migrate(
  (app) => {
    var editionsCol = app.findCollectionByNameOrId('editions')
    var editionId = ''
    var editionTitle = 'Edicao Teste — Grupo 4 Reuso Social'

    try {
      var existing = app.findFirstRecordByData('editions', 'title', editionTitle)
      editionId = existing.id
    } catch (_) {
      var edition = new Record(editionsCol)
      edition.set('title', editionTitle)
      edition.set(
        'description',
        'Edicao de teste para validacao dos templates do Grupo 4 — Reuso Social, refinados com padrao de designer senior.',
      )
      edition.set('slug', 'edicao-teste-grupo4')
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

    var img = function (w, h, q) {
      return 'https://img.usecurling.com/p/' + w + '/' + h + '?q=' + q
    }

    var newsletterCampaign = null
    try {
      var campaigns = app.findRecordsByFilter('newsletter_campaigns', '', '-created', 1, 0)
      if (campaigns.length > 0) newsletterCampaign = campaigns[0]
    } catch (_) {}

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
      'grupo4-test-story',
      'story_social',
      {
        subject: 'Alfaiataria Feminina: A Tendencia Que Domina 2026',
        hook: 'Voce ja conhece essa tendencia?',
        image: img(1080, 1920, 'fashion%20story%20tailoring'),
        caption:
          'A alfaiataria feminina vive um renascimento sem precedentes. Blazers estruturados, calcas de cintura alta e coletes tailored compoem um guarda-roupa versatil que transita do escritorio ao after party com naturalidade. A chave esta na qualidade dos tecidos e na precisao dos cortes. Descubra as melhores marcas no marketplace V MODA BRASIL.',
        cta_label: 'Ver Tendencias',
        link: '/',
        cta_variant: 'A',
        options: ['Blazer Alfaiataria Premium', 'Calca Wide Leg Fluida', 'Colete Tailored'],
        edition_title: editionTitle,
      },
      'Story: Alfaiataria Feminina 2026 | Revista MODA ATUAL',
      'Conteudo social sobre a tendencia de alfaiataria feminina para 2026.',
      'story, social, alfaiataria, feminina, tendencia, 2026',
    )

    var nlData = {
      title: 'Edicao Especial: Tendencias Inverno 2026',
      subject: 'As tendencias que vai dominar a estacao mais fria do ano',
      preheader: 'Descubra as cores, estampas e estilos do inverno 2026',
      content:
        'Ola, leitora! Nesta edicao especial, trazemos as principais tendencias de moda para o inverno 2026. Dos tons terrosos ao streetwear sofisticado, voce vai conferir tudo o que vai bombar nesta estacao.',
      sections: [
        {
          title: 'Tendencias Inverno 2026',
          summary: 'Cores terrosas, estampas geometricas e streetwear sofisticado',
        },
        {
          title: 'Top 60 Marcas',
          summary: 'Ranking das marcas mais influentes da moda brasileira',
        },
        {
          title: 'Perfil: Lumina Festas',
          summary: 'A marca que esta transformando o mercado de moda festa',
        },
      ],
      cta_label: 'Ler Edicao Completa',
      cta_link: '/',
      cta_variant: 'B',
      edition_title: editionTitle,
    }

    if (newsletterCampaign) {
      nlData.campaign_id = newsletterCampaign.id
      nlData.title = newsletterCampaign.getString('title') || nlData.title
      nlData.subject = newsletterCampaign.getString('subject') || nlData.subject
      nlData.preheader = newsletterCampaign.getString('preheader') || nlData.preheader
    }

    upsertPage(
      'grupo4-test-newsletter',
      'newsletter_preview',
      nlData,
      'Newsletter: Tendencias Inverno 2026 | Revista MODA ATUAL',
      'Preview da newsletter com as tendencias de moda para o inverno 2026.',
      'newsletter, preview, inverno 2026, tendencias, revista moda atual',
    )

    upsertPage(
      'grupo4-test-capa',
      'capa_edicao',
      {
        cover_image: img(800, 1200, 'fashion%20magazine%20cover'),
        cover_alt_text: 'Capa da Edicao Teste Grupo 4 — modelo vestindo alfaiataria feminina',
        title: 'Edicao #43 — Inverno 2026',
        subtitle: 'O Renascimento da Alfaiataria',
        highlights: [
          'Tendencias Inverno 2026',
          'Top 60 Marcas Brasileiras',
          'Perfil: Lumina Festas',
          'Fashion Editorial Exclusivo',
        ],
        cta_label: 'Ler Agora',
        link: '/',
        edition_title: editionTitle,
      },
      'Capa: Edicao #43 Inverno 2026 | Revista MODA ATUAL',
      'Capa da edicao Inverno 2026 da Revista MODA ATUAL com alfaiataria feminina.',
      'capa, edicao, inverno 2026, alfaiataria, revista moda atual',
    )

    upsertPage(
      'grupo4-test-editorial',
      'fashion_editorial',
      {
        title: 'Nova Era: O Poder do Tailoring',
        toc_title: 'Editorial — Nova Era',
        intro:
          'Uma celebracao do poder da alfaiataria feminina contemporanea, onde tradicao e ousadia se encontram.',
        images: [
          img(600, 800, 'fashion%20editorial%20blazer'),
          img(600, 800, 'fashion%20editorial%20suit'),
          img(600, 800, 'fashion%20editorial%20model'),
          img(600, 800, 'fashion%20editorial%20tailoring'),
        ],
        body: 'A alfaiataria feminina transcendeu seu papel corporativo para se tornar uma declaracao de poder e elegancia. Em 2026, vemos uma reinterpretacao ousada dessa tradicao, com tecidos fluidos como linho e crepe mantendo a estrutura visual sem sacrificar o conforto termico.\n\nBlazers oversize, coletes estruturados e calcas de cintura alta compoem silhuetas que celebram a feminilidade sem abrir mao da forca. As cores neutras continuam fortes, mas tons como terracota, verde oliva e burgundy ganham espaco como alternativas sofisticadas.\n\nO marketplace V MODA BRASIL reune as melhores marcas de alfaiataria do pais, facilitando o acesso de varejistas e consumidoras a pecas de qualidade premium que traduzem essa nova era do tailoring feminino.',
        credits: 'Fotografia por Studio MODA ATUAL — Estilismo por Fabia Mendonca',
        edition_title: editionTitle,
      },
      'Editorial: Nova Era — O Poder do Tailoring | Revista MODA ATUAL',
      'Fashion editorial sobre o renascimento da alfaiataria feminina em 2026.',
      'editorial, fashion, tailoring, alfaiataria, verao 2026, v moda brasil',
    )
  },
  (app) => {
    var slugs = [
      'grupo4-test-story',
      'grupo4-test-newsletter',
      'grupo4-test-capa',
      'grupo4-test-editorial',
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
        'Edicao Teste — Grupo 4 Reuso Social',
      )
      app.delete(edition)
    } catch (_) {}
  },
)
