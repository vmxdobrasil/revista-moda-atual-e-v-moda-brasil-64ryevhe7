routerAdd('POST', '/backend/v1/auth/2fa/verify', (e) => {
  try {
    const body = e.requestInfo().body || {}
    const email = (body.email || '').trim().toLowerCase()
    const code = (body.code || '').trim()
    const backupCode = (body.backupCode || '').trim()

    if (!email) return e.badRequestError('E-mail é obrigatório.')
    if (!code && !backupCode) return e.badRequestError('Código é obrigatório.')

    var record
    try {
      record = $app.findAuthRecordByEmail('users', email)
    } catch (_) {
      return e.json(401, { error: 'Verificação falhou.' })
    }

    if (!record.getBool('twofa_enabled')) {
      return e.json(400, { error: '2FA não está habilitado para esta conta.' })
    }

    if (backupCode) {
      var codes = record.get('backup_codes')
      if (typeof codes === 'string') {
        try {
          codes = JSON.parse(codes)
        } catch (_) {
          codes = []
        }
      }
      if (!codes || !Array.isArray(codes)) {
        return e.json(401, { error: 'Código de backup inválido.' })
      }
      var hashedBackup = $security.sha256(backupCode.trim().toUpperCase())
      var foundIdx = -1
      for (var i = 0; i < codes.length; i++) {
        if (codes[i] === hashedBackup) {
          foundIdx = i
          break
        }
      }
      if (foundIdx === -1) return e.json(401, { error: 'Código de backup inválido.' })
      codes.splice(foundIdx, 1)
      record.set('backup_codes', codes)
    } else {
      var storedOtp = record.getString('twofa_otp')
      var expiryStr = record.getString('twofa_otp_expiry')
      if (!storedOtp || !expiryStr) {
        return e.json(401, { error: 'Nenhum código ativo. Solicite um novo código.' })
      }
      try {
        if (Date.now() > new Date(expiryStr).getTime()) {
          return e.json(401, { error: 'Código expirado. Solicite um novo código.' })
        }
      } catch (_) {
        return e.json(401, { error: 'Código inválido.' })
      }
      if (storedOtp !== code) return e.json(401, { error: 'Código inválido.' })
      record.set('twofa_otp', '')
      record.set('twofa_otp_expiry', '')
    }

    $app.saveNoValidate(record)

    try {
      var logCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(logCol)
      log.set('integration_name', 'auth/2fa')
      log.set('integration_type', 'route')
      log.set('status', 'success')
      log.set('executed_at', new Date().toISOString())
      log.set('agent_name', 'auth/2fa')
      log.set('workflow_id', 'verify')
      $app.saveNoValidate(log)
    } catch (_) {}

    $apis.recordAuthResponse(e, record)
    return
  } catch (err) {
    try {
      var logCol2 = $app.findCollectionByNameOrId('audit_logs')
      var log2 = new Record(logCol2)
      log2.set('integration_name', 'auth/2fa')
      log2.set('integration_type', 'route')
      log2.set('status', 'error')
      log2.set('executed_at', new Date().toISOString())
      log2.set('agent_name', 'auth/2fa')
      log2.set('error_message', '2FA verification failed')
      log2.set('workflow_id', 'verify')
      $app.saveNoValidate(log2)
    } catch (_) {}

    return e.json(401, { error: 'Verificação falhou.' })
  }
})
