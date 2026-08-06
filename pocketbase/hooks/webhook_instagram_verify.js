routerAdd('GET', '/backend/v1/webhook/instagram', (e) => {
  const mode = e.requestInfo().query['hub.mode']
  const token = e.requestInfo().query['hub.verify_token']
  const challenge = e.requestInfo().query['hub.challenge']

  if (mode === 'subscribe' && token === 'revista_moda_atual_webhook_2024') {
    return e.string(200, challenge || '')
  }

  return e.json(403, { error: 'Verificação falhou. Confirme o verify token.' })
})
