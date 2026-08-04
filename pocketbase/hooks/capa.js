routerAdd(
  'POST',
  '/backend/v1/capa',
  (e) => {
    var body = e.requestInfo().body || {}
    var theme = (body.theme || '').trim()
    if (!theme) return e.badRequestError('Tema e obrigatorio')
    var editionId = body.editionId || ''

    var systemPrompt = [
      'You are the Cover & Editorial Art Director for Revista MODA ATUAL DIGITAL.',
      'Generate a complete cover composition for the given theme.',
      'Follow the Design System: primary orange #ea580c, serif typography for editorial titles.',
      'Cover dimensions: 800x1124px (portrait, 0.7118 aspect ratio).',
      'Return ONLY valid JSON (no markdown, no code fences) with this exact structure:',
      '{"palette":{"name":"","colors":[]},"typography":{"title":"","body":"","accent":""},"hierarchy":"","alt_text":"","variants":[{"name":"","description":"","palette":[],"template":""}],"stock_image_query":"","layout":""}',
      'Provide exactly 2 A/B variants. Use template values from: default, editorial, marketing, holofote, entrevista.',
      'stock_image_query must be 2-3 English keywords for stock image search.',
      'Language: Brazilian Portuguese for content, English for technical terms.',
    ].join('\n')

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'TEMA: ' + theme },
        ],
      })

      var rawContent = reply.choices[0].message.content
      var jsonStr = rawContent
      var fenceMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (fenceMatch) {
        jsonStr = fenceMatch[1].trim()
      } else {
        var braceMatch = rawContent.match(/\{[\s\S]*\}/)
        if (braceMatch) jsonStr = braceMatch[0]
      }

      var composition
      try {
        composition = JSON.parse(jsonStr)
      } catch (_) {
        return e.json(500, { error: 'Falha ao processar composicao da capa.' })
      }

      if (editionId) {
        try {
          var record = $app.findRecordById('editions', editionId)
          record.set('cover_alt_text', composition.alt_text || '')
          record.set('cover_variants', composition.variants || [])

          if (composition.stock_image_query) {
            try {
              var imgUrl =
                'https://img.usecurling.com/p/800/1124?q=' +
                encodeURIComponent(composition.stock_image_query) +
                '&color=orange'
              var file = $filesystem.fileFromURL(imgUrl, 15)
              record.set('cover_image', file)
            } catch (_) {}
          }

          $app.save(record)
        } catch (_) {}
      }

      try {
        var alCol = $app.findCollectionByNameOrId('audit_logs')
        var alRec = new Record(alCol)
        alRec.set('integration_name', 'capa')
        alRec.set('integration_type', 'route')
        alRec.set('status', 'success')
        alRec.set('executed_at', new Date().toISOString())
        alRec.set('agent_name', 'cover/art-director')
        if (editionId) alRec.set('workflow_id', editionId)
        $app.save(alRec)
      } catch (_) {}

      return e.json(200, composition)
    } catch (err) {
      try {
        var alColE = $app.findCollectionByNameOrId('audit_logs')
        var alRecE = new Record(alColE)
        alRecE.set('integration_name', 'capa')
        alRecE.set('integration_type', 'route')
        alRecE.set('status', 'error')
        alRecE.set('executed_at', new Date().toISOString())
        alRecE.set('agent_name', 'cover/art-director')
        alRecE.set('error_message', (err && err.message) || 'unknown error')
        $app.save(alRecE)
      } catch (_) {}

      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'IA temporariamente indisponivel' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { error: 'Erro ao comunicar com IA' })
      }
      return e.json(500, { error: 'Erro inesperado ao gerar capa' })
    }
  },
  $apis.requireAuth(),
)
