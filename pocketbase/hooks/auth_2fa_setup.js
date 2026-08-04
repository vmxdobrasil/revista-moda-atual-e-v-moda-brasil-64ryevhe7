routerAdd(
  'POST',
  '/backend/v1/auth/2fa/setup',
  (e) => {
    try {
      const userId = e.auth && e.auth.id
      if (!userId) return e.unauthorizedError('Autenticação necessária.')

      const body = e.requestInfo().body || {}
      const password = (body.password || '').trim()

      if (!password) return e.badRequestError('Senha é obrigatória.')

      const record = $app.findRecordById('users', userId)

      var passwordValid = false
      try {
        passwordValid = record.validatePassword(password)
      } catch (_) {
        passwordValid = false
      }

      if (!passwordValid) return e.json(401, { error: 'Senha incorreta.' })

      var codes = []
      for (var i = 0; i < 8; i++) {
        codes.push($security.randomString(8).toUpperCase())
      }

      var hashedCodes = []
      for (var j = 0; j < codes.length; j++) {
        hashedCodes.push($security.sha256(codes[j]))
      }

      record.set('twofa_enabled', true)
      record.set('backup_codes', hashedCodes)
      $app.saveNoValidate(record)

      try {
        var logCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(logCol)
        log.set('integration_name', 'auth/2fa')
        log.set('integration_type', 'route')
        log.set('status', 'success')
        log.set('executed_at', new Date().toISOString())
        log.set('agent_name', 'auth/2fa')
        log.set('workflow_id', 'setup')
        log.set('error_message', '2FA enabled by user')
        $app.saveNoValidate(log)
      } catch (_) {}

      return e.json(200, { success: true, backupCodes: codes })
    } catch (err) {
      return e.json(500, { error: 'Falha ao configurar 2FA.' })
    }
  },
  $apis.requireAuth(),
)
