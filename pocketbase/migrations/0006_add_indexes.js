migrate(
  (app) => {
    const hotspots = app.findCollectionByNameOrId('page_hotspots')
    hotspots.addIndex('idx_hotspots_page', false, 'page', '')
    app.save(hotspots)

    const pages = app.findCollectionByNameOrId('edition_pages')
    pages.addIndex('idx_pages_edition_pagenum', false, 'edition, page_number', '')
    app.save(pages)
  },
  (app) => {
    const hotspots = app.findCollectionByNameOrId('page_hotspots')
    hotspots.removeIndex('idx_hotspots_page')
    app.save(hotspots)

    const pages = app.findCollectionByNameOrId('edition_pages')
    pages.removeIndex('idx_pages_edition_pagenum')
    app.save(pages)
  },
)
