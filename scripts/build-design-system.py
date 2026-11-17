#!/usr/bin/env python3
"""Build the Bryan Fawcett design system from the site's own sources.

    python3 scripts/build-design-system.py                  # writes the skill, .claude/skills/fawcett-design-system/
    python3 scripts/build-design-system.py --artifact DIR   # also writes DIR/project/..., the Claude design-system artifact
    python3 scripts/build-design-system.py --check          # fail if the committed skill is stale (CI)

Nothing here is typed in by hand that the site already says. Tokens come from the generated
src/styles/tokens.css and src/brand/{palette,minerals}.ts; component styles are the site's
own global.css; every component preview is the markup Astro actually shipped (read from the
built pages, so run `pnpm build` first); the forced states (hover, focus, active) are derived
from the stylesheet's own :hover/:focus-visible/:active rules.
"""
import argparse, base64, datetime, filecmp, json, os, re, shutil, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BUILT = [os.path.join(ROOT, '.cloudflare/output/v0/workers/default/assets'), os.path.join(ROOT, 'dist/client')]
SKILL = os.path.join(ROOT, '.claude/skills/fawcett-design-system')

ap = argparse.ArgumentParser()
ap.add_argument('--artifact', help='also write the Claude design-system artifact tree here')
ap.add_argument('--check', action='store_true', help='fail if the skill on disk differs from a fresh build')
args = ap.parse_args()

built = next((b for b in BUILT if os.path.exists(os.path.join(b, 'index.html'))), None)
if not built:
    sys.exit('no built site found; run `pnpm build` first')

def read(p): return open(os.path.join(ROOT, p) if not os.path.isabs(p) else p).read()

STAGE = os.path.join(ROOT, '.design-system-build')       # scratch, removed at the end
if os.path.isdir(STAGE): shutil.rmtree(STAGE)
OUT = os.path.join(STAGE, 'project')
os.makedirs(OUT)

def w(rel, text, binary=False):
    p = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'wb' if binary else 'w').write(text)

# ================================================================== sources
tokens_css = read('src/styles/tokens.css')
root_block = re.search(r':root \{\n(.*?)\n\}\n@media', tokens_css, re.S).group(1)
dark_block = re.search(r'@media \(prefers-color-scheme: dark\) \{\n  :root:where\(:not\(\[data-theme="light"\], \.light\)\) \{\n(.*?)\n  \}\n\}', tokens_css, re.S).group(1)
decl = lambda s: {m.group(1): m.group(2).strip() for m in re.finditer(r'--([a-z0-9-]+):\s*([^;]+);', s)}
R, D = decl(root_block), decl(dark_block)
is_plain = lambda v: bool(re.fullmatch(r'#[0-9a-fA-F]{3,8}', v) or re.fullmatch(r'rgba?\([0-9 ,./%]+\)', v))

# --- the 21 families' hex are generated from mzizi-tokens (src/brand/mzizi-palette.generated.ts);
# minerals.ts and palette.ts reference them as MZIZI_PALETTE.<family>.<dark|light>. Expand those back
# to literals so the parsing below is unchanged.
_gen = read('src/brand/mzizi-palette.generated.ts')
GEN = {m.group(1): (m.group(2), m.group(3)) for m in re.finditer(r"(\w+): \{ dark: '(#\w+)', light: '(#\w+)' \}", _gen)}
def expand(text, q):
    return re.sub(r'MZIZI_PALETTE\.(\w+)\.(dark|light)',
                  lambda m: f"{q}{GEN[m.group(1)][0 if m.group(2) == 'dark' else 1]}{q}", text)

# --- the seven minerals, read from minerals.ts (origin, meaning, use are the site's own words)
mts = expand(read('src/brand/minerals.ts'), "'")
MIN = {}
for m in re.finditer(r"\{\s*name: '(\w+)',\s*hex: '(#\w+)',\s*onLight: '(#\w+)'.*?origin: '([^']*)',\s*(?:\n\s*)?symbolism: '([^']*)',\s*(?:\n\s*)?usage: '([^']*)'", mts, re.S):
    MIN[m.group(1)] = dict(hex=m.group(2), onLight=m.group(3), origin=m.group(4), means=m.group(5), usage=m.group(6))
assert len(MIN) == 7, MIN.keys()

pal = expand(read('src/brand/palette.ts'), '"')
def pal_block(name):
    body = re.search(rf'export const {name} = \[(.*?)\n\] as const', pal, re.S).group(1)
    return [dict(re.findall(r'(\w+): "([^"]*)"', o)) for o in re.findall(r'\{(.*?)\n  \}', body, re.S)]
HER, EXP = pal_block('HERITAGE'), pal_block('EXPERIMENTAL')

def lum(h):
    h = h.lstrip('#'); h = ''.join(c * 2 for c in h) if len(h) == 3 else h
    ch = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = map(f, ch); return 0.2126 * r + 0.7152 * g + 0.0722 * b
def ratio(a, b):
    hi, lo = sorted([lum(a), lum(b)], reverse=True); return (hi + 0.05) / (lo + 0.05)
def grade(x): return 'AAA' if x >= 7 else 'AA' if x >= 4.5 else 'AA Large' if x >= 3 else 'Non-text only'
SHEET_DARK = D['sheet']

# ================================================================== tokens.json
USAGE = {
    'sheet': 'Page ground. The base every layout sits on; body text and ink read on it.',
    'sheet-deep': 'The deepest step of the ground ladder: inset sections and the strip beyond the sheet.',
    'sheet-mid': 'The middle step of the ground ladder: overlays and dialogs.',
    'sheet-raised': 'Raised elements above an overlay: menus, the control bar, toasts. Text on it is ink.',
    'sheet-wash': 'Card and panel surface, one step up from sheet. Panels and cards take this fill and a hairline.',
    'sheet-wash-light': 'Inset chips, disabled surfaces and neutral containers sitting on a panel.',
    'ink': 'Primary text and the strongest line, on sheet, sheet-wash and sheet-raised. Headings are always ink.',
    'ink-body': 'Running prose on sheet and sheet-wash.',
    'ink-soft': 'Secondary text and mono labels on sheet and sheet-wash; disabled labels.',
    'ink-faint': 'Section rules, strong hairlines and control borders. Never text.',
    'ink-hair': 'Panel borders and the faintest rules. Never text.',
    'ink-drafted': 'The fill inside the outlined display lockup; the stroke is ink.',
    'brand': 'The one primary colour, heritage river. Fills primary buttons and underlines links; text on it is on-brand.',
    'on-brand': 'Text on a brand fill.',
    'pencil': 'Margin notes and the signature, set in the hand face.',
    'stamp': 'The rule of an approval stamp and graphic marks. Never lettering: use stamp-ink.',
    'stamp-ink': 'Lettering on a stamp.',
    'shadow': 'Reserved. The system draws rings and rules, not shadows.',
    'inset': 'A wash behind recessed content.',
    'ground-glow': 'Lighting radial of the sheet ground (upper right).',
    'ground-lit': 'Lighting radial of the sheet ground (upper left).',
    'ground-pool': 'Lighting radial of the sheet ground (lower left).',
    'ground-shade': 'Lighting radial of the sheet ground (lower right).',
    'ground-vignette': 'Fall-off at the left and right edges of the sheet only.',
    'rule-major': 'The blueprint grid, major lines. Painted only on the ground, never behind text.',
    'rule-minor': 'The blueprint grid, minor lines. Painted only on the ground, never behind text.',
}
color_tokens = []
for k in sorted(set(R) | set(D), key=lambda x: list(R).index(x) if x in R else 999):
    l, d = R.get(k), D.get(k)
    if not (l and is_plain(l)) and not (d and is_plain(d)): continue
    if k.startswith('mineral-'):
        m = re.match(r'mineral-([a-z]+)(-container|-on-container)?$', k); name, suf = m.group(1), m.group(2) or ''
        mi = MIN[name]
        use = (f"Mzizi mineral {name} ({mi['means'].lower()}; from {mi['origin']}). A mark beside or under a word, never the colour of text: raw minerals fail APCA as lettering." if not suf else
               f'The {name} container: a surface themed in the mineral. Text on it is {name}-on-container.' if suf == '-container' else
               f'Text and line work on the {name} container.')
    else:
        use = USAGE.get(k, f'Site token {k}.')
    val = {'light': l or d, 'dark': d or l}
    color_tokens.append({'name': k, 'value': val if val['light'] != val['dark'] else val['light'], 'usage': use})
color_tokens.append({'name': 'ring', 'value': {'light': '#0047AB', 'dark': '#00B0FF'}, 'usage': 'Focus ring: 2px, 2px offset, on every interactive element. Never removed.'})
for h in HER:
    color_tokens.append({'name': h['name'], 'value': {'light': h['lightHex'], 'dark': h['darkHex']},
                         'usage': f"Heritage tone: {h['symbolism']}. Named for {h['origin']}. Used for {h['usage'].lower()}. A mark or surface tone, not body text."})
