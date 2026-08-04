routerAdd(
  'POST',
  '/backend/v1/auth/2fa/generate-otp',
  (e) => {
    try {
      const userId = e.auth && e.auth.id
      if (!userId) return e.unauthorizedError('Autenticação necessária.')

      const record = $app.findRecordById('users', userId)

      if (!record.getBool('twofa_enabled')) {
        return e.json(400, { error: '2FA não está habilitado.' })
      }

      var otp = String(Math.floor(100000 + Math.random() * 900000))
      var expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString()

      record.set('twofa_otp', otp)
      record.set('twofa_otp_expiry', expiry)
      $app.saveNoValidate(record)

      try {
        var logCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(logCol)
        log.set('integration_name', 'auth/2fa')
        log.set('integration_type', 'route')
        log.set('status', 'success')
        log.set('executed_at', new Date().toISOString())
        log.set('agent_name', 'auth/2fa')
        log.set('workflow_id', 'generate-otp')
        $app.saveNoValidate(log)
      } catch (_) {}

      return e.json(200, {
        otp: otp,
        message: 'Código de verificação gerado. Use-o para completar o login.',
      })
    } catch (err) {
      return e.json(500, { error: 'Falha ao gerar código de verificação.' })
    }
  },
  $apis.requireAuth(),
)
