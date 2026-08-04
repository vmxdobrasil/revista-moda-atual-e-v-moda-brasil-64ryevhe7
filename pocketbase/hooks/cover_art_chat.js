routerAdd(
  'POST',
  '/backend/v1/agents/cover-editorial-art-director/chat',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var userId = e.auth && e.auth.id
      if (!userId) return e.unauthorizedError('auth required')
      if (!body.message || !body.message.trim()) return e.badRequestError('message is required')

      var conv = $ai.agent('cover-editorial-art-director').getOrCreateConversation({
        user_id: userId,
        id: body.conversation_id || null,
      })

      var iter = $ai.agent('cover-editorial-art-director').chat({
        user_id: userId,
        conversation_id: conv.id,
        message: body.message,
        stream: true,
      })

      try {
        var alCol = $app.findCollectionByNameOrId('audit_logs')
        var alRec = new Record(alCol)
        alRec.set('integration_name', 'cover_art_chat')
        alRec.set('integration_type', 'route')
        alRec.set('status', 'success')
        alRec.set('executed_at', new Date().toISOString())
        alRec.set('agent_name', 'cover/art-director')
        $app.save(alRec)
      } catch (_) {}

      e.response.header().set('Content-Type', 'text/event-stream')
      e.response.header().set('Cache-Control', 'no-cache')
      e.response.header().set('X-Conversation-Id', conv.id)
      $response.stream(e, iter)
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'AI temporarily unavailable' })
      }
      if (err instanceof SkipAiAgentsError) {
        var status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'agent request failed' : err.message })
      }
      if (err instanceof SkipAiError) {
        var s2 = err.status || 502
        return e.json(s2, { error: s2 >= 500 ? 'AI temporarily unavailable' : err.message })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