for e in EXP:
    color_tokens.append({'name': e['name'], 'value': {'light': e['lightHex'], 'dark': e['darkHex']},
                         'usage': 'Experimental family: a colour for each theme and no origin or meaning yet. Use for marks and fills in experiments only; not body text.'})
names = [c['name'] for c in color_tokens]
assert len(names) == len(set(names))

SPACE_NOTE = {'1': 'Hairline gaps and label offsets.', '1-5': 'Between a hairline and a label; chip padding.', '2': 'Tight gaps between controls.', '2-5': 'Compact control padding.',
              '3': 'Gap between cards in a grid.', '3-5': 'Compact card padding.', '4': 'Default gap; list rhythm.', '5': 'Card block padding.',
              '6': 'Card inline padding; control bar padding.', '6-5': 'Between a section lede and its content.', '7': 'Gap before a card grid; section inner gaps.',
              '8': 'Between blocks inside a section.', '9': 'Page-header spacing.', '10': 'The largest step.'}
spacing = [{'name': k, 'value': v, 'usage': SPACE_NOTE.get(k[len('space-'):], 'Spacing step.')} for k, v in R.items() if k.startswith('space-')]
radius = [
    {'name': 'radius-xs', 'value': R['radius-xs'], 'usage': 'Inline code and small chips.'},
    {'name': 'radius-sm', 'value': '7px', 'usage': 'Small controls and inset chips.'},
    {'name': 'radius-md', 'value': '12px', 'usage': 'Mid-size containers.'},
    {'name': 'radius-lg', 'value': '14px', 'usage': 'Cards and panels. Every card takes this.'},
    {'name': 'radius-xl', 'value': '17px', 'usage': 'Large surfaces.'},
    {'name': 'radius-full', 'value': '9999px', 'usage': 'Buttons (always pills), toggles, the skip link and the control bar.'},
]
TEXT_NOTE = {'sm': 'Button label and the larger mono label.', 'body': 'Running prose.', 'card': 'Text inside a card.', 'lede': 'The paragraph under a section title.',
             'h3': 'Card and item titles; margin notes.', 'title': 'A pull quote and sub-titles.', 'section': 'A section title at its largest.',
             'fluid-section': 'A section title, fluid.', 'fluid-display': 'The home lockup, fluid.', 'fluid-page': 'A page header title, fluid.',
             'fluid-sub': 'The hero proposition, fluid.', 'fluid-big': 'A large statement, fluid.', 'fluid-pull': 'A pull quote, fluid.'}
MOTION_NOTE = {'fast': 'A hover.', 'normal': 'A state change.', 'slow': 'A hairline or a mineral rule drawing itself.', 'page': 'A page unrolling.'}
Z_NOTE = {'raised': 'Just above the ground.', 'content': 'The page content, above the ground layers.', 'header': 'The sticky header.', 'overlay': 'The skip link and anything that must sit over the header.'}
other_marks = []
for k, v in R.items():
    if k.startswith('text-'): other_marks.append({'name': k, 'value': v, 'usage': TEXT_NOTE.get(k[5:], 'A step of the type scale.') + ' Nothing sits below `label`: APCA sets the floor.'})
    elif k.startswith('motion-'): other_marks.append({'name': k, 'value': v, 'usage': MOTION_NOTE.get(k[7:], 'A duration.') + ' Stops under prefers-reduced-motion.'})
    elif k.startswith('z-'): other_marks.append({'name': k, 'value': v, 'usage': Z_NOTE.get(k[2:], 'A layer.')})
marks = {'note': 'Sizes and weights that are not colour, type or space but are shared.', 'tokens': [
    {'name': 'label', 'value': R['label'], 'usage': 'Mono label size, always with label-weight (600). 15px at 600 clears APCA on ink; at 400 it asks 16.5px.'},
    {'name': 'label-lg', 'value': R['label-lg'], 'usage': 'Eyebrows and larger mono labels.'},
    {'name': 'label-weight', 'value': R['label-weight'], 'usage': 'Weight of every mono label. Dropping to 400 is a contrast regression.'},
    {'name': 'mineral-weight', 'value': R['mineral-weight'], 'usage': 'Thickness of every mineral mark: the rule under a heading, the swatch bar, the rail.'},
    {'name': 'measure', 'value': R['measure'], 'usage': 'Prose width. 100%: text fills its container.'},
    {'name': 'measure-wide', 'value': R['measure-wide'], 'usage': 'Prose width for larger type. 100%.'},
    {'name': 'grid-minor', 'value': R['grid-minor'], 'usage': 'The blueprint grid, minor pitch.'},
    {'name': 'grid-major', 'value': R['grid-major'], 'usage': 'The blueprint grid, major pitch.'},
] + other_marks}
fonts = [('Noto Serif', 'noto-serif-400-latin.woff2', '400 700', 'normal'), ('Noto Serif', 'noto-serif-400-italic-latin.woff2', '400', 'italic'),
         ('Noto Sans', 'noto-sans-400-latin.woff2', '400 700', 'normal'), ('Noto Sans', 'noto-sans-400-italic-latin.woff2', '400', 'italic'),
         ('JetBrains Mono', 'jetbrains-mono-400-latin.woff2', '400 600', 'normal'), ('Caveat', 'caveat-500-latin.woff2', '500 600', 'normal')]
for _, f, _, _ in fonts:
    os.makedirs(f'{OUT}/fonts', exist_ok=True); shutil.copy(os.path.join(ROOT, 'public/fonts', f), f'{OUT}/fonts/{f}')

def style(name, fs, lh, wt, ls=None, usage=''):
    s = {'name': name, 'fontSize': fs, 'lineHeight': lh, 'fontWeight': wt, 'usage': usage}
    if ls: s['letterSpacing'] = ls
    return s
tokens = {
    'name': 'Bryan Fawcett', 'version': 1,
    'color': {'themes': [{'id': 'light', 'name': 'Light'}, {'id': 'dark', 'name': 'Dark'}], 'tokens': color_tokens},
    'type': {
        'fonts': [{'family': f, 'file': file, 'weight': wt, 'style': st} for f, file, wt, st in fonts],
        'families': {'display': '"Noto Serif", ui-serif, Georgia, serif', 'sans': '"Noto Sans", ui-sans-serif, system-ui, sans-serif',
                     'mono': '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace', 'hand': '"Caveat", ui-rounded, cursive'},
        'groups': [
            {'name': 'Display', 'family': 'display', 'styles': [
                style('display-xl', '6.5rem', '0.92', 700, '0.01em', 'The home page lockup. Uppercase; each line drafted, the second outlined.'),
                style('title', '4.5rem', '0.95', 700, '0.01em', 'A page header title. Uppercase.'),
                style('section-title', '2.125rem', '1.12', 600, None, 'H2 of a section, in ink with the mineral as a rule beneath.'),
                style('card-title', '1.125rem', '1.12', 500, None, 'H3 of a card; ink, with a mineral rule under it.'),
                style('pull-quote', '1.625rem', '1.4', 400, None, 'A pull quote, set against a mineral rule.')]},
            {'name': 'Text', 'family': 'sans', 'styles': [
                style('lede', '1.1875rem', '1.6', 400, None, 'The paragraph under a section title.'),
                style('body', '1.0625rem', '1.62', 400, None, 'Running prose.'),
                style('card-body', '1.0625rem', '1.55', 400, None, 'Text inside a card.'),
                style('button', '1rem', '1.2', 700, '0.01em', 'Button label. 700, because dark text on river asks 15px at 700 but 16.5px at 600.')]},
            {'name': 'Labels', 'family': 'mono', 'styles': [
                style('label', '0.9375rem', '1.4', 600, '0.2em', 'Captions, figure tags and key terms. Uppercase.'),
                style('eyebrow', '1rem', '1.4', 600, '0.28em', 'The line above a section title. Uppercase, with a rule running out from it.')]},
            {'name': 'Hand', 'family': 'hand', 'styles': [style('margin-note', '1.375rem', '1.2', 500, None, 'A margin note or the signature, in pencil.')]},
        ]},
    'spacing': {'tokens': spacing}, 'radius': {'tokens': radius}, 'marks': marks,
}
w('tokens.json', json.dumps(tokens, indent=2, ensure_ascii=False) + '\n')

# ================================================================== bundle.css: the site's stylesheet + derived forced states
css = read('src/styles/global.css')
assert '</style' not in css.lower() and '<!--' not in css

