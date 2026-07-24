routerAdd('POST', '/backend/v1/analytics/page-view', (e) => {
  const body = e.requestInfo().body || {}
  const pageId = body.pageId
  if (!pageId || typeof pageId !== 'string') {
    return e.badRequestError('pageId is required')
  }
  try {
    const page = $app.findRecordById('edition_pages', pageId)
    const editionId = page.getString('edition')
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
    return e.json(200, { success: true })
  } catch (err) {
    return e.json(500, { error: 'Failed to track page view' })
  }
})
