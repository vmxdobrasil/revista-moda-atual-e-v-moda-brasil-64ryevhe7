migrate(
  (app) => {
    var collection = new Collection({
      name: 'skills',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          required: true,
          values: [
            'producao_editorial',
            'seo',
            'distribuicao',
            'nutricao',
            'monetizacao',
            'conversao',
            'inteligencia_competitiva',
          ],
          maxSelect: 1,
        },
        { name: 'summary', type: 'text' },
        { name: 'flow', type: 'json' },
        { name: 'rules', type: 'json' },
        { name: 'responsibilities', type: 'json' },
        { name: 'related_agents', type: 'json' },
        { name: 'body', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['rascunho', 'publicado'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_skills_slug ON skills (slug)',
        'CREATE INDEX idx_skills_category ON skills (category)',
        'CREATE INDEX idx_skills_status ON skills (status)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('skills')
      app.delete(col)
    } catch (_) {}
  },
)
