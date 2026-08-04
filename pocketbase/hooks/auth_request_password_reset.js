routerAdd('POST', '/backend/v1/auth/request-reset', (e) => {
  try {
    const body = e.requestInfo().body || {}
    const email = (body.email || '').trim().toLowerCase()

    if (!email) return e.badRequestError('E-mail é obrigatório')

    let resetUrl = null

    try {
      const record = $app.findAuthRecordByEmail('users', email)
      const secret = $secrets.get('PB_SUPERUSER_TOKEN') || 'skip-fallback-secret'
      const token = $security.createJWT(
        { user_id: record.id, purpose: 'password_reset' },
        secret,
        3600,
      )
      const siteUrl = $secrets.get('SITE_URL') || 'https://revistamodaatual.com.br'
      resetUrl = siteUrl + '/reset-password?token=' + token
    } catch (_) {
      // User does not exist — do not reveal
    }

    return e.json(200, {
      success: true,
      message: 'Se o e-mail existir, você receberá um link de redefinição.',
      resetUrl: resetUrl,
    })
  } catch (err) {
    $app.logger().error('password reset request failed', 'error', String(err))
    return e.json(500, { error: 'Falha ao processar solicitação.' })
  }
})
