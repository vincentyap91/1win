"""Serialise dialog/menu states of the local clone for the Figma "30 · Menus & Modals" page.

Each state opens itself in the page (FIGMA_PRE), marks the element to capture with data-figma-root and is rendered
to SVG at 1440 and 390 (scripts/figma/spec-to-svg.py). Run with the local server on :4174:

  python scripts/figma/prepare-states.py [state ...]
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'qa/figma-pages-2026-10-15'
STATES = {
    'promo': ('promotions', 'Promotion details', """
      document.querySelector('[class*="variant-1_titleBlock-i8wf0"]').click(); await sleep(900);
      document.querySelector('[data-local-modal="promo"]').setAttribute('data-figma-root','');"""),
    'language': ('index', 'Language picker', """
      const b=[...document.querySelectorAll('[data-testid="language-picker-button"]')].find(x=>x.getClientRects().length); b.click(); await sleep(700);
      document.querySelector('[class*="language-picker_tooltip"]').setAttribute('data-figma-root','');"""),
    'search': ('casino-search', 'Casino search · Games', """
      (document.querySelector('[data-local-modal="search"]')||[...document.querySelectorAll('[data-testid="modal-layout"]')].find(n=>n.firstElementChild)).setAttribute('data-figma-root','');"""),
    'betslip': ('sports', 'Bet slip · 2 selections', """
      const odds=[...document.querySelectorAll('[class*="_odd_ro0me_"]')].filter(o=>!o.disabled&&!o.closest('[disabled]')&&o.getClientRects().length);
      // Both viewports share one browser profile: selections stored by the first run would be toggled off again.
      if(JSON.parse(localStorage.getItem('1win-preview-betslip')||'[]').length<2){odds[1].click(); await sleep(400); odds[5].click(); await sleep(800);}
      if(innerWidth<768){const t=document.querySelector('[class*="_trigger_1b67u_"] [role="button"]'); if(t){t.click(); await sleep(900);}
        document.querySelector('[class*="_root_1cqdp_"]').setAttribute('data-figma-root','');}
      else{let e=document.querySelector('[data-scope="SelectionInfo"]');while(e&&e.getBoundingClientRect().width<300)e=e.parentElement;
        while(e&&e.parentElement&&e.parentElement.getBoundingClientRect().width<400)e=e.parentElement; e.setAttribute('data-figma-root','');}"""),
}


def main():
    names = sys.argv[1:] or list(STATES)
    base = (ROOT / 'scripts/figma/serialize.js').read_text(encoding='utf-8')
    for name in names:
        page, title, pre = STATES[name]
        script = OUT / f'.state-{name}.js'
        script.write_text(f"const FIGMA_ROOT = '[data-figma-root]';\nconst FIGMA_PRE = async () => {{{pre}\n}};\n" + base, encoding='utf-8')
        spec = OUT / f'state-{name}.json'
        r = subprocess.run(['node', '--experimental-websocket', 'scripts/figma/local-run.mjs', '--route', f'/{page}.html', '--script', str(script), '--out', str(spec), '--sizes', '1440x900,390x844'],
                           cwd=ROOT, capture_output=True, text=True, env={**__import__('os').environ, 'MSYS_NO_PATHCONV': '1'})
        print(name, r.stdout.strip().replace('\n', ' | '))
        data = json.loads(spec.read_text(encoding='utf-8'))
        for size, label in (('1440x900', '1440'), ('390x844', '390')):
            if 'tree' not in data.get(size, {}):
                print('  ', size, data.get(size)); continue
            subprocess.run([sys.executable, 'scripts/figma/spec-to-svg.py', str(spec), '--size', size, '--out', str(OUT / f'{title} {label}.svg'), '--name', title], cwd=ROOT)


if __name__ == '__main__':
    main()
