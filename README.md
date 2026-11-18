# De Interio Cafe — Website

The official website of **De Interio Cafe**, an interior design and turnkey execution studio based in
Perungudi, Chennai, working across Chennai, Vellore, Erode and Bengaluru.

- **Live site:** https://de-interio-cafe.vercel.app
- **Built by:** Charan B and S Bhoomika — Zenith 77 Pvt. Limited
- **Stack:** plain HTML, CSS and JavaScript. No framework, no build step, no server.

---

## Quick start

```bash
git clone https://github.com/Charan14057/de-interio-cafe.git
cd de-interio-cafe

# open the site directly …
open site/index.html            # macOS  (Windows: start site\index.html)

# … or serve it locally (recommended, closest to the live site)
python3 -m http.server 8080 --directory site
# then visit http://localhost:8080
```

Every change pushed to the `main` branch goes live automatically on Vercel within a minute.

---

## What is in this repository

```
de-interio-cafe/
├── site/                         ← the website itself (this folder is what goes live)
│   ├── index.html                  all pages: Home, About, Services, Portfolio, Design Ideas,
│   │                               Testimonials, Contact, Terms & Privacy
│   ├── css/
│   │   └── styles.css              every style, grouped by page (contents list at the top)
│   ├── js/
│   │   ├── responsive-images.js    loads the right photo size for each screen (runs first)
│   │   ├── logo-intro.js           the logo animation shown while the site loads
│   │   ├── main.js                 navigation, page switching, home / about / services /
│   │   │                           portfolio / testimonials / contact behaviour + their data
│   │   ├── design-ideas.js         the Design Ideas page and its catalogue data
│   │   └── pause-offscreen.js      pauses animations that are scrolled out of view
│   ├── images/
│   │   ├── projects/<project>/     project photographs, one folder per project
│   │   ├── catalogue-pages/        pages of the printed portfolio (the flip book)
│   │   ├── why-choose-us/          home · Why choose us
│   │   ├── services/               home · What we offer
│   │   ├── craftsmanship/          services · Our craftsmanship
│   │   ├── materials/              design ideas · Materials & hardware
│   │   ├── brands/                 supplier logos (home · Materials & hardware strip)
│   │   └── _sizes/                 800 px and 400 px copies — generated, do not edit
│   └── catalogue/
│       └── De-Interio-Cafe-Portfolio.pdf   the downloadable portfolio (68 pages)
├── tools/
│   ├── make_image_sizes.py         makes the 800 px / 400 px copies after you add photos
│   └── check_site.py               checks every photo and link before you publish
├── docs/                         ← handover documentation
│   ├── PROJECT-STRUCTURE.md        blueprint: pages, sections, styles, scripts, data
│   ├── EDITING-GUIDE.md            how to change text, photos, projects, reviews, contact details
│   ├── IMAGES.md                   photo folders, naming and sizes
│   ├── DEPLOYMENT.md               hosting on Vercel, custom domain, rolling back
│   ├── GO-LIVE-CHECKLIST.md        what to confirm before and after launch
│   ├── image-inventory.csv         every photo: project, client, location, room, type
│   └── De_Interio_Cafe_Project_Documentation.pdf   project report (BRD, FRD, TRD, run book)
├── vercel.json                   hosting settings (serves the site/ folder, caching, security headers)
├── .editorconfig
└── .gitignore
```

---

## Common tasks

| I want to … | Read |
|---|---|
| Change wording on a page | [docs/EDITING-GUIDE.md](docs/EDITING-GUIDE.md#1-text) |
| Replace or add a photo | [docs/IMAGES.md](docs/IMAGES.md) |
| Add a new project to the portfolio | [docs/EDITING-GUIDE.md](docs/EDITING-GUIDE.md#3-portfolio-projects) |
| Update phone, email or address | [docs/EDITING-GUIDE.md](docs/EDITING-GUIDE.md#5-contact-details-and-forms) |
| Understand how a page is put together | [docs/PROJECT-STRUCTURE.md](docs/PROJECT-STRUCTURE.md) |
| Publish, connect a domain or roll back | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |

Before every push:

```bash
python3 tools/make_image_sizes.py   # only if photos were added or replaced (needs: pip install Pillow)
python3 tools/check_site.py         # must print ALL GOOD
```

---

## Working on the code

- **`main`** is the live site. Do not commit unfinished work to it.
- Make a branch for each change (`feature/new-project-sandhya`, `fix/contact-form`), push it and
  open a pull request. Vercel builds a preview link for every branch so the change can be checked
  on a phone before it is merged.
- Releases are tagged (`v1.0.0` is the handover version).

The pages are one file (`index.html`) on purpose: the site switches pages instantly without
reloading, and the hosting needs nothing but static files. Each page is a `<main>` block
(`homeView`, `aboutView`, `svView`, `pfView`, `ideasView`, `tpView`, `contactView`, `legalView`);
the address bar shows `#/about`, `#/services` and so on.

Browser support: current Chrome, Safari (macOS, iPhone, iPad), Edge and Firefox. The layout is
drawn at 85 % on laptops and desktops; phones and touch tablets get their own layouts at 100 %.
