migrate(
  (app) => {
    const collection = new Collection({
      name: 'audit_snapshots',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'snapshot_data', type: 'json', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['success', 'error'],
          maxSelect: 1,
        },
        { name: 'error_message', type: 'text' },
        { name: 'period', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_audit_snapshots_created ON audit_snapshots (created)',
        'CREATE INDEX idx_audit_snapshots_status ON audit_snapshots (status)',
        'CREATE UNIQUE INDEX idx_audit_snapshots_period ON audit_snapshots (period)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('audit_snapshots'))
    } catch (_) {}
  },
)
