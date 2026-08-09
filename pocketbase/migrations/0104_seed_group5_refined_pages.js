migrate(
  (app) => {
    var editionsCol = app.findCollectionByNameOrId('editions')
    var editionId = ''
    var editionTitle = 'Edicao Teste — Grupo 5 Colunas Autorais'

    try {
      var existing = app.findFirstRecordByData('editions', 'title', editionTitle)
      editionId = existing.id
    } catch (_) {
      var edition = new Record(editionsCol)
      edition.set('title', editionTitle)
      edition.set(
        'description',
        'Edicao de teste para validacao dos templates do Grupo 5 — Colunas Autorais, refinados com padrao de designer senior.',
      )
      edition.set('slug', 'edicao-teste-grupo5')
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
      'grupo5-test-holofote',
      'coluna_holofote_evolvida',
      {
        title: 'Holofote da Semana: Ana Beltrao',
        person_name: 'Ana Beltrao',
        person_role: 'Estilista e Empresaria',
        person_photo: img(300, 300, 'fashion%20designer%20woman'),
        date: 'Janeiro 2026',
        body: 'Ana Beltrao transformou o panorama da moda brasileira com sua visao unica e ousadia criativa. Sua jornada comeca em Belo Horizonte e hoje seus desfiles sao presenca garantida nas principais semanas de moda do pais.\n\nCom mais de 15 anos de carreira, Ana construiu um imperio que alia tradicao e inovacao. Suas pecas sao sinonimo de elegancia atemporal, sempre com um toque contemporaneo que fascina criticos e consumidores.\n\nA parceria com a Revista MODA ATUAL marca uma nova fase, onde sua expertise em tendencias se encontra com nossa plataforma digital, levando conhecimento e inspiracao para milhares de profissionais do setor.',
        highlights: [
          'Fundou sua marca em 2011 com apenas 5 pecas',
          'Faturamento cresceu 180% em 2025',
          'Presente em 8 estados brasileiros',
          'Premio Brasileiro de Moda 2025 — Categoria Alfaiataria',
          'Parceria estrategica com V MODA BRASIL',
        ],
        interaction_cta_label: 'Conhecer Trabalho',
        interaction_cta_link: '/',
        edition_title: editionTitle,
      },
      'Holofote: Ana Beltrao | Revista MODA ATUAL',
      'Conheca a trajetoria de Ana Beltrao, estilista que transformou a moda brasileira com elegancia e inovacao.',
      'holofote, ana beltrao, estilista, moda brasileira, coluna social',
    )

    upsertPage(
      'grupo5-test-marketing',
      'coluna_marketing_moda',
      {
        title: 'Visao Estrategica: O Poder do Branding na Moda',
        subtitle:
          'Como construir uma marca que transcende produtos e cria conexoes emocionais duradouras',
        author: 'Valter Mendonca',
        author_photo: img(300, 300, 'businessman%20ceo%20portrait'),
        author_bio:
          'CEO da Revista MODA ATUAL. Especialista em marketing, digital marketing, branding e gestao de private cards e sistemas de beneficios.',
        date: 'Janeiro 2026',
        body: 'No cenario atual da moda brasileira, o branding deixou de ser um diferencial para se tornar uma questao de sobrevivencia. Marcas que nao investem em identidade e narrativa sao rapidamente engolidas pela commodity.\n\nO consumo de moda mudou. Nao basta ter um bom produto — e preciso ter uma historia que conecte. O consumidor de hoje compra significado, nao apenas peca. E e aqui que o branding se torna a ferramenta mais poderosa do arsenal de marketing.\n\nNa Revista MODA ATUAL, vemos diariamente como marcas com branding forte superam concorrentes com produtos tecnicamente equivalentes. A diferenca esta na percepcão de valor — e a percepcão se constroi com consistencia, autenticidade e coragem.\n\nO marketplace V MODA BRASIL nasceu para potencializar essa conexao, oferecendo um palco onde marcas com historia podem brilhar e alcancar novos mercados.',
        insights: [
          'Branding forte aumenta o ticket medio em ate 40%',
          'Marcas com narrativa clara retentam 60% mais clientes',
          'Consistencia visual aumenta reconhecimento em 80%',
          'O consumidor de moda valoriza autenticidade acima de preco',
        ],
        practical_actions: [
          'Defina 3 pilares de marca e use-os em toda comunicacao',
          'Invista em fotografia profissional — e o seu cartao de visitas',
          'Crie um guia de estilo visual e mantenha consistencia',
          'Use o marketplace V MODA BRASIL como vitrine da sua marca',
        ],
        cta_label: 'Conheca V MODA BRASIL',
        cta_link: '/',
        edition_title: editionTitle,
      },
      'Visao Estrategica: Branding na Moda | Revista MODA ATUAL',
      'Como o branding transforma marcas de moda e cria conexoes emocionais duradouras com consumidores.',
      'branding, marketing de moda, visao estrategica, v moda brasil, valter mendonca',
    )
  },
  (app) => {
    var slugs = ['grupo5-test-holofote', 'grupo5-test-marketing']
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
        'Edicao Teste — Grupo 5 Colunas Autorais',
      )
      app.delete(edition)
    } catch (_) {}
  },
)
