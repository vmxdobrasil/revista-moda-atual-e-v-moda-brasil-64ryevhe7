migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('site_settings')

    if (!col.fields.getByName('logo_visual_params')) {
      col.fields.add(new JSONField({ name: 'logo_visual_params' }))
      app.save(col)
    }

    const params = {
      blendMode: 'multiply',
      dropShadow: false,
      rounded: false,
      overflowVisible: true,
      bgTransparent: true,
      fixedAt: new Date().toISOString(),
    }

    try {
      const records = app.findRecordsByFilter('site_settings', '', '-created', 1, 0)
      if (records.length > 0) {
        records[0].set('logo_visual_params', params)
        app.save(records[0])
      } else {
        const rec = new Record(col)
        rec.set('logo_visual_params', params)
        app.save(rec)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('site_settings')
      const field = col.fields.getByName('logo_visual_params')
      if (field) {
        col.fields.remove(field)
        app.save(col)
      }
    } catch (_) {}
  },
)
