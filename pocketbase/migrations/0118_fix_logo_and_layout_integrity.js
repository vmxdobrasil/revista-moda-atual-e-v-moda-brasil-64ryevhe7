migrate(
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('site_settings')
      const records = app.findRecordsByFilter('site_settings', '', '-created', 1, 0)
      if (records.length === 0) {
        const rec = new Record(collection)
        rec.set('updated', new Date().toISOString())
        app.save(rec)
      } else {
        const rec = records[0]
        rec.set('updated', new Date().toISOString())
        app.save(rec)
      }
    } catch (_) {}
  },
  (app) => {},
)
