# Go-live checklist

## Before launch

- [ ] `python3 tools/check_site.py` prints **ALL GOOD**.
- [ ] Every page opened on an iPhone, an Android phone, an iPad (both orientations) and a laptop.
- [ ] Contact form and quick enquiry form each sent once from the live address. Formspree asks the
      account owner to confirm the first enquiry by email; after that enquiries arrive directly.
- [ ] Every phone, WhatsApp, email and map link tapped once.
- [ ] Catalogue PDF downloads and opens.

## Details to confirm with the studio

| Item | On the site now |
|---|---|
| Phones | +91 95000 78674 (main, WhatsApp) · +91 73053 12201 |
| Email | mohanaraodeinteriocafe@gmail.com |
| Head office | No. 52, G-1, Jeyaraj Homes, 2nd Cross Street, Thirumalai Nagar Main Road, Perungudi, Chennai 600096 |
| Hours | Mon – Sat 9:00 AM – 7:00 PM · Sunday by appointment |
| Founded | 2008, by Mohanarao DV ("15+ years") |
| Projects | 500+ |
| Social media | WhatsApp only — add Instagram / YouTube / LinkedIn links to the footer and contact page when the profiles exist |

- **Kalpana Residence — Phase 2:** the printed catalogue says "Katpadi, Chennai"; the site says
  Katpadi, Vellore (as for Phase 1).
- **Design concepts:** 12 of the 19 projects are design renders that have not been built yet; the
  site labels them *Design concept*. The studio does not offer 3D visualisation at present, so the
  site does not mention it.
- **Testimonials:** the 16 reviews are taken word for word from the printed catalogue; the photos
  beside them are captioned with their own project.

## After launch

- [ ] Connect the custom domain (see [DEPLOYMENT.md](DEPLOYMENT.md#custom-domain)).
- [ ] Add `sitemap.xml` and `robots.txt` once the domain is final, and change `og:url` and
      `og:image` in `index.html` to the new domain (the share image is `images/share/og-image.jpg`).
- [ ] Add analytics if the studio wants it (and a cookie notice if it sets cookies).
- [ ] If the studio has original camera files or full-size renders, replace the photos with
      sharper versions (same names) — see [IMAGES.md](IMAGES.md).
