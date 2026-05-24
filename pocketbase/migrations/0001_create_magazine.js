migrate(
  (app) => {
    const editions = new Collection({
      name: 'editions',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'cover_url', type: 'url' },
        { name: 'description', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(editions)

    const pages = new Collection({
      name: 'edition_pages',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'edition',
          type: 'relation',
          required: true,
          collectionId: editions.id,
          cascadeDelete: true,
        },
        { name: 'page_number', type: 'number' },
        { name: 'image_url', type: 'url' },
        { name: 'toc_title', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(pages)

    const hotspots = new Collection({
      name: 'page_hotspots',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'page',
          type: 'relation',
          required: true,
          collectionId: pages.id,
          cascadeDelete: true,
        },
        { name: 'x', type: 'number', required: true },
        { name: 'y', type: 'number', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'text' },
        { name: 'link', type: 'url' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(hotspots)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('page_hotspots'))
    app.delete(app.findCollectionByNameOrId('edition_pages'))
    app.delete(app.findCollectionByNameOrId('editions'))
  },
)
