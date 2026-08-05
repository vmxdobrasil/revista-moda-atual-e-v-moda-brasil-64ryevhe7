migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('marketplace_orders')
    if (!col.fields.getByName('content_id')) {
      col.fields.add(new TextField({ name: 'content_id' }))
    }
    if (!col.fields.getByName('cta_variant')) {
      col.fields.add(new TextField({ name: 'cta_variant' }))
    }
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('marketplace_orders')
    if (col.fields.getByName('content_id')) col.fields.removeByName('content_id')
    if (col.fields.getByName('cta_variant')) col.fields.removeByName('cta_variant')
    app.save(col)
  },
)
