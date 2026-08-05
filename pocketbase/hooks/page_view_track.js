routerAdd(
  'POST',
  '/backend/v1/track/page-view',
  (e) => {
    try {
      var body = e.requestInfo().body || {}

      var pageId = (body.page_id || '').trim()
      var editionId = (body.edition_id || '').trim()

      if (!pageId && !editionId) {
        return e.json(200, { ok: true, skipped: true })
      }

      if (pageId) {
        var contentType = 'materia'
        var contentTitle = ''

        try {
          var page = $app.findRecordById('edition_pages', pageId)
          var tmpl = page.getString('template') || 'default'
          var templateMap = {
            default: 'materia',
            editorial: 'materia',
            marketing: 'banner',
            holofote: 'hotspot',
            entrevista: 'materia',
          }
          contentType = templateMap[tmpl] || 'materia'
          contentTitle = page.getString('toc_title') || ''
          if (!editionId) {
            editionId = page.getString('edition') || ''
          }
          var vc = page.getInt('view_count') || 0
          page.set('view_count', vc + 1)
          $app.saveNoValidate(page)
        } catch (_) {}

        var period = new Date().toISOString().slice(0, 7)
        var contentId = pageId

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
          var orders = metricsRecord.getInt('orders') || 0
          var cr = impressions > 0 ? Math.round((orders / impressions) * 10000) / 100 : 0
          metricsRecord.set('impressions', impressions)
          metricsRecord.set('conversion_rate', cr)
          if (contentTitle && !metricsRecord.getString('content_title')) {
            metricsRecord.set('content_title', contentTitle)
          }
          $app.saveNoValidate(metricsRecord)
        } else {
          try {
            var col = $app.findCollectionByNameOrId('conversion_metrics')
            var rec = new Record(col)
            rec.set('content_id', contentId)
            rec.set('content_title', contentTitle)
            rec.set('content_type', contentType)
            rec.set('period', period)
            rec.set('impressions', 1)
            rec.set('clicks', 0)
            rec.set('orders', 0)
            rec.set('conversion_rate', 0)
            rec.set('cta_variant', 'default')
            rec.set('link_origin', 'revista')
            $app.saveNoValidate(rec)
          } catch (_) {}
        }
      }

      return e.json(200, { ok: true })
    } catch (err) {
      $app.logger().error('page_view_track error', 'error', String(err))
      return e.json(200, { ok: true, error: String(err) })
    }
  },
  $apis.gzip(),
)

routerAdd('GET', '/backend/v1/track/page-view', (e) => {
  return e.json(200, { ok: true, method: 'GET', hint: 'Use POST to track a page view' })
})
