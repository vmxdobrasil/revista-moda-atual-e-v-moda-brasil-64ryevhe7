# Documentacao de Uso — 16 Templates de Pagina

## Formatos Suportados

Cada template renderiza em A4 retrato (21x29.5cm) com grid de 12 colunas e adaptacoes responsivas para:

- Instagram Post (1080x1080)
- Instagram Story/Reels (1080x1920)
- Facebook Post (1200x630)
- YouTube Thumbnail (1280x720)
- WhatsApp Status (1080x1920)
- Pinterest Pin (1000x1500)
- LinkedIn Post (1200x627)

Use o botao "Formatos" na edicao de pagina para pre-visualizar em cada formato.

---

## Grupo 1 — nucleo Editorial

### Lookbook / Tendencia (`lookbook`)

- **Campos:** title, description, images[] (URLs), link
- **Integracao:** marketplace_products (link para produtos)
- **A4:** Grid de 2 colunas com legendas curtas
- **Social:** Quadrado mantem grid 2x2; Story usa coluna unica

### Indice / Sumario (`indice`)

- **Campos:** sections[] { title, link }
- **Integracao:** editions, edition_pages (navegacao)
- **A4:** Lista numerada com setas
- **Social:** Story/Reels adapta para lista vertical scrollavel

### Trend Report (`trend_report`)

- **Campos:** title, author, date, trends[] { headline, description, image }
- **Integracao:** Trend Researcher (dados de tendencia)
- **A4:** Cards horizontais com miniatura + texto
- **Social:** Facebook/LinkedIn otimiza para 2 cards visiveis

---

## Grupo 2 — Monetizacao e Parceiros

### Anuncio / Patrocinado (`anuncio_patrocinado`)

- **Campos:** advertiser, image, headline, description, link
- **Integracao:** advertisements
- **A4:** Pagina cheia com imagem superior + CTA
- **Social:** Story/Reels usa tela cheia com overlay de texto

### Top 60 Marcas (`top60_marcas`)

- **Campos:** category (ID da categoria top60_categories)
- **Integracao:** top60_brands, top60_categories (dados automaticos)
- **A4:** Tabela visual com posicao, nome, descricao, score
- **Social:** Quadrado mostra top 6; Story lista top 10

### Perfil de Marca (`perfil_marca`)

- **Campos:** brand_name, logo, description, website, social_handle
- **Integracao:** top60_brands, marketplace_products
- **A4:** Header com logo + titulo, descricao, links
- **Social:** Pinterest/Story destaca logo e descricao

### Parceiro / Anunciante (`parceiro_anunciante`)

- **Campos:** partner_name, logo, description, contact_info, link
- **Integracao:** advertisements, about_content
- **A4:** Layout institucional com logo, texto e CTA
- **Social:** LinkedIn/Facebook otimiza para conteudo corporativo

---

## Grupo 3 — Conversao

### Galeria de Produtos (`galeria_produtos`)

- **Campos:** products[] { name, image, description, link }
- **Integracao:** marketplace_products
- **A4:** Grid 2 colunas com foto, nome, descricao e link
- **Social:** Quadrado mostra 4 produtos; Story um por tela

### Materia com CTA (`materia_cta`)

- **Campos:** title, body, images[], cta_label, cta_link
- **Integracao:** Conversao (link para marketplace, WhatsApp, signup)
- **A4:** Artigo com CTA no rodape
- **Social:** Facebook/LinkedIn prioriza headline + CTA

### Comparativo A/B (`comparativo_ab`)

- **Campos:** option_a { title, description, image, link }, option_b { ... }
- **Integracao:** conversion_metrics
- **A4:** Duas colunas lado a lado
- **Social:** Story/Reels empilha opcoes verticalmente

---

## Grupo 4 — Reuso Social

### Story / Conteudo Social (`story_social`)

- **Campos:** hook, image, caption, link
- **Integracao:** social_posts, story_texts
- **A4:** Card vertical com gradient roxo/laranja
- **Social:** Story/Reels usa tela cheia nativa

### Newsletter Preview (`newsletter_preview`)

- **Campos:** subject, preheader, content, cta_link
- **Integracao:** newsletter_campaigns
- **A4:** Simula visual de email com borda e cabecalho
- **Social:** LinkedIn/Facebook mostra preview compacto

### Capa de Edicao (`capa_edicao`)

- **Campos:** cover_image, title, subtitle, link
- **Integracao:** editions
- **A4:** Imagem cheia com overlay gradiente e titulo
- **Social:** Story/Reels usa tela cheia; Pinterest proporcao 2:3

### Fashion Editorial (`fashion_editorial`)

- **Campos:** title, intro, images[], body
- **Integracao:** edition_pages, page_hotspots
- **A4:** Grid de imagens + texto justificado
- **Social:** Quadrado foca nas imagens; YouTube mostra hero image

---

## Grupo 5 — Colunas Autorais

### Coluna Holofote — Evoluida (`coluna_holofote_evoluida`)

- **Campos:** title, person_name, person_role, person_photo, date, body, highlights[], interaction_cta_label, interaction_cta_link, edition_title
- **Componentes fixos:** Header "HOLOFOTE", selo de edicao, creditos "Por Fabia Mendonca — Editora de Moda e Tendencias"
- **Destaques:** Lista de 3 a 5 marcos da pessoa destacada
- **CTA:** Botao de interacao (link configuravel)
- **A4:** Layout vertical com foto circular, texto italico e destaques
- **Social:** Story/Reels prioriza foto + nome + highlights

### Coluna Marketing de Moda (`coluna_marketing_moda`)

- **Campos:** title, subtitle, author, author_photo, author_bio, date, body, insights[], practical_actions[], cta_label, cta_link, edition_title
- **Componentes fixos:** Header "MARKETING DE MODA", assinatura prominente de Valter Mendonca — CEO
- **Insights:** Caixa com 3 a 5 conclusoes (icone lâmpada)
- **Para Aplicar:** Caixa com acoes praticas (icone chave)
- **Rodape:** Mini-bio do autor + creditos + data
- **A4:** Fundo escuro com acentos laranja, tipografia serif para titulo
- **Social:** LinkedIn otimiza para insights; Instagram foca no CTA

---

## Padroes de Design

- **Cor primaria:** Laranja `#ea580c` (orange-600)
- **Tipografia:** Serif para titulos, sans-serif para corpo e UI
- **Grid:** 12 colunas com margens consistentes (A4)
- **Bleed:** 3mm para elementos de borda
- **Area segura:** Texto, logos e CTAs dentro da area central
- **Contraste:** WCAG AA em todos os templates
- **Componentes padrao:** Cabecalho, titulo/subtitulo, imagem principal, corpo, caixas de destaque, bloco CTA, creditos/assinatura, rodape com dados da edicao
