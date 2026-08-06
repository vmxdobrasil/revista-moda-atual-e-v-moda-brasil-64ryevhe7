routerAdd(
  'POST',
  '/backend/v1/classificar-interacao',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')
      if (!body.message || !String(body.message).trim()) {
        return e.badRequestError('message is required')
      }

      var validIntents = [
        'elogio',
        'pergunta_conteudo',
        'pergunta_produto',
        'critica',
        'spam',
        'parceria',
        'consultoria',
        'reclamacao',
      ]

      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Voce e um classificador de intencoes para comentarios e DMs do Instagram da Revista MODA ATUAL. Classifique a intencao em UMA destas categorias: elogio, pergunta_conteudo, pergunta_produto, critica, spam, parceria, consultoria, reclamacao. Responda APENAS com o nome da categoria, sem texto adicional.',
          },
          { role: 'user', content: body.message },
        ],
      })

      var intent = reply.choices[0].message.content.trim().toLowerCase()

      var matched = false
      for (var i = 0; i < validIntents.length; i++) {
        if (intent.indexOf(validIntents[i]) !== -1) {
          intent = validIntents[i]
          matched = true
          break
        }
      }
      if (!matched) {
        intent = 'pergunta_conteudo'
      }

      var needsHuman = intent === 'critica' || intent === 'reclamacao'

      return e.json(200, {
        intent: intent,
        needs_human_escalation: needsHuman,
        message: body.message,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'AI temporarily unavailable' })
      }
      if (err instanceof SkipAiError) {
        var status = err.status || 502
        return e.json(status, {
          error: status >= 500 ? 'AI temporarily unavailable' : err.message,
        })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
