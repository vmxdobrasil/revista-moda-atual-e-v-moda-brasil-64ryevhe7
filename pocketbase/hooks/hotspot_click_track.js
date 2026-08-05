routerAdd('POST', '/backend/v1/analytics/hotspot-click', (e) => {
  var body = e.requestInfo().body || {}
  var hotspotId = body.hotspotId
  if (!hotspotId || typeof hotspotId !== 'string') {
    return e.badRequestError('hotspotId is required')
  }
  try {
    var hotspot = $app.findRecordById('page_hotspots', hotspotId)

    $app
      .db()
      .newQuery(
        'UPDATE page_hotspots SET click_count = COALESCE(click_count, 0) + 1 WHERE id = {:id}',
      )
      .bind({ id: hotspotId })
      .execute()

    var ctaVariant = hotspot.getString('cta_variant') || 'default'
    var linkOrigin = hotspot.getString('link_origin') || 'hotspot'
    var contentId = 'hotspot_' + hotspotId
    var contentTitle = hotspot.getString('title') || ''
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
      var clicks = (metricsRecord.getInt('clicks') || 0) + 1
      var impressions = metricsRecord.getInt('impressions') || 0
      var orders = metricsRecord.getInt('orders') || 0
      var cr = impressions > 0 ? Math.round((orders / impressions) * 10000) / 100 : 0
      metricsRecord.set('clicks', clicks)
      metricsRecord.set('conversion_rate', cr)
      $app.save(metricsRecord)
    } else {
      try {
        var col = $app.findCollectionByNameOrId('conversion_metrics')
        var rec = new Record(col)
        rec.set('content_id', contentId)
        rec.set('content_title', contentTitle)
        rec.set('content_type', 'hotspot')
        rec.set('period', period)
        rec.set('impressions', 0)
        rec.set('clicks', 1)
        rec.set('orders', 0)
        rec.set('conversion_rate', 0)
        rec.set('cta_variant', ctaVariant)
        rec.set('link_origin', linkOrigin)
        $app.save(rec)
      } catch (_) {}
    }

    return e.json(200, { success: true })
  } catch (err) {
    return e.json(500, { error: 'Failed to track hotspot click' })
  }
})
