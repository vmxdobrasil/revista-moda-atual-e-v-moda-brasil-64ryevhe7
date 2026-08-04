routerAdd(
  'POST',
  '/backend/v1/thumbnail',
  (e) => {
    var body = e.requestInfo().body || {}
    var theme = (body.theme || '').trim()
    if (!theme) return e.badRequestError('Tema e obrigatorio')
    var format = body.format || 'Reels'

    var dimensionDesc =
      format === 'Reels'
        ? 'Reels: 1080x1920 vertical, bold text overlay in top third, high contrast, max 5 words on screen.'
        : 'YouTube: 1280x720 horizontal, expressive title, clear and large text, max 6 words.'

    var systemPrompt = [
      'You are the Cover & Editorial Art Director for Revista MODA ATUAL DIGITAL.',
      'Generate a thumbnail composition optimized for ' + format + '.',
      'Follow the Design System: primary orange #ea580c.',
      dimensionDesc,
      'Return ONLY valid JSON (no markdown, no code fences) with this exact structure:',
      '{"palette":{"name":"","colors":[]},"typography":{"title":"","body":"","accent":""},"hierarchy":"","alt_text":"","variants":[{"name":"","description":"","palette":[]}],"stock_image_query":"","layout":""}',
      'Provide exactly 2 A/B variants.',
      'stock_image_query must be 2-3 English keywords for stock image search.',
      'Language: Brazilian Portuguese for content, English for technical terms.',
    ].join('\n')

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'TEMA: ' + theme + '\nFORMATO: ' + format },
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
        return e.json(500, { error: 'Falha ao processar composicao do thumbnail.' })
      }

      try {
        var alCol = $app.findCollectionByNameOrId('audit_logs')
        var alRec = new Record(alCol)
        alRec.set('integration_name', 'thumbnail')
        alRec.set('integration_type', 'route')
        alRec.set('status', 'success')
        alRec.set('executed_at', new Date().toISOString())
        alRec.set('agent_name', 'cover/art-director')
        $app.save(alRec)
      } catch (_) {}

      return e.json(200, composition)
    } catch (err) {
      try {
        var alColE = $app.findCollectionByNameOrId('audit_logs')
        var alRecE = new Record(alColE)
        alRecE.set('integration_name', 'thumbnail')
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
      return e.json(500, { error: 'Erro inesperado ao gerar thumbnail' })
    }
  },
  $apis.requireAuth(),
)
