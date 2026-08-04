routerAdd(
  'POST',
  '/backend/v1/tono',
  (e) => {
    var body = e.requestInfo().body || {}
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var content = (body.content || '').trim()
    if (!content || content.length < 10) {
      return e.badRequestError('Conteúdo muito curto para análise de tom.')
    }

    var systemPrompt =
      'Você é o Editorial QA da Revista MODA ATUAL. Analise o tom de voz do conteúdo e retorne uma versão ajustada ao padrão editorial da revista. Retorne APENAS JSON válido: {"adjusted_content": "texto ajustado", "changes": ["mudança 1", "mudança 2"]}.\n\nPADRÃO EDITORIAL:\n- Artigos: sofisticado, autoritativo, norma culta, terceira pessoa\n- Legendas: aspiracional, acessível, primeira pessoa do plural\n- Técnico: preciso, factual, neutro'

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Conteúdo para ajuste de tom:\n\n' + content },
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
          adjusted_content: content,
          changes: ['Não foi possível processar o ajuste de tom. Conteúdo original mantido.'],
        }
      }

      try {
        var alCol = $app.findCollectionByNameOrId('audit_logs')
        var alRec = new Record(alCol)
        alRec.set('integration_name', 'editorial_qa_tone')
        alRec.set('integration_type', 'route')
        alRec.set('status', 'success')
        alRec.set('executed_at', new Date().toISOString())
        alRec.set('agent_name', 'editorial-qa')
        $app.save(alRec)
      } catch (_) {}

      return e.json(200, parsed)
    } catch (err) {
      var msg = err && err.message ? err.message : 'Erro desconhecido'
      if (err instanceof SkipAiConfigError) msg = 'IA não configurada'
      else if (err instanceof SkipAiError) msg = 'Erro de IA: ' + (err.message || '')

      try {
        var alColE = $app.findCollectionByNameOrId('audit_logs')
        var alRecE = new Record(alColE)
        alRecE.set('integration_name', 'editorial_qa_tone')
        alRecE.set('integration_type', 'route')
        alRecE.set('status', 'error')
        alRecE.set('executed_at', new Date().toISOString())
        alRecE.set('agent_name', 'editorial-qa')
        alRecE.set('error_message', msg)
        $app.save(alRecE)
      } catch (_) {}

      return e.json(500, { error: msg })
    }
  },
  $apis.requireAuth(),
)
