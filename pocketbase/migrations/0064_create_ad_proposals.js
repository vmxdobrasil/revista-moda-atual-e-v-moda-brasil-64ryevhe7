migrate(
  (app) => {
    var editionsCol = app.findCollectionByNameOrId('editions')

    var collection = new Collection({
      name: 'ad_proposals',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'advertiser', type: 'text', required: true },
        { name: 'campaign', type: 'text' },
        {
          name: 'edition',
          type: 'relation',
          collectionId: editionsCol.id,
          maxSelect: 1,
        },
        {
          name: 'format',
          type: 'select',
          values: [
            'banner',
            'capa',
            'pagina_inteira',
            'sponsored_content',
            'story',
            'editorial_destaque',
          ],
          maxSelect: 1,
        },
        { name: 'position', type: 'text' },
        { name: 'audience_reach', type: 'number' },
        { name: 'suggested_price', type: 'number' },
        { name: 'match_score', type: 'number' },
        { name: 'proposal_data', type: 'json' },
        {
          name: 'status',
          type: 'select',
          values: ['rascunho', 'enviado', 'aceito', 'recusado', 'contrato', 'entregue'],
          maxSelect: 1,
        },
        { name: 'contract_date', type: 'date' },
        { name: 'delivery_date', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_ad_proposals_status ON ad_proposals (status)',
        'CREATE INDEX idx_ad_proposals_edition ON ad_proposals (edition)',
        'CREATE INDEX idx_ad_proposals_advertiser ON ad_proposals (advertiser)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('ad_proposals')
      app.delete(col)
    } catch (_) {}
  },
)
