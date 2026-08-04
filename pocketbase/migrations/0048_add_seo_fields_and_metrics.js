migrate(
  (app) => {
    var editionsCol = app.findCollectionByNameOrId('editions')

    if (!editionsCol.fields.getByName('seo_title')) {
      editionsCol.fields.add(new TextField({ name: 'seo_title', max: 200 }))
    }
    if (!editionsCol.fields.getByName('seo_description')) {
      editionsCol.fields.add(new TextField({ name: 'seo_description', max: 320 }))
    }
    if (!editionsCol.fields.getByName('keywords')) {
      editionsCol.fields.add(new TextField({ name: 'keywords' }))
    }
    if (!editionsCol.fields.getByName('canonical_url')) {
      editionsCol.fields.add(new URLField({ name: 'canonical_url' }))
    }
    if (!editionsCol.fields.getByName('slug')) {
      editionsCol.fields.add(new TextField({ name: 'slug' }))
    }
    if (!editionsCol.fields.getByName('og_image_url')) {
      editionsCol.fields.add(new URLField({ name: 'og_image_url' }))
    }
    app.save(editionsCol)

    var pagesCol = app.findCollectionByNameOrId('edition_pages')

    if (!pagesCol.fields.getByName('seo_title')) {
      pagesCol.fields.add(new TextField({ name: 'seo_title', max: 200 }))
    }
    if (!pagesCol.fields.getByName('seo_description')) {
      pagesCol.fields.add(new TextField({ name: 'seo_description', max: 320 }))
    }
    if (!pagesCol.fields.getByName('keywords')) {
      pagesCol.fields.add(new TextField({ name: 'keywords' }))
    }
    if (!pagesCol.fields.getByName('canonical_url')) {
      pagesCol.fields.add(new URLField({ name: 'canonical_url' }))
    }
    if (!pagesCol.fields.getByName('slug')) {
      pagesCol.fields.add(new TextField({ name: 'slug' }))
    }
    app.save(pagesCol)

    var editionsId = app.findCollectionByNameOrId('editions').id
    var pagesId = app.findCollectionByNameOrId('edition_pages').id

    var seoMetricsCol = new Collection({
      name: 'seo_metrics',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'keyword', type: 'text', required: true },
        { name: 'position', type: 'number' },
        { name: 'search_volume', type: 'number' },
        { name: 'difficulty', type: 'number' },
        { name: 'edition', type: 'relation', collectionId: editionsId, maxSelect: 1 },
        { name: 'page', type: 'relation', collectionId: pagesId, maxSelect: 1 },
        { name: 'url', type: 'url' },
        { name: 'tracked_date', type: 'date', required: true },
        { name: 'previous_position', type: 'number' },
        { name: 'clicks', type: 'number' },
        { name: 'impressions', type: 'number' },
        { name: 'ctr', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_seo_metrics_keyword ON seo_metrics (keyword)',
        'CREATE INDEX idx_seo_metrics_tracked_date ON seo_metrics (tracked_date)',
        'CREATE INDEX idx_seo_metrics_edition ON seo_metrics (edition)',
        'CREATE INDEX idx_seo_metrics_page ON seo_metrics (page)',
      ],
    })
    app.save(seoMetricsCol)
  },
  (app) => {
    try {
      var editionsCol = app.findCollectionByNameOrId('editions')
      var fieldsToRemove = [
        'seo_title',
        'seo_description',
        'keywords',
        'canonical_url',
        'slug',
        'og_image_url',
      ]
      for (var i = 0; i < fieldsToRemove.length; i++) {
        var ef = editionsCol.fields.getByName(fieldsToRemove[i])
        if (ef) editionsCol.fields.remove(ef)
      }
      app.save(editionsCol)
    } catch (_) {}

    try {
      var pagesCol = app.findCollectionByNameOrId('edition_pages')
      var pageFieldsToRemove = ['seo_title', 'seo_description', 'keywords', 'canonical_url', 'slug']
      for (var j = 0; j < pageFieldsToRemove.length; j++) {
        var pf = pagesCol.fields.getByName(pageFieldsToRemove[j])
        if (pf) pagesCol.fields.remove(pf)
      }
      app.save(pagesCol)
    } catch (_) {}

    try {
      app.delete(app.findCollectionByNameOrId('seo_metrics'))
    } catch (_) {}
  },
)
