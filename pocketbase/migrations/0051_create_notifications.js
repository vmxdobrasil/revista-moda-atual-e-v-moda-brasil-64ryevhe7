migrate(
  (app) => {
    const collection = new Collection({
      name: 'notifications',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'message', type: 'text', required: true },
        { name: 'type', type: 'select', values: ['info', 'warning', 'alert'], maxSelect: 1 },
        { name: 'is_read', type: 'bool', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_notifications_is_read ON notifications (is_read)',
        'CREATE INDEX idx_notifications_created ON notifications (created)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('notifications'))
    } catch (_) {}
  },
)
