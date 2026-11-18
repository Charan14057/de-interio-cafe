# Project structure — blueprint

This document explains how the website is put together, so that anyone opening the repository
for the first time can find the part they need.

## 1. How the site works

The website is a **single-page site**: every page lives in `site/index.html` and the address bar
decides which one is shown.

```
Browser
 ├─ index.html ────────── markup for every page (one <main> per page) + footer + dialogs
 │    ├─ css/styles.css ── all styles (one file, contents list at the top)
 │    ├─ js/responsive-images.js  ── runs first: photo sizes, touch-tablet detection
 │    ├─ js/logo-intro.js         ── logo animation while the first photos load
 │    ├─ js/design-ideas.js       ── Design Ideas page (catalogue, tour, style finder)
 │    ├─ js/main.js               ── everything else + the page router
 │    └─ js/pause-offscreen.js    ── pauses animations outside the screen
 ├─ images/ ──────────── photographs (full size) + images/_sizes/ (800 px, 400 px copies)
 └─ catalogue/ ───────── downloadable portfolio PDF
        │
        ▼
Vercel (static hosting, global CDN) — serves the site/ folder as it is
```

There is no build step, no package manager and no server code. Enquiry forms are sent to
**Formspree** (a hosted form service), which emails each enquiry to the studio.

## 2. Pages and addresses

| Address | Page | Block in `index.html` | Script |
|---|---|---|---|
| `/` or `#home` | Home | `<main id="homeView">` | `main.js` |
| `#/about` | About the studio | `<main id="aboutView">` | `main.js` (search `ABOUT`) |
| `#/services` | Services | `<main id="svView">` | `main.js` (search `SERVICES`) |
| `#/portfolio` | Portfolio | `<main id="pfView">` | `main.js` (search `PORTFOLIO`) |
| `#project/<id>` | A project's full story (opens over the portfolio) | `<dialog id="pfCs">` | `main.js` |
| `#/design-ideas` | Design Ideas | `<main id="ideasView">` | `design-ideas.js` |
| `#idea/<id>` | One collection of the Design Ideas catalogue | inside `ideasView` | `design-ideas.js` |
| `#/testimonials` | Client stories | `<main id="tpView">` | `main.js` (search `const TPS`) |
| `#/contact` | Contact | `<main id="contactView">` | `main.js` (search `CONTACT`) |
| `#/terms`, `#/privacy` | Terms and Privacy | `<main id="legalView">` | `main.js` (`lgShow`) |

The router is at the end of `main.js` (functions `wanted()`, `showView()` and `route()`): it reads
the address, shows the matching `<main>`, hides the others, sets the page title and runs that
page's entrance animation.

## 3. Home page sections (in order)

| # | Section | `id` in `index.html` |
|---|---|---|
| 01 | Hero slider (four rotating photos) | `home` |
| 02 | Brand introduction | `about` |
| — | Cities strip | `locations` |
| 03 | What we offer | `services` |
| 04 | Why choose us | `why-choose-us` |
| 05 | Featured projects | `portfolio` |
| 06 | Design philosophy (tiles) | `process` |
| — | Materials & hardware strip (brand logos + materials) | `materials` |
| 07 | Residential interiors (room tour) | `residential` |
| 08 | Commercial interiors | `commercial` |
| 09 | Our design process | `design-process` |
| 10 | Why us (comparison) | `why-us` |
| 11 | Client testimonials | `testimonials` |
| 12 | Recent spaces (gallery with filters) | `gallery` |
| — | Closing call-to-action + enquiry form (shared by every page) | `contact` |
| — | Footer (shared by every page) | `<footer id="footer">` |

The other pages are built the same way: each `<section>` carries an `id` and a comment above it
naming the section.

## 4. Styles — `css/styles.css`

One stylesheet, in cascade order. The comment at the top lists every heading; search for a
heading to jump to it. The main groups are:

1. **Tokens** — colours, fonts, spacing (`:root` variables such as `--gold`, `--ink`, `--paper`,
   `--serif`, `--sans`). Change a colour here and it changes everywhere.
2. **Navigation**, **Hero** and the **home sections** (numbered as on the page).
3. **Shared pieces** — marquee strips, pop-ups, footer, section headings.
4. **One block per page** — Testimonials, Design Ideas, Contact, About, Services, Portfolio,
   Terms & Privacy.
5. **Phones & tablets** — lighter rendering on touch screens.
6. **85 % zoom** — laptops and desktops draw the layout at 85 %; touch tablets do not.
7. **Fit pass** — final fixes for specific phone, tablet and laptop sizes, grouped by page.

Breakpoints used throughout: `760px` (phones), `870px` and `1024px` (tablets), `1156px` and
`1460px` (small laptops). Fonts: *Bodoni Moda* (headings) and *Manrope* (text), from Google Fonts.

## 5. Scripts

| File | What it does |
|---|---|
| `responsive-images.js` | Gives every photo a `srcset` (400 / 800 / full size) so phones download small copies. Defines `DIC_PHOTO(id)`, which turns a photo name into its path. Marks touch tablets with the class `dic-touch`. |
| `logo-intro.js` | Draws the logo while the first photos load, then opens the page. |
| `main.js` | One module, split into commented sections: intro, hero slider, navigation, each home section, footer, About, Services, Portfolio, Testimonials, Contact, and the router at the end. |
| `design-ideas.js` | The Design Ideas page: hero tour, catalogue, filters, viewer, style finder. |
| `pause-offscreen.js` | Stops looping animations in sections that are not on screen. |

## 6. Content data (where the words and photo lists live)

| Data | File | Contents |
|---|---|---|
| `CONTACT` | `main.js` | Phone numbers, WhatsApp, email, address, map, opening hours, form address |
| `PF` | `main.js` | The 19 portfolio projects: name, client, location, spaces, story, highlights, colours, photos |
| `PF_DET` | `main.js` | The "detail" cards of the portfolio grid |
| `TST` / `TPS` | `main.js` | Client testimonials (home page / testimonials page) |
| `COM_INFO` | `main.js` | Commercial projects shown on the home page |
| `AB_JR` | `main.js` | Milestones on the About page |
| `SV_PH`, `SV_RES`, `SV_COM` | `main.js` | Services: process phases, residential and commercial rooms |
| `IDEAS`, `CATS`, `TOUR`, `ROOMS` | `design-ideas.js` | Design Ideas catalogue, categories, hero tour, rooms |

Photos are referred to by **name** in the data (for example `"mukundhan-05"`); `DIC_PHOTO()` finds
the file (`images/projects/mukundhan/mukundhan-05.webp`). Static parts of the pages (cards,
captions, headings) are written directly in `index.html`.

## 7. Images

See [IMAGES.md](IMAGES.md). In short: one folder per project under `images/projects/`, section
pictures in their own folders, smaller copies generated into `images/_sizes/` by
`tools/make_image_sizes.py`.

## 8. Hosting

`vercel.json` (repository root) tells Vercel to serve the `site/` folder as it is, with clean URLs,
30-day caching for photos, 7-day caching for the catalogue and basic security headers. See
[DEPLOYMENT.md](DEPLOYMENT.md).