def forced_states(sheet):
    """Copy every simple :hover / :focus-visible / :active rule onto .ds-hover / .ds-focus / .ds-active, so a
    preview can show a state without a pointer. Derived from the site's own rules: nothing to keep in step."""
    body = re.sub(r'/\*.*?\*/', '', sheet, flags=re.S)
    out = []
    for m in re.finditer(r'(?m)^([^@{}\s][^{}]*?)\s*\{([^{}]*)\}', body):
        sel, decls = m.group(1).strip(), m.group(2)
        if not re.search(r':(hover|focus-visible|active)\b', sel): continue
        new = []
        for s in sel.split(','):
            s = s.strip()
            if ':focus-visible' in s or ':active' in s or ':hover' in s:
                if re.search(r':(?!hover|focus-visible|active|not|where|is|lang|first|last|nth)[a-z-]+', s.replace('::', '__')) and ':disabled' in s: continue
                s = s.replace(':focus-visible', '.ds-focus').replace(':active', '.ds-active').replace(':hover', '.ds-hover')
                new.append(s)
        if new: out.append(', '.join(new) + ' {' + decls + '}')
    return '/* Forced states, derived from the stylesheet above for previews: .ds-hover, .ds-focus, .ds-active. */\n' + '\n'.join(out) + '\n'

alias = """/* The site's stylesheet, whole: these are the same rules bryanfawcett.com ships.
 * Tokens come from tokens.css (compiled from tokens.json); these aliases map the site's short names onto the type families it declares. */
:root {
  --display: var(--font-display); --sans: var(--font-sans); --mono: var(--font-mono); --hand: var(--font-hand);
  --cjk: var(--font-sans); --cjk-display: var(--font-display); --cjk-chrome: var(--font-mono); --cjk-mono: var(--font-mono);
  /* Bundu's names for the mineral containers, which the site's stylesheet reads (the contact card's QR). */
  --color-cobalt-container: var(--mineral-cobalt-container); --color-tanzanite-container: var(--mineral-tanzanite-container);
  --color-malachite-container: var(--mineral-malachite-container); --color-gold-container: var(--mineral-gold-container);
  --color-terracotta-container: var(--mineral-terracotta-container); --color-sodalite-container: var(--mineral-sodalite-container);
  --color-copper-container: var(--mineral-copper-container);
}
/* Mineral keying: data-mineral on any element sets the one property every mineral mark reads. */
"""
key_rules = ''.join(f'[data-mineral="{m}"] {{ --mineral: var(--mineral-{m}); --mineral-container: var(--mineral-{m}-container); --mineral-on: var(--mineral-{m}-on-container); }}\n' for m in MIN)
key_rules += ''.join(f'[data-mineral="{c["name"]}"] {{ --mineral: var(--{c["name"]}); }}\n' for c in color_tokens if c['name'] in {x['name'] for x in HER + EXP})
# --- every var() the component stylesheet reads must be a token, a font family, or declared in the stylesheet itself
_declared = set(re.findall(r'(--[a-z0-9-]+)\s*:', alias + css))
_defined = {f'--{c["name"]}' for c in color_tokens} | {f'--{t["name"]}' for t in spacing + radius + marks['tokens']} | {f'--font-{k}' for k in tokens['type']['families']}
_inline = {'--mineral', '--mineral-container', '--mineral-on', '--seg', '--corner', '--progress', '--panel-mineral', '--show-dark-only', '--show-light-only', '--blend-ground', '--shadow'}
_unresolved = sorted({v for v in re.findall(r'var\((--[a-z0-9-]+)', css)} - _declared - _defined - _inline)
if _unresolved:
    sys.exit('the component stylesheet reads variables that tokens.json does not define: ' + ', '.join(_unresolved))

bundle_css = alias + key_rules + '\n' + css + '\n' + forced_states(css)
w('components/bundle.css', bundle_css)

# ================================================================== real markup, from the built pages
page = lambda f: open(os.path.join(built, f)).read()
HOME, EXPERIENCE, ORIGINS = page('index.html'), page('experience.html'), page('origins-with-perspective.html')
TAGS = ('section', 'div', 'header', 'figure', 'article', 'aside', 'nav', 'a', 'ol', 'ul', 'footer', 'p')

def outer(html, cls):
    for tag in TAGS:
        for m in re.finditer(rf'<{tag}\b[^>]*class="([^"]*)"[^>]*>', html):
            if cls in m.group(1).split():
                depth = 0
                for t in re.finditer(rf'<(/?){tag}\b[^>]*?(/?)>', html[m.start():]):
                    if t.group(2): continue
                    depth += -1 if t.group(1) else 1
                    if depth == 0: return html[m.start():m.start() + t.end()]
    raise SystemExit(f'component markup not found in the built site: .{cls}')

def datauri(path, mime):
    return f'data:{mime};base64,' + base64.b64encode(open(path, 'rb').read()).decode()
astro_dir = os.path.join(built, '_astro')
def inline_images(html):
    html = re.sub(r'\s(srcset|sizes)="[^"]*"', '', html)
    def sub(m):
        src = m.group(1)
        p = os.path.join(built, src.lstrip('/'))
        if not os.path.exists(p): p = os.path.join(ROOT, 'public', src.lstrip('/'))
        return f'src="{datauri(p, "image/webp")}"' if os.path.exists(p) else m.group(0)
    return re.sub(r'src="(/(?:_astro/[^"]+|nav-portrait)\.webp)"', sub, html)
def static_header(h): return h
real = lambda html, cls: inline_images(outer(html, cls))

# ================================================================== previews and docs
PREVIEW_CSS = """body{padding:24px;min-height:0;background:var(--sheet)}
.ds-states{display:grid;gap:18px}.ds-row{display:grid;grid-template-columns:128px 1fr;gap:16px;align-items:center}
.ds-cap{font-family:var(--mono);font-size:var(--label);font-weight:var(--label-weight);letter-spacing:.18em;text-transform:uppercase;color:var(--ink-soft)}
.ds-wrap{position:relative}"""
def card(group, height, subtitle, body, css=''):
    return f'<!-- @dsCard group="{group}" height={height} subtitle="{subtitle}" -->\n<style>{PREVIEW_CSS}{css}</style>\n{body}\n'
def row(cap, html): return f'<div class="ds-row"><span class="ds-cap">{cap}</span><div>{html}</div></div>'
def states(*rows): return '<div class="ds-states">' + ''.join(row(c, h) for c, h in rows) + '</div>'

def doc(summary, provide, variants, state_rows, a11y, dos, donts, tokens_used):
    vt = '\n'.join(f'| {a} | {b} |' for a, b in variants)
    st = '\n'.join(f'| {a} | {b} |' for a, b in state_rows)
    return (f"{summary}\n\n**You provide** {provide}\n\n**Variants**\n\n| Variant | Use when |\n|---|---|\n{vt}\n\n"
            f"**States**\n\n| State | How it looks and behaves |\n|---|---|\n{st}\n\n**Accessibility.** {a11y}\n\n"
            f"**Do.** {dos}\n\n**Don't.** {donts}\n\n**Tokens.** {tokens_used}\n")

COMPONENTS = {}
def comp(name, preview_html, readme): COMPONENTS[name] = (preview_html, readme)

# ---- Button
B = lambda label, cls='', attrs='': f'<a class="btn {cls}" href="#" {attrs}>{label}</a>'
BB = lambda label, cls='', attrs='': f'<button class="btn {cls}" type="button" {attrs}>{label}</button>'
comp('Button', card('Actions', 560, 'Primary and ghost, in every state', states(
    ('Default', B('Book a call') + ' ' + B('See the systems', 'is-ghost')),
    ('Hover', B('Book a call', 'ds-hover') + ' ' + B('See the systems', 'is-ghost ds-hover')),
    ('Focus', B('Book a call', 'ds-focus') + ' ' + B('See the systems', 'is-ghost ds-focus')),
    ('Active', B('Book a call', 'ds-active') + ' ' + B('See the systems', 'is-ghost ds-active')),
    ('Disabled', BB('Book a call', '', 'disabled') + ' ' + BB('See the systems', 'is-ghost', 'disabled')),
    ('Loading', BB('Booking', '', 'aria-busy="true"') + ' ' + BB('Booking', 'is-ghost', 'aria-busy="true"')),
    ('Hero size', B('Book a free 30-minute call', '', 'style="min-height:56px;padding-inline:32px"')))),
    doc('The action: a pill, 48px tall (56px for a page\'s one hero action), filled `brand` with `on-brand` text at 700. A ghost variant sits beside it for the quieter second choice.',
        'a label that says what happens ("Book a call") and an `href` for a link or a `type="button"` for an action. Add `is-ghost` for the secondary.',
        [('Primary', 'The one action a page asks of its visitor.'), ('Ghost (`is-ghost`)', 'A second, quieter choice next to the primary, or a back/see-more action.'), ('Hero size', 'The single most important action on a page: 56px.')],
        [('Default', '`brand` fill, `on-brand` text, border in `brand`. Ghost: transparent, `ink-soft` border, `ink` text.'),
         ('Hover', 'The border draws in `ink`. Ghost also fills `sheet-raised`. No tint, no lift, no shadow.'),
         ('Focus', 'The `ring` outline: 2px, 2px offset. Never removed.'),
         ('Active', 'Pressed: the fill darkens toward `ink` and the border is `ink`. Ghost fills `sheet-wash-light`.'),
         ('Disabled', 'Use the `disabled` attribute (or `aria-disabled="true"` on a link). Neutral `sheet-wash-light` fill, `ink-soft` label, no pointer response.'),
         ('Loading', 'Set `aria-busy="true"`. The button keeps its size, stops taking clicks and shows a ring beside the label. The ring stops under reduced motion.')],
        'Use a real `<button>` or `<a>`. Targets are at least 44px. Say what is happening in the label while loading ("Booking"), and announce completion in a live region you provide.',
        'Keep one primary per view; use the hero size once; keep the radius `radius-full`.',
        'Add a drop shadow, lift the button on hover, change the weight below 700 (dark text on river asks 15px at 700 but 16.5px at 600), or add a second accent colour.',
        '`brand`, `on-brand`, `ink`, `ink-soft`, `sheet-raised`, `sheet-wash-light`, `ink-hair`, `ring`, `radius-full`, `space-6`, `space-2`.'))

