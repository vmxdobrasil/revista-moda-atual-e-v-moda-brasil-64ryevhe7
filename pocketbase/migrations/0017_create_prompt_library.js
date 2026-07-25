migrate(
  (app) => {
    const col = new Collection({
      name: 'prompt_library',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'prompt_content', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          values: ['basic', 'advanced', 'super'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_prompt_library_slug ON prompt_library (slug)'],
    })
    app.save(col)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('prompt_library'))
    } catch (_) {}
  },
)
