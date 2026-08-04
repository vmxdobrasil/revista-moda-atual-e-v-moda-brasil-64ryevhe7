routerAdd('POST', '/backend/v1/auth/reset-password', (e) => {
  const logResetFailure = (msg) => {
    try {
      const logCol = $app.findCollectionByNameOrId('audit_logs')
      const log = new Record(logCol)
      log.set('integration_name', 'auth/reset-password')
      log.set('integration_type', 'route')
      log.set('status', 'error')
      log.set('executed_at', new Date().toISOString())
      log.set('agent_name', 'auth/reset-password')
      log.set('error_message', String(msg).slice(0, 2000))
      $app.saveNoValidate(log)
    } catch (_) {}
  }

  try {
    const body = e.requestInfo().body || {}
    const token = (body.token || '').trim()
    const password = (body.password || '').trim()

    if (!token) return e.badRequestError('Token é obrigatório.')
    if (!password || password.length < 8)
      return e.badRequestError('A senha deve ter pelo menos 8 caracteres.')

    const secret = $secrets.get('PB_SUPERUSER_TOKEN') || 'skip-fallback-secret'

    let payload
    try {
      payload = $security.parseJWT(token, secret)
    } catch (_) {
      logResetFailure('Token inválido ou expirado.')
      return e.badRequestError('Token inválido ou expirado.')
    }

    if (!payload || payload.purpose !== 'password_reset') {
      logResetFailure('Token com propósito inválido.')
      return e.badRequestError('Token inválido.')
    }

    try {
      const record = $app.findRecordById('users', payload.user_id)
      record.setPassword(password)
      $app.saveNoValidate(record)

      try {
        const logCol = $app.findCollectionByNameOrId('audit_logs')
        const log = new Record(logCol)
        log.set('integration_name', 'auth/reset-password')
        log.set('integration_type', 'route')
        log.set('status', 'success')
        log.set('executed_at', new Date().toISOString())
        log.set('agent_name', 'auth/reset-password')
        log.set('workflow_id', record.getEmail())
        $app.saveNoValidate(log)
      } catch (_) {}

      return e.json(200, { success: true, message: 'Senha redefinida com sucesso.' })
    } catch (err) {
      logResetFailure('Usuário não encontrado: ' + String(err))
      return e.badRequestError('Token inválido ou expirado.')
    }
  } catch (err) {
    logResetFailure(String(err))
    return e.json(500, { error: 'Falha ao redefinir senha.' })
  }
})
