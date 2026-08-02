routerAdd(
  'POST',
  '/backend/v1/generate-arquiteto-workflow',
  (e) => {
    const body = e.requestInfo().body || {}
    const entregaFinal = (body.entregaFinal || '').trim()
    const nRaw = body.n

    if (!entregaFinal || entregaFinal.length === 0) {
      return e.json(400, { error: 'entregaFinal é obrigatório' })
    }

    var n = Number(nRaw)
    if (!Number.isInteger(n) || n < 1 || n > 7) {
      return e.json(400, { error: 'n deve ser um número inteiro entre 1 e 7' })
    }

    var promptRecord
    try {
      promptRecord = $app.findFirstRecordByData('prompt_library', 'slug', 'arquiteto-workflow')
    } catch (_) {
      return e.json(404, { error: 'Prompt "arquiteto-workflow" não encontrado na biblioteca' })
    }

    var promptTemplate = promptRecord.getString('prompt_content')
    var prompt = promptTemplate
      .replace(/\[ENTREGA FINAL\]/g, entregaFinal)
      .replace(/\[N\]/g, String(n))

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um arquiteto de sistemas de IA. Gere workflows estruturados usando os delimitadores ═══. Responda apenas com o workflow, sem comentários adicionais.',
          },
          { role: 'user', content: prompt },
        ],
      })

      var content = reply.choices[0].message.content.trim()

      try {
        var alCol = $app.findCollectionByNameOrId('audit_logs')
        var alRec = new Record(alCol)
        alRec.set('integration_name', 'generate_arquiteto_workflow')
        alRec.set('integration_type', 'route')
        alRec.set('status', 'success')
        alRec.set('executed_at', new Date().toISOString())
        $app.save(alRec)
      } catch (_) {}

      return e.json(200, { workflow: content })
    } catch (err) {
      try {
        var alCol2 = $app.findCollectionByNameOrId('audit_logs')
        var alRec2 = new Record(alCol2)
        alRec2.set('integration_name', 'generate_arquiteto_workflow')
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
        return e.json(502, { error: 'Falha ao gerar workflow' })
      }
      return e.json(500, { error: 'Erro inesperado ao gerar workflow' })
    }
  },
  $apis.requireAuth(),
)
