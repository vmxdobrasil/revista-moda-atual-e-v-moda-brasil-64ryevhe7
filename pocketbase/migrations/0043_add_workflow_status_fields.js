migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('workflow_results')

    if (!col.fields.getByName('status')) {
      col.fields.add(
        new SelectField({
          name: 'status',
          values: ['processing', 'completed', 'failed'],
          maxSelect: 1,
        }),
      )
    }

    if (!col.fields.getByName('error_note')) {
      col.fields.add(
        new TextField({
          name: 'error_note',
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('workflow_results')
    var sf = col.fields.getByName('status')
    if (sf) col.fields.remove(sf)
    var ef = col.fields.getByName('error_note')
    if (ef) col.fields.remove(ef)
    app.save(col)
  },
)
