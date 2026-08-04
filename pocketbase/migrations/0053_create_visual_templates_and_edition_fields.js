migrate(
  (app) => {
    var collection = new Collection({
      name: 'visual_templates',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        {
          name: 'template',
          type: 'select',
          values: ['default', 'editorial', 'marketing', 'holofote', 'entrevista'],
          maxSelect: 1,
        },
        { name: 'description', type: 'text' },
        { name: 'palette', type: 'json' },
        { name: 'typography', type: 'json' },
        { name: 'composition', type: 'json' },
        {
          name: 'thumbnail',
          type: 'file',
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_visual_templates_slug ON visual_templates (slug)'],
    })
    app.save(collection)

    var editionsCol = app.findCollectionByNameOrId('editions')
    if (!editionsCol.fields.getByName('cover_image')) {
      editionsCol.fields.add(
        new FileField({
          name: 'cover_image',
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    if (!editionsCol.fields.getByName('cover_alt_text')) {
      editionsCol.fields.add(new TextField({ name: 'cover_alt_text' }))
    }
    if (!editionsCol.fields.getByName('cover_variants')) {
      editionsCol.fields.add(new JSONField({ name: 'cover_variants' }))
    }
    app.save(editionsCol)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('visual_templates'))
    } catch (_) {}
    var editionsCol = app.findCollectionByNameOrId('editions')
    var ci = editionsCol.fields.getByName('cover_image')
    if (ci) editionsCol.fields.remove(ci)
    var cat = editionsCol.fields.getByName('cover_alt_text')
    if (cat) editionsCol.fields.remove(cat)
    var cv = editionsCol.fields.getByName('cover_variants')
    if (cv) editionsCol.fields.remove(cv)
    app.save(editionsCol)
  },
)
