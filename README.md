# Cat 4 Consulting — cat4consulting.com

Landing page for **Cat 4 Consulting**, a back-office partner for home services
companies built on two pillars:

- **Claims & File Support** — supplement writing, audit rebuttals, equipment &
  scope justification, and claims strategy for restoration/mitigation/storm
  contractors (IICRC S500/S520-backed, Xactimate-fluent).
- **Office & Call Capture** — after-hours live answering, dispatch &
  scheduling, customer intake, and full front-office takeover for every home
  services trade.

Static site — no build step, no frameworks, no dependencies. Deploy the repo
root to any static host and it works.

## Structure

```
index.html        The landing page (both pillars, all sections + contact form)
404.html          Not-found page
css/styles.css    All styles (design tokens at the top under :root)
js/main.js        Nav, scroll reveal, file drop zone, form submit
assets/           Fonts (self-hosted), favicons, OG image
CNAME             Custom domain for GitHub Pages (cat4consulting.com)
.nojekyll         Tells GitHub Pages to serve files as-is (no Jekyll build)
robots.txt        Allows all crawlers, points at sitemap
sitemap.xml       Single URL for now
```

Future pages (`/claims`, `/office`, `/case-studies`, `/blog`) can be added as
additional HTML files reusing `css/styles.css` and `js/main.js` — the
header/footer markup in `index.html` is self-contained and copy-pasteable.
`#claims` and `#office` anchor IDs already exist, so per-pillar landing pages
can later 301 or link back cleanly.

## Deploying — GitHub Pages + Namecheap DNS (recommended, free)

The repo is ready for GitHub Pages (`CNAME` + `.nojekyll` are committed).

**1. In GitHub** (`Settings → Pages` on this repo):
   - Source: **Deploy from a branch** → branch **main**, folder **/ (root)**
   - After the first deploy, confirm **Custom domain** shows
     `cat4consulting.com` (it reads the CNAME file), then tick
     **Enforce HTTPS** once the certificate is issued (can take ~15 min
     after DNS is in place).

**2. In Namecheap** (Domain List → cat4consulting.com → **Advanced DNS**),
   replace the parking records with:

   | Type  | Host | Value                    |
   |-------|------|--------------------------|
   | A     | @    | 185.199.108.153          |
   | A     | @    | 185.199.109.153          |
   | A     | @    | 185.199.110.153          |
   | A     | @    | 185.199.111.153          |
   | CNAME | www  | bathroompoptart.github.io. |

   Delete any conflicting `URL Redirect` / parking A records on `@` and `www`.
   Propagation is usually minutes, worst case a few hours.

**3. Email for `intake@cat4consulting.com`** (used by the form + footer):
   Namecheap → Domain tab → **Redirect Email** → add `intake` forwarding to
   your real inbox. When prompted, let Namecheap set the MX records to its
   forwarding servers (Advanced DNS → Mail Settings → Email Forwarding).
   This coexists fine with the GitHub Pages A records.

Any other static host (Netlify, Cloudflare Pages, or Namecheap's own hosting
via cPanel upload) also works — the site is plain files.

## Connecting the contact form

The form works in three modes, controlled by `FORM_ENDPOINT` at the top of
`js/main.js`:

1. **Not configured (current state)** — submitting opens the visitor's email
   app with a pre-filled draft to the contact address (subject line adapts to
   the claims/office selection). Attachments must be added to the email
   manually. Fine for soft launch, not ideal.
2. **Formspree / Basin / any form API** — create a form, then set
   `FORM_ENDPOINT = "https://formspree.io/f/XXXXXXXX"`. File uploads require
   a paid Formspree plan (Basin includes them on lower tiers). This is the
   right pairing for GitHub Pages hosting.
3. **Netlify Forms** — only if the site is deployed on Netlify: set
   `FORM_ENDPOINT = "netlify"`. File uploads work out of the box (8 MB/file
   limit on the free tier).

The drop zone accepts estimates (PDF/ESX), photos, spreadsheets, and ZIPs, and
warns visitors when the total exceeds ~20 MB. For routinely large files
(big ESX exports, photo sets), a dedicated intake tool (Supabase Storage,
Dropbox file request, etc.) can be added later — the drop zone is built to be
swapped out.

## Before launch — checklist

- [x] **Domain**: meta tags, sitemap, robots.txt, and CNAME all point at
      `https://cat4consulting.com/`.
- [ ] **DNS**: add the Namecheap records above and enable GitHub Pages.
- [ ] **Contact email**: create/forward `intake@cat4consulting.com`
      (used in the CTA section + footer; find/replace if the address changes).
- [ ] **Form**: pick a form backend and set `FORM_ENDPOINT` (see above).
- [ ] **Phone**: no phone number is shown yet. A commented click-to-call
      block is ready in the footer (`<!-- Add click-to-call ... -->`).
- [ ] **Case study numbers**: the three Results cards show redacted amounts
      (`$██,███`) on purpose. Replace the `.redact-num` spans in `index.html`
      with real, approved figures — or keep the redacted look until they're
      ready (it reads as intentional).
- [ ] **Missed-call math**: the Office pillar shows an example
      (1 call/week × $2,500 = $130,000/yr). Adjust the ticket size if you want
      a different anchor number.
- [ ] **Testimonials**: markup is stubbed in a comment in the Results
      section — fill with real quotes + written permission.
- [ ] **Founder name/headshot**: the About section runs nameless by design
      right now. Swap the credential card for a photo card once the bio is
      approved (comment marks the spot).
- [ ] **FAQ answers**: pricing/turnaround/adjuster-contact/office-integration
      answers are written from the brief — confirm them as policy.
- [ ] **Analytics**: none installed. Add your snippet before `</body>` if
      wanted.

## Design system

Tokens live at the top of `css/styles.css`:

- **Palette**: near-black charcoal base (`--bg-0` … `--bg-3`), safety orange
  accent (`--orange`), paper/ink for the document mockups.
- **Type**: Barlow Condensed (display), Barlow (body), IBM Plex Mono
  (data/labels) — self-hosted latin subsets in `assets/fonts/`, ~200 KB total.
- **Motifs**: chamfered corners (clip-path), hazard-stripe dividers, stamp
  and redaction-bar treatments. Imagery is documentation (sample supplement,
  drying log, after-hours call log) rather than stock photos, per the brief.

Accessibility: semantic landmarks, skip link, visible focus states, native
`<details>` FAQ, `prefers-reduced-motion` honored, form labels + live status
region.
