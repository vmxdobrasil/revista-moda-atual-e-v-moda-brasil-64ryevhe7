migrate(
  (app) => {
    const prodId = app.findCollectionByNameOrId('marketplace_products').id
    const collection = new Collection({
      name: 'delivery_queue',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'theme', type: 'text', required: true },
        { name: 'article_content', type: 'json' },
        { name: 'caption', type: 'text' },
        { name: 'bio_text', type: 'text' },
        {
          name: 'product',
          type: 'relation',
          required: true,
          collectionId: prodId,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['rascunho', 'em_revisao', 'aprovado', 'publicado'],
          maxSelect: 1,
        },
        { name: 'published_at', type: 'date' },
        { name: 'error_note', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_delivery_queue_status ON delivery_queue (status)'],
    })
    app.save(collection)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('delivery_queue')
      app.delete(col)
    } catch (_) {}
  },
)
