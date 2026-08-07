migrate(
  (app) => {
    let editions
    try {
      editions = app.findRecordsByFilter('editions', '', 'created', 1, 0)
    } catch (_) {
      return
    }
    if (!editions || editions.length === 0) return

    const edition = editions[0]
    const editionId = edition.id
    const editionTitle = edition.getString('title')

    try {
      const existing = app.findRecordsByFilter(
        'edition_pages',
        'edition = "' + editionId + '" && template = "coluna_marketing_moda"',
        '',
        1,
        0,
      )
      if (existing.length > 0) return
    } catch (_) {}

    let maxPage = 0
    try {
      const pages = app.findRecordsByFilter(
        'edition_pages',
        'edition = "' + editionId + '"',
        '-page_number',
        1,
        0,
      )
      if (pages.length > 0) maxPage = pages[0].getInt('page_number')
    } catch (_) {}

    const col = app.findCollectionByNameOrId('edition_pages')

    var marketingPage = new Record(col)
    marketingPage.set('edition', editionId)
    marketingPage.set('page_number', maxPage + 1)
    marketingPage.set('template', 'coluna_marketing_moda')
    marketingPage.set('template_data', {
      title: 'O Futuro do Marketing de Moda no Brasil',
      subtitle: 'Estrategias digitais que estao transformando o varejo atacadista',
      author: 'Valter Mendonca',
      author_bio:
        'CEO da Revista MODA ATUAL. Especialista em marketing, digital marketing, branding e gestao de private cards e sistemas de beneficios.',
      date: 'Janeiro 2026',
      body: 'O mercado de moda brasileiro passa por uma transformacao sem precedentes. A digitalizacao do varejo, o crescimento do social commerce e a busca por experiencias personalizadas estao redefinindo as regras do jogo.\n\nPara as marcas atacadistas, este e o momento de investir em estrategias que combinam tradicao e inovacao. O marketing de moda nao e mais apenas sobre produtos - e sobre narrativas, conexoes emocionais e proposicao de valor clara.\n\nA Revista MODA ATUAL, com sua plataforma V MODA BRASIL, esta na vanguarda dessa transformacao, conectando marcas, varejistas e consumidoras em um ecossistema digital integrado.',
      insights: [
        'A personalizacao e a chave para a fidelizacao no varejo de moda',
        'Private labels crescem 30% ao ano no atacado brasileiro',
        'O social commerce e o canal de maior crescimento para moda',
        'Dados de comportamento sao o novo ouro do marketing de moda',
      ],
      practical_actions: [
        'Invista em um programa de fidelidade com private cards',
        'Crie conteudo autentico e direcionado nas redes sociais',
        'Use dados de comportamento para personalizar ofertas',
        'Desenvolva parcerias estrategicas com influenciadores de nicho',
      ],
      cta_label: 'Conheca V MODA BRASIL',
      cta_link: '/',
      edition_title: editionTitle,
    })
    app.save(marketingPage)

    var holofotePage = new Record(col)
    holofotePage.set('edition', editionId)
    holofotePage.set('page_number', maxPage + 2)
    holofotePage.set('template', 'coluna_holofote_evoluida')
    holofotePage.set('template_data', {
      title: 'Ana Beltrao: A Forca Feminina na Moda',
      person_name: 'Ana Beltrao',
      person_role: 'Estilista e Empresaria',
      date: 'Janeiro 2026',
      body: 'Ana Beltrao e uma das vozes mais influentes da moda brasileira. Com mais de 15 anos de experiencia, ela construiu um imperio a partir de sua visao unica de estilo e empreendedorismo.\n\nSua jornada comecou em um pequeno atelier em Belo Horizonte e hoje sua marca esta presente em 12 estados brasileiros. Ana acredita que a moda e uma ferramenta de empoderamento e transformacao social.',
      highlights: [
        'Fundou sua marca em 2015 com apenas 3 pecas',
        'Faturamento cresceu 200% em 2025',
        'Presente em 12 estados brasileiros',
        'Parceria com V MODA BRASIL para expansao nacional',
      ],
      interaction_cta_label: 'Conheca a marca',
      interaction_cta_link: '/',
      edition_title: editionTitle,
    })
    app.save(holofotePage)
  },
  (app) => {
    let editions
    try {
      editions = app.findRecordsByFilter('editions', '', 'created', 1, 0)
    } catch (_) {
      return
    }
    if (!editions || editions.length === 0) return
    var editionId = editions[0].id

    var templates = ['coluna_marketing_moda', 'coluna_holofote_evoluida']
    for (var i = 0; i < templates.length; i++) {
      try {
        var pages = app.findRecordsByFilter(
          'edition_pages',
          'edition = "' + editionId + '" && template = "' + templates[i] + '"',
          '',
          0,
          0,
        )
        for (var j = 0; j < pages.length; j++) {
          app.delete(pages[j])
        }
      } catch (_) {}
    }
  },
)
