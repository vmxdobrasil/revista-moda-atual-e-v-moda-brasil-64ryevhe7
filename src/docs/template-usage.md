# Documentação de Uso — 16 Templates de Página

## Formatos Suportados

Cada template renderiza em A4 retrato (21x29.5cm) com grid de 12 colunas e adaptações responsivas para:

- Instagram Post (1080x1080)
- Instagram Story/Reels (1080x1920)
- Facebook Post (1200x630)
- YouTube Thumbnail (1280x720)
- WhatsApp Status (1080x1920)
- Pinterest Pin (1000x1500)
- LinkedIn Post (1200x627)

Use o botão "Formatos" na edição de página para pré-visualizar em cada formato.

---

## Grupo 1 — Núcleo Editorial

### Lookbook / Tendência (`lookbook`)

- **Campos:** title, season, description, looks[] { image, description, price }, images[] (alternativo), link, edition_title
- **Integração:** marketplace_products (link para produtos)
- **A4:** Grid de 2 colunas com legendas curtas e preços
- **Social:** Quadrado mantém grid 2x2; Story usa coluna única

### Índice / Sumário (`indice`)

- **Campos:** sections[] { title, link }
- **Integração:** editions, edition_pages (navegação)
- **A4:** Lista numerada com setas
- **Social:** Story/Reels adapta para lista vertical scrollável

### Trend Report (`trend_report`)

- **Campos:** title, author, date, trends[] { headline, description, image }
- **Integração:** Trend Researcher (dados de tendência)
- **A4:** Cards horizontais com miniatura + texto
- **Social:** Facebook/LinkedIn otimiza para 2 cards visíveis

---

## Grupo 2 — Monetização e Parceiros

### Anúncio / Patrocinado (`anuncio_patrocinado`)

- **Campos:** advertiser, image, headline, description, link, **catalog_link**
- **Integração:** advertisements
- **Catálogo V MODA BRASIL:** O campo `catalog_link` aponta para o catálogo específico da marca no V MODA BRASIL. Se vazio, o CTA usa o `link` como fallback.
- **A4:** Página cheia com imagem superior + CTA
- **Social:** Story/Reels usa tela cheia com overlay de texto

### Top 60 Marcas (`top60_marcas`)

- **Campos:** category (ID da categoria top60_categories)
- **Integração:** top60_brands, top60_categories (dados automáticos)
- **A4:** Tabela visual com posição, nome, descrição, score
- **Social:** Quadrado mostra top 6; Story lista top 10

### Perfil de Marca (`perfil_marca`)

- **Campos:** brand_name, logo, description, website, social_handle, **catalog_link**, products[] { name, image, price, link }
- **Integração:** top60_brands, marketplace_products
- **Catálogo V MODA BRASIL:** O campo `catalog_link` aponta para o catálogo específico da marca. Se vazio, o CTA usa o `website` como fallback.
- **A4:** Header com logo + título, descrição, grid de produtos, links
- **Social:** Pinterest/Story destaca logo e descrição

### Parceiro / Anunciante (`parceiro_anunciante`)

- **Campos:** partner_name, logo, description, testimonial, testimonial_author, contact_info, link, **catalog_link**
- **Integração:** advertisements, about_content
- **Catálogo V MODA BRASIL:** O campo `catalog_link` aponta para o catálogo específico da marca no V MODA BRASIL. Se vazio, o CTA usa o `link` como fallback.
- **A4:** Layout institucional com logo, texto, depoimento e CTA
- **Social:** LinkedIn/Facebook otimiza para conteúdo corporativo

---

## Grupo 3 — Conversão

### Galeria de Produtos (`galeria_produtos`)

- **Status:** Sem melhorias futuras. Não há vitrine de produtos interna na revista.
- **Campos:** products[] { name, image, description, link }
- **Integração:** marketplace_products
- **A4:** Grid 2 colunas com foto, nome, descrição e link
- **Social:** Quadrado mostra 4 produtos; Story um por tela
- **Nota:** A conversão acontece exclusivamente direcionando leitores para o catálogo da marca no V MODA BRASIL, não por uma vitrine interna.

### Matéria com CTA (`materia_cta`)

- **Campos:** title, **subtitle**, body, images[], cta_label, cta_link, **credits**
- **Integração:** Conversão (link para marketplace, WhatsApp, signup)
- **A4:** Artigo com subtítulo abaixo do título, créditos no rodapé próximo ao CTA
- **Social:** Facebook/LinkedIn prioriza headline + CTA

### Comparativo A/B (`comparativo_ab`)

- **Campos:** option_a { title, description, image, link, **metrics** { impressions, clicks, orders, conversion_rate } }, option_b { ... }
- **Integração:** conversion_metrics (métricas agregadas por variante A/B)
- **Métricas:** O formulário busca automaticamente métricas da coleção `conversion_metrics` (filtradas por `cta_variant` = "A" ou "B") e permite carregá-las para cada opção. As métricas são exibidas no renderizador abaixo de cada variante.
- **A4:** Duas colunas lado a lado com métricas de performance
- **Social:** Story/Reels empilha opções verticalmente

---

## Grupo 4 — Reuso Social

### Story / Conteúdo Social (`story_social`)

- **Campos:** hook, image, caption, link
- **Integração:** social_posts, story_texts
- **A4:** Card vertical com gradient roxo/laranja
- **Social:** Story/Reels usa tela cheia nativa

### Newsletter Preview (`newsletter_preview`)

- **Campos:** subject, preheader, content, cta_link
- **Integração:** newsletter_campaigns
- **A4:** Simula visual de email com borda e cabeçalho
- **Social:** LinkedIn/Facebook mostra preview compacto

