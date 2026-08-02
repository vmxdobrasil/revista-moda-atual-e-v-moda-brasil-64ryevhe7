routerAdd(
  'POST',
  '/backend/v1/generate-engenheiro-refinamento',
  (e) => {
    const body = e.requestInfo().body || {}
    const promptOriginal = (body.promptOriginal || '').trim()

    if (!promptOriginal || promptOriginal.length === 0) {
      return e.json(400, { error: 'prompt_original é obrigatório' })
    }

    var promptRecord
    try {
      promptRecord = $app.findFirstRecordByData('prompt_library', 'slug', 'engenheiro-refinamento')
    } catch (_) {
      return e.json(404, { error: 'Prompt "engenheiro-refinamento" não encontrado na biblioteca' })
    }

    var promptTemplate = promptRecord.getString('prompt_content')
    var prompt = promptTemplate.replace(/\[PROMPT_ORIGINAL\]/g, promptOriginal)

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um Engenheiro de Prompts Sênior. Analise prompts e produza versões otimizadas usando os delimitadores ═══. Responda apenas com a análise, sem comentários adicionais.',
          },
          { role: 'user', content: prompt },
        ],
      })

      var content = reply.choices[0].message.content.trim()

      try {
        var alCol = $app.findCollectionByNameOrId('audit_logs')
        var alRec = new Record(alCol)
        alRec.set('integration_name', 'generate_engenheiro_refinamento')
        alRec.set('integration_type', 'route')
        alRec.set('status', 'success')
        alRec.set('executed_at', new Date().toISOString())
        $app.save(alRec)
      } catch (_) {}

      return e.json(200, { resultado: content })
    } catch (err) {
      try {
        var alCol2 = $app.findCollectionByNameOrId('audit_logs')
        var alRec2 = new Record(alCol2)
        alRec2.set('integration_name', 'generate_engenheiro_refinamento')
        alRec2.set('integration_type', 'route')
        alRec2.set('status', 'error')
        alRec2.set('executed_at', new Date().toISOString())
        alRec2.set('error_message', err && err.message ? err.message : 'unknown error')
        $app.save(alRec2)
      } catch (_) {}
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'IA temporariamente indisponível' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { error: 'Falha ao gerar otimização' })
      }
      return e.json(500, { error: 'Erro inesperado ao gerar otimização' })
    }
  },
  $apis.requireAuth(),
)
