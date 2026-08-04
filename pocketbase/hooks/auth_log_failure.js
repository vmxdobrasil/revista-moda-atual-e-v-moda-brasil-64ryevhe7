routerAdd('POST', '/backend/v1/auth/log-failure', (e) => {
  try {
    const body = e.requestInfo().body || {}
    const errorMessage = (body.error_message || 'unknown error').toString().slice(0, 2000)

    const collection = $app.findCollectionByNameOrId('audit_logs')
    const record = new Record(collection)
    record.set('integration_name', 'auth/login')
    record.set('integration_type', 'route')
    record.set('status', 'error')
    record.set('executed_at', new Date().toISOString())
    record.set('error_message', errorMessage)
    record.set('agent_name', 'auth/login')
    record.set('workflow_id', '')
    $app.saveNoValidate(record)

    return e.json(200, { success: true })
  } catch (err) {
    $app.logger().error('failed to log auth failure', 'error', String(err))
    return e.json(500, { error: 'failed to log auth failure' })
  }
})
