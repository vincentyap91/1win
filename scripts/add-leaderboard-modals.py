"""Add the probed "Show all" leaderboard dialog to js/tournament-detail.js."""
import json

from capture_clean import ROOT, Media, clean_fragment
from local_mask_assets import embed_html_masks

media = Media('2026-10-15')
boards = json.loads((ROOT / 'captures/tour-leaderboard.json').read_text(encoding='utf-8'))
path = ROOT / 'js/tournament-detail.js'
raw = path.read_text(encoding='utf-8')
data = json.loads(raw[len('window.TOURNAMENT_DETAIL='):].rstrip().rstrip(';'))
for size, by_id in boards.items():
    for tid, html in by_id.items():
        if tid not in data or not html:
            continue
        data[tid].setdefault('leaderboard', {})[size] = embed_html_masks(clean_fragment(html, media), ROOT)
        print(tid, size, len(data[tid]['leaderboard'][size]))
path.write_text('window.TOURNAMENT_DETAIL=' + json.dumps(data, ensure_ascii=False) + ';\n', encoding='utf-8')
media.save()
print('downloaded', len(media.downloaded), 'missing', len(media.missing))
