migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('marketplace_orders')
    var changed = false
    if (!col.fields.getByName('content_id')) {
      col.fields.add(new TextField({ name: 'content_id' }))
      changed = true
    }
    if (!col.fields.getByName('cta_variant')) {
      col.fields.add(new TextField({ name: 'cta_variant' }))
      changed = true
    }
    if (changed) {
      app.save(col)
    }
  },
  (app) => {
    var col = app.findCollectionByNameOrId('marketplace_orders')
    var changed = false
    if (col.fields.getByName('content_id')) {
      col.fields.removeByName('content_id')
      changed = true
    }
    if (col.fields.getByName('cta_variant')) {
      col.fields.removeByName('cta_variant')
      changed = true
    }
    if (changed) {
      app.save(col)
    }
  },
)
