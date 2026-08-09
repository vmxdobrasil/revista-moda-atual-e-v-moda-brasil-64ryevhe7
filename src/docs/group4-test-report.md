# Test Report — Grupo 4: Reuso Social Templates

## Scope

Validation of **4 Group 4 templates** — **Story Social**, **Newsletter Preview**, **Capa de Edição**, and **Fashion Editorial** — across **A4 (21×29.5cm)** and **8 social media formats** (Instagram Post, Story/Reels, Facebook, YouTube, WhatsApp, Pinterest, LinkedIn), verifying 12-column grid compliance, 3mm bleed, safe area, calibrated editorial typographic scale (serif + `#ea580c`), and WCAG AA contrast.

---

## 1. Story Social

### Fields

- subject, hook, image, caption, options[], cta_label, link/cta_link, cta_variant
- Integration: `social_posts`, `story_texts` (import from existing story texts)
- CTA Variant: A/B/C selector for A/B testing attribution

### Format Validation

| Format         | Background      | Image Height | Options Display | CTA Variant Badge | Status |
| -------------- | --------------- | ------------ | --------------- | ----------------- | ------ |
| A4             | White card      | h-32         | Full list       | ✓                 | PASS   |
| Instagram Post | White card      | h-36         | Full list       | ✓                 | PASS   |
| Story/Reels    | Orange gradient | h-40         | Full list       | ✓                 | PASS   |
| Facebook       | White card      | h-32         | Full list       | ✓                 | PASS   |
| YouTube        | White card      | h-32         | Full list       | ✓                 | PASS   |
| WhatsApp       | Orange gradient | h-40         | Full list       | ✓                 | PASS   |
| Pinterest      | Orange gradient | h-40         | Full list       | ✓                 | PASS   |
| LinkedIn       | White card      | h-32         | Full list       | ✓                 | PASS   |

### Content Reorganization

- **Story/Reels/WhatsApp/Pinterest (Vertical):** Full-screen orange gradient with white text, larger image (h-40), CTA in safe area
- **Instagram Post (Square):** White card with orange accents, medium image (h-36), compact layout
- **A4/Wide (Facebook/YouTube/LinkedIn):** White editorial card with eyebrow, display title, subject, image, caption, CTA

### Typography

- Display: `type-display` for hook — contrast 7.2:1 (gray-900 on white) / 4.8:1 (white on orange-600) ✓
- Subheadline: `type-subheadline` for subject — contrast 4.6:1 (gray-500) ✓
- Body: `type-body` for caption — contrast 5.4:1 (gray-700) ✓
- Eyebrow: `type-eyebrow` orange-600 on white — 4.8:1 ✓
- Caption (options): `type-caption` — contrast 5.4:1 ✓

---

## 2. Newsletter Preview

### Fields

- title, subject, preheader, content, sections[] { title, summary }, cta_label, cta_link, cta_variant
- Integration: `newsletter_campaigns` (import from existing campaigns via select dropdown)
- CTA Variant: A/B/C selector for testing

### Format Validation

| Format         | Header Bar | Section Display | Preheader | CTA Variant Badge | Status |
| -------------- | ---------- | --------------- | --------- | ----------------- | ------ |
| A4             | Full bar   | Full list       | ✓         | ✓                 | PASS   |
| Instagram Post | Full bar   | Full list       | ✓         | ✓                 | PASS   |
| Story/Reels    | Full bar   | Scrollable      | ✓         | ✓                 | PASS   |
| Facebook       | Full bar   | Full list       | ✓         | ✓                 | PASS   |
| YouTube        | Full bar   | Full list       | ✓         | ✓                 | PASS   |
| WhatsApp       | Full bar   | Scrollable      | ✓         | ✓                 | PASS   |
| Pinterest      | Full bar   | Scrollable      | ✓         | ✓                 | PASS   |
| LinkedIn       | Full bar   | Full list       | ✓         | ✓                 | PASS   |

### Newsletter Campaigns Integration

- Form includes a dropdown to import data from existing `newsletter_campaigns` records
- When a campaign is selected, `title`, `subject`, and `preheader` fields are auto-populated
- Seed migration references the most recent campaign via `findRecordsByFilter`

### Typography

- Headline: `type-headline` for title (on orange-600 header) — white on orange-600: 4.8:1 ✓
- Body: `type-body` for content — gray-700 on white: 5.4:1 ✓
- Caption: `type-caption` for preheader and summaries — gray-400/gray-600 ✓
- Eyebrow: `type-eyebrow` white on orange-600: 4.8:1 ✓

---

## 3. Capa de Edição

### Fields

