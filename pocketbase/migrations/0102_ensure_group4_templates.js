migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('edition_pages')
    var field = col.fields.getByName('template')
    if (!field) return

    var existingValues = field.options.values || []
    var required = ['story_social', 'newsletter_preview', 'capa_edicao', 'fashion_editorial']

    var changed = false
    for (var i = 0; i < required.length; i++) {
      if (existingValues.indexOf(required[i]) === -1) {
        existingValues.push(required[i])
        changed = true
      }
    }

    if (changed) {
      col.fields.removeByName('template')
      col.fields.add(
        new SelectField({
          name: 'template',
          maxSelect: 1,
          values: existingValues,
        }),
      )
      app.save(col)
    }
  },
  (app) => {},
)
