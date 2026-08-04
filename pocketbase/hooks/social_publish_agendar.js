routerAdd(
  'POST',
  '/backend/v1/agendar',
  (e) => {
    var body = e.requestInfo().body || {}
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var postIds = body.postIds || []
    var platform = body.platform || 'instagram'
    var scheduledAt = body.scheduledAt || ''

    if (!postIds.length) return e.badRequestError('postIds é obrigatório')

    var validPlatforms = ['instagram', 'facebook', 'youtube', 'whatsapp']
    if (validPlatforms.indexOf(platform) === -1) {
      return e.badRequestError('Plataforma inválida. Use: ' + validPlatforms.join(', '))
    }

    var recommendedTime = ''
    var rationale = ''

    if (!scheduledAt) {
      try {
        var firstPost = $app.findRecordById('social_posts', postIds[0])
        var hook = firstPost.getString('hook')
        var format = firstPost.getString('format')

        var agentMsg =
          'Recomende o melhor horario para publicar um ' +
          format +
          ' sobre "' +
          hook +
          '" no ' +
          platform +
          ' para audiencia brasileira de moda. Considere o proximo dia util. Retorne APENAS JSON valido: {"time": "YYYY-MM-DD HH:MM", "rationale": "breve explicacao"}'

        var result = $ai.agent('social-publisher').chat({
          user_id: userId,
          message: agentMsg,
        })

        var jsonStr = result.content || ''
        var fence = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
        if (fence) {
          jsonStr = fence[1].trim()
        } else {
          var brace = jsonStr.match(/\{[\s\S]*\}/)
          if (brace) jsonStr = brace[0]
        }

        var parsed = JSON.parse(jsonStr)
        scheduledAt = parsed.time || ''
        rationale = parsed.rationale || ''
        recommendedTime = scheduledAt
      } catch (err) {
        var tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(11, 0, 0, 0)
        scheduledAt = tomorrow.toISOString().replace('T', ' ').split('.')[0]
        recommendedTime = scheduledAt
        rationale = 'Horario padrao recomendado (proximo dia util as 11h)'
      }
    }

    var scheduled = []
    for (var i = 0; i < postIds.length; i++) {
      try {
        var record = $app.findRecordById('social_posts', postIds[i])
        record.set('scheduled_at', scheduledAt)
        record.set('platform', platform)
        record.set('status', 'scheduled')
        $app.save(record)
        scheduled.push({ id: postIds[i], scheduled_at: scheduledAt, platform: platform })
      } catch (err) {
        // skip failed posts
      }
    }

    try {
      var alCol = $app.findCollectionByNameOrId('audit_logs')
      var alRec = new Record(alCol)
      alRec.set('integration_name', 'social_publish_agendar')
      alRec.set('integration_type', 'route')
      alRec.set('status', 'success')
      alRec.set('executed_at', new Date().toISOString())
      alRec.set('workflow_id', postIds.join(','))
      alRec.set('agent_name', 'social-publisher')
      $app.save(alRec)
    } catch (_) {}

    return e.json(200, {
      success: true,
      scheduled: scheduled,
      recommended_time: recommendedTime,
      rationale: rationale,
    })
  },
  $apis.requireAuth(),
)
