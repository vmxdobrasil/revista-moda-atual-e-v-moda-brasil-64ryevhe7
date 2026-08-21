migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('subscribers')

    if (!col.fields.getByName('avatar')) {
      col.fields.add(
        new FileField({
          name: 'avatar',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        }),
      )
    }

    if (!col.fields.getByName('avatar_url')) {
      col.fields.add(
        new URLField({
          name: 'avatar_url',
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('subscribers')
    try {
      col.fields.removeByName('avatar')
    } catch (_) {}
    try {
      col.fields.removeByName('avatar_url')
    } catch (_) {}
    app.save(col)
  },
)
