migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('site_settings')
    try {
      const records = app.findRecordsByFilter('site_settings', '', '-created', 1, 0)
      if (records.length === 0) {
        const rec = new Record(collection)
        app.save(rec)
      }
    } catch (_) {}
  },
  (app) => {
    // Revert migration
  },
)
