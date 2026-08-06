routerAdd('GET', '/backend/v1/webhook-instagram', (e) => {
  var mode = ''
  var token = ''
  var challenge = ''

  try {
    var q = e.requestInfo().query || {}
    mode = q['hub.mode'] || ''
    token = q['hub.verify_token'] || ''
    challenge = q['hub.challenge'] || ''
  } catch (_) {}

  var verifyToken = $secrets.get('IG_WEBHOOK_VERIFY_TOKEN') || 'moda_atual_verify_2026'

  if (mode === 'subscribe' && token === verifyToken) {
    return e.string(200, String(challenge))
  }

  return e.unauthorizedError('Webhook verification failed')
})
