migrate(
  (app) => {
    const editionsCol = app.findCollectionByNameOrId('editions')

    const collection = new Collection({
      name: 'generated_social_content',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'theme', type: 'text', required: true },
        {
          name: 'original_edition',
          type: 'relation',
          collectionId: editionsCol.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'content_data', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('generated_social_content')
    app.delete(collection)
  },
)
