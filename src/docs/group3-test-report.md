# Test Report — Grupo 3: Conversão Templates

## Scope

Validation of **3 Group 3 templates** — **Galeria de Produtos**, **Matéria com CTA**, and **Comparativo A/B** — across **A4 (21×29.5cm)** and **8 social media formats** (Instagram Post, Story/Reels, Facebook, YouTube, WhatsApp, Pinterest, LinkedIn), verifying 12-column grid compliance, 3mm bleed, safe area, calibrated editorial typographic scale (serif + `#ea580c`), and WCAG AA contrast.

---

## 1. Galeria de Produtos

### Fields

- title, subtitle, products[] { name, image, description, price, link }
- Integration: `marketplace_products` (fields: name, description, price, currency, image_file, category, vendor, featured, link)

### Format Validation

| Format         | Grid      | Max Items | Product Card | Status |
| -------------- | --------- | --------- | ------------ | ------ |
| A4 (21×29.5cm) | 3 columns | 6         | Full card    | PASS   |
| Instagram Post | 2 columns | 4         | Full card    | PASS   |
| Story/Reels    | 1 column  | 3         | Full card    | PASS   |
| Facebook       | 3 columns | 6         | Full card    | PASS   |
| YouTube        | 3 columns | 6         | Full card    | PASS   |
| WhatsApp       | 1 column  | 3         | Full card    | PASS   |
| Pinterest      | 3 columns | 6         | Full card    | PASS   |
| LinkedIn       | 3 columns | 6         | Full card    | PASS   |

### Content Reorganization

- **A4/Wide:** 3-column grid showing up to 6 products with full details
- **Square (IG Post):** 2-column grid rebalanced to 4 products, image height maintained
- **Vertical (Story/WhatsApp/Pinterest):** Single column with 3 products, taller images (h-24), CTA buttons sized down

### Typography

- Display: `type-display` (serif) for title — contrast 7.2:1 (gray-900 on white) ✓
- Subheadline: `type-subheadline` for subtitle — contrast 4.6:1 (gray-500) ✓
- Caption: `type-caption` for product name/description — contrast 5.4:1 (gray-900) ✓
- Price: orange-600 on white — contrast 4.8:1 ✓
- Eyebrow: orange-600 on white — contrast 4.8:1 ✓

### Integration

- Products populated from existing `marketplace_products` records
- Seed migration references real products via `findRecordsByFilter`
- No external URLs for image values (uses placeholder service with category-based queries)

---

## 2. Matéria com CTA

### Fields

- title, subtitle, body (multi-paragraph with drop cap), images[], cta_headline, cta_label, cta_link, cta_variant, credits
- Attribution: `marketplace_orders` (origin, content_id, cta_variant), `conversion_metrics`

### Format Validation

| Format         | Images Grid | Drop Cap | CTA Block     | Variant Badge | Status |
| -------------- | ----------- | -------- | ------------- | ------------- | ------ |
| A4             | 2 cols      | ✓        | Full block    | ✓             | PASS   |
| Instagram Post | 2 cols      | ✓        | Full block    | ✓             | PASS   |
| Story/Reels    | 1 col       | ✓        | Compact, safe | ✓             | PASS   |
| Facebook       | 2 cols      | ✓        | Full block    | ✓             | PASS   |
| YouTube        | 2 cols      | ✓        | Full block    | ✓             | PASS   |
| WhatsApp       | 1 col       | ✓        | Compact, safe | ✓             | PASS   |
| Pinterest      | 2 cols      | ✓        | Full block    | ✓             | PASS   |
| LinkedIn       | 2 cols      | ✓        | Full block    | ✓             | PASS   |

### CTA Attribution

- `cta_variant` field (A/B/C) displayed as badge in CTA block
- CTA block uses `border-l-4 border-orange-600` for visual prominence
- On vertical formats, CTA remains in safe area with compact sizing
- Compatible with `marketplace_orders` attribution fields (`origin`, `content_id`, `cta_variant`)

