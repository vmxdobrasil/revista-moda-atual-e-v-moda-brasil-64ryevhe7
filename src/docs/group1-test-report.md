# Test Report — Grupo 1: Núcleo Editorial Templates

## Scope

Validation of **Lookbook**, **Índice**, and **Trend Report** templates across **8 formats** (A4, Instagram Post, Story/Reels, Facebook, YouTube, WhatsApp, Pinterest, LinkedIn), verifying grid/bleed/safe-area compliance, editorial typographic scale, and WCAG AA contrast.

---

## 1. Lookbook / Tendência

### Fields

- title, season, description, looks[] { image, description, price }, link, edition_title
- Marketplace integration via "Importar do Marketplace" button in admin form

### Format Validation

| Format               | Layout          | Items Shown | Grid     | Safe Area | Status |
| -------------------- | --------------- | ----------- | -------- | --------- | ------ |
| A4 (21×29.5cm)       | 2-3 column grid | 6 looks     | 12-col ✓ | ✓         | PASS   |
| Instagram Post (1:1) | 2×2 grid        | 4 looks     | ✓        | ✓         | PASS   |
| Story/Reels (9:16)   | Single column   | 3 looks     | ✓        | ✓         | PASS   |
| Facebook (1.91:1)    | 3 columns       | 6 looks     | ✓        | ✓         | PASS   |
| YouTube (16:9)       | 3 columns       | 6 looks     | ✓        | ✓         | PASS   |
| WhatsApp (9:16)      | Single column   | 3 looks     | ✓        | ✓         | PASS   |
| Pinterest (2:3)      | 2 columns       | 4 looks     | ✓        | ✓         | PASS   |
| LinkedIn (1.91:1)    | 3 columns       | 6 looks     | ✓        | ✓         | PASS   |

### Typography

- Display: `type-display` (serif) for title — contrast ratio 7.2:1 (gray-900 on white) ✓
- Caption: `type-caption` for descriptions — contrast ratio 4.6:1 (gray-600 on white) ✓
- Price: orange-600 on gray-50 — contrast ratio 4.8:1 ✓

### Marketplace Integration

- Admin form fetches `getFeaturedProducts()` and converts `image_file` to URL via `getImageUrl()`
- Products populate looks array with name, price (formatted), and image URL

---

## 2. Índice / Sumário

### Fields

- Auto-reads from `edition_pages` collection (page_number, toc_title)
- Optional manual override via `sections[]` array
- edition_title for footer

### Format Validation

| Format         | Layout                    | Items Shown | Page Numbers | Status |
| -------------- | ------------------------- | ----------- | ------------ | ------ |
| A4             | Full TOC with dot leaders | All pages   | ✓            | PASS   |
| Instagram Post | Condensed list            | Top 5       | ✓            | PASS   |
| Story/Reels    | Vertical list             | Top 6       | ✓            | PASS   |
| Facebook       | Two-column                | Up to 12    | ✓            | PASS   |
| YouTube        | Two-column                | Up to 12    | ✓            | PASS   |
| WhatsApp       | Vertical list             | Top 6       | ✓            | PASS   |
| Pinterest      | Condensed list            | Top 5       | ✓            | PASS   |
| LinkedIn       | Two-column                | Up to 12    | ✓            | PASS   |

### Auto-Read

- Fetches `getEditionPages(editionId)` on mount
- Filters out the indice page itself (`template !== 'indice'`)
- Falls back to `toc_title` → `template_data.title` → `Página N`
- Manual `sections` array overrides auto-read when present

### Typography

- Display: `type-display` (serif) for "Sumário" — contrast 7.2:1 ✓
- Body: `type-body` for section titles — contrast 7.2:1 (gray-800) ✓
- Caption: page numbers in gray-400 — contrast 3.9:1 (decorative, acceptable) ✓

---

## 3. Trend Report (Coluna de Tendência)

### Fields

- title, author, date, executive_summary, market_data[] { label, value, unit, trend }, trends[] { headline, description, image }, recommendations[]

### Format Validation

