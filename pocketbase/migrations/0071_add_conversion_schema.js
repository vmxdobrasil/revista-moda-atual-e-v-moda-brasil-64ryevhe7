migrate(
  (app) => {
    const hotspotsCol = app.findCollectionByNameOrId('page_hotspots')
    if (!hotspotsCol.fields.getByName('link_origin')) {
      hotspotsCol.fields.add(
        new SelectField({
          name: 'link_origin',
          values: ['revista', 'hotspot', 'whatsapp'],
          maxSelect: 1,
        }),
      )
    }
    if (!hotspotsCol.fields.getByName('conversion_rate')) {
      hotspotsCol.fields.add(new NumberField({ name: 'conversion_rate', min: 0, max: 100 }))
    }
    if (!hotspotsCol.fields.getByName('cta_variant')) {
      hotspotsCol.fields.add(new TextField({ name: 'cta_variant' }))
    }
    app.save(hotspotsCol)

    const ordersCol = app.findCollectionByNameOrId('marketplace_orders')
    if (!ordersCol.fields.getByName('origin')) {
      ordersCol.fields.add(
        new SelectField({
          name: 'origin',
          values: ['revista', 'hotspot', 'whatsapp'],
          maxSelect: 1,
        }),
      )
    }
    app.save(ordersCol)

    const conversionCol = new Collection({
      name: 'conversion_metrics',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'content_id', type: 'text', required: true },
        { name: 'content_title', type: 'text' },
        {
          name: 'content_type',
          type: 'select',
          values: ['materia', 'legenda', 'story', 'banner', 'hotspot'],
          maxSelect: 1,
        },
        { name: 'period', type: 'text' },
        { name: 'impressions', type: 'number', min: 0 },
        { name: 'clicks', type: 'number', min: 0 },
        { name: 'orders', type: 'number', min: 0 },
        { name: 'conversion_rate', type: 'number', min: 0, max: 100 },
        { name: 'cta_variant', type: 'text' },
        {
          name: 'link_origin',
          type: 'select',
          values: ['revista', 'hotspot', 'whatsapp'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_conversion_metrics_content_id ON conversion_metrics (content_id)',
        'CREATE INDEX idx_conversion_metrics_period ON conversion_metrics (period)',
        'CREATE INDEX idx_conversion_metrics_link_origin ON conversion_metrics (link_origin)',
        'CREATE INDEX idx_conversion_metrics_cta_variant ON conversion_metrics (cta_variant)',
        'CREATE INDEX idx_conversion_metrics_conversion_rate ON conversion_metrics (conversion_rate)',
      ],
    })
    app.save(conversionCol)
  },
  (app) => {
    const hotspotsCol = app.findCollectionByNameOrId('page_hotspots')
    if (hotspotsCol.fields.getByName('link_origin')) hotspotsCol.fields.removeByName('link_origin')
    if (hotspotsCol.fields.getByName('conversion_rate'))
      hotspotsCol.fields.removeByName('conversion_rate')
    if (hotspotsCol.fields.getByName('cta_variant')) hotspotsCol.fields.removeByName('cta_variant')
    app.save(hotspotsCol)

    const ordersCol = app.findCollectionByNameOrId('marketplace_orders')
    if (ordersCol.fields.getByName('origin')) ordersCol.fields.removeByName('origin')
    app.save(ordersCol)

    try {
      app.delete(app.findCollectionByNameOrId('conversion_metrics'))
    } catch (_) {}
  },
)
