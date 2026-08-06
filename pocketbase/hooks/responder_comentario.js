routerAdd(
  'POST',
  '/backend/v1/responder-comentario',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')

      var commentText = body.comment_text || ''
      if (!commentText.trim()) return e.badRequestError('comment_text is required')

      var commentId = body.comment_id || ''
      var mediaId = body.media_id || ''
      var igUserId = body.ig_user_id || ''
      var igUsername = body.ig_username || ''
      var postContext = body.post_context || ''

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
          { role: 'user', content: commentText },
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

      var logCol = $app.findCollectionByNameOrId('engagement_log')

      if (intent === 'spam') {
        var spamRec = new Record(logCol)
        spamRec.set('ig_user_id', igUserId)
        spamRec.set('ig_username', igUsername)
        spamRec.set('type', 'comment')
        spamRec.set('intent', 'spam')
        spamRec.set('message_text', commentText)
        spamRec.set('status', 'ignorado')
        spamRec.set('comment_id', commentId)
        spamRec.set('media_id', mediaId)
        $app.save(spamRec)
        return e.json(200, {
          intent: 'spam',
          response: null,
          status: 'ignorado',
          message: 'Comentario classificado como spam.',
        })
      }

      var sysPrompt =
        'Voce e a Editora de Moda e Tendencias da Revista MODA ATUAL (@revistamodaatual). Responda comentarios no Instagram com tom acolhedor, elegante e informativo. Respostas curtas e objetivas (maximo 2-3 frases). Portugues brasileiro. Use emojis com moderacao. Nunca prometa prazos, valores ou condicoes nao confirmados. Se for critica/reclamacao, responda com empatia e sugira contato via DM.'
      if (postContext) sysPrompt += '\n\nContexto do post: ' + postContext

      var responseRes = $ai.chat({
        model: 'fast',
        messages: [
          { role: 'system', content: sysPrompt },
          {
            role: 'user',
            content:
              'Comentario recebido (intencao: ' +
              intent +
              '): ' +
              commentText +
              '\n\nGere uma resposta adequada.',
          },
        ],
      })
      var responseText = responseRes.choices[0].message.content.trim()

      var needsHuman = intent === 'critica' || intent === 'reclamacao'
      var status = needsHuman ? 'encaminhado_humano' : 'respondido'

      var logRec = new Record(logCol)
      logRec.set('ig_user_id', igUserId)
      logRec.set('ig_username', igUsername)
      logRec.set('type', 'comment')
      logRec.set('intent', intent)
      logRec.set('message_text', commentText)
      logRec.set('response_text', responseText)
      logRec.set('status', status)
      logRec.set('comment_id', commentId)
      logRec.set('media_id', mediaId)
      if (needsHuman) logRec.set('forwarded_to', 'atendimento_humano')
      $app.save(logRec)

      var igToken = $secrets.get('IG_ACCESS_TOKEN') || ''
      var apiResponse = null
      if (igToken && commentId) {
        try {
          var res = $http.send({
            url: 'https://graph.facebook.com/v21.0/' + commentId + '/replies',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: responseText, access_token: igToken }),
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
        forwarded_to: needsHuman ? 'atendimento_humano' : null,
        api_response: apiResponse,
        log_id: logRec.id,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError)
        return e.json(503, { error: 'AI temporarily unavailable' })
      if (err instanceof SkipAiError) {
        var st = err.status || 502
        return e.json(st, { error: st >= 500 ? 'AI temporarily unavailable' : err.message })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
