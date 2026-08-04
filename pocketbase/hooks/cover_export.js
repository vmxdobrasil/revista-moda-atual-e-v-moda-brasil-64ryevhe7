routerAdd(
  'POST',
  '/backend/v1/cover/export-log',
  (e) => {
    const body = e.requestInfo().body || {}
    const editionId = body.edition_id || ''
    const format = body.format || 'png'
    const status = body.status || 'success'
    const errorMessage = body.error_message || ''

    const auditCol = $app.findCollectionByNameOrId('audit_logs')
    const record = new Record(auditCol)
    record.set('integration_name', 'cover/export')
    record.set('integration_type', 'agent')
    record.set('status', status)
    record.set('executed_at', new Date().toISOString())
    record.set('agent_name', 'cover-editorial-art-director')
    if (errorMessage) record.set('error_message', errorMessage)
    if (editionId) record.set('workflow_id', editionId)
    $app.save(record)

    return e.json(200, { logged: true })
  },
  $apis.requireAuth(),
)
