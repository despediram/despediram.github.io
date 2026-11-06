from pathlib import Path
root = Path(__file__).resolve().parents[1]
source = root / 'src/demos'
output = root / 'demos'
css = (source / 'demo.css').read_text()
js = (source / 'demo.js').read_text()
for slug in ('orbita', 'afterplay', 'forma'):
    html = (source / (slug + '.html')).read_text()
    html = html.replace('<link rel="stylesheet" href="demo.css">', '<style>' + css + '</style>')
    html = html.replace('<script src="demo.js"></script>', '<script>' + js + '</script>')
    (output / (slug + '.html')).write_text(html)
