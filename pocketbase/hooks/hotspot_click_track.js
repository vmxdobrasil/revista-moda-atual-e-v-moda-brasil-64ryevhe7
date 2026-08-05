routerAdd(
  'POST',
  '/backend/v1/hotspot-click',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const hotspotId = body.hotspot_id

      if (!hotspotId) {
        return e.badRequestError('hotspot_id is required')
      }

      let record
      try {
        record = $app.findRecordById('page_hotspots', hotspotId)
      } catch (err) {
        return e.notFoundError('hotspot not found')
      }

      const current = record.getInt('click_count') || 0
      record.set('click_count', current + 1)
      $app.saveNoValidate(record)

      return e.json(200, { ok: true, click_count: current + 1 })
    } catch (err) {
      $app.logger().error('hotspot_click_track failed', 'error', String(err))
      return e.json(500, { error: 'failed to track click' })
    }
  },
  $apis.requireAuth(),
)
