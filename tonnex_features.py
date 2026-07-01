"""
tonnex_features.py
==================
Feature engineering for the Tonnex email classifier (Tonnage / VC Cargo / TC Cargo).

Bolts onto an existing TF-IDF + LinearSVC pipeline. Provides:
  1. Text normalization for maritime abbreviations (t/c -> time_charter, etc.)
  2. Category-specific keyword-count features
  3. Regex-derived binary structural features (the high-signal ones)
  4. A sklearn-compatible FeatureUnion combining TF-IDF + engineered features

Usage
-----
    from tonnex_features import build_pipeline
    pipe = build_pipeline()
    pipe.fit(X_train, y_train)        # X_train = list/Series of raw email strings
    preds = pipe.predict(X_test)
    proba = pipe.decision_function(X_test)   # for confidence thresholding

Author: built for IME / Tonnex
"""

import re
import numpy as np
from scipy.sparse import hstack, csr_matrix
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.svm import LinearSVC

# ---------------------------------------------------------------------------
# 1. NORMALIZATION
#    Collapse maritime abbreviations into single canonical tokens BEFORE
#    vectorizing, so TF-IDF treats "t/c", "tc", "tct" as one strong signal.
# ---------------------------------------------------------------------------

# Order matters: longer / more specific patterns first.
NORMALIZATION_MAP = [
    (r"\btrip\s*time\s*charter\b",      " trip_time_charter "),
    (r"\btime\s*charter\b",             " time_charter "),
    (r"\bt\s*/\s*c\b",                  " time_charter "),
    (r"\btct\b",                        " trip_time_charter "),
    (r"\bvoyage\s*charter\b",           " voyage_charter "),
    (r"\bv\s*/\s*c\b",                  " voyage_charter "),
    (r"\bper\s*day\b",                  " rate_per_day "),
    (r"\busd\s*/\s*day\b",              " rate_per_day "),
    (r"\$\s*/\s*day\b",                 " rate_per_day "),
    (r"\bpdpr\b",                       " rate_per_day "),
    (r"\bper\s*mt\b",                   " rate_per_mt "),
    (r"\busd\s*/\s*mt\b",               " rate_per_mt "),
    (r"\$\s*/\s*mt\b",                  " rate_per_mt "),
    (r"\bpmt\b",                        " rate_per_mt "),
    (r"\blump\s*sum\b",                 " lumpsum "),
    (r"\bls\b",                         " lumpsum "),
    (r"\bdely\b",                       " delivery "),
    (r"\bredely\b",                     " redelivery "),
    (r"\bredel\b",                      " redelivery "),
    (r"\bdisport\b",                    " discharge_port "),
    (r"\bdisch\b",                      " discharge "),
    (r"\bcgo\b",                        " cargo "),
    (r"\bfrt\b",                        " freight "),
    (r"\bm\s*/\s*v\b",                  " vessel "),
    (r"\bmv\b",                         " vessel "),
    (r"\babt\b",                        " about "),
    (r"\bqty\b",                        " quantity "),
    (r"\bmoloo\b",                      " moloo "),
    (r"\bww\s*trading\b",               " worldwide_trading "),
]

COMPILED_NORM = [(re.compile(p, re.IGNORECASE), r) for p, r in NORMALIZATION_MAP]


