migrate(
  (app) => {
    var skillsId = app.findCollectionByNameOrId('skills').id

    var collection = new Collection({
      name: 'skills_tasks',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'skill',
          type: 'relation',
          required: true,
          collectionId: skillsId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'task_key', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        {
          name: 'assigned_to',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: ['pending', 'in_progress', 'completed'],
          maxSelect: 1,
        },
        { name: 'completed_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_skills_tasks_skill ON skills_tasks (skill)',
        'CREATE INDEX idx_skills_tasks_status ON skills_tasks (status)',
        'CREATE INDEX idx_skills_tasks_assigned ON skills_tasks (assigned_to)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('skills_tasks'))
    } catch (_) {}
  },
)