# ---- Panel
GRID = '\n'.join(f'<li class="panel" data-mineral="{m}"><h3>{h}</h3><p>{p}</p></li>' for m, h, p in [
    ('cobalt', 'Design', 'Combining utility and significance: thinking like a designer.'), ('tanzanite', 'Story', 'Giving the facts a shape a person can follow and remember.'),
    ('malachite', 'Symphony', 'Seeing how separate parts fit into one working whole.'), ('gold', 'Empathy', 'Starting from what the people using it actually need.'),
    ('terracotta', 'Play', 'Keeping room for the experiment that might not work.'), ('copper', 'Meaning', 'Asking what it is for before asking how to build it.')])
one = lambda extra='': f'<article class="panel {extra}" data-mineral="cobalt" style="max-width:300px"><h3>Design</h3><p>Combining utility and significance.</p></article>'
comp('Panel', card('Surfaces', 700, 'The card: grid, hover, framed', f'<ul class="aptitudes" style="margin:0 0 28px">{GRID}</ul>' + states(
    ('Default', one()), ('Hover', one('ds-hover')), ('Framed', '<article class="panel" data-mineral="cobalt" style="max-width:300px"><span class="panel__rule" aria-hidden="true"></span><h3>Embedded deck</h3><p>Brackets frame something larger.</p></article>'))),
    doc('A hairline-bordered card at `radius-lg` on `sheet-wash`, with an ink heading and the card\'s mineral as a rule under it.',
        'a heading (`h3`, `card-title`), a paragraph (`card-body`, `ink-body`) and a `data-mineral` naming one of the 21 families. Put cards in a grid (`.aptitudes`, `.work-list`, `.questions`: `repeat(auto-fit, minmax(16rem, 1fr))`, gap `space-3`).',
        [('Card (default)', 'Every card: aptitudes, work items, questions, journey stops.'), ('Link card', 'See LinkPanel.'), ('Framed (`.panel__rule`)', 'Only for something that frames something larger, such as an embedded deck or a portrait. Brackets are opt-in, never the default.')],
        [('Default', '`sheet-wash` fill, 1px `ink-hair` border, padding `space-5` by `space-6`.'), ('Hover', 'The hairline strengthens to `ink-faint`. A framed panel also closes its brackets into the full rule.'),
         ('Focus', 'Only when it is a link: the `ring`.'), ('Disabled / loading', 'Not applicable: a card is a surface, not a control.')],
        'Use the right element: `li` inside a list, `article` for a standalone card, `a` for a link card. The mineral is decoration; never the only way to tell cards apart.',
        'Let the mineral appear only as the rule under the heading (`mineral-weight`, 3px); keep radius at `radius-lg`.',
        'Set text in a mineral colour (raw minerals fail APCA as lettering), put a thick bar down the left edge, add a shadow or lift on hover, or draw corner brackets on an ordinary card.',
        '`sheet-wash`, `ink-hair`, `ink-faint`, `ink`, `ink-body`, `mineral-weight`, `radius-lg`, `space-3`, `space-5`, `space-6`.'))

# ---- LinkPanel
LP = lambda cls='', static=False: (f'<div class="panel link-panel link-panel--static {cls}" data-mineral="gold" style="max-width:340px"><h3>Digital Toolkit</h3><p>A consistent, supported set of digital tools for staff.</p></div>' if static else
    f'<a class="panel link-panel {cls}" data-mineral="gold" href="#" style="display:block;max-width:340px"><h3>Nyuchi StationKit</h3><p>A solar weather and soil station for smallholder farms.</p><span class="link-panel__path">Visit</span></a>')
comp('LinkPanel', card('Surfaces', 520, 'A card that links out, and its plain twin', states(
    ('Default', LP()), ('Hover', LP('ds-hover')), ('Focus', LP('ds-focus')), ('No public page', LP(static=True)))),
    doc('A card that links to somewhere else: the same panel, plus a mono `Visit` line and a mineral rule under the heading that rules itself longer on hover.',
        'a heading, a sentence, an `href` and a `data-mineral`. It opens in a new tab with `rel="noopener noreferrer"`.',
        [('Link', 'The ecosystem grid, where each tile names a project and points at its own site.'), ('Static (`link-panel--static`)', 'A project with nothing public to visit (a private repository): a plain tile with no link, no `Visit` line and no hover answer.')],
        [('Default', 'Panel surface, 2rem mineral rule under the heading, mono `Visit`.'), ('Hover', 'The wash deepens to `sheet-raised` and the mineral rule lengthens to 3.5rem. Not a lift.'),
         ('Focus', 'The `ring`; the rule lengthens as on hover.'), ('Static', 'Does not respond to the pointer at all.')],
        'The whole card is one link, named by its heading. Link only to public pages; a link to a 404 is worse than no link.',
        'Link to the project\'s own site or a public repository.', 'Lift the card, add a shadow, or link a tile to a private repository.',
        '`sheet-wash`, `sheet-raised`, `mineral-weight`, `ink-soft`, `label`, `radius-lg`.'))

# ---- Eyebrow / section head
comp('Eyebrow', card('Type', 330, 'The label above a section title', states(
    ('Eyebrow', '<p class="eyebrow is-open">Sheet 05 · The heritage seven</p>'),
    ('With a title', '<p class="eyebrow is-open">Now</p><h2 class="section-title sheet-h2" style="margin-top:12px">What I’m working on</h2>'),
    ('Margin note', '<span class="margin-note">still being tried</span>'))),
    doc('The mono line above a section title: `eyebrow` (JetBrains Mono, 600, uppercase, `0.28em` tracking), in `ink-soft`, with a hairline rule running out from it.',
        'the text. Keep it short and uppercase-friendly. The Chinese pages scale it through a gloss-sized face automatically.',
        [('Eyebrow', 'Names where a section sits ("Sheet 05 · The heritage seven"), as a figure tag does on a drawing.'), ('Margin note', 'A handwritten aside in `pencil`, set at a slight angle, pinned in a margin.')],
        [('Default', '`ink-soft` mono label with a running rule.'), ('Hover / focus / disabled', 'Not interactive.')],
        'It is a label, not a heading: the title beneath it is the `h2`. Do not put it inside the heading.',
        'Keep the weight at 600 and the size at `label-lg`.', 'Drop the weight to 400 (the size and weight are one decision) or set it in a mineral colour.',
        '`ink-soft`, `ink-faint`, `label-lg`, `label-weight`, `pencil`, `hand`.'))

# ---- PullQuote
comp('PullQuote', card('Type', 230, 'A pull quote against a mineral rule', states(
    ('Quote', '<blockquote class="pull" data-mineral="copper">Skills meant survival and success, not grades or good school names.</blockquote>'))),
    doc('A pull quote: `display` at `pull-quote` size, weight 400, in `ink`, set off by a `mineral-weight` rule down its inside edge in the section\'s mineral.',
        'the sentence and a `data-mineral`.',
        [('Pull quote', 'Once or twice on a long page, to land the sentence a section exists for. The one place the system uses a thick edge rule.')],
        [('Default', '`ink` serif against a 3px mineral rule.'), ('Hover / focus / disabled', 'Not interactive.')],
        'Use a `<blockquote>`. If it quotes a person, cite them in the surrounding prose.',
        'Use it sparingly; match the rule to the section\'s mineral.', 'Use the same edge rule on a card (cards take the rule under the heading) or set the quote in a mineral colour.',
        '`ink`, `mineral-weight`, `display`, `space-6`.'))

