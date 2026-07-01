import os

RAW = "datasets/historical_converted/raw"

for file in os.listdir(RAW):

    path = os.path.join(RAW, file)

    with open(
        path,
        encoding="utf8",
        errors="ignore"
    ) as f:

        txt = f.read()

    if txt.startswith("'TR"):

        os.remove(path)

        print(
            "REMOVED",
            file
        )

print("DONE")