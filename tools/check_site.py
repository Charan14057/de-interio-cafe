"""Check the site before publishing.

    python3 tools/check_site.py

Looks through site/index.html and site/js/*.js and reports:
  · photos that are referenced but missing from site/images/
  · photos without their smaller copies in site/images/_sizes/ (run make_image_sizes.py)
  · links to files (PDF, CSS, JS, logos) that do not exist
Python 3 only, no extra packages.
"""
import os
import re
import sys

SITE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site')
GROUPS = {'book': 'catalogue-pages', 'why': 'why-choose-us', 'svc': 'services',
          'craft': 'craftsmanship', 'mat': 'materials'}


def photo_path(pid):
    """Same rule as DIC_PHOTO() in js/responsive-images.js."""
    g = GROUPS.get(pid.split('-')[0]) or 'projects/' + re.sub(r'-\d+$', '', pid)
    return f'images/{g}/{pid}.webp'


def main():
    html = open(os.path.join(SITE, 'index.html'), encoding='utf-8').read()
    js_dir = os.path.join(SITE, 'js')
    scripts = {f: open(os.path.join(js_dir, f), encoding='utf-8').read() for f in os.listdir(js_dir)}
    text = html + '\n'.join(scripts.values())
    problems = []

    # 1. files linked by path
    for ref in sorted(set(re.findall(r'(?:src|href)="((?:css|js|images|catalogue)/[^"#?]+)"', text))):
        if not os.path.exists(os.path.join(SITE, ref)):
            problems.append(f'missing file: {ref}')
    for ref in sorted(set(re.findall(r'images/[\w/-]+\.(?:webp|png|jpg)', text))):
        if '_sizes' in ref:
            continue
        if not os.path.exists(os.path.join(SITE, ref)):
            problems.append(f'missing photo: {ref}')

    # 2. photo ids used by the page data (portfolio, design ideas, services …)
    ids = set(re.findall(r'"((?:[a-z]+-)+\d{2})"', text))
    known = set()
    for folder, _, files in os.walk(os.path.join(SITE, 'images')):
        if '_sizes' in folder:
            continue
        known.update(f[:-5] for f in files if f.endswith('.webp'))
    for pid in sorted(ids):
        if pid in known and not os.path.exists(os.path.join(SITE, photo_path(pid))):
            problems.append(f'photo in the wrong folder: {pid} (expected {photo_path(pid)})')

    # 3. smaller copies
    for pid in sorted(known):
        for w in (800, 400):
            if not os.path.exists(os.path.join(SITE, 'images', '_sizes', str(w), pid + '.webp')):
                problems.append(f'no {w} px copy of {pid} — run python3 tools/make_image_sizes.py')
                break

    if problems:
        print('\n'.join(problems))
        print(f'\n{len(problems)} problem(s)')
        sys.exit(1)
    print(f'ALL GOOD — {len(known)} photos, every link resolves')


if __name__ == '__main__':
    main()