# ---- PaletteKey
def key_item(i, m, compact=False):
    mi = MIN[m]; x = ratio(mi['hex'], SHEET_DARK)
    figs = f'<div class="key__figures"><span class="key__hex">{mi["hex"].upper()}</span><span class="key__ratio">{x:.2f}:1 <span class="key__grade">{grade(x)}</span></span></div>'
    if compact:
        return f'<li><article class="panel key__item" data-mineral="{m}"><span class="key__swatch" aria-hidden="true"></span><div class="key__body"><h3>{m}</h3></div>{figs}</article></li>'
    return (f'<li><article class="panel key__item" data-mineral="{m}"><span class="key__index">{i:02d}</span><span class="key__swatch" aria-hidden="true"></span>'
            f'<div class="key__body"><h3>{m}</h3><dl><dt>Means</dt><dd>{mi["means"]}</dd><dt>Mined in</dt><dd>{mi["origin"]}</dd><dt>Used for</dt><dd>{mi["usage"]}</dd></dl></div>{figs}</article></li>')
comp('PaletteKey', card('Surfaces', 760, 'A row of the palette key, and the compact grid', states(
    ('Rows', '<ol class="key" style="margin:0">' + ''.join(key_item(i, m) for i, m in enumerate(list(MIN)[:2], 1)) + '</ol>'),
    ('Compact', '<ol class="key key--compact" style="margin:0">' + ''.join(key_item(i, m, True) for i, m in enumerate(list(MIN)[:4], 1)) + '</ol>'))),
    doc('One row of a colour key: an index, the mineral as a 4px swatch bar stood on end, the name in `ink` with its meaning, origin and use, and the hex with its measured contrast on the ground.',
        'a `data-mineral`, a name and the definition list. Every figure is computed from the same tokens the swatch is drawn with, so the page cannot drift from the palette.',
        [('Rows', 'A set that has an origin, a meaning and a use: the seven minerals and the heritage tones.'), ('Compact (`key--compact`)', 'A set with a colour and a name and nothing else: the experimental seven.')],
        [('Default', 'Panel surface; swatch bar in the mineral; name in `ink`; hex and `AAA`/`AA` grade in mono.'), ('Hover / focus / disabled', 'Not interactive.')],
        'The swatch is `aria-hidden`; the name and figures carry the information. Contrast is printed so the colour is judged by number, not by eye.',
        'Print the contrast figure and grade next to every swatch.', 'Print a mineral\'s name in its own colour: sodalite measures Lc 24.6 as lettering.',
        '`mineral-<name>`, `ink`, `ink-soft`, `label`, `mineral-weight`, `radius-lg`.'))

# ---- Footer (real markup)
footer = real(HOME, 'mzizi-footer')
comp('Footer', card('Chrome', 560, 'The canonical navigation and title block', states(('Footer', footer + '<style>.mzizi-footer{margin:0}</style>')), 'body{padding:0}.ds-row{grid-template-columns:1fr}.ds-cap{display:none}'),
    doc('The canonical navigation: Site, Ecosystem and Connect, the copyright line, the title block ("Drawn by B.D.F. · Sheet 01 / 06 · Rev A") and the seven mineral dots, under a 3px strip of the seven minerals. Its markup is the Mzizi registry\'s `mzizi-footer` contract, written without a framework.',
        'the language, the sheet number and the year; the links, strings and ecosystem list come from the site\'s data.',
        [('Footer', 'The foot of every page.')],
        [('Link default', '`ink` text, 44px target.'), ('Link hover / focus', 'Hover underlines; focus draws the `ring`.'), ('Disabled / loading', 'Not applicable.')],
        '`<footer role="contentinfo">` with one `nav` per section, each labelled by its title. The mineral strip and dots are `aria-hidden`. Links to other sites open with `rel="noopener noreferrer"`.',
        'Keep the strip and dots as `<span data-mineral>`, coloured by `--mineral`.', 'Colour the strip or dots with an inline style, or add a fourth section.',
        '`ink`, `ink-soft`, `ink-hair`, `sheet`, `label`, `mineral-<name>`.'))

# ---- Header (real markup) + link states
header = real(HOME, 'mzizi-header')
comp('Header', card('Chrome', 640, 'The sticky header, with a current page and every link state', states(
    ('Header', '<div class="ds-wrap">' + header + '</div>'),
    ('Link states', '<nav style="display:flex;gap:12px;flex-wrap:wrap"><a class="mzizi-header__link" href="#">Default</a><a class="mzizi-header__link ds-hover" href="#">Hover</a><a class="mzizi-header__link is-current" aria-current="page" href="#">Current</a><a class="mzizi-header__link ds-focus" href="#">Focus</a></nav>')),
    '.mzizi-header{position:static}.ds-row{grid-template-columns:1fr}'),
    doc('The sticky header, laid out as Nyuchi Learning\'s: a portrait and serif name, text links in the middle, the language switcher, a ghost theme toggle and the "Book a Call" pill. 64px, 80px from 64rem. Its markup is the Mzizi registry\'s `mzizi-header` contract without a framework.',
        'the language and the current route. The links, strings and portrait come from the site\'s data.',
        [('Desktop', 'Brand, links, language switcher, theme toggle and CTA in one bar.'), ('Phone (below 56rem)', 'The bar keeps brand, toggle and pill; the links drop to a second row that scrolls sideways, ending in the language switcher. Never a hamburger: every destination stays one tap away. The name hides below 22.5rem.')],
        [('Link default', '`ink-soft`, 44px target.'), ('Link hover', 'Underlines in `ink`.'), ('Link current', '`is-current` with `aria-current="page"`: underlined in `brand`.'), ('Link focus', 'The `ring`.'),
         ('Theme toggle', 'Shows the sun or moon (`--show-light-only`, `--show-dark-only`); stores an explicit choice in `localStorage("theme")`, applied as `data-theme` before first paint.'), ('Disabled / loading', 'Not applicable.')],
        '`<header>` landmark, `nav` with an `aria-label`, a skip link before it, `aria-current="page"` on the current link, the toggle labelled and `aria-pressed`. Every target is at least 44px.',
        'Keep every destination visible and one tap away on a phone.', 'Hide the navigation behind a menu, shrink targets below 44px, or add a second accent.',
        '`sheet`, `ink`, `ink-soft`, `ink-hair`, `brand`, `radius-full`, `space-3`, `space-5`.'))

# ---- LanguageSwitcher
lang = real(HOME, 'lang')
comp('LanguageSwitcher', card('Chrome', 300, 'The link to the page in the other language', states(
    ('Default', lang), ('Hover', lang.replace('class="lang', 'class="lang ds-hover', 1)), ('Focus', lang.replace('class="lang', 'class="lang ds-focus', 1)))),
    doc('A pill that links to the *current page* in the other language, so the reader lands on its counterpart, not the home page. The label is the other language\'s name in its own script (`中文`, `English`).',
        'the current language and the page\'s language-neutral path; a page whose translation has its own slug passes where to go.',
        [('Link', 'Always: it is a link, not a toggle that reloads in place.')],
        [('Default', 'Hairline pill with the label in `ink`, set in the chrome face (`--cjk-chrome`) so English pages never fetch a Chinese font.'), ('Hover', 'Border draws in `ink`.'), ('Focus', 'The `ring`.'), ('Disabled / loading', 'Not applicable.')],
        'Carries `hreflang` and `lang` for the target. A page with no translation falls back to the other language\'s list page, and its `hreflang` alternate is omitted.',
        'Point at the real counterpart page.', 'Send the reader to the home page, or list an `hreflang` alternate for a page that is not a translation.',
        '`ink`, `ink-hair`, `radius-full`, `label`, `cjk-chrome`.'))

# ---- PageHeader
ph = real(EXPERIENCE, 'page-header')
comp('PageHeader', card('Chrome', 420, 'The title block that opens every page', states(('Page header', ph)), '.ds-row{grid-template-columns:1fr}.ds-cap{display:none}'),
    doc('The title block that opens every page except the home page: an eyebrow, the page title in `title` (uppercase `display`, 700), a lede, and an optional margin note.',
        'an `eyebrow`, a `title`, a `lede`, an optional `note` and, in the slot, optional actions.',
        [('Page header', 'Every inner page. One per page, and it carries the page\'s only `h1`.')],
        [('Default', 'Title in `ink` at `title`; lede in `ink-body`, filling its container.'), ('Hover / focus / disabled', 'Not interactive; actions in the slot follow Button.')],
        'The title is the page\'s single `h1`. Heading order must not skip: sections beneath start at `h2`.',
        'Keep the title short and uppercase-friendly.', 'Add a second `h1`, or set the lede narrower than its container (text fills its column).',
        '`ink`, `ink-body`, `title`, `lede`, `eyebrow`, `margin-note`.'))