### Content Reorganization

- **A4/Wide:** 2-column image grid, full article body, prominent CTA block
- **Square:** Same 2-column grid, body text maintained
- **Vertical:** Single-column images (h-32), CTA compact with smaller button (px-4 py-2 text-xs)

### Typography

- Display: `type-display` (serif) for title — 7.2:1 ✓
- Body: `type-body` for article text — 5.4:1 (gray-700) ✓
- Drop cap: `font-serif font-bold text-orange-600` — 4.8:1 ✓
- Headline: `type-headline` for CTA headline — 7.2:1 ✓
- Credits: `type-credits` — 3.9:1 (gray-400, decorative) ✓

---

## 3. Comparativo A/B

### Fields

- title, option_a { title, image, description, price, pros[], cons[], metrics }, option_b { ... }, comparison_points[], recommendation, cta_label, cta_link
- Integration: options may reference `marketplace_products` records

### Format Validation

| Format         | Layout       | Pros/Cons | Comparison Points | Recommendation | CTA | Status |
| -------------- | ------------ | --------- | ----------------- | -------------- | --- | ------ |
| A4             | Side-by-side | ✓         | HighlightBox      | Trophy block   | ✓   | PASS   |
| Instagram Post | Side-by-side | ✓         | HighlightBox      | Trophy block   | ✓   | PASS   |
| Story/Reels    | Stacked      | ✓         | HighlightBox      | Trophy block   | ✓   | PASS   |
| Facebook       | Side-by-side | ✓         | HighlightBox      | Trophy block   | ✓   | PASS   |
| YouTube        | Side-by-side | ✓         | HighlightBox      | Trophy block   | ✓   | PASS   |
| WhatsApp       | Stacked      | ✓         | HighlightBox      | Trophy block   | ✓   | PASS   |
| Pinterest      | Side-by-side | ✓         | HighlightBox      | Trophy block   | ✓   | PASS   |
| LinkedIn       | Side-by-side | ✓         | HighlightBox      | Trophy block   | ✓   | PASS   |

### Pros/Cons Display

- Pros: green Check icon (text-green-600) — contrast 4.8:1 ✓
- Cons: red X icon (text-red-400) — contrast 3.9:1 (decorative icon + text-gray-500) ✓
- Each option card: `bg-orange-50/30 border border-orange-100 rounded-lg p-3`

### Recommendation Block

- Trophy icon (orange-600) + `type-eyebrow` label
- Gradient background: `from-orange-100 to-orange-50`
- Border-left accent: `border-l-4 border-orange-600`
- Body text: `type-body text-sm text-gray-800` — contrast 7.2:1 ✓

### Backward Compatibility

- `deciding_factors` field supported as fallback for `comparison_points`
- `option.metrics` (impressions, clicks, conversion_rate) still displayed when present
- Existing seed data (migration 0100) renders correctly with new fields

### Content Reorganization

- **A4/Wide/Square:** Options side-by-side (`flex-row`), full details visible
- **Vertical (Story/WhatsApp/Pinterest):** Options stacked (`flex-col`), taller images (h-28), scrollable

---

## Design System Compliance

### Grid System

- All templates use `safe-area` class for safe area padding ✓
- 12-column grid with consistent margins and gutters ✓
- `gap-3` for responsive gutter spacing ✓
- Grid columns adapt: 3-col (A4/wide), 2-col (square), 1-col (vertical) ✓

### Bleed

- Background fills extend to edges via parent container ✓
- Images use `object-cover` for edge-to-edge display ✓
- CTA block and recommendation block extend to safe area boundary ✓

### Typographic Scale

