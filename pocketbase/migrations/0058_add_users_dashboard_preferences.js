migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!col.fields.getByName('dashboard_preferences')) {
      col.fields.add(new JSONField({ name: 'dashboard_preferences' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      col.fields.removeByName('dashboard_preferences')
    } catch (_) {}
    app.save(col)
  },
)
