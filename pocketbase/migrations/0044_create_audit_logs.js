migrate(
  (app) => {
    const collection = new Collection({
      name: 'audit_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'integration_name', type: 'text', required: true },
        {
          name: 'integration_type',
          type: 'select',
          values: ['route', 'event', 'agent'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: ['success', 'error'],
          maxSelect: 1,
        },
        { name: 'executed_at', type: 'date', required: true },
        { name: 'workflow_id', type: 'text' },
        { name: 'error_message', type: 'text' },
        { name: 'agent_name', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_audit_logs_integration ON audit_logs (integration_name)',
        'CREATE INDEX idx_audit_logs_executed ON audit_logs (executed_at)',
        'CREATE INDEX idx_audit_logs_agent ON audit_logs (agent_name)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('audit_logs'))
    } catch (_) {}
  },
)
