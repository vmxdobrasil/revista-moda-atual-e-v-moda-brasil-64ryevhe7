routerAdd(
  'POST',
  '/backend/v1/audit-snapshot/generate',
  (e) => {
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var now = new Date()
    var periodKey =
      now.getUTCFullYear() +
      '-' +
      String(now.getUTCMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getUTCDate()).padStart(2, '0') +
      ' ' +
      String(now.getUTCHours()).padStart(2, '0') +
      ':00'

    try {
      var existing = $app.findFirstRecordByData('audit_snapshots', 'period', periodKey)
      if (existing) {
        return e.json(200, { id: existing.id, period: periodKey, status: 'already_exists' })
      }
    } catch (_) {}

    var col = $app.findCollectionByNameOrId('audit_snapshots')
    var record = new Record(col)
    record.set('period', periodKey)

    try {
      var baseUrl = $secrets.get('PB_INSTANCE_URL') || ''
      if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1)
      var token = $secrets.get('PB_SUPERUSER_TOKEN') || ''

      if (!baseUrl) {
        record.set('status', 'error')
        record.set('error_message', 'PB_INSTANCE_URL not configured')
        $app.save(record)
        return e.json(500, { error: 'PB_INSTANCE_URL not configured' })
      }

      var res = $http.send({
        url: baseUrl + '/backend/v1/audit-report',
        method: 'GET',
        headers: { Authorization: token },
        timeout: 60,
      })

      if (res.statusCode !== 200) {
        record.set('status', 'error')
        record.set('error_message', 'HTTP ' + res.statusCode)
        $app.save(record)
        $app.logger().error('Audit snapshot generation failed', 'status', res.statusCode)
        return e.json(500, { error: 'Failed to generate report', status: res.statusCode })
      }

      record.set('snapshot_data', res.json)
      record.set('status', 'success')
      $app.save(record)
      $app.logger().info('Audit snapshot saved', 'period', periodKey)

      return e.json(201, { id: record.id, period: periodKey, status: 'success' })
    } catch (err) {
      record.set('status', 'error')
      record.set('error_message', String(err))
      $app.save(record)
      $app.logger().error('Audit snapshot error', 'error', String(err))
      return e.json(500, { error: String(err) })
    }
  },
  $apis.requireAuth(),
)
