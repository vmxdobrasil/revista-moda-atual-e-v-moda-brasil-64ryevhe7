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

    var editions = []
    try {
      if (editionId) {
        var singleEdition = $app.findRecordById('editions', editionId)
        editions = [singleEdition]
      } else {
        editions = $app.findRecordsByFilter(
          'editions',
          'created >= "' + mondayStr + '" && created <= "' + sundayStr + '"',
          '-created',
          0,
          0,
        )
      }
    } catch (_) {}

    if (editions.length === 0) {
      return e.json(404, {
        message:
          'Nenhuma edição encontrada para a semana de ' +
          weekRangeStr +
          '. Informe um edition_id ou ajuste a data.',
      })
    }

    var pautasText = ''
    var linkInfo = ''
    for (var i = 0; i < editions.length; i++) {
      var ed = editions[i]
      var edTitle = ed.getString('title')
      var edDesc = ed.getString('description')
      pautasText += i + 1 + '. ' + edTitle + (edDesc ? ' — ' + edDesc : '') + '\n'
      linkInfo += 'Pauta ' + (i + 1) + ' (' + edTitle + '): /edition/' + ed.id + '\n'
    }

    try {
      var aiPrompt =
        'Você é o editor-chefe da Revista MODA ATUAL, uma revista de moda digital brasileira.\n' +
        'Gere o conteúdo de uma newsletter editorial em português brasileiro, com tom sofisticado e acessível.\n\n' +
        'Pautas da semana (' +
        weekRangeStr +
        '):\n' +
        pautasText +
        '\nLinks das pautas:\n' +
        linkInfo +
        '\nResponda APENAS com um JSON válido (sem markdown, sem comentários, sem texto antes ou depois) no formato:\n' +
        '{"subject": "linha de assunto cativante (máx 60 caracteres)", "preheader": "texto de pré-visualização curto (máx 100 caracteres)", "content": {"opening": "parágrafo de abertura da newsletter", "sections": [{"title": "título da pauta", "summary": "resumo curto da pauta em 1-2 frases", "link": "/edition/ID_DA_EDICAO"}], "cta": "chamada para ação final"}}\n' +
        'Cada pauta acima deve ter exatamente uma seção correspondente no array "sections", usando o link correto fornecido.'

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

      if (
        !parsed.subject ||
        !parsed.preheader ||
        !parsed.content ||
        !parsed.content.opening ||
        !parsed.content.cta ||
        !Array.isArray(parsed.content.sections)
      ) {
        return e.json(502, {
          message: 'A resposta da IA não contém todos os campos necessários.',
        })
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
