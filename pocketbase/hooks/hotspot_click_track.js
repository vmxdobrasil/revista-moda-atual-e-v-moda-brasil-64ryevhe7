routerAdd('POST', '/backend/v1/analytics/hotspot-click', (e) => {
  const body = e.requestInfo().body || {}
  const hotspotId = body.hotspotId
  if (!hotspotId || typeof hotspotId !== 'string') {
    return e.badRequestError('hotspotId is required')
  }
  try {
    $app.findRecordById('page_hotspots', hotspotId)
    $app
      .db()
      .newQuery(
        'UPDATE page_hotspots SET click_count = COALESCE(click_count, 0) + 1 WHERE id = {:id}',
      )
      .bind({ id: hotspotId })
      .execute()
    return e.json(200, { success: true })
  } catch (err) {
    return e.json(500, { error: 'Failed to track hotspot click' })
  }
})
