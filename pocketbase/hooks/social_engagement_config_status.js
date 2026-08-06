routerAdd(
  'GET',
  '/backend/v1/social-engagement/config/status',
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
      return e.json(200, {
        is_configured: false,
        is_validated: false,
        mode: 'simulado',
        account_name: '',
        account_id: '',
      })
    }

    const isConfigured = !!record.getString('encrypted_credentials')
    const isValidated = record.getBool('is_validated')

    return e.json(200, {
      is_configured: isConfigured,
      is_validated: isValidated,
      mode: isValidated ? 'ativo' : 'simulado',
      account_name: record.getString('account_name'),
      account_id: record.getString('account_id'),
    })
  },
  $apis.requireAuth(),
)
