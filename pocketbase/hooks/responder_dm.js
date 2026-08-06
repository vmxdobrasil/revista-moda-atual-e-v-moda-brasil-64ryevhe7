routerAdd(
  'POST',
  '/backend/v1/responder-dm',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')
      if (!body.message || !String(body.message).trim()) {
        return e.badRequestError('message is required')
      }

      var igUserId = body.ig_user_id || ''
      var igUsername = body.ig_username || ''
      var conversationId = body.conversation_id || null

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

      var classifyRes = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Classifique a intencao em UMA categoria: elogio, pergunta_conteudo, pergunta_produto, critica, spam, parceria, consultoria, reclamacao. Responda APENAS com a categoria.',
          },
          { role: 'user', content: body.message },
        ],
      })
      var intent = classifyRes.choices[0].message.content.trim().toLowerCase()
      var matched = false
      for (var i = 0; i < validIntents.length; i++) {
        if (intent.indexOf(validIntents[i]) !== -1) {
          intent = validIntents[i]
          matched = true
          break
        }
      }
      if (!matched) intent = 'pergunta_conteudo'

      if (intent === 'spam') {
        return e.json(200, {
          intent: 'spam',
          response: null,
          status: 'ignorado',
          message: 'Mensagem classificada como spam.',
        })
      }

      var contextPrefix = ''
      if (igUsername) {
        contextPrefix = '[Usuario IG: ' + igUsername + '] '
      }
      var agentMsg = contextPrefix + body.message

      var conv = $ai.agent('social-engagement').getOrCreateConversation({
        user_id: userId,
        id: conversationId,
      })

      var result = $ai.agent('social-engagement').chat({
        user_id: userId,
        conversation_id: conv.id,
        message: agentMsg,
      })

      var responseText = result.content

      var needsHuman = intent === 'reclamacao' || intent === 'critica' || intent === 'parceria'
      var status = needsHuman ? 'encaminhado_humano' : 'respondido'

      var logCol = $app.findCollectionByNameOrId('engagement_log')
      var logRec = new Record(logCol)
      logRec.set('ig_user_id', igUserId)
      logRec.set('ig_username', igUsername)
      logRec.set('type', 'dm')
      logRec.set('intent', intent)
      logRec.set('message_text', body.message)
      logRec.set('response_text', responseText)
      logRec.set('status', status)
      logRec.set('conversation_id', conv.id)
      if (needsHuman) {
        var fwdTo = intent === 'parceria' ? 'comercial' : 'atendimento_humano'
        logRec.set('forwarded_to', fwdTo)
      }
      $app.save(logRec)

      var convCol = $app.findCollectionByNameOrId('ig_conversations')
      try {
        var existing = $app.findRecordsByFilter(
          'ig_conversations',
          'conversation_id = {:cid}',
          '-created',
          1,
          0,
          { cid: conv.id },
        )
        if (existing.length > 0) {
          existing[0].set('message_count', (existing[0].getInt('message_count') || 0) + 1)
          existing[0].set('last_message_at', new Date().toISOString())
          existing[0].set('ig_username', igUsername || existing[0].getString('ig_username'))
          $app.save(existing[0])
        } else {
          var crec = new Record(convCol)
          crec.set('ig_user_id', igUserId)
          crec.set('ig_username', igUsername)
          crec.set('conversation_id', conv.id)
          crec.set('message_count', 1)
          crec.set('last_message_at', new Date().toISOString())
          crec.set('context', '{"intent": "' + intent + '"}')
          $app.save(crec)
        }
      } catch (_) {}

      var igToken = $secrets.get('IG_ACCESS_TOKEN') || ''
      var apiResponse = null
      if (igToken && igUserId) {
        try {
          var res = $http.send({
            url: 'https://graph.facebook.com/v21.0/' + igUserId + '/messages',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipient: { id: igUserId },
              message: { text: responseText },
              access_token: igToken,
            }),
            timeout: 15,
          })
          apiResponse = { statusCode: res.statusCode }
        } catch (apiErr) {
          apiResponse = { error: String(apiErr) }
        }
      }

      return e.json(200, {
        intent: intent,
        response: responseText,
        status: status,
        conversation_id: conv.id,
        message_id: result.message_id,
        forwarded_to: needsHuman
          ? intent === 'parceria'
            ? 'comercial'
            : 'atendimento_humano'
          : null,
        api_response: apiResponse,
        log_id: logRec.id,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError)
        return e.json(503, { error: 'AI temporarily unavailable' })
      if (err instanceof SkipAiAgentsError) {
        var st1 = err.status || 500
        return e.json(st1, { error: st1 >= 500 ? 'agent request failed' : err.message })
      }
      if (err instanceof SkipAiError) {
        var st2 = err.status || 502
        return e.json(st2, { error: st2 >= 500 ? 'AI temporarily unavailable' : err.message })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
