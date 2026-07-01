from pathlib import Path
path = Path('src/maritime-extractor.ts')
text = path.read_text(encoding='utf-8')
old = '    if (!fields.dwt && ml.DWT && /\x08DWT\x08/.test(upper)\n        fields.dwt = ml.DWT;\n'
new = '    if (\n        !fields.dwt &&\n        ml.DWT &&\n        segmentType === "Tonnage" &&\n        /\\bDWT\\b/.test(upper)\n    ) {\n        fields.dwt = ml.DWT;\n    }\n'
if old not in text:
    raise ValueError('Old DWT regex block not found')
text = text.replace(old, new, 1)
path.write_text(text, encoding='utf-8')
print('patched')
