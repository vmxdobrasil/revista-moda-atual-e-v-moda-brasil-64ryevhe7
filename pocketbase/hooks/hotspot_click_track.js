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

      $app.saveNoValidate(hotspot)

      return e.json(200, { success: true, clicks: clicks + 1 })
    } catch (err) {
      return e.json(500, { error: 'failed to track click' })
    }
  },
  $apis.requireAuth(),
)
