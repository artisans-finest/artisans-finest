# Artisan's Finest — Site Audit & Review

**Branch:** `audit/site-review` · **Date:** 2026-06-17 · **Scope:** Audit only (no fixes applied, no claims altered)

## Repo map / stack

- **Stack:** Hand-written static HTML + a single `styles.css`. No build step, no framework, no package manager. Vanilla inline `<script>` blocks for the testimonial carousel (index), product tabs + flavor dialogs (products), and recipe menus + dialogs (recipes).
- **Hosting:** GitHub Pages, served from repo root at `https://artisans-finest.github.io/artisans-finest/`. No `CNAME` (no custom domain), no `.nojekyll`, no `.github/` workflows.
- **Pages (7):** `index.html`, `products.html`, `recipes.html`, `events.html`, `about.html`, `contact.html`, `thank-you.html`.
- **Third-party / integrations:** Formspree form (`https://formspree.io/f/mpqewgbw`). That's the **only** external dependency. Fonts (Fraunces, Hanken Grotesk) are **self-hosted** woff2 in `/fonts`. No CDN scripts, no analytics, no external CSS/JS. All images local in `/images`.
- **Assets:** `images/` ≈ 4.2 MB, `fonts/` ≈ 112 KB. Largest images: `sugar-salt-free-hero.webp` (360 KB), `greek.webp` (136 KB), `favicon.png` (72 KB).

---

## SECURITY

| # | Sev | Item | Ref | One-line fix |
|---|-----|------|-----|--------------|
| S1 | Medium | No Content-Security-Policy or other security headers. Static host can't set HTTP headers, and no `<meta http-equiv>` equivalents exist. | all `<head>` blocks | Add `<meta http-equiv="Content-Security-Policy">` + `Referrer-Policy`/`X-Content-Type-Options` metas. **Caveat:** inline `<script>`/`<style>` mean a strict CSP needs per-block hashes or `'unsafe-inline'` — decide before implementing (see Go/No-Go). |
| S2 | Low | `target="_blank"` links use `rel="noopener"` but not `noreferrer`. Tab-nabbing is already covered by `noopener`; `noreferrer` is a privacy add. | events.html (12), index:205, contact:55/176, about:123, products:1046, recipes:1190, thank-you:72 | Append ` noreferrer` to the `rel` on external links. |
| S3 | Low | Formspree spam defense relies only on the honeypot (`_gotcha`). No CAPTCHA. | contact.html:67-70 | Honeypot is well-built (CSS off-screen + `aria-hidden` + `tabindex="-1"` + `autocomplete="off"`). Recommend enabling Formspree's dashboard spam filter; add reCAPTCHA only if spam appears (it costs UX + adds a third-party script). |
| S4 | ✅ Pass | No committed secrets/keys in tree or git history. Formspree endpoint is public by design. | — | None. |
| S5 | ✅ Pass | No third-party scripts/CDN → no SRI gap. Everything self-hosted over HTTPS/relative paths. This is a security strength. | — | None. |
| S6 | ✅ Pass | Inline JS reviewed for XSS: dialog content comes from static `<template>` clones; URL params in contact.html are written via `.value`/`textContent` and `encodeURIComponent`, never `innerHTML`. No unsafe DOM injection. | contact.html:96-117, products.html:1095-1142 | None. |

---

## FUNCTIONALITY