# ---- Hero
hero = real(HOME, 'hero')
comp('Hero', card('Chrome', 760, 'The home page opener', states(('Hero', hero)), '.ds-row{grid-template-columns:1fr}.ds-cap{display:none}'),
    doc('The home page opener: the drafted two-word lockup (the first word solid, the second outlined), a one-line proposition, two actions, a byline and a margin note.',
        'two words (`solid`, `drafted`), an `eyebrow`, a `sub` line, a `note` and the action buttons.',
        [('Hero', 'The home page only. A page has one hero, and its action is the only 56px button.')],
        [('Default', 'Uppercase display lockup at `display-xl`; the second word is stroked in `ink` and filled `ink-drafted`.'), ('Actions', 'Follow Button: primary at the hero size, ghost beside it.')],
        'The lockup is one `h1` split into two spans. The outline uses `-webkit-text-stroke` behind an `@supports` guard, so a browser without it shows solid text, never invisible text.',
        'Show the work, not an adjective; keep to one proposition.', 'Use `color: transparent` without the `@supports` guard, or add a second hero elsewhere.',
        '`ink`, `ink-drafted`, `display-xl`, `lede`, `pencil`, `brand`.'))

# ---- Portrait
portrait = real(HOME, 'portrait')
comp('Portrait', card('Media', 560, 'The framed plate', states(('Portrait', '<div style="max-width:320px">' + portrait + '</div>')), '.ds-row{grid-template-columns:1fr}.ds-cap{display:none}'),
    doc('The portrait as a framed plate: a hairline, corner brackets and a ruled caption, desaturated halfway so the face belongs to the drawing.',
        'a width and an optional caption. The image goes through `astro:assets` on prerendered pages; anything shared by the nav or the footer uses a plain `<img>` instead.',
        [('Plate', 'The one place the corner brackets are part of the default treatment, because it frames a photograph.')],
        [('Default', 'Image at 50% saturation inside the bracketed frame, caption in the mono label.'), ('Hover / focus / disabled', 'Not interactive.')],
        'The image carries meaningful `alt`. The brackets are `aria-hidden`.',
        'Use one portrait per page.', 'Use `<Image>` from `astro:assets` in anything the on-demand blog routes render: it resolves to an endpoint that does not exist there.',
        '`ink`, `ink-hair`, `radius-lg`, `label`.'))

# ---- ContactCard
contact = real(HOME, 'card')
comp('ContactCard', card('Media', 700, 'Portrait, particulars and the booking QR', states(('Card', '<div style="max-width:520px">' + contact + '</div>')), '.ds-row{grid-template-columns:1fr}.ds-cap{display:none}'),
    doc('The contact card: the portrait, the particulars, and a QR that opens the 30-minute booking page, because booking is the one action the site asks for. A "Download .vcf" link sits beneath it.',
        'the language, an optional portrait width and `eager` for above-the-fold use. The QR is rendered to SVG at build time.',
        [('Dark QR', 'Light ink on Mzizi\'s cobalt container: an inverted code the iOS Camera and Google Lens read.'), ('Light QR', 'The light ink on white: a conventional code every scanner reads. One of the two is shown per theme (`--show-dark-only`, `--show-light-only`).')],
        [('Default', 'Panel surface with portrait, name, roles, email and the QR.'), ('Download link', 'Hover underlines; focus draws the `ring`.'), ('Disabled / loading', 'Not applicable.')],
        'The QR is decorative to assistive tech and the booking link is also a plain link. The vCard stays English in both languages: one canonical record.',
        'Re-verify any change to the QR by decoding a real screen capture.', 'Put the QR over the blueprint ruling (a phone will not lock onto it) or make the vCard differ by language.',
        '`sheet-wash`, `ink`, `ink-soft`, `radius-lg`, `mineral-cobalt-container`.'))

# ---- WorkshopStrip
strip = real(HOME, 'strip')
comp('WorkshopStrip', card('Media', 420, 'The captioned plates', states(('Strip', strip)), '.ds-row{grid-template-columns:1fr}.ds-cap{display:none}'),
    doc('A strip of captioned plates from the workshop, each framed like the portrait.',
        'the language; the plates and captions come from the site\'s data.',
        [('Strip', 'Under the hero, to show the work.')],
        [('Default', 'Plates in a row with mono captions.'), ('Hover / focus / disabled', 'Not interactive.')],
        'Each plate\'s caption is its accessible name.', 'Keep captions to a label.', 'Make the plates a carousel.',
        '`ink`, `ink-hair`, `label`, `radius-lg`.'))

# ---- Schematics
sch = outer(HOME, 'schematics')
comp('Schematics', card('Media', 420, 'Three faint line drawings over the ground', f'<div style="position:relative;height:340px;overflow:hidden;border:1px solid var(--ink-hair);border-radius:var(--radius-lg)">{sch}</div>'),
    doc('Three faint line drawings laid over the ground, held to 9–13% opacity so they read as drawings and cost the text nothing.',
        'nothing: it is decorative and positions itself (`.schematics__1`, `__2`, `__3`).',
        [('Schematics', 'The page ground, behind everything.')],
        [('Default', 'Absolute over the document (they travel with the sheet), in `ink`.')],
        'The whole group is `aria-hidden` and `pointer-events: none`.',
        'Keep them behind content and under 13% opacity.', 'Raise their opacity or put text over a drawing without re-running the contrast gate.',
        '`ink`.'))

# ---- SkipLink
comp('SkipLink', card('Chrome', 220, 'First in the tab order, hidden until focused', states(
    ('Hidden', '<div style="position:relative;height:60px;overflow:hidden"><a class="skip-link" href="#main">Skip to main content</a></div>'),
    ('Focused', '<div style="position:relative;height:60px;overflow:hidden"><a class="skip-link ds-focus" href="#main">Skip to main content</a></div>'))),
    doc('A pill that is the first focusable element on every page and slides into view on focus, so a keyboard user can jump past the header.',
        'the label and the id of the main landmark.',
        [('Skip link', 'Every page.')],
        [('Hidden', 'Translated off-screen, still in the tab order.'), ('Focus', 'Slides into view with the `ring`.')],
        'It must stay reachable: never `display: none`. Targets `#main`.',
        'Keep it first in the document.', 'Remove it, hide it with `display: none`, or leave it focused while measuring contrast: it would sit over the header.',
        '`sheet-raised`, `ink`, `radius-full`, `label-lg`, `ring`.'))

# ---- Journey
journey = real(ORIGINS, 'journey')
comp('Journey', card('Surfaces', 560, 'A path in stops, each keyed to a mineral', states(('Journey', journey)), '.ds-row{grid-template-columns:1fr}.ds-cap{display:none}'),
    doc('An ordered list of stops, each one a dated place and a role, keyed to its own mineral: used for a career path or any sequence where the order matters.',
        'a list of stops with a period, a place, a role and a detail, each with a `data-mineral`.',
        [('Journey', 'Only where the order is information the reader needs.')],
        [('Default', 'Each stop: a mono period and place with the mineral as a rule, then the role in `display` and the detail.'), ('Hover / focus / disabled', 'Not interactive.')],
        'An `ol`, so the order is announced. The period and place read as the stop\'s first line.',
        'Use it for a real sequence.', 'Number things that are not a sequence.',
        '`ink`, `ink-body`, `ink-soft`, `mineral-weight`, `label`, `display`.'))

# ---- Cover
cover = """<!-- @dsCard height=288 -->
<style>body{margin:0;padding:0;background:var(--sheet)}svg{display:block;width:960px;height:288px}
.river{fill:var(--brand)}.cobalt{fill:var(--mineral-cobalt)}.tanzanite{fill:var(--mineral-tanzanite)}.gold{fill:var(--mineral-gold)}.copper{fill:var(--mineral-copper)}
.blk{rx:var(--radius-lg)}.rule{stroke:var(--ink-faint);stroke-width:1;fill:none}
.name{font-family:var(--font-display),'Noto Serif',Georgia,serif;font-weight:700;fill:var(--ink)}
.tag{font-family:var(--font-sans),'Noto Sans',system-ui,sans-serif;fill:var(--ink-soft)}</style>
<svg viewBox="0 0 960 288" role="img" aria-label="Bryan Fawcett design system">
<!-- derivation
 blocks: brand (river) 168x288 slab, mineral-cobalt 140x120, mineral-tanzanite 144x168 off the top edge, mineral-gold 92x128, mineral-copper 192x104 off the bottom edge; sides are multiples of space-4 (16)
 arrangement: one tall river slab at x=480 with satellites staggered to the right, two bleeding off the top and bottom edges
 pattern: four hairlines at ink-faint, one per 72px (the sheet's baseline), because the system says "rules, not shadows" and draws its containers as line work
 steps/radii: radius-lg (14px) on every block; hairlines span x=480..960 only, nothing crosses the name -->
<rect class="river blk" x="480" y="0" width="168" height="288"/>
<rect class="cobalt blk" x="664" y="24" width="140" height="120"/>
<rect class="tanzanite blk" x="816" y="0" width="144" height="168"/>
<rect class="gold blk" x="664" y="160" width="92" height="128"/>
<rect class="copper blk" x="768" y="184" width="192" height="104"/>
<path class="rule" d="M480 48H960M480 120H960M480 192H960M480 264H960"/>
<text class="name" x="32" y="148" font-size="92">Bryan</text>
<text class="name" x="32" y="236" font-size="92">Fawcett</text>
<text class="tag" x="32" y="266" font-size="13">A drafted sheet in seven African minerals.</text>
</svg>
"""
w('components/Cover/preview.html', cover)