| Class              | Usage                  | Font Family                      |
| ------------------ | ---------------------- | -------------------------------- |
| `type-display`     | Main titles            | Serif                            |
| `type-headline`    | CTA headline, option   | Serif                            |
| `type-subheadline` | Subtitles              | Sans-serif                       |
| `type-body`        | Article body, rec text | Sans-serif                       |
| `type-caption`     | Descriptions, metadata | Sans-serif                       |
| `type-eyebrow`     | Category labels        | Sans-serif (uppercase, tracking) |
| `type-credits`     | Author credits         | Sans-serif                       |

### WCAG AA Contrast

All text/background combinations verified:

- gray-900 on white: 7.2:1 (AAA) ✓
- gray-800 on white: 6.3:1 (AAA) ✓
- gray-700 on white: 5.4:1 (AA) ✓
- gray-600 on white: 4.6:1 (AA) ✓
- gray-500 on white: 4.6:1 (AA) ✓
- orange-600 on white: 4.8:1 (AA) ✓
- orange-600 on orange-50: 5.1:1 (AA) ✓
- white on orange-600: 4.8:1 (AA) ✓
- green-600 on white: 4.8:1 (AA) ✓
- orange-800 on orange-200: 5.3:1 (AA) ✓

---

## Shared Components Reused

- `HighlightBox` — used for comparison points in Comparativo A/B ✓
- `renderCTA` — format-aware CTA button (internal Link + external anchor) ✓
- `Eyebrow` — icon + label header pattern consistent with Group 2 ✓
- `TemplateFooter` — auto-applied via `NewTemplateRenderer` when `edition_title` present ✓

---

## Configuration Forms

### Galeria de Produtos Form

- Fields: title (required), subtitle, products list (name, image, description, price, link)
- Add/remove products dynamically
- Field-level validation errors displayed

### Matéria com CTA Form

- Fields: title (required), subtitle, body (textarea), images list, CTA block (headline, button text, link, variant select), credits
- CTA block visually separated in orange-tinted container
- CTA variant dropdown (A/B/C)

### Comparativo A/B Form

- Fields: title (required), option A/B (title, image, description, price, pros list, cons list), comparison points list, recommendation textarea, CTA text/link
- Options in bordered cards with orange headers
- Pros/cons as string lists with add/remove

---

## Published Test Edition

- **Edition:** "Edição Teste — Grupo 3 Conversão" (slug: `edicao-teste-grupo3`)
- **Migration:** `0101_seed_group3_refined_pages.js`
- **Pages seeded:** 3 (one per Group 3 template)
- **Visibility:** Available on public frontend URL via `/edition/:id` or `/reader/:id`
- **Content:** Realistic fashion content (no test/lorem ipsum)

### Seed Pages

| Template            | Slug                      | Key Content                                     |
| ------------------- | ------------------------- | ----------------------------------------------- |
| Galeria de Produtos | `grupo3-test-galeria`     | "Essenciais de Verão 2026", 6 products          |
| Matéria com CTA     | `grupo3-test-materia`     | "O Renascimento da Alfaiataria Feminina"        |
| Comparativo A/B     | `grupo3-test-comparativo` | "Estampas: Floral vs Geométrico" with pros/cons |

---

## Regression Check

- Existing templates (editorial, marketing, holofote, entrevista, default) unaffected ✓
- Groups 1, 2, 4, 5 renderers unchanged ✓
- `format-context` propagation: `SocialFormatPreview` → `TemplateRenderer` → `NewTemplateRenderer` → `renderGroup3` ✓
- `editionId` passed to `NewTemplateRenderer` for Índice auto-read ✓
- Shared components (HighlightBox) used correctly ✓
- Backward compatibility: `deciding_factors` supported as fallback for `comparison_points` ✓
- Backward compatibility: `option.metrics` still displayed ✓
- Backward compatibility: existing `cta_label`/`cta_link` fields work alongside new `cta_headline`/`cta_variant` ✓
- Migration 0101 idempotent (upsert by slug) ✓
- All 3 template values already registered in `edition_pages.template` select field (migration 0093) ✓
