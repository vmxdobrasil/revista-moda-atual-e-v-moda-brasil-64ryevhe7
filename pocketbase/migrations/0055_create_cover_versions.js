migrate(
  (app) => {
    const editionsCol = app.findCollectionByNameOrId('editions')

    const coverVersions = new Collection({
      name: 'cover_versions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'edition',
          type: 'relation',
          required: true,
          collectionId: editionsCol.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'version_number', type: 'number', required: true, onlyInt: true },
        {
          name: 'cover_image',
          type: 'file',
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'cover_alt_text', type: 'text' },
        { name: 'cover_variants', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_cover_versions_edition ON cover_versions (edition)'],
    })
    app.save(coverVersions)

    const socialPosts = app.findCollectionByNameOrId('social_posts')
    if (!socialPosts.fields.getByName('edition')) {
      socialPosts.fields.add(
        new RelationField({
          name: 'edition',
          collectionId: editionsCol.id,
          maxSelect: 1,
        }),
      )
      app.save(socialPosts)
    }

    const deliveryQueue = app.findCollectionByNameOrId('delivery_queue')
    const productField = deliveryQueue.fields.getByName('product')
    if (productField) {
      try {
        productField.required = false
      } catch (_) {}
    }
    app.save(deliveryQueue)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('cover_versions'))
    } catch (_) {}
    try {
      const sp = app.findCollectionByNameOrId('social_posts')
      const ef = sp.fields.getByName('edition')
      if (ef) {
        sp.fields.remove(ef)
        app.save(sp)
      }
    } catch (_) {}
  },
)
