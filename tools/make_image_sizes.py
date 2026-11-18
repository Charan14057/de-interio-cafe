"""Make the smaller copies of every photo.

    python3 tools/make_image_sizes.py            # only photos that are new or changed
    python3 tools/make_image_sizes.py --all      # rebuild every copy

Each photo in site/images/<folder>/<name>.webp gets two lighter copies that phones and
thumbnails use automatically:

    site/images/_sizes/800/<name>.webp   (800 px wide)
    site/images/_sizes/400/<name>.webp   (400 px wide)

Run it after adding or replacing a photo. Needs Python 3 and Pillow (pip install Pillow).
"""
import os
import sys

from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site', 'images')
SIZES = (800, 400)
QUALITY = {800: 82, 400: 78}
SKIP = {'_sizes', 'brands'}


def photos():
    for folder, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP]
        for f in sorted(files):
            if f.endswith('.webp'):
                yield os.path.join(folder, f)


def main():
    rebuild = '--all' in sys.argv
    names, made = set(), 0
    for src in photos():
        name = os.path.basename(src)
        if name in names:
            sys.exit(f'Two photos share the name {name} — every file name must be unique.')
        names.add(name)
        for w in SIZES:
            dst = os.path.join(ROOT, '_sizes', str(w), name)
            if not rebuild and os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
                continue
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            im = Image.open(src)
            im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
            if im.width > w:
                im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            im.save(dst, 'WEBP', quality=QUALITY[w], method=6)
            made += 1
    # remove copies whose photo no longer exists
    removed = 0
    for w in SIZES:
        d = os.path.join(ROOT, '_sizes', str(w))
        for f in os.listdir(d) if os.path.isdir(d) else []:
            if f not in names:
                os.remove(os.path.join(d, f))
                removed += 1
    print(f'{len(names)} photos · {made} copies written · {removed} old copies removed')


if __name__ == '__main__':
    main()
