migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!col.fields.getByName('twofa_enabled')) {
      col.fields.add(new BoolField({ name: 'twofa_enabled' }))
    }
    if (!col.fields.getByName('backup_codes')) {
      col.fields.add(new JSONField({ name: 'backup_codes' }))
    }
    if (!col.fields.getByName('twofa_otp')) {
      col.fields.add(new TextField({ name: 'twofa_otp' }))
    }
    if (!col.fields.getByName('twofa_otp_expiry')) {
      col.fields.add(new DateField({ name: 'twofa_otp_expiry' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      col.fields.removeByName('twofa_enabled')
    } catch (_) {}
    try {
      col.fields.removeByName('backup_codes')
    } catch (_) {}
    try {
      col.fields.removeByName('twofa_otp')
    } catch (_) {}
    try {
      col.fields.removeByName('twofa_otp_expiry')
    } catch (_) {}
    app.save(col)
  },
)
