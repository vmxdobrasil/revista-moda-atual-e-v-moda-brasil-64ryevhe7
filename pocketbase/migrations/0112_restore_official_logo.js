migrate(
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('site_settings')
      const records = app.findRecordsByFilter('site_settings', '', '-created', 1, 0)
      if (records.length === 0) {
        const rec = new Record(collection)
        app.save(rec)
      } else {
        const rec = records[0]
        app.save(rec)
      }
    } catch (_) {}
  },
  (app) => {
    // Revert migration
  },
)