| # | Sev | Item | Ref | One-line fix |
|---|-----|------|-----|--------------|
| F1 | High | Products tab images need a JS "repaint" hack (toggle `display`, force reflow) to paint on revisit — git history shows ~5 commits fighting this. Fragile workaround, not a fix. | products.html:1167-1187 | Root-cause the decoded-but-unpainted issue (likely `decoding="sync"` + `object-fit: contain` on bfcache restore); prefer a CSS/markup fix and remove the reflow hack. |
| F2 | Medium | 14 external event links can't be verified from this sandbox (no network). Several are event-specific pages likely to 404 after their date (e.g. the opaque `starinthevalley.com/.../867jh82...` slug, `bbqhub.us/contest/564`, `allevents.in/...`). | events.html:57,70,90,97,110,124,137,144,151,185,192,212 | Manually test all 14 links; replace dead event URLs with the venue's main page. |
| F3 | Medium | Internal links + nav paths all resolve (verified against files on disk); all image `src`/`href` resolve with **zero** broken references. `share-card.png` is "unused" only by my grep — it's referenced via absolute `og:image` URLs, so it's fine. | — | No action; informational pass. |
| F4 | ✅ Pass | Formspree flow is solid: native `required`/`email` validation, JS `fetch` with disabled-button "Sending…" state, success → branded `thank-you.html`, error → inline `role="alert"` message with email fallback. No-JS path still POSTs natively via `action` + `_next`. `thank-you.html` is `noindex`. | contact.html:58-157 | None. (`interest` select isn't `required` but always has a default — acceptable.) |
| F5 | Low | Progressive enhancement is correct: without JS, all product panels show and the carousel is a scroll-snap list; with JS they enhance. Good resilience. | products.html:1083-1087, index.html:214-308 | None. |

---

## PERFORMANCE

| # | Sev | Item | Ref | One-line fix |
|---|-----|------|-----|--------------|
| P1 | Medium | All 5 product-tab hero images are `loading="eager" decoding="sync"` at 1536×1024 but render small — heavy, mostly-offscreen initial load. | products.html:53,57,61,66,72 | Keep the first tab eager; lazy-load the rest, drop `decoding="sync"`. |
| P2 | Medium | `sugar-salt-free-hero.webp` is 360 KB (≈3× the next image) for a thumbnail-sized slot. | images/ | Recompress/resize to match the others (~80–120 KB). |
| P3 | Low | `favicon.png` is 72 KB — should be ~2–5 KB. | images/favicon.png | Export a small 32×32/48×48 favicon. |
| P4 | ✅ Pass | Single local CSS, no render-blocking third-party, self-hosted fonts with `font-display: swap`, images carry `width`/`height` (low CLS). | styles.css:1-22 | Optional: `<link rel="preload">` the two primary woff2 fonts. |

---

## ACCESSIBILITY

| # | Sev | Item | Ref | One-line fix |
|---|-----|------|-----|--------------|
| A1 | Low | `.badge.soon` text (`#97681c` on light-gold) ≈ **4.09:1** — below AA 4.5 for this small bold text. | styles.css:567-571 | Darken the text or the threshold; e.g. `#7d5512`. |
| A2 | Low | On `index.html` the brand logo and the decorative `.hero-logo` both use `alt="Artisan's Finest logo"` — redundant for screen readers. | index.html:29 & 56 | Make the duplicate `.hero-logo` decorative: `alt=""`. |
| A3 | Low | Mobile nav links (`0.9rem`, ~7–9px padding) fall under the 44px tap-target guideline. | styles.css:1320-1323 | Bump mobile nav padding to reach ~44px height. |
| A4 | ✅ Pass | Alt text present throughout (decorative tab images correctly `alt=""`), all form fields labeled, skip link present, carousel has roles/labels and respects `prefers-reduced-motion`, heading order is sane. Most contrast pairs pass (muted/paper 6.0:1, clay eyebrow 4.65:1, ink 14.9:1). | — | None. |

---

## SEO

| # | Sev | Item | Ref | One-line fix |
|---|-----|------|-----|--------------|
| E1 | Medium | No structured data. A local business with products + a public event schedule is an ideal candidate for JSON-LD. | all pages | Add `LocalBusiness`, `Product`, and `Event` JSON-LD built only from facts already on the page (no new claims). |
| E2 | Low | No `sitemap.xml` or `robots.txt`. | repo root | Add both (6 indexable pages; exclude `thank-you.html`). |
| E3 | Low | `og:url` is set per page but there's no `<link rel="canonical">`. | all `<head>` | Add a self-referencing canonical per page. |
| E4 | ✅ Pass | Unique titles, meta descriptions, full Open Graph + Twitter card set, sized share image (1200×630), favicon on every page. Strong baseline. | — | None. |

---

## AESTHETIC / VISUAL (recommendations only)

**Strengths:** The Fraunces (display serif) + Hanken Grotesk pairing is already a premium, on-brand choice, and the warm palette (`--paper`/`--cream`/`--clay`/`--gold`/`--sage`) reads artisan rather than generic. Hierarchy and whitespace are clean.

| # | Sev | Item | Recommendation |
|---|-----|------|----------------|
| V1 | Medium | **Product tiles read templated.** The flavor grid is plain text buttons with a gold left-border — the most generic element on the site, especially since photography exists for most items. | Add small product thumbnails to the tiles (vanillas/seasonings already have images) for a richer, more premium catalog feel. |
| V2 | Medium | **BBQ rubs and gift sets have no imagery at all** (no tile image, no dialog image), unlike vanilla/seasonings. Feels half-finished. | Commission/add product photos for rubs and bundles so all categories feel equally cared-for. |
| V3 | Low | **Hero** stacks the bottle photo above a second copy of the logo — the logo is already in the sticky header, so it reads redundant. | Replace the duplicate hero logo with a warmer, hand-crafted detail (texture, ingredient, or lifestyle crop) for more "small-batch" warmth. |
| V4 | Low | **Mobile nav** wraps 6 pill links under a stacked brand — busy on small screens. | Consider a condensed/collapsible mobile nav. |
| V5 | Low | CTA path is consistent ("Request Info" everywhere, no cart) and clear; hero CTAs could be slightly more prominent (size/contrast) to anchor the single conversion action. | Minor emphasis bump on the primary hero button. |

---

## Claims to review with owner (NOT edited — flagging only)

These are product/sourcing/health-adjacent or endorsement claims that carry legal/verification risk. I have changed none of them.

1. **"Sugar and Salt Free Seasonings" / "sugar-free and salt-free"** — `salt-free`/`sugar-free` are FDA-defined nutrient-content claims with specific per-serving thresholds. Confirm each product meets them and is substantiated. *(products.html:56, 217; index.html testimonial line 124)*
2. **"no fillers or anti-caking agents"** — composition claim (inside a testimonial). Verify accuracy. *(index.html:148)*
3. **"cold extracted for more than six months"** and other extraction-process claims. *(products.html:93)*
4. **Sourcing/origin:** "premium vanilla beans"; hero alt text "small-batch Madagascar bourbon vanilla"; "Kentucky Bourbon influence." Confirm origin/sourcing language is accurate. *(index.html:55; products.html:93,104-107)*
5. **"naturally tenderizing meat"** (Coffee Ancho) — mild efficacy claim. *(products.html:461)*
6. **"More than 25 years in the making"** (Rib Dust) — verify provenance. *(products.html:527)*
7. **Testimonials (11 named people + comparative/competition claims** e.g. "far superior to anything... grocery store," "helped me place in our... BBQ competition"). FTC endorsement rules require these be genuine and substantiated. *(index.html:116-181)*
8. **Alcohol-derived extracts** (bourbon/rum/agave "spirits") — confirm labeling is consistent with how they're described. *(products.html:104-178)*

---

## Go / No-Go

### I'd implement immediately on your "go" (safe, mechanical, zero claim changes)
- **S2** add `rel="noreferrer"` to external links.
- **A1** fix `.badge.soon` contrast; **A2** decorative logo `alt=""`; **A3** mobile tap-target padding.
- **P1** lazy-load non-first tab images; **P2/P3** recompress `sugar-salt-free-hero.webp` and `favicon.png`.
- **E2** add `robots.txt` + `sitemap.xml`; **E3** add canonical links.
- **E1** add JSON-LD built only from existing on-page facts.
- **F1** replace the fragile tab-image repaint hack with a proper CSS/markup fix.

### Needs your decision first
- **S1 (CSP):** strict CSP requires either `'unsafe-inline'` (weaker) or refactoring inline scripts into external files with hashes (cleaner, more work). Pick the approach.
- **S3:** whether to add reCAPTCHA (adds a third-party dependency) vs. relying on the honeypot + Formspree filter.
- **F2:** I can't reach the network here — confirm you want me to verify the 14 external event links, or do it on your side.
- **V1–V5 (aesthetic):** any redesign and the BBQ/gift photography need your direction and assets.
- **All product claims:** untouched, pending your review with the owner.

**Implementing nothing until you say go.**
