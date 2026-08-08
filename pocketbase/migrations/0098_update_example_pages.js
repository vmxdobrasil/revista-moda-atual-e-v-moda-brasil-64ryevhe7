migrate(
  (app) => {
    function updatePage(slug, additions) {
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
      for (var key in additions) {
        if (
          additions[key] &&
          typeof additions[key] === 'object' &&
          !Array.isArray(additions[key])
        ) {
          td[key] = Object.assign({}, td[key] || {}, additions[key])
        } else {
          td[key] = additions[key]
        }
      }
      page.set('template_data', td)
      app.save(page)
    }

    updatePage('exemplo-anuncio-patrocinado', {
      catalog_link: 'https://revistamodaatual.com.br/catalogo/lumina-festas',
    })

    updatePage('exemplo-perfil-marca', {
      catalog_link: 'https://revistamodaatual.com.br/catalogo/lumina-festas',
    })

    updatePage('exemplo-parceiro-anunciante', {
      catalog_link: 'https://revistamodaatual.com.br/catalogo/atelier-bh',
    })

    updatePage('exemplo-materia-cta', {
      subtitle: 'Como a digitalizacao e o social commerce estao redefinindo o varejo nacional',
      credits: 'Equipe Revista MODA ATUAL',
    })

    updatePage('exemplo-comparativo-ab', {
      option_a: {
        metrics: { impressions: 5200, clicks: 780, orders: 42, conversion_rate: 0.81 },
      },
      option_b: {
        metrics: { impressions: 4800, clicks: 920, orders: 58, conversion_rate: 1.21 },
      },
    })
  },
  (app) => {
    var slugs = [
      'exemplo-anuncio-patrocinado',
      'exemplo-perfil-marca',
      'exemplo-parceiro-anunciante',
      'exemplo-materia-cta',
      'exemplo-comparativo-ab',
    ]
    var removals = {
      'exemplo-anuncio-patrocinado': ['catalog_link'],
      'exemplo-perfil-marca': ['catalog_link'],
      'exemplo-parceiro-anunciante': ['catalog_link'],
      'exemplo-materia-cta': ['subtitle', 'credits'],
      'exemplo-comparativo-ab': [],
    }
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
        var fields = removals[slugs[i]] || []
        for (var j = 0; j < fields.length; j++) {
          delete td[fields[j]]
        }
        if (slugs[i] === 'exemplo-comparativo-ab') {
          if (td.option_a) delete td.option_a.metrics
          if (td.option_b) delete td.option_b.metrics
        }
        page.set('template_data', td)
        app.save(page)
      } catch (_) {}
    }
  },
)