for name, (prev, rd) in COMPONENTS.items():
    w(f'components/{name}/preview.html', prev)
    w(f'components/{name}/README.md', rd)

# ================================================================== README (brand book)
readme = """The Bryan Fawcett design system is the look of bryanfawcett.com: a drafted sheet in the Mzizi and Bundu standard, light and dark following the device. It is a showcase for that standard, so it uses the standard's names (`--mineral-<name>`, `--radius-<name>`, `--ring`) and does not invent colours.

## Content fundamentals

- **Write in the first person, plainly.** "I craft dynamic ecosystems that unite and empower communities." Short, direct sentences. Show the work; never claim an adjective.
- **Never frame the work around AI.** No "AI-powered". An AI product is named once, as a pillar, and nothing more.
- **No number without proof.** Print a figure only where a live site states it today. Leave out counts, client names and quotes until they exist.
- **Name things by what people recognise.** A project is its own name ("Mukoko Weather"); say who it is for before how it is built.
- **Proper nouns are never translated.** Nyuchi, Mukoko, Bundu, Shamwari, Mzizi and the school names stay in Latin script in both languages, with a short Chinese gloss in parentheses where a reader needs the handhold ("The Bundu Foundation（本都基金会）").
- **Attribute precisely.** Mzizi, the open standards, the Weather Commons and the Zimbabwe Information Platform are Bundu Foundation work; Nyuchi Africa operates some of them; Mukoko is its own pillar. Do not call Bundu work Nyuchi's.
- **Say exactly what a button does.** "Book a call", then the call is free and thirty minutes.
- **Link only to public pages.** A tile for something private is a plain tile; mention it by name, do not link it.

## Visual foundations

**Ground.** The page is `sheet`; cards and panels sit one step up on `sheet-wash`; inset chips take `sheet-wash-light`; menus and the control bar take `sheet-raised`. The step between `sheet` and `sheet-wash` is small, so panels carry a `ink-hair` hairline. The ground is matte and neutral, with a faint blueprint grid in `rule-minor` and `rule-major` that travels with the sheet and is never painted behind text.

**One primary colour.** `brand` (heritage river) fills the primary button and underlines links, with `on-brand` text at weight 700. Do not mix it with a second accent. Colour lives in the minerals.

**Minerals.** There are 21 families in three sets: the seven minerals (cobalt, tanzanite, malachite, gold, terracotta, sodalite, copper), the seven heritage tones (indigo, savanna, baobab, sunset, river, hematite, kalahari) and seven experimental families. Key anything to one with `data-mineral="<name>"`; the stylesheet sets `--mineral`. A mineral is a mark: a 3px rule (`mineral-weight`) under a heading, a swatch bar beside a word, a dot. **A raw mineral is never the colour of text**, because set on the ground the seven measure Lc 25–48 as lettering. The word is `ink`; the mineral goes under it or beside it. The same holds on hover: a link underlines in its mineral, it does not turn that colour. Surfaces themed in a mineral use `--mineral-container` with `--mineral-on-container` text.

**Type.** Noto Serif (`display`) for H1 to H3 and the big lockups; Noto Sans (`sans`) for everything people read; JetBrains Mono (`mono`) for labels, figure tags and the title block; Caveat (`hand`) only for margin notes and the signature. Mono labels are `label` at `label-weight`, 15px at 600: size and weight trade against each other in APCA, so dropping to 400 is a regression. Prose fills its container (`measure` is 100%).

**Radius and lines.** Cards and panels take `radius-lg` (14px) with a 1px `ink-hair` border. Buttons, the skip link, toggles and the control bar are always pills (`radius-full`). Buttons are 48px tall (56px for a page's one hero action). Use rings and rules, never shadows: no drop shadows, no lift on hover. Hover on a card strengthens its hairline to `ink-faint`.

**Cards.** The card is the aptitude card: a grid of panels, the heading in `ink`, the mineral as a rule under it, padding `space-5` by `space-6`. There is no thick bar down the left edge of a card. A pull quote is the only place a mineral rule runs down an edge. Corner brackets are opt-in for something that frames something larger.

**Space.** Use `space-1` to `space-10` (4px to 64px); a value off the scale should look deliberately off it. Padding and gaps are never `1.1rem`.

**States.** Every interactive component has a default, hover, focus, active, disabled and loading state where they apply. Hover draws the ink ring or deepens the surface; focus is a 2px `ring` with a 2px offset and is never removed; disabled uses the `disabled` attribute and a neutral surface; loading is `aria-busy="true"` and a ring beside the label. None of them lifts a control or adds a shadow. Every interactive target is at least 44px, except a link inside a sentence.

**Motion.** Small and honest: a hairline strengthens, a mineral rule lengthens, a page unrolls. Everything respects `prefers-reduced-motion`.

**Contrast.** Every text block clears APCA for its size and weight in both themes. Opacity on a block of words multiplies against the ground and is not allowed.

## Iconography

There is no icon set. Arrows are the glyphs `←` and `→`; a status is a word. Marks are minerals: a rule, a swatch bar, a dot. Do not add emoji or a third-party icon font. The site has no logo: the name is set in `display`.

## Components

`Button`, `Panel`, `LinkPanel`, `Eyebrow`, `PullQuote`, `PaletteKey`, `Journey`, `Header`, `LanguageSwitcher`, `SkipLink`, `PageHeader`, `Hero`, `Portrait`, `ContactCard`, `WorkshopStrip`, `Schematics` and `Footer`. Each has a README (variants, states, accessibility, do and don't, tokens) and a live preview taken from the markup the site ships. Their styles are the site's own stylesheet in `components/bundle.css`.
"""
w('README.md', readme)

now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
w('design-system.json', json.dumps({
    'v': 3, 'layout': 'files', 'createdOnFiles': {'v': 1, 'at': now}, 'title': 'Bryan Fawcett Design System', 'namespace': 'FawcettSheet',
    'libraries': [], 'sections': {}, 'groups': [], 'assetGroups': {}, 'blobs': {}, 'docs': {'readme': 'project/README.md', 'sections': []},
    'lastChange': {'by': 'Bryan Fawcett', 'at': now, 'via': 'Claude Code · bryanfawcett.com', 'note': 'Built from bryanfawcett.com: tokens.css, palette.ts, minerals.ts, global.css, the vendored fonts and the built pages.'}}, indent=2) + '\n')

# ================================================================== the skill (same content, laid out for a consumer)
def build_skill(dest):
    if os.path.isdir(dest): shutil.rmtree(dest)
    ref = os.path.join(dest, 'references'); ast = os.path.join(dest, 'assets')
    os.makedirs(ref); os.makedirs(os.path.join(ast, 'fonts'))
    shutil.copy(f'{OUT}/README.md', f'{ref}/brand-book.md'); shutil.copy(f'{OUT}/tokens.json', f'{ref}/tokens.json')
    shutil.copytree(f'{OUT}/components', f'{ref}/components', ignore=shutil.ignore_patterns('bundle.css'))
    shutil.copy(f'{OUT}/components/bundle.css', f'{ast}/components.css')
    for _, f, *_ in fonts: shutil.copy(f'{OUT}/fonts/{f}', f'{ast}/fonts/{f}')
    # a self-contained tokens.css for a consumer that does not run @bundu/ui: the site's tokens, plus radius, ring and the 14 non-mineral families
    extras_light = ';'.join([f'--radius-sm:7px;--radius-md:12px;--radius-lg:14px;--radius-xl:17px;--radius-2xl:17px;--radius-full:9999px;--ring:#0047AB'] + [f'--color-{m}-container:var(--mineral-{m}-container)' for m in MIN] + [f'--color-{c["name"]}:{c["value"]["light"]}' for c in color_tokens if c['name'] in {x['name'] for x in HER + EXP}])
    extras_dark = ';'.join(['--ring:#00B0FF'] + [f'--color-{c["name"]}:{c["value"]["dark"]}' for c in color_tokens if c['name'] in {x['name'] for x in HER + EXP}])
    extra = (f'\n/* Added for a consumer that does not load @bundu/ui: radius, the focus ring and the 14 heritage and experimental families. */\n'
             f':root {{ {extras_light}; }}\n@media (prefers-color-scheme: dark) {{ :root:where(:not([data-theme="light"], .light)) {{ {extras_dark}; }} }}\n'
             f':root:where([data-theme="dark"], .dark) {{ {extras_dark}; }}\n')
    open(f'{ast}/tokens.css', 'w').write(tokens_css + extra)
    # fonts.css, Latin only
    fc = read('src/styles/fonts.css')
    faces = [b for b in re.findall(r'@font-face\s*\{.*?\}', fc, re.S) if 'noto-serif-sc' not in b]
    for b in faces:
        f = re.search(r'url\(/fonts/([^)]+)\)', b).group(1)
        if not os.path.exists(f'{ast}/fonts/{f}'): shutil.copy(os.path.join(ROOT, 'public/fonts', f), f'{ast}/fonts/{f}')
    open(f'{ast}/fonts.css', 'w').write('\n\n'.join(b.replace('url(/fonts/', 'url(./fonts/') for b in faces) + '\n')
    shutil.copy(os.path.join(ROOT, 'public/fonts/OFL.txt'), f'{ast}/fonts/OFL.txt')
    os.makedirs(os.path.join(dest, 'scripts'))
    open(f'{dest}/SKILL.md', 'w').write(SKILL_MD)
    open(f'{dest}/scripts/adopt.sh', 'w').write(ADOPT_SH); os.chmod(f'{dest}/scripts/adopt.sh', 0o755)
    open(f'{dest}/scripts/install.sh', 'w').write(INSTALL_SH); os.chmod(f'{dest}/scripts/install.sh', 0o755)