def normalize_email(text: str) -> str:
    """Lowercase + collapse maritime abbreviations to canonical tokens."""
    if not isinstance(text, str):
        text = str(text or "")
    t = text.lower()
    for pat, repl in COMPILED_NORM:
        t = pat.sub(repl, t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


# ---------------------------------------------------------------------------
# 2. KEYWORD LEXICONS (counted as features, post-normalization)
#    NOTE: keep these as the *normalized* forms where applicable.
# ---------------------------------------------------------------------------

TONNAGE_KW = [
    "open", "opening", "spot", "prompt", "tonnage", "available", "dwt",
    "built", "blt", "sdwt", "dwcc", "geared", "gearless", "grabs",
    "ballast", "eta", "last cargo", "flag", "class", "looking for cargo",
    "vessel", "grt", "nrt", "cranes", "derricks", "open for orders",
    "available position", "open for",
]

VC_KW = [
    "cargo", "stem", "account", "charterers", "rate_per_mt", "freight",
    "lumpsum", "laycan", "loading", "discharge_port", "discharge",
    "load port", "demurrage", "despatch", "liner terms", "fiost", "fios",
    "filo", "gencon", "quantity", "moloo", "in bulk", "tolerance",
    "chopt", "intention", "1 safe berth", "sbsa",
]

TC_KW = [
    "time_charter", "trip_time_charter", "period", "hire", "rate_per_day",
    "daily hire", "delivery", "redelivery", "on hire", "off hire",
    "basis delivery", "months", "worldwide_trading", "nype",
    "hire rate", "vessel wanted", "period of",
]

KEYWORD_SETS = {"tonnage": TONNAGE_KW, "vc": VC_KW, "tc": TC_KW}


# ---------------------------------------------------------------------------
# 3. HIGH-SIGNAL REGEX BINARY FEATURES
#    These are the structural cues that actually discriminate the classes.
# ---------------------------------------------------------------------------

REGEX_FEATURES = {
    # rate units — strongest single signals
    "has_per_day_rate":   re.compile(r"rate_per_day|\bhire\b", re.I),
    "has_per_mt_rate":    re.compile(r"rate_per_mt", re.I),
    "has_lumpsum":        re.compile(r"\blumpsum\b", re.I),
    # TC time-signature: delivery + redelivery pairing
    "has_dely_redely":    re.compile(r"delivery.*redelivery|redelivery.*delivery", re.I | re.S),
    "has_period_dur":     re.compile(r"\b\d+\s*(?:to|-|/)\s*\d+\s*month", re.I),
    # VC voyage-signature
    "has_laycan":         re.compile(r"\blaycan\b", re.I),
    "has_load_disch":     re.compile(r"load.*discharge|discharge.*load", re.I | re.S),
    "has_qty_tol":        re.compile(r"moloo|\bchopt\b|\d+\s*pct", re.I),
    # Tonnage-signature: vessel position being offered
    "has_open_position":  re.compile(r"\bopen\b|\bballast\b|\beta\b", re.I),
    "has_dwt_spec":       re.compile(r"\b\d{2,3}[,\.]?\d{3}\s*(?:dwt|mt|sdwt|dwcc)", re.I),
    "has_built_year":     re.compile(r"\b(?:built|blt)\b.*\b(19|20)\d{2}\b", re.I),
}


# ---------------------------------------------------------------------------
# 4. TRANSFORMERS
# ---------------------------------------------------------------------------

class NormalizeText(BaseEstimator, TransformerMixin):
    """Apply maritime normalization. Returns a list of normalized strings."""
    def fit(self, X, y=None):
        return self
    def transform(self, X):
        return [normalize_email(t) for t in X]


class EngineeredFeatures(BaseEstimator, TransformerMixin):
    """
    Produces a sparse matrix of:
      - 3 keyword-count columns (tonnage / vc / tc), normalized by token length
      - len(REGEX_FEATURES) binary structural columns
    Expects ALREADY-normalized text as input.
    """
    def __init__(self):
        self.feature_names_ = (
            [f"kwcount_{k}" for k in KEYWORD_SETS]
            + list(REGEX_FEATURES.keys())
        )

    def fit(self, X, y=None):
        return self

    def _row(self, text):
        toklen = max(len(text.split()), 1)
        # keyword counts (length-normalized to avoid long-email bias)
        kw = []
        for words in KEYWORD_SETS.values():
            c = sum(text.count(w) for w in words)
            kw.append(c / toklen)
        # regex binaries
        rx = [1.0 if pat.search(text) else 0.0 for pat in REGEX_FEATURES.values()]
        return kw + rx

    def transform(self, X):
        rows = [self._row(t) for t in X]
        return csr_matrix(np.asarray(rows, dtype=np.float64))


# ---------------------------------------------------------------------------
# 5. PIPELINE BUILDER
# ---------------------------------------------------------------------------

def build_pipeline(C=1.0, class_weight="balanced", max_features=20000):
    """
    Full pipeline: normalize -> [TF-IDF (1,3)  +  engineered features] -> LinearSVC.

    If you use SMOTE, wrap the *transformed* features with imblearn instead;
    see note in __main__ below.
    """
    tfidf = TfidfVectorizer(
        ngram_range=(1, 3),
        max_features=max_features,
        sublinear_tf=True,
        min_df=2,
        token_pattern=r"(?u)\b\w[\w_/]+\b",   # keep our underscore tokens intact
    )

    features = FeatureUnion([
        ("tfidf", tfidf),
        ("engineered", EngineeredFeatures()),
    ])

    pipe = Pipeline([
        ("normalize", NormalizeText()),
        ("features", features),
        ("clf", LinearSVC(C=C, class_weight=class_weight)),
    ])
    return pipe


# ---------------------------------------------------------------------------
# 6. CONFIDENCE / REVIEW QUEUE HELPER
# ---------------------------------------------------------------------------

def predict_with_confidence(pipe, X, margin_threshold=0.5):
    """
    LinearSVC has no predict_proba, but decision_function margins work well.
    Returns (predictions, needs_review_mask).

    margin = gap between top class score and runner-up. Low gap -> ambiguous
    email (e.g. mixed tonnage+cargo thread) -> route to human review.
    """
    dec = pipe.decision_function(X)
    classes = pipe.named_steps["clf"].classes_
    if dec.ndim == 1:  # binary edge case
        preds = (dec > 0).astype(int)
        margins = np.abs(dec)
    else:
        order = np.argsort(dec, axis=1)
        top = dec[np.arange(len(dec)), order[:, -1]]
        second = dec[np.arange(len(dec)), order[:, -2]]
        margins = top - second
        preds = classes[order[:, -1]]
    needs_review = margins < margin_threshold
    return preds, needs_review


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    # Tiny smoke test with synthetic examples
    X = [
        "MV Ocean Star open Singapore prompt, 56000 dwt blt 2012 geared, looking for cargo",
        "Cargo 50000 mt coal in bulk, laycan 10/15 Jan, load Richards Bay disport Mundra, USD/mt basis",
        "Vessel wanted for trip time charter, delivery Singapore redelivery China, 4-6 months, USD/day hire",
    ]
    y = ["tonnage", "vc", "tc"]

    pipe = build_pipeline()
    pipe.fit(X, y)
    print("Predictions:", list(pipe.predict(X)))

    preds, review = predict_with_confidence(pipe, X, margin_threshold=0.3)
    print("With confidence:", list(zip(preds, review)))

    # Inspect engineered feature names
    print("Engineered features:", EngineeredFeatures().feature_names_)

    # ---- SMOTE NOTE ----
    # SMOTE must run on numeric vectors, not raw text. Use imblearn Pipeline:
    #   from imblearn.pipeline import Pipeline as ImbPipeline
    #   from imblearn.over_sampling import SMOTE
    #   ImbPipeline([
    #       ("normalize", NormalizeText()),
    #       ("features", features),       # FeatureUnion from above
    #       ("smote", SMOTE(k_neighbors=3)),
    #       ("clf", LinearSVC(C=1.0, class_weight="balanced")),
    #   ])
    # Keep class_weight="balanced" OR SMOTE — using both can over-correct.
