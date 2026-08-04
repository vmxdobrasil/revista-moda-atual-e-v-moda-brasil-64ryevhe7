routerAdd(
  'POST',
  '/backend/v1/qa',
  (e) => {
    var body = e.requestInfo().body || {}
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var content = (body.content || '').trim()
    var contentType = (body.content_type || 'article').trim()
    if (!content || content.length < 10) {
      return e.badRequestError('Conteúdo muito curto para revisão (mínimo 10 caracteres).')
    }

    var prompt =
      'Revise o seguinte conteúdo do tipo "' +
      contentType +
      '" e retorne APENAS JSON válido com: classification (aprovado|revisar|reprovado), justification, suggestions[], score (0-100).\n\nCONTEÚDO:\n' +
      content

    try {
      var result = $ai.agent('editorial-qa').chat({
        user_id: userId,
        message: prompt,
      })

      var rawContent = result.content || ''
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
          classification: 'revisar',
          justification: 'Não foi possível processar a resposta do QA. Revisão manual necessária.',
          suggestions: ['Verificar o conteúdo manualmente.'],
          score: 50,
        }
      }

      var validClassifications = ['aprovado', 'revisar', 'reprovado']
      if (validClassifications.indexOf(parsed.classification) === -1) {
        parsed.classification = 'revisar'
      }
      if (typeof parsed.score !== 'number' || parsed.score < 0 || parsed.score > 100) {
        parsed.score = 50
      }
      if (!Array.isArray(parsed.suggestions)) {
        parsed.suggestions = []
      }

      try {
        var alCol = $app.findCollectionByNameOrId('audit_logs')
        var alRec = new Record(alCol)
        alRec.set('integration_name', 'editorial_qa_review')
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
      else if (err instanceof SkipAiAgentsError) msg = 'Erro do agente: ' + (err.message || '')
      else if (err instanceof SkipAiError) msg = 'Erro de IA: ' + (err.message || '')

      try {
        var alColE = $app.findCollectionByNameOrId('audit_logs')
        var alRecE = new Record(alColE)
        alRecE.set('integration_name', 'editorial_qa_review')
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
