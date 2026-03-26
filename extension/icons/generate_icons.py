"""
Run this once to generate icon16.png, icon48.png, icon128.png.
Requires: pip install Pillow
"""
from PIL import Image, ImageDraw, ImageFont
import os

SIZES = [16, 48, 128]

BG     = (15,  23,  42)   # #0f172a
ORANGE = (247, 147, 26)   # #f7931a


def make_icon(size: int) -> Image.Image:
    img  = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded-rect background
    r = max(2, size // 8)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=BG)

    # ₿ symbol centred
    font_size = int(size * 0.62)
    try:
        # Try to use a bold system font; fall back to default
        font = ImageFont.truetype("arialbd.ttf", font_size)
    except Exception:
        try:
            font = ImageFont.truetype("Arial Bold.ttf", font_size)
        except Exception:
            font = ImageFont.load_default()

    symbol = "₿"
    bbox   = draw.textbbox((0, 0), symbol, font=font)
    tw     = bbox[2] - bbox[0]
    th     = bbox[3] - bbox[1]
    x      = (size - tw) / 2 - bbox[0]
    y      = (size - th) / 2 - bbox[1]
    draw.text((x, y), symbol, font=font, fill=ORANGE)

    return img


if __name__ == "__main__":
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    for s in SIZES:
        icon = make_icon(s)
        out  = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"icon{s}.png")
        icon.save(out)
        print(f"Saved {out}")
