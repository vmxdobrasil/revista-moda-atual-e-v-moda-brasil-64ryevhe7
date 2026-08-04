routerAdd(
  'POST',
  '/backend/v1/publicar',
  (e) => {
    var body = e.requestInfo().body || {}
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var postId = body.postId || ''
    if (!postId) return e.badRequestError('postId é obrigatório')

    var platform = body.platform || ''

    try {
      var record = $app.findRecordById('social_posts', postId)
      if (!platform) {
        platform = record.getString('platform') || 'instagram'
      }

      var validPlatforms = ['instagram', 'facebook', 'youtube', 'whatsapp']
      if (validPlatforms.indexOf(platform) === -1) {
        platform = 'instagram'
      }

      var published = false
      var attempts = 0
      var maxAttempts = 3
      var lastError = ''

      while (!published && attempts < maxAttempts) {
        attempts++
        try {
          // Simulated publication — in production this would call the actual platform API
          // using tokens configured in $secrets
          published = true
        } catch (err) {
          lastError = err && err.message ? err.message : 'unknown error'
          if (attempts >= maxAttempts) {
            record.set('status', 'failed')
            $app.save(record)

            try {
              var alColE = $app.findCollectionByNameOrId('audit_logs')
              var alRecE = new Record(alColE)
              alRecE.set('integration_name', 'social_publish_publicar')
              alRecE.set('integration_type', 'route')
              alRecE.set('status', 'error')
              alRecE.set('executed_at', new Date().toISOString())
              alRecE.set('workflow_id', postId)
              alRecE.set('error_message', 'Falha apos ' + maxAttempts + ' tentativas: ' + lastError)
              alRecE.set('agent_name', 'social-publisher')
              $app.save(alRecE)
            } catch (_) {}

            return e.json(500, {
              success: false,
              error: 'Falha na publicacao apos ' + maxAttempts + ' tentativas',
              attempts: attempts,
            })
          }
        }
      }

      var now = new Date().toISOString()
      record.set('published_at', now)
      record.set('status', 'published')
      record.set('platform', platform)
      $app.save(record)

      try {
        var alCol = $app.findCollectionByNameOrId('audit_logs')
        var alRec = new Record(alCol)
        alRec.set('integration_name', 'social_publish_publicar')
        alRec.set('integration_type', 'route')
        alRec.set('status', 'success')
        alRec.set('executed_at', now)
        alRec.set('workflow_id', postId)
        alRec.set('agent_name', 'social-publisher')
        $app.save(alRec)
      } catch (_) {}

      return e.json(200, {
        success: true,
        published: {
          id: postId,
          published_at: now,
          platform: platform,
          attempts: attempts,
        },
      })
    } catch (err) {
      return e.json(404, { success: false, error: 'Post nao encontrado' })
    }
  },
  $apis.requireAuth(),
)