SKILL_MD = """---
name: fawcett-design-system
description: Use when building or restyling UI for any Bryan Fawcett, Nyuchi, Bundu, Mukoko or Mzizi property, or any repo that should share the bryanfawcett.com look (the drafted sheet, the 21 Mzizi colour families keyed with data-mineral, Noto Serif/Sans and JetBrains Mono, light and dark). Provides the tokens, fonts, the site's component stylesheet, documented components with every state, the rules (minerals are marks not text, cards are hairlines, buttons are pills, no shadows), and a script that adopts all of it into another repo.
---

# Bryan Fawcett design system

The look of bryanfawcett.com, packaged so another repo can adopt it and adapt it. It is the Mzizi and Bundu standard as that site implements it: a drafted sheet, light and dark following the device, colour carried by minerals.

## What is here

| Path | What |
|---|---|
| `references/brand-book.md` | The rules: content fundamentals, visual foundations, iconography. **Read first.** |
| `references/tokens.json` | Every token with a usage note, light and dark (62 colours, spacing, radius, marks, the type scale). |
| `references/components/<Name>/README.md` | One per component: variants, states, accessibility, do and don't, tokens used. |
| `references/components/<Name>/preview.html` | A live preview of each component in every state, from the markup the site ships. |
| `assets/tokens.css` | Self-contained CSS custom properties, light and dark, plus `data-mineral` keying for all 21 families. |
| `assets/fonts.css`, `assets/fonts/` | The self-hosted faces (Noto Serif, Noto Sans, JetBrains Mono, Caveat) and the OFL licence. |
| `assets/components.css` | The site's own component stylesheet. Adapt it; do not reinvent it. |
| `scripts/adopt.sh <repo>` | Copy the assets into another repo and print what to link. |
| `scripts/install.sh` | Install this skill for Claude Code (user or project). |

Components: Button, Panel, LinkPanel, Eyebrow, PullQuote, PaletteKey, Journey, Header, LanguageSwitcher, SkipLink, PageHeader, Hero, Portrait, ContactCard, WorkshopStrip, Schematics, Footer.

## Adopting it in a new repo

1. Run `scripts/adopt.sh <path-to-repo> [dir]`. It copies `tokens.css`, `fonts.css`, `fonts/` and `components.css` to `<dir>` (default `src/design`).
2. Load them in this order, before the project's own CSS: `tokens.css`, `fonts.css`, `components.css`.
3. Set `data-mineral="<name>"` on anything that carries a mineral; the stylesheet turns it into `--mineral`. Never write an inline style to colour something.
4. Add a theme switch if the project needs one: set `data-theme="light"` or `"dark"` on `<html>`; with none set, the device preference applies.
5. Build the page from the components in `references/components/`: copy the markup from a preview, not from memory.
6. Run an APCA check over the rendered pages in both themes before shipping. The system's whole accessibility case rests on it.

## The rules that matter most

- **A raw mineral is never the colour of text.** The word is `ink`; the mineral is the 3px rule under it or the swatch beside it. This holds on hover too.
- **One primary colour:** `brand` (heritage river). Do not add a second accent.
- **Cards are hairlines.** `radius-lg`, `ink-hair`, heading in `ink`, mineral as the rule under it. No thick left bar, no shadow, no lift, no corner brackets unless the panel frames something larger.
- **Buttons, the skip link, toggles and the control bar are pills** (`radius-full`). 48px tall; 56px once per page.
- **Mono labels are `label` at weight 600.** Dropping to 400 fails APCA.
- **Prose fills its container** (`--measure` is 100%).
- **Every interactive target is at least 44px**, and focus is a 2px `ring` with a 2px offset, never removed.
- **Spacing is the `--space-N` scale.** Hardcode a value only when it should look deliberately off the scale.
- **Link only to public pages.**

## Adapting it to a different brand

Change, in this order: `brand` and `on-brand` (check APCA at the button size), the display and sans families, the mineral subset (keep the keying mechanism), the content fundamentals in `brand-book.md`. Keep: the surface ladder, the hairline and pill language, the state model (hover draws the ring, focus ring, disabled neutral, loading ring), the rule that a mineral is a mark, and the contrast gate. A property that changes the palette should say so plainly: it is a derivative of the standard, not the standard.

## Keeping it current

The source of truth is the bryanfawcett.com repository. `pnpm build && pnpm design-system` regenerates this folder from `src/brand/tokens.ts`, `palette.ts`, `minerals.ts`, `src/styles/global.css` and the built pages, so a token or component change flows here by regeneration, never by hand. The same generator can also write the Claude design-system artifact (`--artifact DIR`).
"""

ADOPT_SH = """#!/usr/bin/env bash
# Copy the design system's assets into another repo.
#   adopt.sh <repo> [dir]     dir defaults to src/design
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
REPO="${1:?usage: adopt.sh <repo> [dir]}"
DIR="${2:-src/design}"
DEST="$REPO/$DIR"
mkdir -p "$DEST/fonts"
cp "$HERE/assets/tokens.css" "$HERE/assets/fonts.css" "$HERE/assets/components.css" "$DEST/"
cp "$HERE/assets/fonts/"* "$DEST/fonts/"
echo "Copied the design system into $DEST"
echo
echo "Next:"
echo "  1. Load, in this order, before your own CSS:"
echo "       $DIR/tokens.css   $DIR/fonts.css   $DIR/components.css"
echo "  2. Key anything that carries a mineral with data-mineral=\\"cobalt\\" (any of the 21 families)."
echo "  3. Copy markup from references/components/<Name>/preview.html; read references/brand-book.md first."
echo "  4. Run an APCA contrast check over the rendered pages in light and dark."
"""

INSTALL_SH = """#!/usr/bin/env bash
# Install this skill for Claude Code.
#   install.sh            into ~/.claude/skills/ (all projects)
#   install.sh --project  into ./.claude/skills/ (this project only)
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
NAME="$(basename "$HERE")"
if [ "${1:-}" = "--project" ]; then TARGET="$PWD/.claude/skills"; else TARGET="$HOME/.claude/skills"; fi
mkdir -p "$TARGET"
rm -rf "$TARGET/$NAME"
cp -R "$HERE" "$TARGET/$NAME"
echo "Installed $NAME into $TARGET"
"""

# ================================================================== write / check
if args.check:
    tmp = os.path.join(STAGE, 'skill'); build_skill(tmp)
    def same(a, b):
        cmp = filecmp.dircmp(a, b)
        if cmp.left_only or cmp.right_only or cmp.diff_files: return False
        return all(same(os.path.join(a, d), os.path.join(b, d)) for d in cmp.common_dirs)
    ok = os.path.isdir(SKILL) and same(tmp, SKILL)
    shutil.rmtree(STAGE)
    print('design system skill is up to date' if ok else 'the design system skill is stale; run `pnpm build && pnpm design-system`')
    sys.exit(0 if ok else 1)

build_skill(SKILL)
if args.artifact:
    if os.path.isdir(args.artifact): shutil.rmtree(args.artifact)
    shutil.copytree(STAGE, args.artifact)
shutil.rmtree(STAGE)
n = sum(len(f) for _, _, f in os.walk(SKILL))
print(f'skill: {n} files in {os.path.relpath(SKILL, ROOT)}  |  {len(COMPONENTS) + 1} components (+ cover)  |  {len(color_tokens)} colours')
