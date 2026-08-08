migrate(
  (app) => {
    var editionsCol = app.findCollectionByNameOrId('editions')
    var editionId = ''
    var editionTitle = 'Edicao Teste — Grupo 3 Conversao'

    try {
      var existing = app.findFirstRecordByData('editions', 'title', editionTitle)
      editionId = existing.id
    } catch (_) {
      var edition = new Record(editionsCol)
      edition.set('title', editionTitle)
      edition.set(
        'description',
        'Edicao de teste para validacao dos templates do Grupo 3 — Conversao, refinados com padrao de designer senior.',
      )
      edition.set('slug', 'edicao-teste-grupo3')
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

    var galleryProducts =
      products.length > 0
        ? products.slice(0, 6).map(function (p) {
            return {
              name: p.getString('name'),
              image: img(300, 300, encodeURIComponent(p.getString('category') || 'fashion')),
              description: (p.getString('description') || '').slice(0, 80),
              price: 'R$ ' + p.getFloat('price').toFixed(2).replace('.', ','),
              link: p.getString('link') || '/',
            }
          })
        : [
            {
              name: 'Vestido Midi Floral',
              image: img(300, 300, 'floral%20midi%20dress'),
              description: 'Vestido midi com estampa floral em viscolinho',
              price: 'R$ 89,90',
              link: '/',
            },
            {
              name: 'Blazer Alfaiataria Premium',
              image: img(300, 300, 'premium%20blazer'),
              description: 'Blazer estruturado com forracao interna',
              price: 'R$ 199,90',
              link: '/',
            },
            {
              name: 'Calça Jeans Skinny',
              image: img(300, 300, 'skinny%20jeans'),
              description: 'Calca jeans skinny com elastano premium',
              price: 'R$ 129,90',
              link: '/',
            },
            {
              name: 'Bolsa Couro Legitimo',
              image: img(300, 300, 'leather%20bag'),
              description: 'Bolsa estruturada em couro legitimo',
              price: 'R$ 249,90',
              link: '/',
            },
            {
              name: 'Legging Fitness High Waist',
              image: img(300, 300, 'fitness%20leggings'),
              description: 'Legging com cintura alta e compressao',
              price: 'R$ 79,90',
              link: '/',
            },
            {
              name: 'Cardigan Trico La',
              image: img(300, 300, 'knit%20cardigan'),
              description: 'Cardigan em trico de la merino',
              price: 'R$ 119,90',
              link: '/',
            },
          ]

    upsertPage(
      'grupo3-test-galeria',
      'galeria_produtos',
      {
        title: 'Essenciais de Verao 2026',
        subtitle: 'Selecao curada de pecas indispensaveis para a estacao mais quente do ano',
        products: galleryProducts,
        edition_title: editionTitle,
      },
      'Essenciais de Verao 2026 | Galeria de Produtos | Revista MODA ATUAL',
      'Selecao curada dos produtos indispensaveis para o verao 2026 no marketplace V MODA BRASIL.',
      'galeria, produtos, verao 2026, essentials, moda, v moda brasil',
    )

    upsertPage(
      'grupo3-test-materia',
      'materia_cta',
      {
        title: 'O Renascimento da Alfaiataria Feminina',
        subtitle:
          'Como a alfaiataria deixou de ser exclusividade do masculino e conquistou o guarda-roupa feminino',
        body: 'A alfaiataria feminina vive um momento de renaissance sem precedentes. O que antes era restrito ao universo masculino e a ambientes corporativos agora domina passarelas, redes sociais e o cotidiano de mulheres que buscam elegancia sem abrir mao do conforto.\n\nBlazers estruturados, calcas de cintura alta e coletes tailored compoem um guarda-roupa versatil que transita do escritorio ao after party com naturalidade. A chave dessa versatilidade esta na qualidade dos tecidos e na precisao dos cortes — atributos que marcas brasileiras como Vertice e Atelier BH ja dominam.\n\nPara o verao 2026, a aposta sao tecidos fluidos como linho e crepe, que mantem a estrutura visual sem sacrificar o conforto termico. As cores neutras continuam fortes, mas tons como terracota e verde oliva ganham espaco como alternativas sofisticadas.\n\nO marketplace V MODA BRASIL reune as melhores marcas de alfaiataria do pais em um so lugar, facilitando o acesso de varejistas e consumidoras a pecas de qualidade premium.',
        images: [
          img(400, 300, 'tailoring%20fashion%20woman'),
          img(400, 300, 'blazer%20style%20woman'),
        ],
        credits: 'Equipe Revista MODA ATUAL',
        cta_headline: 'Explore a colecao completa de alfaiataria',
        cta_label: 'Conheca V MODA BRASIL',
        cta_link: '/',
        cta_variant: 'A',
        edition_title: editionTitle,
      },
      'O Renascimento da Alfaiataria Feminina | Revista MODA ATUAL',
      'Como a alfaiataria feminina conquistou o guarda-roupa contemporaneo com tecidos fluidos e cortes precisos.',
      'alfaiataria feminina, blazer, moda executiva, verao 2026, v moda brasil',
    )

    upsertPage(
      'grupo3-test-comparativo',
      'comparativo_ab',
      {
        title: 'Estampas: Floral vs Geometrico',
        option_a: {
          title: 'Estampa Floral',
          description:
            'Classica e romantica, a estampa floral e curinga do verao. Versatil e atemporal, combina com diversos estilos.',
          image: img(400, 400, 'floral%20print%20dress'),
          price: 'A partir de R$ 89,90',
          pros: [
            'Atemporal — nunca sai de moda',
            'Versatil — do casual ao elegante',
            'Combina com todos os tons de pele',
            'Transmite feminilidade e leveza',
          ],
          cons: [
            'Pode parecer dated em padroes muito especificos',
            'Exige cuidado na combinacao de acessorios',
          ],
          metrics: { impressions: 5200, clicks: 780, orders: 42, conversion_rate: 0.81 },
        },
        option_b: {
          title: 'Estampa Geometrica',
          description:
            'Moderna e ousada, a estampa geometrica traz contemporaneidade. Ideal para quem busca um look statement.',
          image: img(400, 400, 'geometric%20print%20fashion'),
          price: 'A partir de R$ 129,90',
          pros: [
            'Visual moderno e arrojado',
            'Valoriza silhuetas estruturadas',
            'Tendencia forte para 2026',
            'Gera alto impacto nas redes sociais',
          ],
          cons: [
            'Menos versatil que o floral',
            'Pode encurtar a validade do look',
            'Preco medio mais elevado',
          ],
          metrics: { impressions: 4800, clicks: 920, orders: 58, conversion_rate: 1.21 },
        },
        comparison_points: [
          'Custo-beneficio: floral oferece maior versatilidade por peca',
          'Impacto visual: geometrico gera 49% mais engajamento social',
          'Conversao: geometrico converte 49% mais que floral',
          'Tendencia: ambas sao apostas fortes para verao 2026',
        ],
        recommendation:
          'Para varejistas que buscam volume de vendas, a estampa geometrica e a aposta recomendada: converte 49% mais e gera maior engajamento nas redes sociais. Para colecoes atemporais com rotatividade garantida, o floral continua sendo a escolha segura.',
        cta_label: 'Ver Opcoes no Marketplace',
        cta_link: '/',
        edition_title: editionTitle,
      },
      'Estampas: Floral vs Geometrico | Comparativo | Revista MODA ATUAL',
      'Comparativo de estampas para verao 2026: floral vs geometrico. Qual tendencia converte mais?',
      'comparativo, estampas, floral, geometrico, tendencias, verao 2026',
    )
  },
  (app) => {
    var slugs = ['grupo3-test-galeria', 'grupo3-test-materia', 'grupo3-test-comparativo']
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
        'Edicao Teste — Grupo 3 Conversao',
      )
      app.delete(edition)
    } catch (_) {}
  },
)
