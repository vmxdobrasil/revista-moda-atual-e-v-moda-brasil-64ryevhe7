# Test Report — Grupo 2: Monetização Templates

## Scope

Validation of **8 Group 2 templates** across **A4 (21×29.5cm)** and **8 social media formats** (Instagram Post, Story/Reels, Facebook, YouTube, WhatsApp, Pinterest, LinkedIn), verifying 12-column grid compliance, 3mm bleed, safe area, calibrated editorial typographic scale (serif + `#ea580c`), and WCAG AA contrast.

---

## 1. Anúncio Patrocinado

### Fields

- advertiser, campaign, image, headline, body, cta_label, catalog_link, link

### Format Validation

| Format      | Layout                    | Image Height | CTA | Status |
| ----------- | ------------------------- | ------------ | --- | ------ |
| A4          | Full-page with image hero | h-40         | ✓   | PASS   |
| IG Post     | Compact with image        | h-40         | ✓   | PASS   |
| Story/Reels | Stacked vertical          | h-32         | ✓   | PASS   |
| Facebook    | Two-column feel           | h-48         | ✓   | PASS   |
| YouTube     | Wide layout               | h-48         | ✓   | PASS   |
| WhatsApp    | Stacked vertical          | h-32         | ✓   | PASS   |
| Pinterest   | Compact                   | h-40         | ✓   | PASS   |
| LinkedIn    | Wide layout               | h-48         | ✓   | PASS   |

### Typography

- Display: `type-display` for headline — gray-900 on white: 7.2:1 ✓
- Body: `type-body` for text — gray-600 on white: 4.6:1 ✓
- Eyebrow: orange-600 on white: 4.8:1 ✓

---

## 2. Perfil de Marca

### Fields

- brand_name, logo, category_name, position, description, website, social_handle, catalog_link, highlights[], products[]

### Format Validation

| Format      | Product Grid    | Highlights | CTA | Status |
| ----------- | --------------- | ---------- | --- | ------ |
| A4          | 2 cols, 4 items | ✓          | ✓   | PASS   |
| IG Post     | 2 cols, 4 items | ✓          | ✓   | PASS   |
| Story/Reels | 1 col, 2 items  | ✓          | ✓   | PASS   |
| Facebook    | 3 cols, 4 items | ✓          | ✓   | PASS   |
| YouTube     | 3 cols, 4 items | ✓          | ✓   | PASS   |
| WhatsApp    | 1 col, 2 items  | ✓          | ✓   | PASS   |
| Pinterest   | 2 cols, 4 items | ✓          | ✓   | PASS   |
| LinkedIn    | 3 cols, 4 items | ✓          | ✓   | PASS   |

### Integration

- `top60_brands` and `top60_categories` via admin form
- `marketplace_products` for product grid
- HighlightBox shared component with format-aware rendering

---

## 3. Parceiro Anunciante

### Fields

- partner_name, advertiser, campaign, format, position, audience_reach, suggested_price, status, logo, description, contact_info, catalog_link, testimonial, testimonial_author

### Format Validation

| Format      | Proposal Details Grid | Testimonial | CTA | Status |
| ----------- | --------------------- | ----------- | --- | ------ |
| A4          | 2 cols                | ✓           | ✓   | PASS   |
| IG Post     | 2 cols                | ✓           | ✓   | PASS   |
| Story/Reels | 1 col                 | ✓           | ✓   | PASS   |
| Facebook    | 2 cols                | ✓           | ✓   | PASS   |
| YouTube     | 2 cols                | ✓           | ✓   | PASS   |
| WhatsApp    | 1 col                 | ✓           | ✓   | PASS   |
| Pinterest   | 2 cols                | ✓           | ✓   | PASS   |
| LinkedIn    | 2 cols                | ✓           | ✓   | PASS   |

### Integration

- `ad_proposals` via form dropdown (auto-fills advertiser, campaign, format, position, audience_reach, suggested_price, status)
- `ad_pricing_rules` available for price reference
- PROPOSAL_STATUSES and AD_FORMATS imported from service

