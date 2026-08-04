routerAdd(
  'POST',
  '/backend/v1/palavras-chave',
  (e) => {
    var body = e.requestInfo().body || {}
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var tema = (body.tema || '').trim()
    if (!tema) {
      return e.badRequestError('Informe o tema (tema) para sugerir palavras-chave')
    }

    function loadPrompt(slug) {
      var rec = $app.findFirstRecordByData('prompt_library', 'slug', slug)
      return rec.getString('prompt_content')
    }

    var promptTemplate
    try {
      promptTemplate = loadPrompt('palavras-chave')
    } catch (_) {
      promptTemplate =
        'Sugira 15 palavras-chave para o tema: [TEMA]. Retorne JSON com keyword, estimated_volume, difficulty, intent, related.'
    }

    var prompt = promptTemplate.replace(/\[TEMA\]/g, tema)

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um analista de SEO para revista de moda brasileira. Responda APENAS com JSON válido.',
          },
          { role: 'user', content: prompt },
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

      var parsed
      try {
        parsed = JSON.parse(jsonStr)
      } catch (parseErr) {
        parsed = {
          keywords: [
            {
              keyword: tema,
              estimated_volume: 'médio',
              difficulty: 50,
              intent: 'informacional',
              related: [],
            },
          ],
        }
      }

      try {
        var alCol = $app.findCollectionByNameOrId('audit_logs')
        var alRec = new Record(alCol)
        alRec.set('integration_name', 'palavras_chave')
        alRec.set('integration_type', 'route')
        alRec.set('status', 'success')
        alRec.set('executed_at', new Date().toISOString())
        $app.save(alRec)
      } catch (_) {}

      return e.json(200, parsed)
    } catch (err) {
      var msg = err && err.message ? err.message : 'Erro desconhecido'
      if (err instanceof SkipAiConfigError) msg = 'IA não configurada'
      else if (err instanceof SkipAiError) msg = 'Erro de IA: ' + (err.message || '')

      return e.json(500, { error: msg })
    }
  },
  $apis.requireAuth(),
)
