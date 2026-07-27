migrate(
  (app) => {
    try {
      app.findFirstRecordByData('advertisements', 'title', 'Anúncio Demonstração')
      return
    } catch (_) {}

    const col = app.findCollectionByNameOrId('advertisements')
    const r = new Record(col)
    r.set('title', 'Anúncio Demonstração')
    r.set('url', 'https://revistamodaatual.goskip.app')
    r.set('is_active', true)
    app.save(r)
  },
  (app) => {
    try {
      const r = app.findFirstRecordByData('advertisements', 'title', 'Anúncio Demonstração')
      app.delete(r)
    } catch (_) {}
  },
)
