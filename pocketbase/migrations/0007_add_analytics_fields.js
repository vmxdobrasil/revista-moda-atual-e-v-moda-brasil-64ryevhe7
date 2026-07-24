migrate(
  (app) => {
    const editions = app.findCollectionByNameOrId('editions')
    if (!editions.fields.getByName('view_count')) {
      editions.fields.add(new NumberField({ name: 'view_count', min: 0 }))
    }
    app.save(editions)
    app.db().newQuery('UPDATE editions SET view_count = 0 WHERE view_count IS NULL').execute()

    const pages = app.findCollectionByNameOrId('edition_pages')
    if (!pages.fields.getByName('view_count')) {
      pages.fields.add(new NumberField({ name: 'view_count', min: 0 }))
    }
    app.save(pages)
    app.db().newQuery('UPDATE edition_pages SET view_count = 0 WHERE view_count IS NULL').execute()

    const hotspots = app.findCollectionByNameOrId('page_hotspots')
    if (!hotspots.fields.getByName('click_count')) {
      hotspots.fields.add(new NumberField({ name: 'click_count', min: 0 }))
    }
    app.save(hotspots)
    app
      .db()
      .newQuery('UPDATE page_hotspots SET click_count = 0 WHERE click_count IS NULL')
      .execute()
  },
  (app) => {
    const editions = app.findCollectionByNameOrId('editions')
    if (editions.fields.getByName('view_count')) {
      editions.fields.removeByName('view_count')
    }
    app.save(editions)

    const pages = app.findCollectionByNameOrId('edition_pages')
    if (pages.fields.getByName('view_count')) {
      pages.fields.removeByName('view_count')
    }
    app.save(pages)

    const hotspots = app.findCollectionByNameOrId('page_hotspots')
    if (hotspots.fields.getByName('click_count')) {
      hotspots.fields.removeByName('click_count')
    }
    app.save(hotspots)
  },
)
