migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('edition_pages')

    if (!col.fields.getByName('template')) {
      col.fields.add(
        new SelectField({
          name: 'template',
          maxSelect: 1,
          values: ['default', 'editorial', 'marketing', 'holofote', 'entrevista'],
        }),
      )
    }

    if (!col.fields.getByName('template_data')) {
      col.fields.add(
        new JSONField({
          name: 'template_data',
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('edition_pages')

    if (col.fields.getByName('template')) {
      col.fields.removeByName('template')
    }
    if (col.fields.getByName('template_data')) {
      col.fields.removeByName('template_data')
    }

    app.save(col)
  },
)
