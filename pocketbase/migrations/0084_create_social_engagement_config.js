migrate(
  (app) => {
    const collection = new Collection({
      name: 'social_engagement_config',
      type: 'base',
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'encrypted_credentials', type: 'text', required: false },
        { name: 'is_validated', type: 'bool', required: false },
        { name: 'account_name', type: 'text', required: false },
        { name: 'account_id', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('social_engagement_config')
      app.delete(col)
    } catch (_) {}
  },
)