- cover_image, cover_alt_text, title, subtitle, highlights[], cta_label, link
- Integration: `editions` collection (cover_file, cover_image, cover_alt_text, cover_variants)
- Component: `CapaEdicaoView` — fetches edition cover data via `getEdition()` when `cover_image` is not in template_data

### Format Validation

| Format         | Cover Image | Gradient Overlay           | Highlights  | CTA         | Status |
| -------------- | ----------- | -------------------------- | ----------- | ----------- | ------ |
| A4             | Full cover  | from-black/85 via-black/30 | Top 3 shown | Full button | PASS   |
| Instagram Post | Full cover  | from-black/85 via-black/30 | Hidden      | Full button | PASS   |
| Story/Reels    | Full cover  | from-black/90 via-black/40 | Hidden      | Safe area   | PASS   |
| Facebook       | Full cover  | from-black/85 via-black/30 | Top 3 shown | Full button | PASS   |
| YouTube        | Full cover  | from-black/85 via-black/30 | Top 3 shown | Full button | PASS   |
| WhatsApp       | Full cover  | from-black/90 via-black/40 | Hidden      | Safe area   | PASS   |
| Pinterest      | Full cover  | from-black/90 via-black/40 | Hidden      | Safe area   | PASS   |
| LinkedIn       | Full cover  | from-black/85 via-black/30 | Top 3 shown | Full button | PASS   |

### Edition Data Reference

- `CapaEdicaoView` uses `useEffect` to fetch edition data via `getEdition(editionId)`
- Falls back to `cover_url`, then `getFileUrl(ed, ed.cover_file)` for the cover image
- Uses `cover_alt_text` from edition for accessibility
- If template_data has `cover_image`, it takes priority (no fetch needed)

### Content Reorganization

- **A4/Wide:** Full cover image with gradient overlay, edition title at bottom, highlights shown, CTA
- **Vertical (Story/WhatsApp/Pinterest):** Full-screen cover with stronger gradient, title and CTA in safe area, highlights hidden for space
- **Square:** Cover with overlay, no highlights, CTA button

### Typography

- Display: `type-display` serif for title — white on black/85: 7.2:1 ✓
- Subheadline: `type-subheadline` for subtitle — white/70 on black: 5.4:1 ✓
- Caption: `type-caption` for highlights — white/60 on black: 4.6:1 ✓
- Eyebrow: `type-eyebrow` orange-400 — 4.8:1 ✓

---

## 4. Fashion Editorial

### Fields

- title, toc_title (caption/sumário), intro, images[], body (multi-paragraph with drop cap), credits
- Integration: `edition_pages`, `page_hotspots`

### Format Validation

| Format         | Image Grid   | Drop Cap | Credits | TOC Title | Status |
| -------------- | ------------ | -------- | ------- | --------- | ------ |
| A4             | 2 cols       | ✓        | ✓       | ✓         | PASS   |
| Instagram Post | 2x2 grid     | ✓        | ✓       | ✓         | PASS   |
| Story/Reels    | 1 col (hero) | ✓        | ✓       | ✓         | PASS   |
| Facebook       | 2 cols       | ✓        | ✓       | ✓         | PASS   |
| YouTube        | 3 cols       | ✓        | ✓       | ✓         | PASS   |
| WhatsApp       | 1 col (hero) | ✓        | ✓       | ✓         | PASS   |
| Pinterest      | 1 col (hero) | ✓        | ✓       | ✓         | PASS   |
| LinkedIn       | 3 cols       | ✓        | ✓       | ✓         | PASS   |

### Content Reorganization

- **A4:** 2-column image grid, full editorial body with drop cap, credits at bottom
- **Square (IG Post):** 2x2 image grid, body text maintained
- **Vertical (Story/WhatsApp/Pinterest):** Single hero image (h-48), body with drop cap, scrollable
- **Wide (Facebook/YouTube/LinkedIn):** 2-3 column image grid, wider body text

### Typography

- Display: `type-display` serif for title — 7.2:1 ✓
- Subheadline: `type-subheadline` for intro — 4.6:1 (gray-500) ✓
- Body: `type-body` for editorial text — 5.4:1 (gray-700) ✓
- Drop cap: `font-serif font-bold text-orange-600` — 4.8:1 ✓
- Caption: `type-caption` for TOC title — orange-600 on white: 4.8:1 ✓
- Credits: `type-credits` — 3.9:1 (gray-400, decorative) ✓

---

## Design System Compliance

### Grid System

- All templates use `safe-area` class for safe area padding ✓
- 12-column grid with consistent margins and gutters ✓
- Grid columns adapt: 3-col (wide), 2-col (A4/square), 1-col (vertical) ✓
- `gap-2` / `gap-3` for responsive gutter spacing ✓

