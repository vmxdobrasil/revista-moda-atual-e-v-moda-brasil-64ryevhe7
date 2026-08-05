onRecordAfterCreateSuccess((e) => {
  var order = e.record
  var origin = order.getString('origin') || 'revista'
  var contentId = order.getString('content_id') || ''
  var ctaVariant = order.getString('cta_variant') || 'default'

  if (!contentId) return e.next()

  var period = new Date().toISOString().slice(0, 7)

  var contentTitle = ''
  try {
    var page = $app.findRecordById('edition_pages', contentId)
    contentTitle = page.getString('toc_title') || ''
  } catch (_) {}

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
    var orders = (metricsRecord.getInt('orders') || 0) + 1
    var impressions = metricsRecord.getInt('impressions') || 0
    var cr = impressions > 0 ? Math.round((orders / impressions) * 10000) / 100 : 0
    metricsRecord.set('orders', orders)
    metricsRecord.set('conversion_rate', cr)
    if (contentTitle && !metricsRecord.getString('content_title')) {
      metricsRecord.set('content_title', contentTitle)
    }
    if (!metricsRecord.getString('cta_variant')) {
      metricsRecord.set('cta_variant', ctaVariant)
    }
    if (!metricsRecord.getString('link_origin')) {
      metricsRecord.set('link_origin', origin)
    }
    $app.save(metricsRecord)
  } else {
    try {
      var col = $app.findCollectionByNameOrId('conversion_metrics')
      var rec = new Record(col)
      rec.set('content_id', contentId)
      rec.set('content_title', contentTitle)
      rec.set('content_type', 'materia')
      rec.set('period', period)
      rec.set('impressions', 0)
      rec.set('clicks', 0)
      rec.set('orders', 1)
      rec.set('conversion_rate', 0)
      rec.set('cta_variant', ctaVariant)
      rec.set('link_origin', origin)
      $app.save(rec)
    } catch (_) {}
  }

  return e.next()
}, 'marketplace_orders')
