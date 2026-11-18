# Deployment

The site is static: Vercel serves the `site/` folder exactly as it is in the repository.

## How publishing works

```
edit → commit → push to main ──► Vercel builds nothing, copies site/ to its CDN ──► live in ~1 minute
          push to a branch ──► Vercel makes a preview link for that branch (for checking)
```

- **Production:** https://de-interio-cafe.vercel.app (branch `main`)
- **Settings:** `vercel.json` at the repository root — output folder `site`, clean URLs, caching
  (photos 30 days, catalogue 7 days, the page itself always fresh) and security headers.
  No settings need changing in the Vercel dashboard.

## Day-to-day

```bash
git checkout -b fix/phone-number
# … edit …
python3 tools/check_site.py          # must print ALL GOOD
git commit -am "Update second phone number"
git push -u origin fix/phone-number  # Vercel posts a preview link on the pull request
# open a pull request on GitHub, check the preview on a phone, merge → live
```

## Custom domain

Vercel → project → **Settings → Domains** → add `deinteriocafe.com` (and `www.deinteriocafe.com`),
then create the DNS records Vercel shows at the domain registrar. HTTPS is issued automatically.
After the switch, update the `og:url` and `canonical` tags in `index.html` if they are added.

## Rolling back

Vercel → project → **Deployments** → pick the last good deployment → **⋯ → Promote to Production**.
The site switches back instantly; fix the problem on a branch, then merge again.

## Without GitHub (manual upload)

```bash
cd site
npx vercel@latest          # first time: sign in, accept the defaults
npx vercel@latest --prod   # publish to production
```

## Other hosts

Any static host works (Netlify, Cloudflare Pages, Firebase Hosting, plain Apache/Nginx): upload
the contents of `site/` to the web root. Nothing needs to run on the server.

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| A photo is missing on the live site | File name or folder does not match the reference | `python3 tools/check_site.py` lists it |
| Old photo still shows after replacing it | Browser cache (30 days) | Use a new file name, update references |
| Push rejected: file too large | A file over 100 MB (usually the PDF) | Compress the PDF below 100 MB |
| Enquiries do not arrive | Formspree form not confirmed, or the address changed | Log in to formspree.io, confirm the form, check `CONTACT.formspree` |
| Layout looks wrong after an edit | Unclosed tag in `index.html` | Validate at https://validator.w3.org or undo the last change |
