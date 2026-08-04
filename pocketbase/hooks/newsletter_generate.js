routerAdd(
  'POST',
  '/backend/v1/newsletter',
  (e) => {
    var body = e.requestInfo().body || {}

    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var weekStart = (body.week_start || '').trim()
    var editionId = (body.edition_id || '').trim()
    var segments = ['varejo', 'atacado', 'consumidora']
    if (Array.isArray(body.segments) && body.segments.length > 0) {
      segments = body.segments
    }

    if (weekStart) {
      var testDate = new Date(weekStart)
      if (isNaN(testDate.getTime())) {
        return e.badRequestError('Data inválida', {
          week_start: 'Formato de data inválido. Use ISO 8601 (YYYY-MM-DD).',
        })
      }
    }

    // --- Fetch edition data when edition_id is provided ---
    var targetEdition = null
    var editionPages = []

    if (editionId) {
      try {
        targetEdition = $app.findRecordById('editions', editionId)
      } catch (_) {
        return e.badRequestError('Edição inválida', {
          edition_id: 'Edição não encontrada.',
        })
      }

      try {
        editionPages = $app.findRecordsByFilter(
          'edition_pages',
          'edition = "' + editionId + '"',
          'page_number',
          0,
          0,
        )
      } catch (_) {
        editionPages = []
      }
    }

    // --- Determine week range for weekly mode ---
    var monday, sunday
    if (weekStart) {
      monday = new Date(weekStart + 'T00:00:00.000Z')
    } else {
      var now = new Date()
      var dayOfWeek = now.getUTCDay()
      var diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      monday = new Date(now)
      monday.setUTCDate(now.getUTCDate() + diff)
      monday.setUTCHours(0, 0, 0, 0)
    }
    sunday = new Date(monday)
    sunday.setUTCDate(monday.getUTCDate() + 6)
    sunday.setUTCHours(23, 59, 59, 999)

    var mondayStr = monday.toISOString()
    var sundayStr = sunday.toISOString()
    var weekRangeStr =
      monday.toISOString().split('T')[0] + ' a ' + sunday.toISOString().split('T')[0]

    // --- Fetch weekly editions when no edition_id ---
    var weeklyEditions = []
    var latestEdition = null

    if (!editionId) {
      try {
        weeklyEditions = $app.findRecordsByFilter(
          'editions',
          'created >= "' + mondayStr + '" && created <= "' + sundayStr + '"',
          '-created',
          0,
          0,
        )
      } catch (_) {}

      // Fetch most recent published edition for enrichment
      try {
        var allEditions = $app.findRecordsByFilter('editions', '', '-created', 1, 0)
        if (allEditions.length > 0) {
          latestEdition = allEditions[0]
        }
      } catch (_) {}

      if (weeklyEditions.length === 0 && !latestEdition) {
        return e.json(404, {
          message:
            'Nenhuma edição encontrada para a semana de ' +
            weekRangeStr +
            '. Informe um edition_id ou ajuste a data.',
        })
      }
    }

    // --- Build editorial context for AI ---
    var editionsForContext = editionId && targetEdition ? [targetEdition] : weeklyEditions
    var enrichmentEdition = targetEdition || latestEdition

    var pautasText = ''
    var linkInfo = ''
    var pagesContext = ''
    var productContext = ''

    for (var i = 0; i < editionsForContext.length; i++) {
      var ed = editionsForContext[i]
      var edTitle = ed.getString('title')
      var edDesc = ed.getString('description')
      pautasText += i + 1 + '. ' + edTitle + (edDesc ? ' — ' + edDesc : '') + '\n'
      linkInfo += 'Pauta ' + (i + 1) + ' (' + edTitle + '): /edition/' + ed.id + '\n'
    }

    // Build page blocks context
    var pagesForContent = []
    if (editionId && editionPages.length > 0) {
      for (var pi = 0; pi < editionPages.length; pi++) {
        var page = editionPages[pi]
        var pageTitle =
          page.getString('toc_title') || 'Página ' + (page.getInt('page_number') || pi + 1)
        var pageTemplate = page.getString('template') || 'default'
        var pageSlug = page.getString('slug') || ''
        var pageImage = page.getString('image_url') || ''
        var pageNumber = page.getInt('page_number') || pi + 1

        // Fetch hotspots for this page
        var hotspots = []
        try {
          hotspots = $app.findRecordsByFilter('page_hotspots', 'page = "' + page.id + '"', '', 0, 0)
        } catch (_) {}

        var productCallouts = []
        for (var hi = 0; hi < hotspots.length; hi++) {
          var hotspot = hotspots[hi]
          var productId = hotspot.getString('product')
          var hsTitle = hotspot.getString('title')
          var hsPrice = hotspot.getString('price')
          var hsLink = hotspot.getString('link')

          if (productId) {
            try {
              var product = $app.findRecordById('marketplace_products', productId)
              productCallouts.push({
                name: product.getString('name'),
                price: product.getFloat('price') || 0,
                link: hsLink || '/offers',
                vendor: product.getString('vendor'),
              })
            } catch (_) {
              if (hsTitle) {
                productCallouts.push({
                  name: hsTitle,
                  price: hsPrice || '',
                  link: hsLink || '',
                  vendor: '',
                })
              }
            }
          } else if (hsTitle) {
            productCallouts.push({
              name: hsTitle,
              price: hsPrice || '',
              link: hsLink || '',
              vendor: '',
            })
          }
        }

        pagesForContent.push({
          title: pageTitle,
          template: pageTemplate,
          slug: pageSlug,
          image_url: pageImage,
          page_number: pageNumber,
          products: productCallouts,
        })

        pagesContext +=
          'Página ' + pageNumber + ': ' + pageTitle + ' (template: ' + pageTemplate + ')\n'
        if (productCallouts.length > 0) {
          for (var pci = 0; pci < productCallouts.length; pci++) {
            pagesContext +=
              '  Produto: ' +
              productCallouts[pci].name +
              ' — R$ ' +
              productCallouts[pci].price +
              '\n'
          }
        }
      }
    }

    var enrichmentInfo = ''
    if (enrichmentEdition) {
      enrichmentInfo =
        'Edição mais recente para enriquecer: ' + enrichmentEdition.getString('title')
      if (enrichmentEdition.getString('description')) {
        enrichmentInfo += ' — ' + enrichmentEdition.getString('description')
      }
      enrichmentInfo += '\n'
    }

    try {
      var aiPrompt =
        'Você é o editor-chefe da Revista MODA ATUAL, uma revista de moda digital brasileira.\n' +
        'Gere o conteúdo de uma newsletter editorial em português brasileiro, com tom sofisticado e acessível.\n\n'

      if (editionId && targetEdition) {
        aiPrompt +=
          'EDIÇÃO SELECIONADA: ' +
          targetEdition.getString('title') +
          '\n' +
          'Descrição: ' +
          (targetEdition.getString('description') || '') +
          '\n' +
          'Slug: ' +
          (targetEdition.getString('slug') || '') +
          '\n\n' +
          'PÁGINAS DA EDIÇÃO:\n' +
          pagesContext +
          '\n'
      } else {
        aiPrompt +=
          'Pautas da semana (' +
          weekRangeStr +
          '):\n' +
          pautasText +
          '\n' +
          'Links das pautas:\n' +
          linkInfo +
          '\n' +
          enrichmentInfo +
          '\n'
      }

      aiPrompt +=
        '\nResponda APENAS com um JSON válido (sem markdown, sem comentários, sem texto antes ou depois) no formato:\n' +
        '{"subject": "linha de assunto cativante (máx 60 caracteres)", "preheader": "texto de pré-visualização curto (máx 100 caracteres)", "content": {"header": {"title": "título da edição", "description": "descrição da edição"}, "intro": "parágrafo de introdução da newsletter", "sections": [{"title": "título da página/pauta", "summary": "resumo curto em 1-2 frases", "link": "/edition/ID_DA_EDICAO", "products": [{"name": "nome do produto", "price": "preço", "link": "link do produto"}]}], "cta": "chamada para ação final"}}\n' +
        'Cada página/pauta deve ter exatamente uma seção correspondente no array "sections". Quando houver produtos curados, inclua-os no array "products" da seção correspondente.'

      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um editor de newsletter da Revista MODA ATUAL. Responda apenas com JSON válido, sem markdown ou texto adicional.',
          },
          { role: 'user', content: aiPrompt },
        ],
      })

      var rawContent = reply.choices[0].message.content.trim()

      if (rawContent.indexOf('```') !== -1) {
        rawContent = rawContent
          .replace(/^```(?:json)?\n?/, '')
          .replace(/\n?```$/, '')
          .trim()
      }

      var jsonStart = rawContent.indexOf('{')
      var jsonEnd = rawContent.lastIndexOf('}')
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        rawContent = rawContent.substring(jsonStart, jsonEnd + 1)
      }

      var parsed
      try {
        parsed = JSON.parse(rawContent)
      } catch (_) {
        return e.json(502, {
          message: 'Falha ao processar a resposta da IA. Tente novamente.',
        })
      }

      // Validate and normalize content structure
      if (!parsed.subject || !parsed.preheader || !parsed.content) {
        return e.json(502, {
          message: 'A resposta da IA não contém todos os campos necessários.',
        })
      }

      // Ensure content has the block structure
      if (!parsed.content.header) {
        var headerTitle = targetEdition
          ? targetEdition.getString('title')
          : enrichmentEdition
            ? enrichmentEdition.getString('title')
            : 'Revista MODA ATUAL'
        var headerDesc = targetEdition
          ? targetEdition.getString('description') || ''
          : enrichmentEdition
            ? enrichmentEdition.getString('description') || ''
            : ''
        parsed.content.header = { title: headerTitle, description: headerDesc }
      }

      if (!parsed.content.intro) {
        parsed.content.intro = parsed.content.opening || ''
      }

      if (!Array.isArray(parsed.content.sections)) {
        parsed.content.sections = []
      }

      // Enrich sections with page data if available
      if (pagesForContent.length > 0) {
        for (var si = 0; si < parsed.content.sections.length && si < pagesForContent.length; si++) {
          if (
            !parsed.content.sections[si].products ||
            parsed.content.sections[si].products.length === 0
          ) {
            if (pagesForContent[si].products.length > 0) {
              parsed.content.sections[si].products = pagesForContent[si].products
            }
          }
        }
      }

      if (!parsed.content.cta) {
        parsed.content.cta = 'Leia a edição completa na Revista MODA ATUAL.'
      }

      var col = $app.findCollectionByNameOrId('newsletter_campaigns')
      var record = new Record(col)
      record.set('title', 'Newsletter da semana — ' + weekRangeStr)
      record.set('subject', parsed.subject)
      record.set('preheader', parsed.preheader)
      record.set('content', parsed.content)
      record.set('segments', segments)
      record.set('status', 'rascunho')
      record.set('audience_size', 0)
      record.set('opened_count', 0)
      record.set('open_rate', 0)
      record.set('click_count', 0)
      record.set('click_rate', 0)
      record.set('unsubscribe_count', 0)

      if (editionId) {
        record.set('edition', editionId)
      } else if (enrichmentEdition) {
        record.set('edition', enrichmentEdition.id)
      }

      $app.save(record)

      return e.json(200, {
        id: record.id,
        title: record.getString('title'),
        subject: record.getString('subject'),
        preheader: record.getString('preheader'),
        content: record.get('content'),
        segments: record.get('segments'),
        status: record.getString('status'),
        edition: record.getString('edition'),
        audience_size: record.getInt('audience_size'),
        created: record.getString('created'),
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { message: 'IA temporariamente indisponível' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { message: 'Falha ao gerar newsletter. Tente novamente.' })
      }
      return e.json(500, { message: 'Erro inesperado ao gerar newsletter' })
    }
  },
  $apis.requireAuth(),
)