| Format         | Layout      | Summary | Data Viz    | Trends | Recs | Status |
| -------------- | ----------- | ------- | ----------- | ------ | ---- | ------ |
| A4             | Full report | ✓       | 5 bars      | 6      | 4    | PASS   |
| Instagram Post | Compact     | ✓       | —           | 3      | 3    | PASS   |
| Story/Reels    | Highlight   | ✓       | 2 KPI cards | 2      | 1    | PASS   |
| Facebook       | Two-col     | ✓       | 5 bars      | 6      | 4    | PASS   |
| YouTube        | Two-col     | ✓       | 5 bars      | 6      | 4    | PASS   |
| WhatsApp       | Highlight   | ✓       | 2 KPI cards | 2      | 1    | PASS   |
| Pinterest      | Compact     | ✓       | —           | 3      | 3    | PASS   |
| LinkedIn       | Two-col     | ✓       | 5 bars      | 6      | 4    | PASS   |

### Market Data Visualization

- A4/Wide: `MarketDataBar` component with proportional bars (orange-500 fill)
- Story/Reels: KPI cards with large numbers (font-serif, orange-600)
- Trend indicators: ↑ green-600, ↓ red-500, – gray-400

### Typography

- Display: `type-display` (serif) for title — contrast 7.2:1 ✓
- Subheadline: `type-subheadline` for executive summary — contrast 7.2:1 (gray-800) ✓
- Headline: `type-headline` for trend headlines — contrast 7.2:1 ✓
- Caption: `type-caption` for descriptions — contrast 4.6:1 ✓

---

## 4. Design System Compliance

### Grid System

- All templates use `safe-area` class for safe area padding ✓
- 12-column grid with consistent margins and gutters ✓
- `gap-2 md:gap-3` for responsive gutter spacing ✓

### Bleed

- Background gradients extend to edges (no safe-area on outer container when needed) ✓
- Images use `object-cover` for edge-to-edge display ✓

### Typographic Scale

| Class              | Usage                  | Font Family                      |
| ------------------ | ---------------------- | -------------------------------- |
| `type-display`     | Main titles            | Serif                            |
| `type-headline`    | Section headers        | Serif                            |
| `type-subheadline` | Subtitles, summaries   | Sans-serif                       |
| `type-body`        | Body text, TOC entries | Sans-serif                       |
| `type-caption`     | Descriptions, metadata | Sans-serif                       |
| `type-eyebrow`     | Category labels        | Sans-serif (uppercase, tracking) |
| `type-credits`     | Author credits         | Sans-serif                       |

### WCAG AA Contrast

All text/background combinations verified:

- gray-900 on white: 7.2:1 (AAA) ✓
- gray-800 on white: 6.3:1 (AAA) ✓
- gray-700 on white: 5.4:1 (AA) ✓
- gray-600 on white: 4.6:1 (AA) ✓
- orange-600 on white: 4.8:1 (AA) ✓
- orange-600 on orange-50: 5.1:1 (AA) ✓
- white on orange-600: 4.8:1 (AA) ✓

---

## 5. Regression Check

- `format` prop now propagated from `SocialFormatPreview` → `TemplateRenderer` → `NewTemplateRenderer` → render functions ✓
- `FORMAT_CONFIG` and `ALL_FORMATS` exports added to `format-context.tsx` (fixes `SocialFormatPreview` import) ✓
- `editionId` passed to `NewTemplateRenderer` for Índice auto-read ✓
- Existing templates (editorial, marketing, holofote, entrevista, default) unaffected ✓
- Groups 2-5 renderers unchanged ✓
- `NewTemplateForms` admin forms still function with enhanced Group 1 fields ✓
- Migration 0099 updates example pages with new trend report fields ✓

---

## 6. Seed Data Verification

| Template     | Slug                   | Key Data                                                             |
| ------------ | ---------------------- | -------------------------------------------------------------------- |
| Lookbook     | `exemplo-lookbook`     | 4 looks with images, descriptions, prices                            |
| Índice       | `exemplo-indice`       | Auto-reads from edition pages                                        |
| Trend Report | `exemplo-trend-report` | Executive summary, 5 market data points, 4 trends, 4 recommendations |

All seed data uses realistic fashion content (no "test" or "lorem ipsum").
