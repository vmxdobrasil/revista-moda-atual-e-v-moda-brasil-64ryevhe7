routerAdd('POST', '/backend/v1/webhook/instagram', (e) => {
  let isValidated = false
  let appSecret = ''
  try {
    const records = $app.findRecordsByFilter(
      'social_engagement_config',
      "id != ''",
      '-created',
      1,
      0,
    )
    if (records.length > 0) {
      isValidated = records[0].getBool('is_validated')
      if (isValidated) {
        const key = $secrets.get('PB_SUPERUSER_TOKEN') || 'skip-fallback-key'
        const encrypted = records[0].getString('encrypted_credentials')
        const decrypted = $security.decrypt(encrypted, key)
        const creds = JSON.parse(decrypted)
        appSecret = creds.app_secret || ''
      }
    }
  } catch (_) {}

  if (!isValidated) {
    $app.logger().info('webhook_instagram: evento recebido em modo simulado')
    return e.json(200, {
      status: 'simulated',
      message: 'Credenciais não validadas - modo simulado ativo',
    })
  }

  if (appSecret) {
    const sig = e.request.header.get('X-Hub-Signature-256') || ''
    const bodyStr = JSON.stringify(e.requestInfo().body || {})
    const expected = 'sha256=' + $security.hs256(bodyStr, appSecret)
    if (sig !== expected) {
      $app
        .logger()
        .warn(
          'webhook_instagram: assinatura inválida',
          'received',
          sig,
          'expected_prefix',
          expected.substring(0, 20),
        )
      return e.json(401, { error: 'Assinatura inválida' })
    }
  }

  const body = e.requestInfo().body || {}
  const engCol = $app.findCollectionByNameOrId('engagement_log')

  if (body.entry) {
    for (const entry of body.entry) {
      if (entry.changes) {
        for (const change of entry.changes) {
          if (change.field === 'comments' && change.value) {
            const v = change.value
            const rec = new Record(engCol)
            rec.set('ig_user_id', v.from ? v.from.id : '')
            rec.set('ig_username', v.from ? v.from.username : '')
            rec.set('type', 'comment')
            rec.set('message_text', v.text || '')
            rec.set('status', 'pendente')
            rec.set('media_id', v.media_id || '')
            rec.set('comment_id', v.id || '')
            $app.save(rec)
          }
        }
      }
      if (entry.messaging) {
        for (const msg of entry.messaging) {
          if (msg.message && msg.message.text) {
            const rec = new Record(engCol)
            rec.set('ig_user_id', msg.sender ? msg.sender.id : '')
            rec.set('type', 'dm')
            rec.set('message_text', msg.message.text || '')
            rec.set('status', 'pendente')
            rec.set('conversation_id', entry.id || '')
            $app.save(rec)
          }
        }
      }
    }
  }

  return e.json(200, { status: 'processed' })
})
