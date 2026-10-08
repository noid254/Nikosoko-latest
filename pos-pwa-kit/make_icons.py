"""Generate PWA icons (mustard + ink 'T'). Run: python make_icons.py"""
import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "pwa", "icons")
os.makedirs(OUT, exist_ok=True)


def make(size, maskable):
    im = Image.new("RGBA", (size, size), "#C9A227")
    if not maskable:  # rounded corners; maskable must be full-bleed
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, size, size), size // 5, fill=255)
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.paste(im, (0, 0), mask)
        im = out
    font = ImageFont.load_default()
    for f in ("C:/Windows/Fonts/georgiab.ttf", "C:/Windows/Fonts/timesbd.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"):
        if os.path.exists(f):
            font = ImageFont.truetype(f, int(size * (0.5 if maskable else 0.62)))
            break
    ImageDraw.Draw(im).text((size / 2, size / 2), "T", font=font, fill="#1f180c", anchor="mm")
    return im


make(192, False).save(os.path.join(OUT, "icon-192.png"))
make(512, False).save(os.path.join(OUT, "icon-512.png"))
make(512, True).save(os.path.join(OUT, "maskable-512.png"))
print("icons written to", OUT)
