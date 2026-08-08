migrate(
  (app) => {
    let editions
    try {
      editions = app.findRecordsByFilter('editions', '', 'created', 1, 0)
    } catch (_) {
      return
    }
    if (!editions || editions.length === 0) return

    var edition = editions[0]
    var editionId = edition.id
    var editionTitle = edition.getString('title')

    function pageExists(slug) {
      try {
        app.findFirstRecordByData('edition_pages', 'slug', slug)
        return true
      } catch (_) {
        return false
      }
    }

    var maxPage = 0
    try {
      var existingPages = app.findRecordsByFilter(
        'edition_pages',
        'edition = "' + editionId + '"',
        '-page_number',
        1,
        0,
      )
      if (existingPages.length > 0) maxPage = existingPages[0].getInt('page_number')
    } catch (_) {}

    var products = []
    try {
      products = app.findRecordsByFilter('marketplace_products', '', 'created', 10, 0)
    } catch (_) {}

    if (products.length === 0) {
      var prodCol = app.findCollectionByNameOrId('marketplace_products')
      var sampleProducts = [
        {
          name: 'Vestido Floral Verao',
          price: 129.9,
          category: 'Vestidos',
          vendor: 'Lumina Festas',
          featured: true,
        },
        {
          name: 'Blazer Alfaiataria Premium',
          price: 259.9,
          category: 'Blazers',
          vendor: 'Atelier BH',
          featured: true,
        },
        {
          name: 'Camiseta Algodao Pima',
          price: 89.9,
          category: 'Camisetas',
          vendor: 'Moda Sul',
          featured: false,
        },
        {
          name: 'Calca Wide Leg Fluida',
          price: 179.9,
          category: 'Calcas',
          vendor: 'Lumina Festas',
          featured: true,
        },
        {
          name: 'Bolsa Couro Natural',
          price: 349.9,
          category: 'Acessorios',
          vendor: 'Atelier BH',
          featured: false,
        },
      ]
      for (var pi = 0; pi < sampleProducts.length; pi++) {
        var p = sampleProducts[pi]
        var prec = new Record(prodCol)
        prec.set('name', p.name)
        prec.set('price', p.price)
        prec.set('currency', 'BRL')
        prec.set('category', p.category)
        prec.set('vendor', p.vendor)
        prec.set('featured', p.featured)
        prec.set('link', '/')
        app.save(prec)
      }
    }

    var categoryId = ''
    try {
      var cats = app.findRecordsByFilter('top60_categories', '', 'order', 1, 0)
      if (cats.length > 0) categoryId = cats[0].id
    } catch (_) {}

    var pageNum = maxPage
    var col = app.findCollectionByNameOrId('edition_pages')

    function img(w, h, q) {
      return 'https://img.usecurling.com/p/' + w + '/' + h + '?q=' + q
    }

    function createPage(slug, template, templateData, seoTitle, seoDesc, keywords) {
      if (pageExists(slug)) return null
      pageNum++
      var page = new Record(col)
      page.set('edition', editionId)
      page.set('page_number', pageNum)
      page.set('template', template)
      page.set('slug', slug)
      page.set('seo_title', seoTitle)
      page.set('seo_description', seoDesc)
      page.set('keywords', keywords)
      page.set('canonical_url', '')
      page.set('template_data', templateData)
      app.save(page)
      return page
    }

    createPage(
      'exemplo-lookbook',
      'lookbook',
      {
        title: 'Tendencias Verao 2026',
        season: 'Verao 2026',
        description:
          'As principais tendencias de moda praia e verao para a estacao mais quente do ano.',
        looks: [
          {
            image: img(400, 500, 'summer%20dress%20floral'),
            description: 'Vestido floral leve com estampa tropical',
            price: 'R$ 129,90',
          },
          {
            image: img(400, 500, 'beach%20fashion%20outfit'),
            description: 'Conjunto praia com estampa geometrica',
            price: 'R$ 189,90',
          },
          {
            image: img(400, 500, 'summer%20fashion%20woman'),
            description: 'Macacao floral para dias quentes',
            price: 'R$ 159,90',
          },
          {
            image: img(400, 500, 'fashion%20sandals%20summer'),
            description: 'Sandalia rasteira com pedrarias',
            price: 'R$ 89,90',
          },
        ],
        images: [],
        link: '/',
        edition_title: editionTitle,
      },
      'Lookbook Verao 2026 | Revista MODA ATUAL',
      'Confira as principais tendencias de moda para o verao 2026: estampas tropicais, cores vibrantes e pecas leves.',
      'lookbook, verao 2026, tendencias moda, moda praia, estampas tropicais',
    )

    createPage(
      'exemplo-indice',
      'indice',
      {
        sections: [
          { title: 'Carta do Editor', link: '' },
          { title: 'Tendencias Verao 2026', link: '' },
          { title: 'Trend Report: Futuro da Moda', link: '' },
          { title: 'Top 60 Marcas Brasileiras', link: '' },
          { title: 'Perfil: Lumina Festas', link: '' },
          { title: 'Parceiro: Atelier BH', link: '' },
          { title: 'Galeria de Produtos', link: '' },
          { title: 'Materia: O Futuro do Varejo', link: '' },
          { title: 'Comparativo: Minimalista vs Maximalista', link: '' },
          { title: 'Story Social', link: '' },
          { title: 'Newsletter Preview', link: '' },
          { title: 'Fashion Editorial', link: '' },
          { title: 'Coluna Holofote', link: '' },
          { title: 'Coluna Marketing de Moda', link: '' },
        ],
      },
      'Sumario da Edicao | Revista MODA ATUAL',
      'Indice completo da edicao com todas as secoes e conteudos.',
      'sumario, indice, edicao, revista moda atual, conteudo',
    )

    createPage(
      'exemplo-trend-report',
      'trend_report',
      {
        title: 'Trend Report: O Futuro da Moda Brasileira',
        author: 'Equipe Revista MODA ATUAL',
        date: 'Janeiro 2026',
        trends: [
          {
            headline: 'Moda Sustentavel em Alta',
            description:
              'Tecidos reciclados e producao etica dominam o mercado nacional, com crescimento de 35% ao ano.',
            image: img(200, 200, 'sustainable%20fashion'),
          },
          {
            headline: 'Retro Futurismo',
            description:
              'Estetica dos anos 2000 retorna com toque contemporaneo, misturando nostalgia e inovacao.',
            image: img(200, 200, 'retro%20y2k%20fashion'),
          },
          {
            headline: 'Cores Vibrantes',
            description:
              'Laranja, magenta e verde limao sao as cores da estacao, trazendo energia as colecoes.',
            image: img(200, 200, 'colorful%20fashion%20trend'),
          },
          {
            headline: 'Social Commerce',
            description:
              'Vendas direto das redes sociais crescem 45% no atacado brasileiro de moda.',
            image: img(200, 200, 'social%20media%20shopping'),
          },
        ],
      },
      'Trend Report 2026: Tendencias da Moda Brasileira | Revista MODA ATUAL',
      'Analise das principais tendencias de moda para 2026: sustentabilidade, retro futurismo, cores vibrantes e social commerce.',
      'trend report, tendencias 2026, moda sustentavel, social commerce, moda brasileira',
    )

    createPage(
      'exemplo-anuncio-patrocinado',
      'anuncio_patrocinado',
      {
        advertiser: 'Lumina Festas',
        image: img(800, 400, 'fashion%20brand%20advertisement'),
        headline: 'Colecao Verao 2026: Estilo que Inspira',
        description:
          'A Lumina Festas apresenta sua nova colecao inspirada nas tendencias globais. Pecas exclusivas que combinam elegancia e conforto, perfeitas para todas as ocasioes. Descubra o que ha de mais atual na moda brasileira.',
        link: '/',
      },
      'Lumina Festas: Colecao Verao 2026 | Anuncio Patrocinado',
      'Conheca a nova colecao Verao 2026 da Lumina Festas. Estilo, elegancia e tendencias globais.',
      'lumina festas, colecao verao 2026, anuncio patrocinado, moda festa',
    )

    createPage(
      'exemplo-top60-marcas',
      'top60_marcas',
      {
        category: categoryId,
      },
      'Top 60 Marcas Brasileiras de Moda | Revista MODA ATUAL',
      'Ranking das 60 marcas mais influentes da moda brasileira por categoria.',
      'top 60, marcas, ranking, moda brasileira, fashion brands',
    )

    createPage(
      'exemplo-perfil-marca',
      'perfil_marca',
      {
        brand_name: 'Lumina Festas',
        logo: 'https://img.usecurling.com/i?q=lumina&color=orange',
        description:
          'Lumina Festas e uma marca brasileira especializada em moda festa e alfaiataria feminina. Fundada em 2015, a marca combina tecidos premium com design contemporaneo, atendendo varejistas e consumidoras finais em todo o Brasil.',
        website: 'https://luminafestas.com.br',
        social_handle: '@luminafestas',
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
      },
      'Perfil: Lumina Festas | Revista MODA ATUAL',
      'Conheca a Lumina Festas, marca brasileira de moda festa e alfaiataria feminina.',
      'lumina festas, perfil de marca, moda festa, alfaiataria feminina',
    )

    createPage(
      'exemplo-parceiro-anunciante',
      'parceiro_anunciante',
      {
        partner_name: 'Atelier BH',
        logo: 'https://img.usecurling.com/i?q=atelier&color=multicolor',
        description:
          'Atelier BH e referencia em moda alfaiataria e pecas sob medida no mercado atacadista brasileiro. Com mais de 10 anos de experiencia, a marca oferece qualidade premium e atendimento personalizado para varejistas em todo o pais.',
        contact_info: 'contato@atelierbh.com.br - (31) 3333-4444',
        link: '/',
        testimonial:
          'A parceria com a Revista MODA ATUAL elevou nossa marca a um novo patamar de visibilidade. O retorno em vendas e credibilidade superou todas as expectativas.',
        testimonial_author: 'Mariana Costa, CEO do Atelier BH',
      },
      'Parceiro: Atelier BH | Revista MODA ATUAL',
      'Conheca o Atelier BH, parceiro e anunciante da Revista MODA ATUAL.',
      'atelier bh, parceiro, anunciante, alfaiataria, moda atacadista',
    )

    createPage(
      'exemplo-galeria-produtos',
      'galeria_produtos',
      {
        products: [
          {
            name: 'Vestido Floral Verao',
            image: img(300, 300, 'floral%20summer%20dress'),
            description: 'Vestido leve com estampa tropical ideal para dias quentes',
            link: '/',
          },
          {
            name: 'Blazer Alfaiataria Premium',
            image: img(300, 300, 'premium%20blazer'),
            description: 'Blazer estruturado em tecido premium com caimento perfeito',
            link: '/',
          },
          {
            name: 'Camiseta Algodao Pima',
            image: img(300, 300, 'cotton%20tshirt'),
            description: 'Camiseta em algodao pima com toque macio e durabilidade',
            link: '/',
          },
          {
            name: 'Calca Wide Leg Fluida',
            image: img(300, 300, 'wide%20leg%20trousers'),
            description: 'Calca de cintura alta com fluidez e conforto',
            link: '/',
          },
        ],
      },
      'Galeria de Produtos V MODA BRASIL | Revista MODA ATUAL',
      'Produtos em destaque do marketplace V MODA BRASIL.',
      'galeria, produtos, marketplace, v moda brasil, moda',
    )

    createPage(
      'exemplo-materia-cta',
      'materia_cta',
      {
        title: 'O Futuro do Varejo de Moda no Brasil',
        body: 'O varejo de moda brasileiro passa por uma transformacao sem precedentes. A digitalizacao acelerada, o crescimento do social commerce e a busca por experiencias personalizadas estao redefinindo as regras do jogo.\n\nPara as marcas atacadistas, este e o momento de investir em estrategias que combinam tradicao e inovacao. O marketing de moda nao e mais apenas sobre produtos - e sobre narrativas, conexoes emocionais e proposicao de valor clara.\n\nA Revista MODA ATUAL, com sua plataforma V MODA BRASIL, esta na vanguarda dessa transformacao, conectando marcas, varejistas e consumidoras em um ecossistema digital integrado que potencializa negocios e fortalece relacionamentos.',
        images: [img(400, 300, 'fashion%20retail%20store'), img(400, 300, 'boutique%20interior')],
        cta_label: 'Conheca V MODA BRASIL',
        cta_link: '/',
      },
      'O Futuro do Varejo de Moda no Brasil | Revista MODA ATUAL',
      'Como a digitalizacao e o social commerce estao transformando o varejo de moda brasileiro.',
      'varejo moda, social commerce, digitalizacao, marketplace, v moda brasil',
    )

    createPage(
      'exemplo-comparativo-ab',
      'comparativo_ab',
      {
        option_a: {
          title: 'Estilo Minimalista',
          description:
            'Pecas atemporais em tons neutros com cortes limpos e elegancia discreta. Ideal para quem busca versatilidade e sofisticacao.',
          image: img(400, 400, 'minimalist%20fashion%20outfit'),
          link: '/',
        },
        option_b: {
          title: 'Estilo Maximalista',
          description:
            'Cores vibrantes, estampas ousadas e mistura de texturas. Para quem nao tem medo de ousar e destacar-se na multidao.',
          image: img(400, 400, 'maximalist%20fashion%20colorful'),
          link: '/',
        },
      },
      'Minimalista vs Maximalista: Qual e o seu Estilo? | Revista MODA ATUAL',
      'Comparativo de estilos: minimalista vs maximalista. Qual tendencia combina mais com voce?',
      'comparativo, minimalista, maximalista, tendencias, estilo',
    )

    createPage(
      'exemplo-story-social',
      'story_social',
      {
        hook: 'Voce viu essa tendencia?',
        image: img(1080, 1920, 'fashion%20story%20vertical'),
        caption:
          'As estampas florais sao a maior tendencia do verao 2026! Inspire-se nas nossas sugestoes e arrase nesta estacao. Salve este post e compartilhe com aquela amiga que ama moda!',
        link: '/',
      },
      'Story: Tendencias Verao 2026 | Revista MODA ATUAL',
      'Conteudo social sobre as tendencias de moda para o verao 2026.',
      'story, social, tendencias, verao 2026, estampas florais',
    )

    createPage(
      'exemplo-newsletter-preview',
      'newsletter_preview',
      {
        subject: 'Edicao Especial: Tendencias Verao 2026',
        preheader: 'Descubra as cores e estilos que vao dominar a estacao',
        content:
          'Ola, leitora!\n\nNesta edicao especial, trazemos as principais tendencias de moda para o verao 2026. Das estampas florais ao retro futurismo, voce vai conferir tudo o que vai bombar nesta estacao.\n\nAlem disso, apresentamos nosso Top 60 Marcas Brasileiras e um perfil exclusivo da Lumina Festas. Nao perca!\n\nBoa leitura,\nEquipe Revista MODA ATUAL',
        cta_link: '/',
      },
      'Newsletter: Edicao Especial Verao 2026 | Revista MODA ATUAL',
      'Preview da newsletter com as tendencias de moda para o verao 2026.',
      'newsletter, preview, verao 2026, tendencias, revista moda atual',
    )

    createPage(
      'exemplo-capa-edicao',
      'capa_edicao',
      {
        cover_image: img(800, 1200, 'fashion%20magazine%20cover%20woman'),
        title: editionTitle || 'Edicao Especial',
        subtitle: 'Edicao Especial Verao 2026',
        link: '/',
      },
      'Capa: Edicao Especial Verao 2026 | Revista MODA ATUAL',
      'Capa da edicao especial verao 2026 da Revista MODA ATUAL.',
      'capa, edicao, verao 2026, revista moda atual, fashion magazine',
    )

    var editorialPage = createPage(
      'exemplo-fashion-editorial',
      'fashion_editorial',
      {
        title: 'Nova Era: A Moda Brasileira em Foco',
        intro:
          'Um editorial que celebra a diversidade e criatividade da moda nacional, destacando novas perspectivas e talentos emergentes.',
        images: [
          img(600, 800, 'fashion%20editorial%20model%20orange'),
          img(600, 800, 'fashion%20editorial%20elegant'),
          img(600, 800, 'fashion%20editorial%20creative'),
          img(600, 800, 'fashion%20editorial%20bold'),
        ],
        body: 'A moda brasileira vive um momento de efervescencia criativa. Estilistas emergentes ganham espaco internacional, enquanto marcas tradicionais se reinventam para atender um consumidor cada vez mais exigente e consciente.\n\nNeste editorial, celebramos a diversidade que define a moda nacional - das influencias tropicais as referencias urbanas, do artesanal ao tecnologico. Cada peca conta uma historia, cada look expressa uma identidade.\n\nA Revista MODA ATUAL e o palco onde essa nova era se manifesta, conectando criadores, marcas e consumidoras em um ecossistema vibrante de moda e estilo.',
      },
      'Fashion Editorial: Nova Era | Revista MODA ATUAL',
      'Editorial de moda celebrando a diversidade e criatividade da moda brasileira.',
      'fashion editorial, moda brasileira, diversidade, criatividade, tendencias',
    )

    if (editorialPage) {
      try {
        var hotspotCol = app.findCollectionByNameOrId('page_hotspots')
        var hotspotData = [
          {
            x: 25,
            y: 40,
            title: 'Vestido Editorial',
            description: 'Peca exclusiva do editorial',
            price: 'R$ 299,90',
            link: '/',
          },
          {
            x: 70,
            y: 60,
            title: 'Acessorio em Destaque',
            description: 'Bolsa de couro artesanal',
            price: 'R$ 349,90',
            link: '/',
          },
        ]
        for (var hi = 0; hi < hotspotData.length; hi++) {
          var hd = hotspotData[hi]
          var hotspot = new Record(hotspotCol)
          hotspot.set('page', editorialPage.id)
          hotspot.set('x', hd.x)
          hotspot.set('y', hd.y)
          hotspot.set('title', hd.title)
          hotspot.set('description', hd.description)
          hotspot.set('price', hd.price)
          hotspot.set('link', hd.link)
          hotspot.set('link_origin', 'revista')
          app.save(hotspot)
        }
      } catch (_) {}
    }
  },
  (app) => {
    var slugs = [
      'exemplo-lookbook',
      'exemplo-indice',
      'exemplo-trend-report',
      'exemplo-anuncio-patrocinado',
      'exemplo-top60-marcas',
      'exemplo-perfil-marca',
      'exemplo-parceiro-anunciante',
      'exemplo-galeria-produtos',
      'exemplo-materia-cta',
      'exemplo-comparativo-ab',
      'exemplo-story-social',
      'exemplo-newsletter-preview',
      'exemplo-capa-edicao',
      'exemplo-fashion-editorial',
    ]
    for (var i = 0; i < slugs.length; i++) {
      try {
        var rec = app.findFirstRecordByData('edition_pages', 'slug', slugs[i])
        try {
          var hotspots = app.findRecordsByFilter(
            'page_hotspots',
            'page = "' + rec.id + '"',
            '',
            0,
            0,
          )
          for (var j = 0; j < hotspots.length; j++) {
            app.delete(hotspots[j])
          }
        } catch (_) {}
        app.delete(rec)
      } catch (_) {}
    }
  },
)
