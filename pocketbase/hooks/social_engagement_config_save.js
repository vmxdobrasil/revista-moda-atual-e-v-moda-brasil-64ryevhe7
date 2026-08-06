routerAdd(
  'POST',
  '/backend/v1/social-engagement/config',
  (e) => {
    const body = e.requestInfo().body || {}
    const { access_token, app_secret, page_id, ig_user_id } = body

    if (!access_token || !app_secret || !page_id || !ig_user_id) {
      return e.badRequestError('Todos os campos são obrigatórios')
    }

    const key = $secrets.get('PB_SUPERUSER_TOKEN') || 'skip-fallback-key'
    const creds = JSON.stringify({ access_token, app_secret, page_id, ig_user_id })
    const encrypted = $security.encrypt(creds, key)

    const col = $app.findCollectionByNameOrId('social_engagement_config')
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
      record = new Record(col)
    }
    record.set('encrypted_credentials', encrypted)
    record.set('is_validated', false)
    record.set('account_name', '')
    record.set('account_id', '')
    $app.save(record)

    return e.json(200, { success: true, message: 'Credenciais salvas com sucesso' })
  },
  $apis.requireAuth(),
)
