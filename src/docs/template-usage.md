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

- **Campos:** advertiser, image, headline, description, link
- **Integração:** advertisements
- **A4:** Página cheia com imagem superior + CTA
- **Social:** Story/Reels usa tela cheia com overlay de texto

### Top 60 Marcas (`top60_marcas`)

- **Campos:** category (ID da categoria top60_categories)
- **Integração:** top60_brands, top60_categories (dados automáticos)
- **A4:** Tabela visual com posição, nome, descrição, score
- **Social:** Quadrado mostra top 6; Story lista top 10

### Perfil de Marca (`perfil_marca`)

- **Campos:** brand_name, logo, description, website, social_handle, products[] { name, image, price, link }
- **Integração:** top60_brands, marketplace_products
- **A4:** Header com logo + título, descrição, grid de produtos, links
- **Social:** Pinterest/Story destaca logo e descrição

### Parceiro / Anunciante (`parceiro_anunciante`)

- **Campos:** partner_name, logo, description, testimonial, testimonial_author, contact_info, link
- **Integração:** advertisements, about_content
- **A4:** Layout institucional com logo, texto, depoimento e CTA
- **Social:** LinkedIn/Facebook otimiza para conteúdo corporativo

---

## Grupo 3 — Conversão

### Galeria de Produtos (`galeria_produtos`)

- **Campos:** products[] { name, image, description, link }
- **Integração:** marketplace_products
- **A4:** Grid 2 colunas com foto, nome, descrição e link
- **Social:** Quadrado mostra 4 produtos; Story um por tela

### Matéria com CTA (`materia_cta`)

- **Campos:** title, body, images[], cta_label, cta_link
- **Integração:** Conversão (link para marketplace, WhatsApp, signup)
- **A4:** Artigo com CTA no rodapé
- **Social:** Facebook/LinkedIn prioriza headline + CTA

### Comparativo A/B (`comparativo_ab`)

- **Campos:** option_a { title, description, image, link }, option_b { ... }
- **Integração:** conversion_metrics
- **A4:** Duas colunas lado a lado
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

Todos os CTAs de oferta/produto dos novos templates (galeria, matéria com CTA, comparativo, lookbook, etc.) apontam para `/` — a plataforma V MODA BRASIL.
