"""
tonnex_features.py  (v2 — complete)
===================================
Feature engineering for the Tonnex email classifier:
    Tonnage  /  VC Cargo (voyage charter)  /  TC Cargo (time charter)

Bolts onto an existing TF-IDF + LinearSVC pipeline. Adds:
  1. Maritime abbreviation normalization (t/c, $/day, dely, shinc, ...)
  2. Charter-party FORM detection  -> near-deterministic class signals
  3. Full keyword lexicons (tonnage / VC / TC / bunker / laytime)
  4. High-signal regex binary features (rate unit, dely/redely, laycan, ...)
  5. Trip-Time-Charter (TCT) handling: voyage ports BUT daily hire -> TC
  6. Confidence-margin review-queue helper

TAXONOMY ASSUMPTION
-------------------
  Tonnage  = a vessel is being OFFERED (open/spot/ballast, seeking cargo)
  VC Cargo = cargo OFFERED for a single voyage, freight per-mt / lumpsum
  TC Cargo = a vessel WANTED/OFFERED for a period, hire per-day
  TCT (trip time charter) is labeled TC  (daily hire is the deciding feature)

Usage
-----
    from tonnex_features import build_pipeline, predict_with_confidence
    pipe = build_pipeline()
    pipe.fit(X_train, y_train)
    preds, needs_review = predict_with_confidence(pipe, X_test)
"""

import re
import numpy as np
from scipy.sparse import csr_matrix
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.svm import LinearSVC

# ===========================================================================
# 1. NORMALIZATION  (longer / more specific patterns first)
# ===========================================================================

NORMALIZATION_MAP = [
    (r"\btrip\s*time\s*charter\b",   " trip_time_charter "),
    (r"\btime\s*charter\b",          " time_charter "),
    (r"\bt\s*/\s*c\s*t\b",           " trip_time_charter "),
    (r"\bt\s*c\s*t\b",               " trip_time_charter "),
    (r"\bt\s*/\s*c\b",               " time_charter "),
    (r"\bt\s*c\b",                   " time_charter "),
    (r"\bvoyage\s*charter\b",        " voyage_charter "),
    (r"\bv\s*/\s*c\b",               " voyage_charter "),
    (r"\bper\s*day\b",               " rate_per_day "),
    (r"\busd\s*/\s*day\b",           " rate_per_day "),
    (r"\$\s*/\s*day\b",              " rate_per_day "),
    (r"\bpdpr\b",                    " rate_per_day "),
    (r"\bper\s*mt\b",                " rate_per_mt "),
    (r"\busd\s*/\s*mt\b",            " rate_per_mt "),
    (r"\$\s*/\s*mt\b",               " rate_per_mt "),
    (r"\bpmt\b",                     " rate_per_mt "),
    (r"\blump\s*sum\b",              " lumpsum "),
    (r"\bl\s*/\s*s\b",               " lumpsum "),
    (r"\bredely\b",                  " redelivery "),
    (r"\bredel\b",                   " redelivery "),
    (r"\bdely\b",                    " delivery "),
    (r"\bbod\b",                     " bunkers_on_delivery "),
    (r"\bbor\b",                     " bunkers_on_redelivery "),
    (r"\bilohc\b",                   " ilohc "),
    (r"\bcve\b",                     " cve "),
    (r"\bdisport\b",                 " discharge_port "),
    (r"\bdisch\b",                   " discharge "),
    (r"\bdischg\b",                  " discharge "),
    (r"\bload\s*port\b",             " load_port "),
    (r"\bcgo\b",                     " cargo "),
    (r"\bfrt\b",                     " freight "),
    (r"\bqty\b",                     " quantity "),
    (r"\bm\s*/\s*v\b",               " vessel "),
    (r"\bm\s*v\b",                   " vessel "),
    (r"\bm\s*/\s*t\b",               " vessel "),
    (r"\bsshex\b",                   " sshex "),
    (r"\bshinc\b",                   " shinc "),
    (r"\bshex\b",                    " shex "),
    (r"\bfhex\b",                    " fhex "),
    (r"\bwibon\b",                   " wibon "),
    (r"\bwccon\b",                   " wccon "),
    (r"\bcqd\b",                     " cqd "),
    (r"\beiu\b",                     " eiu "),
    (r"\bww\s*trading\b",            " worldwide_trading "),
    (r"\babt\b",                     " about "),
    (r"\bblt\b",                     " built "),
    (r"\bmoloo\b",                   " moloo "),
    (r"\bchopt\b",                   " chopt "),
]

COMPILED_NORM = [(re.compile(p, re.IGNORECASE), r) for p, r in NORMALIZATION_MAP]


def normalize_email(text: str) -> str:
    if not isinstance(text, str):
        text = str(text or "")
    t = text.lower()
    for pat, repl in COMPILED_NORM:
        t = pat.sub(repl, t)
    return re.sub(r"\s+", " ", t).strip()


# ===========================================================================
# 2. CHARTER-PARTY FORM NAMES  (near-deterministic class signals)
# ===========================================================================

