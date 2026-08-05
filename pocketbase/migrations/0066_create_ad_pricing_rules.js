migrate(
  (app) => {
    var collection = new Collection({
      name: 'ad_pricing_rules',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'format',
          type: 'select',
          required: true,
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
        { name: 'base_price', type: 'number', required: true },
        { name: 'reach_multiplier', type: 'json' },
        { name: 'position_multiplier', type: 'json' },
        { name: 'active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_ad_pricing_rules_format ON ad_pricing_rules (format)',
        'CREATE INDEX idx_ad_pricing_rules_active ON ad_pricing_rules (active)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('ad_pricing_rules')
      app.delete(col)
    } catch (_) {}
  },
)
