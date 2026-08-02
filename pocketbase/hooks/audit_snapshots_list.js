routerAdd(
  'GET',
  '/backend/v1/audit-snapshots',
  (e) => {
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var records = $app.findRecordsByFilter('audit_snapshots', '', '-created', 50, 0)
    var result = []

    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      result.push({
        id: r.id,
        period: r.getString('period'),
        status: r.getString('status'),
        error_message: r.getString('error_message'),
        created: r.getString('created'),
        updated: r.getString('updated'),
      })
    }

    return e.json(200, result)
  },
  $apis.requireAuth(),
)
