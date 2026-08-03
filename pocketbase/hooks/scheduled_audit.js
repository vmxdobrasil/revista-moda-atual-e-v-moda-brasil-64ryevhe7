onBootstrap((e) => {
  e.next()

  try {
    cronAdd('scheduled_audit', '0 0 * * *', () => {
      var baseUrl = $secrets.get('PB_INSTANCE_URL') || ''
      if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1)
      var token = $secrets.get('PB_SUPERUSER_TOKEN') || ''

      if (!baseUrl) {
        $app.logger().error('Scheduled audit skipped: PB_INSTANCE_URL not set')
        return
      }

      try {
        var res = $http.send({
          url: baseUrl + '/backend/v1/audit-snapshot/generate',
          method: 'POST',
          headers: { Authorization: token },
          timeout: 120,
        })

        if (res.statusCode === 200 || res.statusCode === 201) {
          $app.logger().info('Scheduled audit snapshot generated')
        } else {
          $app.logger().error('Scheduled audit failed', 'status', res.statusCode)
        }
      } catch (err) {
        $app.logger().error('Scheduled audit error', 'error', String(err))
      }
    })
  } catch (err) {
    $app.logger().error('Failed to register scheduled audit cron', 'error', String(err))
  }
})
