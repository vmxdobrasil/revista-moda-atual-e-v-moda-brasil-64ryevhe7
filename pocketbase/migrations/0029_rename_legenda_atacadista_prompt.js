migrate(
  (app) => {
    try {
      var r = app.findFirstRecordByData('prompt_library', 'slug', 'legenda-atacadista')
      r.set('name', 'Apresentação da Marca')
      r.set(
        'description',
        'Gera legenda para Instagram apresentando marcas atacadistas do Polo de Moda de Goiás, com CTA "VEJA O CATÁLOGO" e link para V MODA BRASIL.',
      )
      app.save(r)
    } catch (_) {}
  },
  (app) => {
    try {
      var r = app.findFirstRecordByData('prompt_library', 'slug', 'legenda-atacadista')
      r.set('name', 'Legenda Atacadista')
      app.save(r)
    } catch (_) {}
  },
)