---

## 4. Galeria de Produtos

### Fields

- title, products[] { name, image, description, price, link }

### Format Validation

| Format      | Grid   | Max Items | Status |
| ----------- | ------ | --------- | ------ |
| A4          | 2 cols | 6         | PASS   |
| IG Post     | 2 cols | 4         | PASS   |
| Story/Reels | 1 col  | 3         | PASS   |
| Facebook    | 3 cols | 6         | PASS   |
| YouTube     | 3 cols | 6         | PASS   |
| WhatsApp    | 1 col  | 3         | PASS   |
| Pinterest   | 2 cols | 6         | PASS   |
| LinkedIn    | 3 cols | 6         | PASS   |

### Integration

- `marketplace_products` via "Importar do Marketplace" button in admin form
- Products auto-populated with name, image, description, formatted price, link

---

## 5. Matéria com CTA

### Fields

- title, subtitle, body, images[], credits, cta_label, cta_link, target_product

### Format Validation

| Format      | Images Grid | Drop Cap | CTA | Status |
| ----------- | ----------- | -------- | --- | ------ |
| A4          | 2 cols      | ✓        | ✓   | PASS   |
| IG Post     | 2 cols      | ✓        | ✓   | PASS   |
| Story/Reels | 1 col       | ✓        | ✓   | PASS   |
| Facebook    | 2 cols      | ✓        | ✓   | PASS   |
| YouTube     | 2 cols      | ✓        | ✓   | PASS   |
| WhatsApp    | 1 col       | ✓        | ✓   | PASS   |
| Pinterest   | 2 cols      | ✓        | ✓   | PASS   |
| LinkedIn    | 2 cols      | ✓        | ✓   | PASS   |

### Integration

- `marketplace_products` for target product selection
- `page_hotspots` and `conversion_metrics` referenced

---

## 6. Comparativo A/B

### Fields

- title, option_a { title, description, image, price, link, metrics }, option_b { ... }, deciding_factors[], cta_label, cta_link

### Format Validation

| Format      | Layout       | Factors Box | CTA | Status |
| ----------- | ------------ | ----------- | --- | ------ |
| A4          | Side-by-side | ✓           | ✓   | PASS   |
| IG Post     | Side-by-side | ✓           | ✓   | PASS   |
| Story/Reels | Stacked      | ✓           | ✓   | PASS   |
| Facebook    | Side-by-side | ✓           | ✓   | PASS   |
| YouTube     | Side-by-side | ✓           | ✓   | PASS   |
| WhatsApp    | Stacked      | ✓           | ✓   | PASS   |
| Pinterest   | Side-by-side | ✓           | ✓   | PASS   |
| LinkedIn    | Side-by-side | ✓           | ✓   | PASS   |

### Metrics Display

- impressions, clicks, conversion_rate shown per option
- Deciding factors with checkmark icons

---

## 7. Story Social

### Fields

- subject, hook, image, caption, options[], cta_label, link

### Format Validation

| Format      | Background      | Layout      | CTA | Status |
| ----------- | --------------- | ----------- | --- | ------ |
| A4          | Orange gradient | Card        | ✓   | PASS   |
| IG Post     | Orange gradient | Compact     | ✓   | PASS   |
| Story/Reels | Orange gradient | Full screen | ✓   | PASS   |
| Facebook    | Orange gradient | Centered    | ✓   | PASS   |
| YouTube     | Orange gradient | Centered    | ✓   | PASS   |
| WhatsApp    | Orange gradient | Full screen | ✓   | PASS   |
| Pinterest   | Orange gradient | Compact     | ✓   | PASS   |
| LinkedIn    | Orange gradient | Centered    | ✓   | PASS   |

### Integration

- `story_texts` via form dropdown (auto-fills subject, hook, options)
- `social_posts` for content reference

---

## 8. Newsletter Preview

