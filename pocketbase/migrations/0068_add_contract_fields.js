migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('ad_proposals')

    if (!col.fields.getByName('contract_number')) {
      col.fields.add(new TextField({ name: 'contract_number' }))
    }
    if (!col.fields.getByName('contract_date_formal')) {
      col.fields.add(new DateField({ name: 'contract_date_formal' }))
    }
    if (!col.fields.getByName('contract_terms')) {
      col.fields.add(new JSONField({ name: 'contract_terms' }))
    }
    if (!col.fields.getByName('contract_signed_at')) {
      col.fields.add(new DateField({ name: 'contract_signed_at' }))
    }

    col.addIndex(
      'idx_ad_proposals_contract_number',
      true,
      'contract_number',
      "contract_number != ''",
    )
    col.addIndex('idx_ad_proposals_delivery_date', false, 'delivery_date', '')

    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('ad_proposals')
    col.removeIndex('idx_ad_proposals_contract_number')
    col.removeIndex('idx_ad_proposals_delivery_date')
    app.save(col)
  },
)
