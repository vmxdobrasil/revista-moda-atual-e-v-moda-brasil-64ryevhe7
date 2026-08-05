migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('advertisements')

    if (!col.fields.getByName('advertiser')) {
      col.fields.add(new TextField({ name: 'advertiser' }))
    }
    if (!col.fields.getByName('campaign')) {
      col.fields.add(new TextField({ name: 'campaign' }))
    }
    if (!col.fields.getByName('price')) {
      col.fields.add(new NumberField({ name: 'price' }))
    }
    if (!col.fields.getByName('status')) {
      col.fields.add(
        new SelectField({
          name: 'status',
          values: ['rascunho', 'aprovado', 'em_entrega', 'entregue', 'concluido', 'cancelado'],
          maxSelect: 1,
        }),
      )
    }
    if (!col.fields.getByName('delivery')) {
      col.fields.add(new DateField({ name: 'delivery' }))
    }

    col.addIndex('idx_advertisements_status', false, 'status', '')
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('advertisements')
    col.removeIndex('idx_advertisements_status')
    app.save(col)
  },
)