VC_CP_FORMS = [
    "gencon", "synacomex", "norgrain", "amwelsh", "americanized welsh",
    "sugar charter", "fertivoy", "graincon", "austwheat", "scancon",
    "polcoalvoy", "coal-orevoy", "orevoy", "cementvoy", "nipponcoal",
    "asbatankvoy", "exxonvoy", "shellvoy", "bpvoy", "biscoilvoy",
]

TC_CP_FORMS = [
    "nype", "new york produce", "baltime", "shelltime", "gentime",
    "boxtime", "supplytime", "linertime", "asbatime", "intertanktime",
]


# ===========================================================================
# 3. KEYWORD LEXICONS  (counted post-normalization)
# ===========================================================================

TONNAGE_KW = [
    "open", "opening", "spot", "prompt", "tonnage", "available",
    "open for orders", "open for", "available position", "looking for cargo",
    "seeking cargo", "in search of cargo", "ballast", "eta", "last cargo",
    "dwt", "sdwt", "dwcc", "dwat", "grt", "nrt", "teu", "loa", "beam",
    "draft", "draught", "built", "flag", "class", "imo", "sid", "bimco",
    "geared", "gearless", "grabs", "cranes", "derricks", "holds", "hatches",
    "self trimming", "self-trimming", "box shaped", "box-shaped",
    "open hatch", "single decker", "tween decker", "log fitted", "vessel",
    "ship", "mpp", "handysize", "handymax", "supramax", "ultramax",
    "panamax", "kamsarmax", "capesize",
]

VC_KW = [
    "cargo", "stem", "account", "charterers", "rate_per_mt", "freight",
    "lumpsum", "laycan", "loading", "load_port", "discharge_port",
    "discharge", "demurrage", "despatch", "dispatch", "liner terms",
    "fiost", "fios", "filo", "fio", "quantity", "moloo", "in bulk",
    "tolerance", "chopt", "intention", "safe berth", "safe port",
    "1sb1sp", "sbsa", "cqd", "shinc", "shex", "sshex", "fhex", "wibon",
    "wccon", "eiu", "freight idea", "per metric ton", "min/max",
    "loadrate", "load rate", "disch rate", "norgrain", "berth terms",
]

TC_KW = [
    "time_charter", "trip_time_charter", "period", "hire", "rate_per_day",
    "daily hire", "delivery", "redelivery", "on hire", "off hire",
    "basis delivery", "basis dely", "month", "months", "worldwide_trading",
    "hire rate", "vessel wanted", "tonnage wanted", "period of",
    "bunkers_on_delivery", "bunkers_on_redelivery", "bunkers", "ifo",
    "vlsfo", "lsmgo", "mgo", "bunker clause", "ilohc", "cve",
    "clean on redelivery", "trading limits", "intention period",
    "duration", "about months", "consecutive voyages",
]

BUNKER_KW = [
    "bunkers", "bunkers_on_delivery", "bunkers_on_redelivery", "ifo",
    "vlsfo", "lsmgo", "mgo", "hsfo", "bunker clause", "rob",
    "remaining on board", "fuel oil", "gas oil",
]

LAYTIME_KW = [
    "laytime", "laycan", "demurrage", "despatch", "dispatch", "cqd",
    "shinc", "shex", "sshex", "fhex", "wibon", "wccon", "eiu",
    "reversible", "non-reversible", "weather working days", "wwd",
    "notice of readiness", "nor", "turn time",
]

KEYWORD_SETS = {
    "tonnage": TONNAGE_KW,
    "vc": VC_KW,
    "tc": TC_KW,
    "bunker": BUNKER_KW,
    "laytime": LAYTIME_KW,
    "vc_cp_form": VC_CP_FORMS,
    "tc_cp_form": TC_CP_FORMS,
}


# ===========================================================================
# 4. HIGH-SIGNAL REGEX BINARY FEATURES
# ===========================================================================

