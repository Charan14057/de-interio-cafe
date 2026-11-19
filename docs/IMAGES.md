# Images

All pictures live in `site/images/`. Photographs are **WebP** files; brand logos are PNG.

## Folders

| Folder | What is in it | Used on |
|---|---|---|
| `projects/<project>/` | Photographs and design renders of one project (`fayyaz`, `mukundhan`, `navin-2` …) | every page |
| `catalogue-pages/` | Pages of the printed portfolio (`book-01` … `book-13`) | Portfolio · flip book |
| `why-choose-us/` | Six pictures for the "Why choose us" cards | Home |
| `services/` | Four pictures for "What we offer" | Home |
| `craftsmanship/` | Sixteen craft pictures | Services · Our craftsmanship |
| `materials/` | Sixteen materials and hardware pictures | Design Ideas · Materials & hardware |
| `brands/` | Supplier logos in their own colours (transparent background) | Home · Materials & hardware strip |
| `share/` | `og-image.jpg`, 1200 × 630 — the picture shown when the site link is shared on WhatsApp, LinkedIn etc. | link previews |
| `_sizes/800/`, `_sizes/400/` | Smaller copies of every photo — **generated, do not edit** | phones and thumbnails |

Project folders and their clients are listed in [image-inventory.csv](image-inventory.csv)
(project, client, location, room, photograph or design render, size).

## Naming

- Every file name is unique across all folders: `<project>-NN.webp` for projects
  (`sandhya-04.webp`), `<group>-<subject>.webp` for section pictures (`mat-laminates.webp`).
- Lower-case letters, numbers and hyphens only.
- The folder follows from the name — `DIC_PHOTO()` in `js/responsive-images.js` and
  `tools/check_site.py` use the same rule:
  `book-` → `catalogue-pages/`, `why-` → `why-choose-us/`, `svc-` → `services/`,
  `craft-` → `craftsmanship/`, `mat-` → `materials/`, anything else → `projects/<name without the number>/`.

## Size and quality

- Up to **1600 px wide** (a little more is fine), WebP quality 85–90. Typical file: 150–350 KB.
- Landscape photos work best everywhere (most slots are wider than tall).
- Export from Photoshop / Lightroom / Figma as WebP, or convert a JPEG:
  `python3 -c "from PIL import Image; Image.open('in.jpg').save('out.webp', quality=88)"`.

## Replacing a photo

1. Save the new picture with the **same file name** over the old one.
2. Run `python3 tools/make_image_sizes.py` (needs `pip install Pillow`).
3. Run `python3 tools/check_site.py`, then commit and push.

Photos are cached by browsers for up to 30 days. If a replaced photo still shows the old picture
after publishing, give the new file a new name instead (for example `sandhya-04b.webp`) and update
the references (search the project for the old name).

## Adding photos to a project

Add `<project>-NN.webp` to the project folder, run the two commands above, then add the name to
that project's `img` list in `PF` (`js/main.js`) and, if it should appear in Design Ideas, to the
matching collection in `IDEAS` (`js/design-ideas.js`).

## The portfolio PDF

`site/catalogue/De-Interio-Cafe-Portfolio.pdf` is the full-resolution catalogue (83 MB). It must
stay under 100 MB to be stored on GitHub.
