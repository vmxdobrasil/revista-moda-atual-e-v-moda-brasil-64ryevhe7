migrate(
  (app) => {
    function updatePage(slug, updates) {
      try {
        var page = app.findFirstRecordByData('edition_pages', 'slug', slug)
      } catch (_) {
        return
      }
      var td = page.get('template_data')
      if (typeof td === 'string') {
        try {
          td = JSON.parse(td)
        } catch (_) {
          td = {}
        }
      }
      if (!td || typeof td !== 'object') td = {}
      for (var key in updates) {
        td[key] = updates[key]
      }
      page.set('template_data', td)
      app.save(page)
    }

    updatePage('exemplo-lookbook', {
      description:
        'As principais tendencias de moda praia e verao para a estacao mais quente do ano, com pecas exclusivas do marketplace V MODA BRASIL.',
      edition_title: 'Edicao #42 - Verao 2026',
    })

    updatePage('exemplo-indice', {
      edition_title: 'Edicao #42 - Verao 2026',
    })

    updatePage('exemplo-trend-report', {
      executive_summary:
        'O mercado de moda brasileiro caminha para um 2026 de transformacoes: sustentabilidade, social commerce e retro futurismo definem o tom. Marcas que investirem em narrativas autenticas e canais digitais integrados terao vantagem competitiva significativa.',
      market_data: [
        { label: 'Moda Sustentavel', value: 35, unit: '%', trend: 'up' },
        { label: 'Social Commerce', value: 45, unit: '%', trend: 'up' },
        { label: 'Retro Futurismo', value: 28, unit: '%', trend: 'up' },
        { label: 'Cores Vibrantes', value: 52, unit: '%', trend: 'up' },
        { label: 'E-commerce Moda', value: 67, unit: '%', trend: 'up' },
      ],
      recommendations: [
        'Invista em colecoes com tecidos reciclados e producao etica',
        'Crie estrategias de social commerce com influenciadores de nicho',
        'Incorpore estetica Y2K com toque contemporaneo nas colecoes',
        'Use cores vibrantes (laranja, magenta, verde limao) como diferencial',
      ],
      edition_title: 'Edicao #42 - Verao 2026',
    })
  },
  (app) => {
    var slugs = ['exemplo-lookbook', 'exemplo-indice', 'exemplo-trend-report']
    for (var i = 0; i < slugs.length; i++) {
      try {
        var page = app.findFirstRecordByData('edition_pages', 'slug', slugs[i])
        var td = page.get('template_data')
        if (typeof td === 'string') {
          try {
            td = JSON.parse(td)
          } catch (_) {
            continue
          }
        }
        if (!td) continue
        delete td.executive_summary
        delete td.market_data
        delete td.recommendations
        page.set('template_data', td)
        app.save(page)
      } catch (_) {}
    }
  },
)
