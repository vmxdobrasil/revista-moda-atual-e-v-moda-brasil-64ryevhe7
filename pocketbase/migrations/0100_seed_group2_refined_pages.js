migrate(
  (app) => {
    var editionsCol = app.findCollectionByNameOrId('editions')
    var editionId = ''
    var editionTitle = 'Edicao Teste — Grupo 2 Monetizacao'

    try {
      var existing = app.findFirstRecordByData('editions', 'title', editionTitle)
      editionId = existing.id
    } catch (_) {
      var edition = new Record(editionsCol)
      edition.set('title', editionTitle)
      edition.set(
        'description',
        'Edicao de teste para validacao dos templates do Grupo 2 — Monetizacao, refinados com padrao de designer senior.',
      )
      edition.set('slug', 'edicao-teste-grupo2')
      app.save(edition)
      editionId = edition.id
    }

    var col = app.findCollectionByNameOrId('edition_pages')
    var maxPage = 0
    try {
      var pages = app.findRecordsByFilter(
        'edition_pages',
        'edition = "' + editionId + '"',
        '-page_number',
        1,
        0,
      )
      if (pages.length > 0) maxPage = pages[0].getInt('page_number')
    } catch (_) {}

    var products = []
    try {
      products = app.findRecordsByFilter('marketplace_products', '', 'created', 10, 0)
    } catch (_) {}

    var img = function (w, h, q) {
      return 'https://img.usecurling.com/p/' + w + '/' + h + '?q=' + q
    }

    function upsertPage(slug, template, templateData, seoTitle, seoDesc, keywords) {
      try {
        var existingPage = app.findFirstRecordByData('edition_pages', 'slug', slug)
        existingPage.set('template', template)
        existingPage.set('template_data', templateData)
        existingPage.set('seo_title', seoTitle)
        existingPage.set('seo_description', seoDesc)
        existingPage.set('keywords', keywords)
        app.save(existingPage)
        return existingPage
      } catch (_) {
        maxPage++
        var page = new Record(col)
        page.set('edition', editionId)
        page.set('page_number', maxPage)
        page.set('template', template)
        page.set('slug', slug)
        page.set('seo_title', seoTitle)
        page.set('seo_description', seoDesc)
        page.set('keywords', keywords)
        page.set('template_data', templateData)
        app.save(page)
        return page
      }
    }

    upsertPage(
      'grupo2-test-anuncio',
      'anuncio_patrocinado',
      {
        advertiser: 'Lumina Festas',
        campaign: 'Colecao Verao 2026',
        image: img(800, 400, 'fashion%20brand%20advertisement'),
        headline: 'Colecao Verao 2026: Estilo que Inspira',
        body: 'A Lumina Festas apresenta sua nova colecao inspirada nas tendencias globais. Pecas exclusivas que combinam elegancia e conforto, perfeitas para todas as ocasioes. Descubra o que ha de mais atual na moda brasileira com tecidos premium e design contemporaneo.',
        cta_label: 'Ver Colecao Completa',
        catalog_link: 'https://revistamodaatual.com.br/catalogo/lumina-festas',
        link: '/',
        edition_title: editionTitle,
      },
      'Lumina Festas: Colecao Verao 2026 | Anuncio Patrocinado',
      'Conheca a nova colecao Verao 2026 da Lumina Festas com pecas exclusivas e design contemporaneo.',
      'lumina festas, colecao verao 2026, anuncio patrocinado, moda festa',
    )

    upsertPage(
      'grupo2-test-perfil-marca',
      'perfil_marca',
      {
        brand_name: 'Lumina Festas',
        logo: 'https://img.usecurling.com/i?q=lumina&color=orange',
        category_name: 'Moda Festa',
        position: 1,
        description:
          'Lumina Festas e uma marca brasileira especializada em moda festa e alfaiataria feminina. Fundada em 2015, a marca combina tecidos premium com design contemporaneo, atendendo varejistas e consumidoras finais em todo o Brasil. Com mais de 200 pontos de venda, e referencia no segmento de moda festa nacional.',
        website: 'https://luminafestas.com.br',
        social_handle: '@luminafestas',
        catalog_link: 'https://revistamodaatual.com.br/catalogo/lumina-festas',
        highlights: [
          'Fundada em 2015 com apenas 3 pecas',
          'Faturamento cresceu 200% em 2025',
          'Presente em 12 estados brasileiros',
          'Parceria com V MODA BRASIL para expansao nacional',
          'Tecidos premium importados da Italia',
        ],
        products: [
          {
            name: 'Vestido Longo Floral',
            image: img(300, 300, 'floral%20long%20dress'),
            price: 'R$ 129,90',
            link: '/',
          },
          {
            name: 'Blazer Alfaiataria Premium',
            image: img(300, 300, 'blazer%20fashion'),
            price: 'R$ 259,90',
            link: '/',
          },
          {
            name: 'Calca Wide Leg Fluida',
            image: img(300, 300, 'wide%20leg%20pants'),
            price: 'R$ 179,90',
            link: '/',
          },
          {
            name: 'Bolsa Couro Natural',
            image: img(300, 300, 'leather%20bag'),
            price: 'R$ 349,90',
            link: '/',
          },
        ],
        edition_title: editionTitle,
      },
      'Perfil: Lumina Festas | Revista MODA ATUAL',
      'Conheca a Lumina Festas, marca brasileira de moda festa e alfaiataria feminina presente em 12 estados.',
      'lumina festas, perfil de marca, moda festa, alfaiataria feminina',
    )

    upsertPage(
      'grupo2-test-parceiro',
      'parceiro_anunciante',
      {
        partner_name: 'Atelier BH',
        advertiser: 'Atelier BH',
        campaign: 'Lancamento Linha Premium',
        format: 'Pagina Inteira',
        position: 'Pagina interior meio',
        audience_reach: 45000,
        suggested_price: 3500,
        status: 'Contrato',
        logo: 'https://img.usecurling.com/i?q=atelier&color=multicolor',
        description:
          'Atelier BH e referencia em moda alfaiataria e pecas sob medida no mercado atacadista brasileiro. Com mais de 10 anos de experiencia, a marca oferece qualidade premium e atendimento personalizado para varejistas em todo o pais.',
        contact_info: 'contato@atelierbh.com.br - (31) 3333-4444',
        link: '/',
        catalog_link: 'https://revistamodaatual.com.br/catalogo/atelier-bh',
        testimonial:
          'A parceria com a Revista MODA ATUAL elevou nossa marca a um novo patamar de visibilidade. O retorno em vendas e credibilidade superou todas as expectativas.',
        testimonial_author: 'Mariana Costa, CEO do Atelier BH',
        edition_title: editionTitle,
      },
      'Parceiro: Atelier BH | Revista MODA ATUAL',
      'Conheca o Atelier BH, parceiro e anunciante da Revista MODA ATUAL com mais de 10 anos de experiencia.',
      'atelier bh, parceiro, anunciante, alfaiataria, moda atacadista',
    )

    upsertPage(
      'grupo2-test-galeria',
      'galeria_produtos',
      {
        title: 'Produtos em Destaque — V MODA BRASIL',
        products:
          products.length > 0
            ? products.slice(0, 6).map(function (p) {
                return {
                  name: p.getString('name'),
                  image: '',
                  description: (p.getString('description') || '').slice(0, 80),
                  price: 'R$ ' + p.getFloat('price').toFixed(2).replace('.', ','),
                  link: p.getString('link') || '/',
                }
              })
            : [
                {
                  name: 'Vestido Floral Verao',
                  image: img(300, 300, 'floral%20summer%20dress'),
                  description: 'Vestido leve com estampa tropical',
                  price: 'R$ 129,90',
                  link: '/',
                },
                {
                  name: 'Blazer Alfaiataria Premium',
                  image: img(300, 300, 'premium%20blazer'),
                  description: 'Blazer estruturado em tecido premium',
                  price: 'R$ 259,90',
                  link: '/',
                },
                {
                  name: 'Calca Wide Leg Fluida',
                  image: img(300, 300, 'wide%20leg%20trousers'),
                  description: 'Calca de cintura alta com fluidez',
                  price: 'R$ 179,90',
                  link: '/',
                },
                {
                  name: 'Bolsa Couro Natural',
                  image: img(300, 300, 'leather%20bag'),
                  description: 'Bolsa estruturada em couro legítimo',
                  price: 'R$ 349,90',
                  link: '/',
                },
              ],
        edition_title: editionTitle,
      },
      'Galeria de Produtos V MODA BRASIL | Revista MODA ATUAL',
      'Produtos em destaque do marketplace V MODA BRASIL com precos e descricoes.',
      'galeria, produtos, marketplace, v moda brasil, moda',
    )

    upsertPage(
      'grupo2-test-materia',
      'materia_cta',
      {
        title: 'O Futuro do Varejo de Moda no Brasil',
        subtitle: 'Como a digitalizacao e o social commerce estao redefinindo o varejo nacional',
        body: 'O varejo de moda brasileiro passa por uma transformacao sem precedentes. A digitalizacao acelerada, o crescimento do social commerce e a busca por experiencias personalizadas estao redefinindo as regras do jogo.\n\nPara as marcas atacadistas, este e o momento de investir em estrategias que combinam tradicao e inovacao. O marketing de moda nao e mais apenas sobre produtos - e sobre narrativas, conexoes emocionais e proposicao de valor clara.\n\nA Revista MODA ATUAL, com sua plataforma V MODA BRASIL, esta na vanguarda dessa transformacao, conectando marcas, varejistas e consumidoras em um ecossistema digital integrado que potencializa negocios e fortalece relacionamentos.',
        images: [img(400, 300, 'fashion%20retail%20store'), img(400, 300, 'boutique%20interior')],
        credits: 'Equipe Revista MODA ATUAL',
        cta_label: 'Conheca V MODA BRASIL',
        cta_link: '/',
        edition_title: editionTitle,
      },
      'O Futuro do Varejo de Moda no Brasil | Revista MODA ATUAL',
      'Como a digitalizacao e o social commerce estao transformando o varejo de moda brasileiro.',
      'varejo moda, social commerce, digitalizacao, marketplace, v moda brasil',
    )

    upsertPage(
      'grupo2-test-comparativo',
      'comparativo_ab',
      {
        title: 'Minimalista vs Maximalista: Qual e o seu Estilo?',
        option_a: {
          title: 'Estilo Minimalista',
          description:
            'Pecas atemporais em tons neutros com cortes limpos e elegancia discreta. Ideal para quem busca versatilidade e sofisticacao.',
          image: img(400, 400, 'minimalist%20fashion%20outfit'),
          price: 'A partir de R$ 89,90',
          link: '/',
          metrics: { impressions: 5200, clicks: 780, orders: 42, conversion_rate: 0.81 },
        },
        option_b: {
          title: 'Estilo Maximalista',
          description:
            'Cores vibrantes, estampas ousadas e mistura de texturas. Para quem nao tem medo de ousar e destacar-se na multidao.',
          image: img(400, 400, 'maximalist%20fashion%20colorful'),
          price: 'A partir de R$ 129,90',
          link: '/',
          metrics: { impressions: 4800, clicks: 920, orders: 58, conversion_rate: 1.21 },
        },
        deciding_factors: [
          'Custo-beneficio: minimalista oferece maior versatilidade por peca',
          'Impacto visual: maximalista gera mais engajamento nas redes sociais',
          'Conversao: maximalista converte 49% mais que minimalista',
          'Tendencia: ambas as esteticas sao tendencias fortes para 2026',
        ],
        cta_label: 'Ver Opcoes',
        cta_link: '/',
        edition_title: editionTitle,
      },
      'Minimalista vs Maximalista | Revista MODA ATUAL',
      'Comparativo de estilos: minimalista vs maximalista. Qual tendencia combina mais com voce?',
      'comparativo, minimalista, maximalista, tendencias, estilo',
    )

    upsertPage(
      'grupo2-test-story',
      'story_social',
      {
        subject: 'Tendencias Verao 2026',
        hook: 'Voce viu essa tendencia?',
        image: img(1080, 1920, 'fashion%20story%20vertical'),
        caption:
          'As estampas florais sao a maior tendencia do verao 2026! Inspire-se nas nossas sugestoes e arrase nesta estacao. Salve este post e compartilhe com aquela amiga que ama moda!',
        cta_label: 'Ver Mais Tendencias',
        link: '/',
        edition_title: editionTitle,
      },
      'Story: Tendencias Verao 2026 | Revista MODA ATUAL',
      'Conteudo social sobre as tendencias de moda para o verao 2026.',
      'story, social, tendencias, verao 2026, estampas florais',
    )

    upsertPage(
      'grupo2-test-newsletter',
      'newsletter_preview',
      {
        title: 'Edicao Especial: Tendencias Verao 2026',
        subject: 'Edicao Especial: Tendencias Verao 2026',
        preheader: 'Descubra as cores e estilos que vao dominar a estacao',
        content:
          'Ola, leitora!\n\nNesta edicao especial, trazemos as principais tendencias de moda para o verao 2026. Das estampas florais ao retro futurismo, voce vai conferir tudo o que vai bombar nesta estacao.\n\nAlem disso, apresentamos nosso Top 60 Marcas Brasileiras e um perfil exclusivo da Lumina Festas. Nao perca!\n\nBoa leitura,\nEquipe Revista MODA ATUAL',
        sections: [
          {
            title: 'Tendencias Verao 2026',
            summary: 'As cores, estampas e estilos que vao dominar a estacao',
          },
          {
            title: 'Top 60 Marcas',
            summary: 'Ranking das marcas mais influentes da moda brasileira',
          },
          {
            title: 'Perfil: Lumina Festas',
            summary: 'Conheca a marca que esta transformando o mercado de moda festa',
          },
        ],
        cta_label: 'Ler Edicao Completa',
        cta_link: '/',
        edition_title: editionTitle,
      },
      'Newsletter: Edicao Especial Verao 2026 | Revista MODA ATUAL',
      'Preview da newsletter com as tendencias de moda para o verao 2026.',
      'newsletter, preview, verao 2026, tendencias, revista moda atual',
    )
  },
  (app) => {
    var slugs = [
      'grupo2-test-anuncio',
      'grupo2-test-perfil-marca',
      'grupo2-test-parceiro',
      'grupo2-test-galeria',
      'grupo2-test-materia',
      'grupo2-test-comparativo',
      'grupo2-test-story',
      'grupo2-test-newsletter',
    ]
    for (var i = 0; i < slugs.length; i++) {
      try {
        var rec = app.findFirstRecordByData('edition_pages', 'slug', slugs[i])
        app.delete(rec)
      } catch (_) {}
    }
    try {
      var edition = app.findFirstRecordByData(
        'editions',
        'title',
        'Edicao Teste — Grupo 2 Monetizacao',
      )
      app.delete(edition)
    } catch (_) {}
  },
)
