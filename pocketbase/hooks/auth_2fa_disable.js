routerAdd(
  'POST',
  '/backend/v1/auth/2fa/disable',
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

      record.set('twofa_enabled', false)
      record.set('backup_codes', [])
      record.set('twofa_otp', '')
      record.set('twofa_otp_expiry', '')
      $app.saveNoValidate(record)

      try {
        var logCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(logCol)
        log.set('integration_name', 'auth/2fa')
        log.set('integration_type', 'route')
        log.set('status', 'success')
        log.set('executed_at', new Date().toISOString())
        log.set('agent_name', 'auth/2fa')
        log.set('workflow_id', 'disable')
        log.set('error_message', '2FA disabled by user')
        $app.saveNoValidate(log)
      } catch (_) {}

      return e.json(200, { success: true })
    } catch (err) {
      return e.json(500, { error: 'Falha ao desativar 2FA.' })
    }
  },
  $apis.requireAuth(),
)
