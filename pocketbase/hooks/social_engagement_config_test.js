routerAdd(
  'POST',
  '/backend/v1/social-engagement/config/test',
  (e) => {
    let record
    try {
      const records = $app.findRecordsByFilter(
        'social_engagement_config',
        "id != ''",
        '-created',
        1,
        0,
      )
      if (records.length > 0) {
        record = records[0]
      }
    } catch (_) {}

    if (!record) {
      return e.json(400, { error: 'Nenhuma credencial configurada' })
    }

    const encrypted = record.getString('encrypted_credentials')
    if (!encrypted) {
      return e.json(400, { error: 'Nenhuma credencial configurada' })
    }

    const key = $secrets.get('PB_SUPERUSER_TOKEN') || 'skip-fallback-key'
    let creds
    try {
      const decrypted = $security.decrypt(encrypted, key)
      creds = JSON.parse(decrypted)
    } catch (err) {
      return e.json(500, { error: 'Erro ao descriptografar credenciais' })
    }

    const url =
      'https://graph.facebook.com/v18.0/' +
      creds.ig_user_id +
      '?fields=username,followers_count,media_count&access_token=' +
      creds.access_token

    let res
    try {
      res = $http.send({ url, method: 'GET', timeout: 15 })
    } catch (err) {
      return e.json(502, { error: 'Erro de conexão com a API do Instagram: ' + String(err) })
    }

    if (res.statusCode !== 200) {
      let errorMsg = 'Erro ao validar credenciais'
      try {
        const errBody = res.json
        if (errBody && errBody.error) {
          if (errBody.error.code === 190) {
            errorMsg = 'Token expirado ou inválido. Gere um novo long-lived token.'
          } else if (errBody.error.code === 10) {
            errorMsg = 'Permissão negada. Verifique se todos os scopes foram concedidos.'
          } else if (errBody.error.code === 100) {
            errorMsg = 'Instagram User ID inválido ou não vinculado à Facebook Page.'
          } else {
            errorMsg = errBody.error.message || errorMsg
          }
        }
      } catch (_) {}

      record.set('is_validated', false)
      record.set('account_name', '')
      record.set('account_id', '')
      $app.save(record)

      return e.json(400, { error: errorMsg })
    }

    const data = res.json || {}
    record.set('is_validated', true)
    record.set('account_name', data.username || '')
    record.set('account_id', creds.ig_user_id)
    $app.save(record)

    return e.json(200, {
      success: true,
      account_name: data.username || '',
      account_id: creds.ig_user_id,
      followers_count: data.followers_count || 0,
      media_count: data.media_count || 0,
    })
  },
  $apis.requireAuth(),
)
