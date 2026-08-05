routerAdd(
  'POST',
  '/backend/v1/track/page-view',
  (e) => {
    try {
      const body = e.requestInfo().body || {}

      const editionId = (body.edition_id || '').trim()
      const pageId = (body.page_id || '').trim()
      const readerId = (body.reader_id || '').trim()
      const sessionId = (body.session_id || '').trim()
      const referrer = (body.referrer || '').trim()
      const duration = Number(body.duration) || 0

      if (!editionId && !pageId) {
        return e.json(200, { ok: true, skipped: true })
      }

      let col
      try {
        col = $app.findCollectionByNameOrId('page_views')
      } catch (_) {
        return e.json(200, { ok: true, skipped: true, reason: 'collection_missing' })
      }

      const record = new Record(col)
      if (editionId) record.set('edition_id', editionId)
      if (pageId) record.set('page_id', pageId)
      if (readerId) record.set('reader_id', readerId)
      if (sessionId) record.set('session_id', sessionId)
      if (referrer) record.set('referrer', referrer)
      record.set('duration', duration)

      try {
        $app.saveNoValidate(record)
      } catch (saveErr) {
        $app.logger().warn('page_view_track save failed', 'error', String(saveErr))
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
