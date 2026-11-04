# Cut the white-background renders in assets/generated/ into trimmed transparent WebPs in public/assets/.
# ponytail: white-flood-fill matte, fine for studio shots on #FFF; swap for Vision/rembg if a render has a busy background.
import sys, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

SRC, OUT = sys.argv[1], sys.argv[2]

def matte(rgb, all_white=False):
    mn, mx = rgb.min(2), rgb.max(2)
    white = (mn > 238) & (mx - mn < 14)
    if all_white:
        bg = white
    else:
        lab, _ = ndi.label(white)
        edge = np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])
        bg = np.isin(lab, edge[edge > 0])
    fg = ndi.binary_opening(~bg, iterations=1)
    fg = ndi.binary_fill_holes(fg) if not all_white else fg
    alpha = ndi.gaussian_filter(fg.astype(np.float32), 0.7)
    # pull edge colours from the nearest solid pixel so there is no white fringe
    core = ndi.binary_erosion(fg, iterations=2)
    _, (iy, ix) = ndi.distance_transform_edt(~core, return_indices=True)
    out = rgb.copy()
    band = ~core
    out[band] = rgb[iy[band], ix[band]]
    return np.dstack([out, (alpha * 255).clip(0, 255).astype(np.uint8)])

def save(rgba, name):
    a = rgba[..., 3]
    ys, xs = np.where(a > 8)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    Image.fromarray(rgba[y0:y1, x0:x1]).save(f"{OUT}/{name}.webp", quality=92, method=6)
    return dict(name=name, w=int(x1 - x0), h=int(y1 - y0), crop=[int(x0), int(y0)])

info = []
for name, kw in [("tv", {}), ("organizer", {}), ("turntable_body", {}), ("recorder", {}),
                 ("vinyl", {"all_white": True}), ("vhs_cassette", {})]:
    rgb = np.asarray(Image.open(f"{SRC}/{name}.png").convert("RGB"))
    info.append(save(matte(rgb, **kw), name))

# already transparent: just trim
info.append(save(np.asarray(Image.open(f"{SRC}/tape_rack.png").convert("RGBA")), "tape_rack"))

rgb = np.asarray(Image.open(f"{SRC}/vhs_sleeves.png").convert("RGB"))
rgba = matte(rgb)
cols = np.where((rgba[..., 3] > 8).sum(0) > 0)[0]
runs = np.split(cols, np.where(np.diff(cols) > 1)[0] + 1)
assert len(runs) == 5, len(runs)
for i, r in enumerate(runs):
    piece = np.zeros_like(rgba); piece[:, r[0]:r[-1] + 1] = rgba[:, r[0]:r[-1] + 1]
    info.append(save(piece, f"sleeve{i + 1}"))
print(json.dumps(info))
