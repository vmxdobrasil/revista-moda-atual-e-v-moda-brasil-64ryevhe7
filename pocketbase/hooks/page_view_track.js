routerAdd('POST', '/backend/v1/analytics/page-view', (e) => {
  var body = e.requestInfo().body || {}
  var pageId = body.pageId
  if (!pageId || typeof pageId !== 'string') {
    return e.badRequestError('pageId is required')
  }
  try {
    var page = $app.findRecordById('edition_pages', pageId)
    var editionId = page.getString('edition')

    $app
      .db()
      .newQuery(
        'UPDATE edition_pages SET view_count = COALESCE(view_count, 0) + 1 WHERE id = {:id}',
      )
      .bind({ id: pageId })
      .execute()

    if (editionId) {
      $app
        .db()
        .newQuery('UPDATE editions SET view_count = COALESCE(view_count, 0) + 1 WHERE id = {:id}')
        .bind({ id: editionId })
        .execute()
    }

    var contentId = 'page_' + pageId
    var contentTitle = page.getString('toc_title') || 'Pagina ' + (page.getInt('page_number') || '')
    var period = new Date().toISOString().slice(0, 7)

    var metricsRecord = null
    try {
      var existing = $app.findRecordsByFilter(
        'conversion_metrics',
        'content_id = {:cid} && period = {:p}',
        '-created',
        1,
        0,
        { cid: contentId, p: period },
      )
      if (existing.length > 0) metricsRecord = existing[0]
    } catch (_) {}

    if (metricsRecord) {
      var impressions = (metricsRecord.getInt('impressions') || 0) + 1
      var clicks = metricsRecord.getInt('clicks') || 0
      var orders = metricsRecord.getInt('orders') || 0
      var cr = impressions > 0 ? Math.round((orders / impressions) * 10000) / 100 : 0
      metricsRecord.set('impressions', impressions)
      metricsRecord.set('conversion_rate', cr)
      $app.save(metricsRecord)
    } else {
      try {
        var col = $app.findCollectionByNameOrId('conversion_metrics')
        var rec = new Record(col)
        rec.set('content_id', contentId)
        rec.set('content_title', contentTitle)
        rec.set('content_type', 'materia')
        rec.set('period', period)
        rec.set('impressions', 1)
        rec.set('clicks', 0)
        rec.set('orders', 0)
        rec.set('conversion_rate', 0)
        rec.set('cta_variant', 'default')
        rec.set('link_origin', 'revista')
        $app.save(rec)
      } catch (_) {}
    }

    return e.json(200, { success: true })
  } catch (err) {
    return e.json(500, { error: 'Failed to track page view' })
  }
})
