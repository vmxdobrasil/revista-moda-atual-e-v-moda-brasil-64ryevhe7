routerAdd(
  'POST',
  '/backend/v1/cover/approval',
  (e) => {
    const body = e.requestInfo().body || {}
    const deliveryId = body.delivery_id || ''
    const action = body.action || ''

    if (!deliveryId) return e.badRequestError('delivery_id is required')
    if (!action) return e.badRequestError('action is required')

    let delivery
    try {
      delivery = $app.findRecordById('delivery_queue', deliveryId)
    } catch (_) {
      return e.notFoundError('delivery item not found')
    }

    const currentStatus = delivery.getString('status')
    let newStatus = currentStatus

    if (action === 'submit_review') {
      if (currentStatus !== 'rascunho')
        return e.badRequestError('can only submit drafts for review')
      newStatus = 'em_revisao'
    } else if (action === 'approve') {
      if (currentStatus !== 'em_revisao')
        return e.badRequestError('can only approve items in review')
      newStatus = 'aprovado'
    } else if (action === 'reject') {
      if (currentStatus !== 'em_revisao')
        return e.badRequestError('can only reject items in review')
      newStatus = 'rascunho'
    } else if (action === 'publish') {
      if (currentStatus !== 'aprovado') return e.badRequestError('can only publish approved covers')
      newStatus = 'publicado'
      delivery.set('published_at', new Date().toISOString())
    } else {
      return e.badRequestError('invalid action: ' + action)
    }

    delivery.set('status', newStatus)
    $app.save(delivery)

    if (action === 'publish') {
      let articleContent = delivery.get('article_content')
      if (typeof articleContent === 'string') {
        try {
          articleContent = JSON.parse(articleContent)
        } catch (_) {
          articleContent = {}
        }
      }
      if (articleContent && articleContent.edition_id) {
        try {
          const edition = $app.findRecordById('editions', articleContent.edition_id)
          if (articleContent.cover_url) edition.set('cover_url', articleContent.cover_url)
          if (articleContent.cover_alt_text)
            edition.set('cover_alt_text', articleContent.cover_alt_text)
          if (articleContent.cover_variants)
            edition.set('cover_variants', articleContent.cover_variants)
          $app.save(edition)
        } catch (_) {}
      }
    }

    const auditCol = $app.findCollectionByNameOrId('audit_logs')
    const record = new Record(auditCol)
    record.set('integration_name', 'cover/approval')
    record.set('integration_type', 'agent')
    record.set('status', 'success')
    record.set('executed_at', new Date().toISOString())
    record.set('agent_name', 'cover-editorial-art-director')
    record.set('workflow_id', deliveryId)
    $app.save(record)

    return e.json(200, { delivery_id: deliveryId, status: newStatus })
  },
  $apis.requireAuth(),
)
