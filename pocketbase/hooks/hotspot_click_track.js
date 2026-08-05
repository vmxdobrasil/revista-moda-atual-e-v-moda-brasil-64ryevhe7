routerAdd(
  'POST',
  '/backend/v1/analytics/hotspot-click',
  (e) => {
    var body = e.requestInfo().body || {}

    if (!body.hotspot_id) {
      return e.badRequestError('hotspot_id is required')
    }

    try {
      var hotspot = $app.findRecordById('page_hotspots', body.hotspot_id)

      var clicks = hotspot.getInt('click_count') || 0
      hotspot.set('click_count', clicks + 1)

      var linkOrigin = hotspot.getString('link_origin') || 'hotspot'
      var ctaVariant = hotspot.getString('cta_variant') || 'default'
      var pageId = hotspot.getString('page') || ''

      $app.saveNoValidate(hotspot)

      if (pageId) {
        var period = new Date().toISOString().slice(0, 7)
        var contentId = pageId
        var contentType = 'hotspot'

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
          var mClicks = (metricsRecord.getInt('clicks') || 0) + 1
          var mImpressions = metricsRecord.getInt('impressions') || 0
          var mOrders = metricsRecord.getInt('orders') || 0
          var cr = mImpressions > 0 ? Math.round((mOrders / mImpressions) * 10000) / 100 : 0
          metricsRecord.set('clicks', mClicks)
          metricsRecord.set('conversion_rate', cr)
          if (!metricsRecord.getString('cta_variant')) {
            metricsRecord.set('cta_variant', ctaVariant)
          }
          if (!metricsRecord.getString('link_origin')) {
            metricsRecord.set('link_origin', linkOrigin)
          }
          $app.saveNoValidate(metricsRecord)
        } else {
          try {
            var col = $app.findCollectionByNameOrId('conversion_metrics')
            var rec = new Record(col)
            rec.set('content_id', contentId)
            rec.set('content_title', '')
            rec.set('content_type', contentType)
            rec.set('period', period)
            rec.set('impressions', 0)
            rec.set('clicks', 1)
            rec.set('orders', 0)
            rec.set('conversion_rate', 0)
            rec.set('cta_variant', ctaVariant)
            rec.set('link_origin', linkOrigin)
            $app.saveNoValidate(rec)
          } catch (_) {}
        }
      }

      return e.json(200, { success: true, clicks: clicks + 1 })
    } catch (err) {
      return e.json(500, { error: 'failed to track click' })
    }
  },
  $apis.gzip(),
)
