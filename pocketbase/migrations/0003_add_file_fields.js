migrate(
  (app) => {
    const editions = app.findCollectionByNameOrId('editions')
    editions.fields.add(
      new FileField({
        name: 'cover_file',
        maxSelect: 1,
        maxSize: 10485760,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      }),
    )
    editions.createRule = "@request.auth.id != ''"
    editions.updateRule = "@request.auth.id != ''"
    editions.deleteRule = "@request.auth.id != ''"
    app.save(editions)

    const pages = app.findCollectionByNameOrId('edition_pages')
    pages.fields.add(
      new FileField({
        name: 'image_file',
        maxSelect: 1,
        maxSize: 10485760,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      }),
    )
    pages.createRule = "@request.auth.id != ''"
    pages.updateRule = "@request.auth.id != ''"
    pages.deleteRule = "@request.auth.id != ''"
    app.save(pages)
  },
  (app) => {
    const editions = app.findCollectionByNameOrId('editions')
    editions.fields.removeByName('cover_file')
    editions.createRule = null
    editions.updateRule = null
    editions.deleteRule = null
    app.save(editions)

    const pages = app.findCollectionByNameOrId('edition_pages')
    pages.fields.removeByName('image_file')
    pages.createRule = null
    pages.updateRule = null
    pages.deleteRule = null
    app.save(pages)
  },
)