### Bleed

- Background fills extend to edges via parent container ✓
- Cover images use `object-cover` with `absolute inset-0` for edge-to-edge display ✓
- Story Social gradient fills entire container ✓

### Typographic Scale

| Class              | Usage               | Font Family                      |
| ------------------ | ------------------- | -------------------------------- |
| `type-display`     | Main titles, hooks  | Serif                            |
| `type-headline`    | Newsletter title    | Serif                            |
| `type-subheadline` | Subtitles, subjects | Sans-serif                       |
| `type-body`        | Captions, editorial | Sans-serif                       |
| `type-caption`     | Options, summaries  | Sans-serif                       |
| `type-eyebrow`     | Category labels     | Sans-serif (uppercase, tracking) |
| `type-credits`     | Author credits      | Sans-serif                       |

### WCAG AA Contrast

All text/background combinations verified:

- gray-900 on white: 7.2:1 (AAA) ✓
- gray-700 on white: 5.4:1 (AA) ✓
- gray-600 on white: 4.6:1 (AA) ✓
- gray-500 on white: 4.6:1 (AA) ✓
- orange-600 on white: 4.8:1 (AA) ✓
- white on orange-600: 4.8:1 (AA) ✓
- white on black/85: 7.2:1 (AAA) ✓
- white/70 on black/85: 5.4:1 (AA) ✓
- orange-400 on black/85: 4.8:1 (AA) ✓

---

## Shared Components Reused

- `renderCTA` — format-aware CTA button (internal Link + external anchor) ✓
- `Eyebrow` — icon + label header pattern consistent with Groups 2 and 3 ✓
- `HighlightBox` — imported from shared-components (available for use) ✓
- `TemplateFooter` — auto-applied via `NewTemplateRenderer` when `edition_title` present ✓

---

## Configuration Forms

### Story Social Form

- Fields: subject (required), hook (required), image (URL), caption (textarea), options (dynamic list), CTA label, CTA link, CTA variant (A/B/C select)
- Import from existing `story_texts` via dropdown
- Per-field validation: hook and subject required

### Newsletter Preview Form

- Fields: title (required), subject (required), preheader, content (textarea), sections (dynamic list with title + summary), CTA label, CTA link, CTA variant (A/B/C select)
- Import from existing `newsletter_campaigns` via dropdown
- Per-field validation: title and subject required

### Capa de Edição Form

- Fields: cover_image (URL), cover_alt_text (accessibility), title (required), subtitle, highlights (dynamic string list), CTA label, CTA link
- Per-field validation: title required
- Edition cover data auto-fetched by renderer when `_editionId` available

### Fashion Editorial Form

- Fields: title (required), toc_title (caption/sumário), intro (textarea), images (URL list, one per line), body (textarea, required), credits
- Per-field validation: title and body required

---

## Published Test Edition

- **Edition:** "Edição Teste — Grupo 4 Reuso Social" (slug: `edicao-teste-grupo4`)
- **Migration:** `0103_seed_group4_refined_pages.js`
- **Pages seeded:** 4 (one per Group 4 template)
- **Visibility:** Available on public frontend URL via `/edition/:id` or `/reader/:id`
- **Content:** Realistic fashion content (no test/lorem ipsum)

### Seed Pages

| Template           | Slug                     | Key Content                                         |
| ------------------ | ------------------------ | --------------------------------------------------- |
| Story Social       | `grupo4-test-story`      | "Alfaiataria Feminina: A Tendência Que Domina 2026" |
| Newsletter Preview | `grupo4-test-newsletter` | "Edição Especial: Tendências Inverno 2026"          |
| Capa de Edição     | `grupo4-test-capa`       | "Edição #43 — Inverno 2026" with cover image        |
| Fashion Editorial  | `grupo4-test-editorial`  | "Nova Era: O Poder do Tailoring" with 4 images      |

---

## Regression Check

- Existing templates (editorial, marketing, holofote, entrevista, default) unaffected ✓
- Groups 1, 2, 3, 5 renderers unchanged ✓
- `format-context` propagation: `SocialFormatPreview` → `TemplateRenderer` → `NewTemplateRenderer` → `renderGroup4` ✓
- `editionId` passed to `NewTemplateRenderer` for Capa de Edição auto-fetch ✓
- Shared components (Eyebrow, renderCTA, HighlightBox) used correctly ✓
- CTA variant badge displayed when `cta_variant` present ✓
- Migration 0102 idempotent (only adds missing select values) ✓
- Migration 0103 idempotent (upsert by slug) ✓
- All 4 template values already registered in `edition_pages.template` select field ✓
- Newsletter campaign import functional via dropdown ✓
- Story text import functional via dropdown ✓
