migrate(
  (app) => {
    const collection = new Collection({
      name: 'advertisements',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'image',
          type: 'file',
          required: false,
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        },
        { name: 'url', type: 'text', required: false },
        { name: 'title', type: 'text', required: true },
        { name: 'is_active', type: 'bool', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_advertisements_active ON advertisements (is_active)'],
    })
    app.save(collection)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('advertisements')
      app.delete(col)
    } catch (_) {}
  },
)
