# pokeemerald 16x32 people strip (9 frames: down, up, left, down walk x2, up walk x2, left walk x2) -> the
# 256x256 4x4 walk sheet Room.jsx reads (64px frames, rows down/left/right/up, right = mirrored left, 2x).
# usage: python3 scripts/emerald_sheet.py SRC.png OUT.png
import sys
from PIL import Image, ImageOps

src = Image.open(sys.argv[1]).convert('RGBA')
if src.getpixel((0, 0))[3]: # index-0 background colour -> transparent
    bg = src.getpixel((0, 0))
    src.putdata([(0, 0, 0, 0) if p == bg else p for p in src.getdata()])
f = [src.crop((i * 16, 0, i * 16 + 16, 32)) for i in range(9)]
rows = [[f[0], f[3], f[0], f[4]], [f[2], f[7], f[2], f[8]], None, [f[1], f[5], f[1], f[6]]]
rows[2] = [ImageOps.mirror(x) for x in rows[1]]
out = Image.new('RGBA', (256, 256))
for r, row in enumerate(rows):
    for c, fr in enumerate(row):
        out.paste(fr.resize((32, 64), Image.NEAREST), (c * 64 + 16, r * 64))
out.save(sys.argv[2])