### Capa de Edição (`capa_edicao`)

- **Campos:** cover_image, title, subtitle, link
- **Integração:** editions
- **A4:** Imagem cheia com overlay gradiente e título
- **Social:** Story/Reels usa tela cheia; Pinterest proporção 2:3

### Fashion Editorial (`fashion_editorial`)

- **Campos:** title, intro, images[], body
- **Integração:** edition_pages, page_hotspots
- **A4:** Grid de imagens + texto justificado
- **Social:** Quadrado foca nas imagens; YouTube mostra hero image

---

## Grupo 5 — Colunas Autorais

### Coluna Holofote — Evoluída (`coluna_holofote_evolvida`)

- **Campos:** title, person_name, person_role, person_photo, date, body, highlights[], interaction_cta_label, interaction_cta_link, edition_title
- **Componentes fixos:** Header "HOLOFOTE", selo de edição, créditos "Por Fabia Mendonça — Editora de Moda e Tendências"
- **Destaques:** Lista de 3 a 5 marcos da pessoa destacada
- **CTA:** Botão de interação (link configurável)
- **A4:** Layout vertical com foto circular, texto itálico e destaques
- **Social:** Story/Reels prioriza foto + nome + highlights

### Coluna Marketing de Moda (`coluna_marketing_moda`)

- **Campos:** title, subtitle, author, author_photo, author_bio, date, body, insights[], practical_actions[], cta_label, cta_link, edition_title
- **Componentes fixos:** Header "MARKETING DE MODA", assinatura proeminente de Valter Mendonça — CEO
- **Insights:** Caixa com 3 a 5 conclusões (ícone lâmpada)
- **Para Aplicar:** Caixa com ações práticas (ícone chave)
- **Rodapé:** Mini-bio do autor + créditos + data
- **A4:** Fundo escuro com acentos laranja, tipografia serif para título
- **Social:** LinkedIn otimiza para insights; Instagram foca no CTA

---

## Padrões de Design

- **Cor primária:** Laranja `#ea580c` (orange-600)
- **Tipografia:** Serif para títulos, sans-serif para corpo e UI
- **Grid:** 12 colunas com margens consistentes (A4)
- **Bleed:** 3mm para elementos de borda
- **Área segura:** Texto, logos e CTAs dentro da área central
- **Contraste:** WCAG AA em todos os templates
- **Componentes padrão:** Cabeçalho, título/subtítulo, imagem principal, corpo, caixas de destaque, bloco CTA, créditos/assinatura, rodapé com dados da edição

## Diretiva de CTA

Todos os CTAs de oferta/produto dos templates de advertiser (`anuncio_patrocinado`, `perfil_marca`, `parceiro_anunciante`) apontam para o `catalog_link` configurável — o catálogo específico da marca no V MODA BRASIL. Quando `catalog_link` está vazio, o CTA faz fallback para o campo de link existente (`link` ou `website`). Os CTAs dos demais templates (galeria, matéria com CTA, comparativo, lookbook, etc.) continuam apontando para `/` — a raiz da plataforma V MODA BRASIL.

---

## Páginas de Exemplo (Migration 0097)

Exemplo de páginas foram criadas via migration `0097_seed_group1_to_4_example_pages.js` para cada um dos 14 templates dos Grupos 1–4. Cada página pode ser visualizada no admin em **Edições → abrir edição → visualizar páginas**.

| Template            | Slug                          | Grupo                       |
| ------------------- | ----------------------------- | --------------------------- |
| Lookbook            | `exemplo-lookbook`            | 1 — Núcleo Editorial        |
| Índice              | `exemplo-indice`              | 1 — Núcleo Editorial        |
| Trend Report        | `exemplo-trend-report`        | 1 — Núcleo Editorial        |
| Anúncio Patrocinado | `exemplo-anuncio-patrocinado` | 2 — Monetização e Parceiros |
| Top 60 Marcas       | `exemplo-top60-marcas`        | 2 — Monetização e Parceiros |
| Perfil de Marca     | `exemplo-perfil-marca`        | 2 — Monetização e Parceiros |
| Parceiro Anunciante | `exemplo-parceiro-anunciante` | 2 — Monetização e Parceiros |
| Galeria de Produtos | `exemplo-galeria-produtos`    | 3 — Conversão               |
| Matéria com CTA     | `exemplo-materia-cta`         | 3 — Conversão               |
| Comparativo A/B     | `exemplo-comparativo-ab`      | 3 — Conversão               |
| Story Social        | `exemplo-story-social`        | 4 — Reuso Social            |
| Newsletter Preview  | `exemplo-newsletter-preview`  | 4 — Reuso Social            |
| Capa de Edição      | `exemplo-capa-edicao`         | 4 — Reuso Social            |
| Fashion Editorial   | `exemplo-fashion-editorial`   | 4 — Reuso Social            |

Todos os CTAs de oferta/produto apontam para `/` (V MODA BRASIL). As páginas de exemplo incluem:

- Dados realistas (produtos, marcas, tendências, depoimentos)
- Imagens placeholder via `img.usecurling.com`
- Campos SEO completos (`seo_title`, `seo_description`, `keywords`)
- Hotspots interativos na página de Fashion Editorial
- Integração com coleções existentes (`marketplace_products`, `top60_brands`, `top60_categories`, `page_hotspots`)
- Seed de `marketplace_products` caso a coleção esteja vazia
- Atribuição automática de `page_number` sequencial após as páginas existentes
- Verificação de idempotência por `slug` antes de cada inserção
