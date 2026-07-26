migrate(
  (app) => {
    try {
      var record = app.findFirstRecordByData('prompt_library', 'slug', 'titulos-seo')
      record.set('description', 'Gera 5 opções de título SEO para matéria no site')
      app.save(record)
    } catch (_) {}
  },
  (app) => {
    try {
      var record = app.findFirstRecordByData('prompt_library', 'slug', 'titulos-seo')
      record.set('description', 'Gera 5 opções de título para matéria com SEO')
      app.save(record)
    } catch (_) {}
  },
)
