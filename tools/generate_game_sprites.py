#!/usr/bin/env python3
"""Generate placeholder sprite PNGs for the "Ride for the Cause" mini-game.

These are stand-ins drawn as simple cartoon shapes in the site's gold/navy
palette. Real commissioned art can be dropped in later by replacing the output
files of the same name and dimensions (see common/src/game/assets.js).

Usage:
    python3 tools/generate_game_sprites.py

Output: common/src/assets/game/*.png
"""

import os
from PIL import Image, ImageDraw

# --- palette (mirrors common/src/index.css) ---
GOLD = (245, 158, 11, 255)          # --accent-gold #f59e0b
GOLD_LIGHT = (251, 191, 36, 255)    # --accent-gold-light #fbbf24
GOLD_DARK = (217, 119, 6, 255)      # --accent-gold-dark #d97706
NAVY = (7, 14, 27, 255)             # --bg-primary #070e1b
NAVY_SOFT = (17, 28, 48, 255)
WHITE = (245, 245, 245, 255)
BROWN = (120, 72, 40, 255)
BROWN_DARK = (84, 50, 28, 255)
HAY = (214, 178, 92, 255)
HAY_DARK = (170, 138, 66, 255)
MUD = (92, 64, 38, 255)
MUD_DARK = (66, 45, 26, 255)
ORANGE = (233, 124, 42, 255)
GREEN = (86, 158, 74, 255)
BLUE = (43, 91, 158, 255)
CLEAR = (0, 0, 0, 0)

# white horse (dark legs for contrast against a bright sky)
HORSE_BODY = (247, 247, 244, 255)
HORSE_OUTLINE = (120, 126, 138, 255)
HORSE_LEG = (74, 52, 34, 255)
HORSE_HOOF = (40, 30, 20, 255)
HORSE_MANE = (110, 74, 44, 255)

SS = 3  # supersample factor for anti-aliasing

OUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "common", "src", "assets", "game",
)


def new_canvas(w, h):
    img = Image.new("RGBA", (w * SS, h * SS), CLEAR)
    return img, ImageDraw.Draw(img)


def finish(img, w, h, name):
    out = img.resize((w, h), Image.LANCZOS)
    path = os.path.join(OUT_DIR, name)
    out.save(path)
    print(f"  wrote {name} ({w}x{h})")


def s(v):
    """Scale a coordinate/size by the supersample factor."""
    return v * SS


def draw_horse_frame(d, ox, legs_forward):
    """Draw one gallop frame. Drawn facing LEFT here; gen_horse mirrors each
    frame so the final sprite faces RIGHT (the direction of travel). Origin ox
    in supersampled px."""
    # legs first (behind the body), with hooves, in a dark tone for contrast
    lw = s(6)

    def leg(x1, y1, x2, y2):
        d.line([(ox + s(x1), s(y1)), (ox + s(x2), s(y2))], fill=HORSE_LEG, width=lw)
        d.ellipse([ox + s(x2 - 3), s(y2 - 2), ox + s(x2 + 3), s(y2 + 4)], fill=HORSE_HOOF)

    if legs_forward:
        leg(30, 48, 22, 66); leg(46, 50, 52, 66); leg(66, 48, 60, 66); leg(78, 48, 86, 64)
    else:
        leg(30, 48, 34, 66); leg(46, 50, 40, 66); leg(66, 48, 72, 66); leg(78, 48, 74, 66)

    # body + hindquarters
    d.ellipse([ox + s(18), s(20), ox + s(74), s(52)], fill=HORSE_BODY, outline=HORSE_OUTLINE, width=SS)
    d.ellipse([ox + s(58), s(16), ox + s(86), s(50)], fill=HORSE_BODY, outline=HORSE_OUTLINE, width=SS)
    # neck + head
    d.polygon([
        (ox + s(24), s(30)), (ox + s(10), s(6)),
        (ox + s(24), s(4)), (ox + s(34), s(26)),
    ], fill=HORSE_BODY, outline=HORSE_OUTLINE)
    d.ellipse([ox + s(4), s(2), ox + s(26), s(20)], fill=HORSE_BODY, outline=HORSE_OUTLINE, width=SS)
    # ear + eye + muzzle
    d.polygon([(ox + s(18), s(4)), (ox + s(24), s(-4)), (ox + s(26), s(6))], fill=HORSE_OUTLINE)
    d.ellipse([ox + s(9), s(7), ox + s(14), s(12)], fill=NAVY)
    d.ellipse([ox + s(4), s(12), ox + s(11), s(19)], fill=(210, 200, 190, 255))
    # mane + tail
    d.line([(ox + s(22), s(2)), (ox + s(34), s(24))], fill=HORSE_MANE, width=s(4))
    d.line([(ox + s(84), s(18)), (ox + s(94), s(44))], fill=HORSE_MANE, width=s(5))
    # gold saddle cloth
    d.rectangle([ox + s(40), s(22), ox + s(60), s(38)], fill=GOLD, outline=GOLD_DARK, width=SS)


