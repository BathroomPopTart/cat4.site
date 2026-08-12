# Cat 4 Consulting — cat4.site

Landing page for **Cat 4 Consulting**: supplement writing, audit rebuttals, and
IICRC-backed claims support for restoration, mitigation, and storm contractors.

Static site — no build step, no frameworks, no dependencies. Deploy the repo
root to any static host and it works.

## Structure

```
index.html        The landing page (all 9 sections + contact form)
404.html          Not-found page
css/styles.css    All styles (design tokens at the top under :root)
js/main.js        Nav, scroll reveal, file drop zone, form submit
assets/           Fonts (self-hosted), favicons, OG image
robots.txt        Allows all crawlers, points at sitemap
sitemap.xml       Single URL for now
```

Future pages (`/services`, `/case-studies`, `/blog`) can be added as additional
HTML files reusing `css/styles.css` and `js/main.js` — the header/footer markup
in `index.html` is self-contained and copy-pasteable.

## Deploying

Any static host works. Two easy paths:

- **Netlify** (recommended — free tier includes form handling with file
  uploads): drag the repo folder into Netlify, or connect the GitHub repo.
  Set the custom domain to `cat4.site`.
- **GitHub Pages**: Settings → Pages → deploy from `main`. Add the custom
  domain. (Note: GitHub Pages has no form backend — you'll need Formspree or
  similar for the form, see below.)

## Connecting the contact form

The form works in three modes, controlled by `FORM_ENDPOINT` at the top of
`js/main.js`:

1. **Not configured (current state)** — submitting opens the visitor's email
   app with a pre-filled draft to the contact address. Attachments must be
   added to the email manually. Fine for soft launch, not ideal.
2. **Formspree / Basin / any form API** — create a form, then set
   `FORM_ENDPOINT = "https://formspree.io/f/XXXXXXXX"`. File uploads require
   a paid Formspree plan (Basin includes them on lower tiers).
3. **Netlify Forms** — if the site is deployed on Netlify, set
   `FORM_ENDPOINT = "netlify"`. File uploads work out of the box (8 MB/file
   limit on the free tier). Submissions arrive in the Netlify dashboard and
   can be forwarded to email under Site → Forms → Notifications.

The drop zone accepts estimates (PDF/ESX), photos, spreadsheets, and ZIPs, and
warns visitors when the total exceeds ~20 MB. For routinely large files
(big ESX exports, photo sets), a dedicated intake tool (Supabase Storage,
Dropbox file request, etc.) can be added later — the drop zone is built to be
swapped out.

## Before launch — checklist

- [ ] **Contact email**: `intake@cat4.site` is used in `index.html` (two
      places: CTA section + footer). Create that inbox or find/replace with
      the real address.
- [ ] **Form**: pick a form backend and set `FORM_ENDPOINT` (see above).
- [ ] **Phone**: no phone number is shown yet. A commented click-to-call
      block is ready in the footer (`<!-- Add click-to-call ... -->`).
- [ ] **Case study numbers**: the three Results cards show redacted amounts
      (`$██,███`) on purpose. Replace the `.redact-num` spans in `index.html`
      with real, approved figures — or keep the redacted look until they're
      ready (it reads as intentional).
- [ ] **Testimonials**: markup is stubbed in a comment in the Results
      section — fill with real quotes + written permission.
- [ ] **Founder name/headshot**: the About section runs nameless by design
      right now. Swap the credential card for a photo card once the bio is
      approved (comment marks the spot).
- [ ] **FAQ answers**: review the pricing/turnaround/adjuster-contact answers
      — they're written from the brief but should be confirmed as policy.
- [ ] **Domain**: meta tags, sitemap, and robots.txt all assume
      `https://cat4.site/`. If the final domain differs
      (e.g. cat4consulting.com), find/replace across `index.html`,
      `robots.txt`, `sitemap.xml`.
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
  drying log) rather than stock photos, per the brief.

Accessibility: semantic landmarks, skip link, visible focus states, native
`<details>` FAQ, `prefers-reduced-motion` honored, form labels + live status
region.
