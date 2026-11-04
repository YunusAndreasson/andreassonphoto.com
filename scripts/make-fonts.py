"""The site's four faces, cut from the full families with the OpenType
features the site sets kept whole: swash capitals, old-style and lining
figures, proportional and tabular spacing, the Th ligature, case forms,
fractions. Small caps, the historical ligatures and the stylistic sets were
tried and left out (they doubled the files and read as costume); add a tag
to FEATURES to bring one back. The cut is otherwise by character only (Latin,
the transliteration marks, the punctuation the copy uses).

    python3 -m venv .venv-fonts && .venv-fonts/bin/pip install fonttools brotli
    .venv-fonts/bin/python scripts/make-fonts.py

Sources are the variable fonts in github.com/google/fonts (OFL), fixed at
the weights the CSS sets (astro.config.mjs): Cormorant Garamond 300 and 500
for display and labels, EB Garamond 400 roman and italic for reading text.
The output replaces src/assets/fonts/*.woff2 under the same names.
"""

import io
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

BASE = 'https://github.com/google/fonts/raw/main/ofl/'
OUT = Path(__file__).resolve().parent.parent / 'src/assets/fonts'

FACES = [
    ('cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf', 300, 'cormorant-garamond-light.woff2'),
    ('cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf', 500, 'cormorant-garamond-medium.woff2'),
    ('ebgaramond/EBGaramond%5Bwght%5D.ttf', 400, 'eb-garamond-regular.woff2'),
    ('ebgaramond/EBGaramond-Italic%5Bwght%5D.ttf', 400, 'eb-garamond-italic.woff2'),
]

# Latin and Latin-1; Latin Extended-A and Additional, so a transliterated
# Ẓuhr or Ramaḍān can take its precomposed letter; the combining marks the
# copy is decomposed into; ʻ ʼ ʾ ʿ; and the punctuation, dashes and spaces.
UNICODES = (
    'U+0020-007E,U+00A0-00FF,U+0100-017F,U+0131,U+0152-0153,U+02BB-02BF,'
    'U+02C6,U+02DA,U+02DC,U+0300-0309,U+0323,U+0329,U+1E00-1EFF,'
    'U+2002-200B,U+2010-2027,U+2032-2033,U+2039-203A,U+2044,U+20AC,U+2122,'
    'U+2190-2193,U+2212,U+2215'
)

# Shaping and spacing (kern, marks, ligatures, locale forms), then what the
# CSS asks for by name: figures, swash, case, fractions.
FEATURES = [
    'kern', 'mark', 'mkmk', 'ccmp', 'locl', 'rlig', 'liga', 'clig', 'calt',
    'onum', 'lnum', 'pnum', 'tnum', 'swsh', 'case', 'frac', 'numr', 'dnom',
]

sources = {}
for path, weight, name in FACES:
    if path not in sources:
        with urllib.request.urlopen(BASE + path) as response:
            sources[path] = response.read()
    font = TTFont(io.BytesIO(sources[path]))
    static = instancer.instantiateVariableFont(font, {'wght': weight})

    options = subset.Options()
    options.layout_features = FEATURES
    options.flavor = 'woff2'
    options.name_IDs = ['*']
    options.notdef_outline = True
    options.hinting = False  # TrueType hints; browsers ignore them on screen
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=subset.parse_unicodes(UNICODES))
    subsetter.subset(static)

    static.flavor = 'woff2'
    static.save(OUT / name)
    print(f'{name}: {(OUT / name).stat().st_size / 1024:.1f} KB')
