routerAdd(
  'POST',
  '/backend/v1/hotspot/click',
  (e) => {
    const body = e.requestInfo().body || {}

    if (!body.hotspot_id || !body.page_id) {
      return e.badRequestError('hotspot_id and page_id are required')
    }

    try {
      const col = $app.findCollectionByNameOrId('magazine_pages')
      const record = $app.findRecordById('magazine_pages', body.page_id)

      const clicks = record.getInt('hotspot_clicks') || 0
      record.set('hotspot_clicks', clicks + 1)

      if (body.hotspot_id) {
        const hotspots = record.get('hotspots') || []
        if (Array.isArray(hotspots)) {
          const updated = hotspots.map(function (h) {
            if (h && h.id === body.hotspot_id) {
              h.clicks = (h.clicks || 0) + 1
            }
            return h
          })
          record.set('hotspots', updated)
        }
      }

      $app.saveNoValidate(record)

      return e.json(200, { success: true, clicks: clicks + 1 })
    } catch (err) {
      return e.json(500, { error: 'failed to track click' })
    }
  },
  $apis.requireAuth(),
)
