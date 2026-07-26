migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('story_texts')
    col.viewRule = ''
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('story_texts')
    col.viewRule = "@request.auth.id != ''"
    app.save(col)
  },
)