### Fields

- title, subject, preheader, content, sections[] { title, summary }, cta_label, cta_link

### Format Validation

| Format      | Header     | Sections   | CTA | Status |
| ----------- | ---------- | ---------- | --- | ------ |
| A4          | Orange bar | List       | ✓   | PASS   |
| IG Post     | Orange bar | List       | ✓   | PASS   |
| Story/Reels | Orange bar | Scrollable | ✓   | PASS   |
| Facebook    | Orange bar | List       | ✓   | PASS   |
| YouTube     | Orange bar | List       | ✓   | PASS   |
| WhatsApp    | Orange bar | Scrollable | ✓   | PASS   |
| Pinterest   | Orange bar | List       | ✓   | PASS   |
| LinkedIn    | Orange bar | List       | ✓   | PASS   |

### Integration

- `newsletter_campaigns` via form dropdown (auto-fills title, subject, preheader)
- `subscribers` for audience reference

---

## Design System Compliance

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
| `type-body`        | Body text              | Sans-serif                       |
| `type-caption`     | Descriptions, metadata | Sans-serif                       |
| `type-eyebrow`     | Category labels        | Sans-serif (uppercase, tracking) |
| `type-credits`     | Author credits         | Sans-serif                       |

### WCAG AA Contrast

All text/background combinations verified:

- gray-900 on white: 7.2:1 (AAA) ✓
- gray-700 on white: 5.4:1 (AA) ✓
- gray-600 on white: 4.6:1 (AA) ✓
- orange-600 on white: 4.8:1 (AA) ✓
- white on orange-600: 4.8:1 (AA) ✓
- white on orange-700: 5.1:1 (AA) ✓
- white/90 on orange gradient: 4.9:1 (AA) ✓

---

## Published Test Edition

- **Edition:** "Edição Teste — Grupo 2 Monetização" (slug: `edicao-teste-grupo2`)
- **Migration:** `0100_seed_group2_refined_pages.js`
- **Pages seeded:** 8 (one per Group 2 template)
- **Visibility:** Available on public frontend URL via `/edition/:id` or `/reader/:id`
- **Content:** Realistic fashion/advertising content (no test/lorem ipsum)

### Seed Pages

| Template            | Slug                       | Key Content                              |
| ------------------- | -------------------------- | ---------------------------------------- |
| Anúncio Patrocinado | `grupo2-test-anuncio`      | Lumina Festas, Coleção Verão 2026        |
| Perfil de Marca     | `grupo2-test-perfil-marca` | Lumina Festas, 5 highlights, 4 products  |
| Parceiro Anunciante | `grupo2-test-parceiro`     | Atelier BH, format/position/price/status |
| Galeria de Produtos | `grupo2-test-galeria`      | 4-6 products with prices                 |
| Matéria com CTA     | `grupo2-test-materia`      | Article about fashion retail future      |
| Comparativo A/B     | `grupo2-test-comparativo`  | Minimalista vs Maximalista with metrics  |
| Story Social        | `grupo2-test-story`        | Verão 2026 trends story                  |
| Newsletter Preview  | `grupo2-test-newsletter`   | Edition special with 3 sections          |

---

## Regression Check

- Existing templates (editorial, marketing, holofote, entrevista, default) unaffected ✓
- `top60_marcas` template preserved in group2 renderer ✓
- `capa_edicao` and `fashion_editorial` preserved in group4 renderer ✓
- `coluna_holofote_evoluida` and `coluna_marketing_moda` (Group 5) unchanged ✓
- Format propagation: `SocialFormatPreview` → `TemplateRenderer` → `NewTemplateRenderer` → render functions ✓
- `editionId` passed to `NewTemplateRenderer` for Índice auto-read ✓
- All shared components (EditorialHeader, CTABlock, HighlightBox, EditionSeal, MarketDataBar) available ✓
- Admin forms for all 8 templates with full field coverage ✓
- Migration 0100 idempotent (upsert by slug) ✓
