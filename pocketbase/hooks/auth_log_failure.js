routerAdd('POST', '/backend/v1/auth/log-failure', (e) => {
  try {
    const body = e.requestInfo().body || {}
    const errorMessage = (body.error_message || 'unknown error').toString().slice(0, 2000)
    const email = (body.email || '').toString().trim().toLowerCase()

    const collection = $app.findCollectionByNameOrId('audit_logs')
    const record = new Record(collection)
    record.set('integration_name', 'auth/login')
    record.set('integration_type', 'route')
    record.set('status', 'error')
    record.set('executed_at', new Date().toISOString())
    record.set('error_message', errorMessage)
    record.set('agent_name', 'auth/login')
    record.set('workflow_id', email)
    $app.saveNoValidate(record)

    if (email) {
      try {
        var recentFailures = $app.findRecordsByFilter(
          'audit_logs',
          "agent_name = 'auth/login' && status = 'error'",
          '-executed_at',
          50,
          0,
        )
        var count = 0
        var fifteenMinAgo = Date.now() - 15 * 60 * 1000
        for (var i = 0; i < recentFailures.length; i++) {
          if (recentFailures[i].getString('workflow_id') === email) {
            var execAt = recentFailures[i].getString('executed_at')
            if (execAt) {
              try {
                if (new Date(execAt).getTime() >= fifteenMinAgo) count++
              } catch (_) {}
            }
          }
        }

        if (count >= 3) {
          try {
            var notifCol = $app.findCollectionByNameOrId('notifications')
            var notif = new Record(notifCol)
            notif.set('title', 'Tentativa de Login Suspeita')
            notif.set('message', count + ' tentativas de login falharam para: ' + email)
            notif.set('type', 'alert')
            notif.set('is_read', false)
            $app.saveNoValidate(notif)
          } catch (_) {}
        }
      } catch (_) {}
    }

    return e.json(200, { success: true })
  } catch (err) {
    $app.logger().error('failed to log auth failure', 'error', String(err))
    return e.json(500, { error: 'failed to log auth failure' })
  }
})
