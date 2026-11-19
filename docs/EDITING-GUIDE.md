# Editing guide

Everything on the site can be changed with a text editor (VS Code recommended). After a change,
open `site/index.html` in a browser (or run `python3 -m http.server 8080 --directory site`) and
check the page on a phone-sized window too. Then commit and push — see [DEPLOYMENT.md](DEPLOYMENT.md).

> Tip: in VS Code, `Ctrl/Cmd + Shift + F` searches the whole project. Search for the words you
> can see on the page; that is the fastest way to find where they are written.

## 1. Text

- **Headings, paragraphs, buttons, captions** are written in `site/index.html`. Search for the
  sentence, change it, save.
- **Words that come from data** (project stories, testimonials, Design Ideas collections, services
  rooms) are in the data lists described in [PROJECT-STRUCTURE.md §6](PROJECT-STRUCTURE.md#6-content-data-where-the-words-and-photo-lists-live).
  Keep the quotes and commas exactly as they are — only change the text between the quotes.
- **Page titles** shown in the browser tab: `TITLES` in `js/main.js`.
- **Search engine description**: the `<meta name="description">` and `og:` tags at the top of `index.html`.

Headlines are split into lines for their reveal animation:

```html
<h2><span class="rmask"><span>Spaces we've</span></span>
    <span class="rmask"><span><em>brought to life.</em></span></span></h2>
```

Change the words inside the innermost `<span>`; keep the wrappers. `<em>` gives the gold italic.

## 2. Photos

See [IMAGES.md](IMAGES.md). To swap one photo for another of the same size and shape, replace the
file in `site/images/...` keeping the same file name, then run `python3 tools/make_image_sizes.py`.

## 3. Portfolio projects

A project appears in three places:

1. **Data** — the `PF` list in `js/main.js`. Copy an existing entry and change every field:

   | Field | Meaning |
   |---|---|
   | `id` | short name used in the address (`#project/sandhya`) and in photo names |
   | `name`, `client`, `kind`, `cat` | "Sandhya Residence", "Mrs. Sandhya", "Residence", "Residential" or "Commercial" |
   | `city`, `ct`, `place` | locality, city, and the two together |
   | `spaces` | list of rooms shown as chips |
   | `feel`, `blurb`, `story`, `hl` | three-word mood line, short and long description, highlights |
   | `pal` | colour swatches: `["#hex", "Name"]` |
   | `img` | photo names in the order they appear (first one is the cover) |

2. **Grid card** — in `index.html`, inside `<section id="pfWork">`, copy one
   `<article class="pf-tg-c" data-kind="project">…</article>` block and change the number, name,
   place, photo, `data-cat` (its city) and `data-i` (its position in `PF`, counting from 0).
3. **Photos** — a folder `site/images/projects/<id>/` with files `<id>-01.webp`, `<id>-02.webp` …

Then update the totals that mention "19 projects" (search for `19`) and run `python3 tools/check_site.py`.

## 4. Testimonials

`TST` (home page) and `TPS` (testimonials page) in `js/main.js`. Each review has:
`n` name, `p` project type, `l` place, `q` short quote, `f` full review, `s` one-line summary,
`img` photo shown beside it, `ph` caption of that photo, `m` initials.

## 5. Contact details and forms

All contact details are in **one place**: the `CONTACT` object near the top of the contact section
of `js/main.js`.

```js
const CONTACT = {
  phone: '+91 95000 78674',   tel: '+919500078674',
  phone2: '+91 73053 12201',  tel2: '+917305312201',
  whatsapp: '919500078674',
  email: 'mohanaraodeinteriocafe@gmail.com',
  address: ['No. 52, G-1, Jeyaraj Homes, 2nd Cross Street', 'Thirumalai Nagar Main Road, Perungudi', 'Chennai 600096'],
  formspree: 'https://formspree.io/f/mkgewzeg',
  hours: [null, [9, 19], [9, 19], [9, 19], [9, 19], [9, 19], [9, 19]]   // Sunday first
};
```

Every phone link, WhatsApp button, email link and address on the site is filled in from here.
The footer and structured data (`<script type="application/ld+json">` in `index.html`) repeat the
phone and address for search engines — update them too.

**Forms.** The contact form and the quick enquiry form send to the Formspree address above.
Enquiries arrive by email at the address registered on the Formspree account. To change where they
go, log in to formspree.io (or create a new form there) and replace the `formspree` address.

## 6. Terms and Privacy

The text is in `index.html` inside `<main id="legalView">`. Each heading is an `<h2>` with an `id`
used by the side contents list.

## 7. Catalogue (downloadable PDF)

Replace `site/catalogue/De-Interio-Cafe-Portfolio.pdf` with the new file (same name), and update
the size shown on the buttons (search for `83 MB`). Keep the file under 100 MB: GitHub does not
accept larger files. The flip book on the Portfolio page shows pages from
`site/images/catalogue-pages/` (`book-01.webp` … `book-13.webp`, 800 × 1024 px).

## 8. Brand logos (Materials & hardware strip)

PNG files in `site/images/brands/`, in each brand's own colours on a transparent background, 96 px
tall. In `index.html`, search for `strip-brands`; each logo is one `<li class="brand-logo">`. The
`--h` value on the image sets its height so that wide and square logos look the same size.
Each logo appears twice in the list (the second copy keeps the scrolling seamless).
The `?v=2` after each file name makes browsers fetch a fresh copy — when you replace a logo, raise
the number (`?v=3`) in both of its `<img>` tags.

## 9. Colours and fonts

At the top of `css/styles.css` (`:root`): `--gold`, `--gold-lt`, `--ink`, `--paper`, `--night` and
the font variables `--serif` and `--sans`. Fonts load from Google Fonts in the `<head>` of `index.html`.
