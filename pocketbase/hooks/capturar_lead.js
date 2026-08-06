routerAdd(
  'POST',
  '/backend/v1/capturar-lead',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')

      var igUserId = body.ig_user_id || ''
      var igUsername = body.ig_username || ''
      var conversationId = body.conversation_id || ''

      var validIntents = ['produto', 'anuncio', 'consultoria', 'parceria']
      var intent = body.intent || 'produto'
      if (validIntents.indexOf(intent) === -1) intent = 'produto'

      var leadsCol = $app.findCollectionByNameOrId('dm_leads')

      try {
        var existing = $app.findRecordsByFilter(
          'dm_leads',
          'ig_user_id = {:uid} && intent = {:int}',
          '-created',
          1,
          0,
          { uid: igUserId, int: intent },
        )
        if (existing.length > 0) {
          var ex = existing[0]
          if (body.name) ex.set('name', body.name)
          if (body.email) ex.set('email', body.email)
          if (body.whatsapp) ex.set('whatsapp', body.whatsapp)
          if (body.city) ex.set('city', body.city)
          if (body.notes) ex.set('notes', body.notes)
          $app.save(ex)
          return e.json(200, { success: true, lead_id: ex.id, updated: true })
        }
      } catch (_) {}

      var rec = new Record(leadsCol)
      rec.set('ig_user_id', igUserId)
      rec.set('ig_username', igUsername)
      if (body.name) rec.set('name', body.name)
      if (body.email) rec.set('email', body.email)
      if (body.whatsapp) rec.set('whatsapp', body.whatsapp)
      if (body.city) rec.set('city', body.city)
      rec.set('intent', intent)
      rec.set('status', 'novo')
      if (body.notes) rec.set('notes', body.notes)
      if (conversationId) rec.set('conversation_id', conversationId)
      $app.save(rec)

      return e.json(200, { success: true, lead_id: rec.id, updated: false })
    } catch (err) {
      $app.logger().error('capturar-lead error', 'error', String(err))
      return e.json(500, { error: 'Failed to capture lead' })
    }
  },
  $apis.requireAuth(),
)