REGEX_FEATURES = {
    "has_per_day_rate":  re.compile(r"rate_per_day", re.I),
    "has_per_mt_rate":   re.compile(r"rate_per_mt", re.I),
    "has_lumpsum":       re.compile(r"\blumpsum\b", re.I),
    "has_hire":          re.compile(r"\bhire\b", re.I),
    "has_freight":       re.compile(r"\bfreight\b", re.I),
    "has_dely_redely":   re.compile(r"delivery.*redelivery|redelivery.*delivery", re.I | re.S),
    "has_period_dur":    re.compile(r"\b\d+\s*(?:to|-|/|\+)\s*\d+\s*month|about\s*\d+\s*month", re.I),
    "has_bunkers":       re.compile(r"\bbunkers|bunkers_on_|ilohc\b", re.I),
    "has_tc_cp_form":    re.compile(r"\b(?:nype|baltime|shelltime|gentime|boxtime|supplytime)\b", re.I),
    "has_laycan":        re.compile(r"\blaycan\b", re.I),
    "has_load_disch":    re.compile(r"load.*discharge|discharge.*load|load_port|discharge_port", re.I | re.S),
    "has_qty_tol":       re.compile(r"\bmoloo\b|\bchopt\b|\d+\s*pct|min\s*/\s*max", re.I),
    "has_demurrage":     re.compile(r"\bdemurrage\b|\bdespatch\b|\bdispatch\b", re.I),
    "has_vc_cp_form":    re.compile(r"\b(?:gencon|synacomex|norgrain|amwelsh|orevoy|asbatankvoy|shellvoy)\b", re.I),
    "has_open_position": re.compile(r"\bopen\b|\bballast\b|\bspot\b|\bprompt\b", re.I),
    "has_dwt_spec":      re.compile(r"\b\d{1,3}[,\.]?\d{3}\s*(?:dwt|mt|sdwt|dwcc|dwat)", re.I),
    "has_built_year":    re.compile(r"\bbuilt\b.*\b(?:19|20)\d{2}\b|\b(?:19|20)\d{2}\s*built\b", re.I),
    "has_gear_spec":     re.compile(r"\bgeared\b|\bgearless\b|\bgrabs\b|\bcranes\b|\bderricks\b", re.I),
    "has_seeking_cargo": re.compile(r"looking for cargo|seeking cargo|in search of cargo|open for orders", re.I),
    "is_tct_hybrid":     re.compile(r"trip_time_charter", re.I),
}


# ===========================================================================
# 5. TRANSFORMERS
# ===========================================================================

class NormalizeText(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self
    def transform(self, X):
        return [normalize_email(t) for t in X]


class EngineeredFeatures(BaseEstimator, TransformerMixin):
    CP_FORM_WEIGHT = 5.0

    def __init__(self):
        self.feature_names_ = (
            [f"kwcount_{k}" for k in KEYWORD_SETS]
            + list(REGEX_FEATURES.keys())
        )

    def fit(self, X, y=None):
        return self

    def _row(self, text):
        toklen = max(len(text.split()), 1)
        kw = []
        for name, words in KEYWORD_SETS.items():
            c = sum(text.count(w) for w in words)
            val = c / toklen
            if name.endswith("_cp_form"):
                val *= self.CP_FORM_WEIGHT
            kw.append(val)
        rx = [1.0 if pat.search(text) else 0.0 for pat in REGEX_FEATURES.values()]
        return kw + rx

    def transform(self, X):
        rows = [self._row(t) for t in X]
        return csr_matrix(np.asarray(rows, dtype=np.float64))


# ===========================================================================
# 6. PIPELINE BUILDER
# ===========================================================================

def build_pipeline(C=1.0, class_weight="balanced", max_features=30000):
    tfidf = TfidfVectorizer(
        ngram_range=(1, 3),
        max_features=max_features,
        sublinear_tf=True,
        min_df=2,
        token_pattern=r"(?u)\b\w[\w_/]+\b",
    )
    features = FeatureUnion([
        ("tfidf", tfidf),
        ("engineered", EngineeredFeatures()),
    ])
    return Pipeline([
        ("normalize", NormalizeText()),
        ("features", features),
        ("clf", LinearSVC(C=C, class_weight=class_weight)),
    ])


# ===========================================================================
# 7. CONFIDENCE / REVIEW QUEUE
# ===========================================================================

def predict_with_confidence(pipe, X, margin_threshold=0.5):
    dec = pipe.decision_function(X)
    classes = pipe.named_steps["clf"].classes_
    if dec.ndim == 1:
        preds = np.where(dec > 0, classes[1], classes[0])
        margins = np.abs(dec)
    else:
        order = np.argsort(dec, axis=1)
        top = dec[np.arange(len(dec)), order[:, -1]]
        second = dec[np.arange(len(dec)), order[:, -2]]
        margins = top - second
        preds = classes[order[:, -1]]
    return preds, margins < margin_threshold


# ===========================================================================
if __name__ == "__main__":
    X = [
        "MV Ocean Star open Singapore prompt, 56000 dwt built 2012 geared, "
        "5 holds 5 hatches self-trimming, looking for cargo",
        "Cargo 50000 mt coal in bulk 10pct moloo, laycan 10/15 Jan, "
        "load Richards Bay disport Mundra, USD/mt freight basis gencon, "
        "demurrage 25000 shinc",
        "Vessel wanted for time charter, delivery Singapore redelivery China, "
        "about 4-6 months, USD/day hire basis NYPE, bunkers on delivery",
        "TCT enquiry: 1 trip via Australia to China, delivery Singapore "
        "redelivery China, daily hire idea pls, abt 35-40 days",
    ]
    y = ["tonnage", "vc", "tc", "tc"]

    pipe = build_pipeline()
    pipe.fit(X, y)
    print("Predictions:", list(pipe.predict(X)))

    preds, review = predict_with_confidence(pipe, X, margin_threshold=0.3)
    print("With confidence:", list(zip([str(p) for p in preds], [bool(r) for r in review])))

    ef = EngineeredFeatures()
    print(f"\n{len(ef.feature_names_)} engineered features:")
    print(ef.feature_names_)