def gen_horse():
    # two-frame horizontal strip, each frame 96x72, mirrored to face right
    fw, fh, frames = 96, 72, 2
    strip = Image.new("RGBA", (fw * frames * SS, fh * SS), CLEAR)
    for i, legs in enumerate((True, False)):
        frame = Image.new("RGBA", (fw * SS, fh * SS), CLEAR)
        draw_horse_frame(ImageDraw.Draw(frame), 0, legs)
        frame = frame.transpose(Image.FLIP_LEFT_RIGHT)  # face right
        strip.paste(frame, (i * fw * SS, 0))
    out = strip.resize((fw * frames, fh), Image.LANCZOS)
    out.save(os.path.join(OUT_DIR, "horse.png"))
    print(f"  wrote horse.png ({fw * frames}x{fh})")


def gen_fence():
    w, h = 54, 64
    img, d = new_canvas(w, h)
    # two white rails + posts (classic racetrack rail)
    for py in (14, 34):
        d.rounded_rectangle([s(2), s(py), s(52), s(py + 10)], radius=s(3), fill=WHITE, outline=GOLD_DARK, width=SS)
    for px in (8, 40):
        d.rectangle([s(px), s(6), s(px + 8), s(60)], fill=BROWN, outline=BROWN_DARK, width=SS)
    finish(img, w, h, "fence.png")


def gen_haybale():
    w, h = 62, 56
    img, d = new_canvas(w, h)
    d.rounded_rectangle([s(3), s(6), s(59), s(52)], radius=s(10), fill=HAY, outline=HAY_DARK, width=s(2))
    for ly in (16, 28, 40):
        d.line([(s(6), s(ly)), (s(56), s(ly))], fill=HAY_DARK, width=SS)
    # binding straps
    for lx in (22, 40):
        d.line([(s(lx), s(8)), (s(lx), s(50))], fill=BROWN_DARK, width=s(2))
    finish(img, w, h, "haybale.png")


def gen_mud():
    w, h = 96, 28
    img, d = new_canvas(w, h)
    d.ellipse([s(2), s(8), s(94), s(26)], fill=MUD, outline=MUD_DARK, width=s(2))
    d.ellipse([s(20), s(4), s(60), s(16)], fill=MUD_DARK)
    # splash highlights
    for cx, cy, r in ((30, 12, 3), (52, 10, 2), (70, 14, 3)):
        d.ellipse([s(cx - r), s(cy - r), s(cx + r), s(cy + r)], fill=(120, 90, 60, 255))
    finish(img, w, h, "mud.png")


def gen_horseshoe():
    w, h = 42, 42
    img, d = new_canvas(w, h)
    # thick gold U (outer arc minus inner arc, minus top gap)
    d.arc([s(6), s(4), s(36), s(40)], start=20, end=340, fill=GOLD, width=s(8))
    d.arc([s(6), s(4), s(36), s(40)], start=20, end=340, fill=GOLD_LIGHT, width=s(3))
    # nail holes
    for ang_x, ang_y in ((11, 30), (11, 12), (31, 30), (31, 12)):
        d.ellipse([s(ang_x - 2), s(ang_y - 2), s(ang_x + 2), s(ang_y + 2)], fill=GOLD_DARK)
    finish(img, w, h, "horseshoe.png")


def gen_carrot():
    w, h = 40, 44
    img, d = new_canvas(w, h)
    # body (pointing down)
    d.polygon([(s(12), s(14)), (s(28), s(14)), (s(20), s(42))], fill=ORANGE, outline=GOLD_DARK, width=SS)
    for ry in (20, 26, 32):
        off = (ry - 14) // 3
        d.line([(s(13 + off), s(ry)), (s(27 - off), s(ry))], fill=GOLD_DARK, width=SS)
    # leafy top
    for lx in (14, 20, 26):
        d.polygon([(s(lx), s(14)), (s(lx - 4), s(2)), (s(lx + 2), s(4))], fill=GREEN)
    finish(img, w, h, "carrot.png")


def gen_shield():
    w, h = 40, 46
    img, d = new_canvas(w, h)
    d.polygon([
        (s(6), s(6)), (s(34), s(6)), (s(34), s(26)),
        (s(20), s(42)), (s(6), s(26)),
    ], fill=BLUE, outline=GOLD, width=s(2))
    # gold cross
    d.rectangle([s(18), s(12), s(22), s(32)], fill=GOLD_LIGHT)
    d.rectangle([s(12), s(18), s(28), s(22)], fill=GOLD_LIGHT)
    finish(img, w, h, "shield.png")


def gen_coin():
    w, h = 32, 32
    img, d = new_canvas(w, h)
    d.ellipse([s(2), s(2), s(30), s(30)], fill=GOLD, outline=GOLD_DARK, width=s(2))
    d.ellipse([s(6), s(6), s(26), s(26)], outline=GOLD_LIGHT, width=s(2))
    # heart (donation theme)
    d.polygon([
        (s(16), s(22)), (s(9), s(14)), (s(12), s(10)), (s(16), s(13)),
        (s(20), s(10)), (s(23), s(14)),
    ], fill=(220, 60, 70, 255))
    finish(img, w, h, "coin.png")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"Generating placeholder game sprites -> {OUT_DIR}")
    gen_horse()
    gen_fence()
    gen_haybale()
    gen_mud()
    gen_horseshoe()
    gen_carrot()
    gen_shield()
    gen_coin()
    print("Done.")


if __name__ == "__main__":
    main()
