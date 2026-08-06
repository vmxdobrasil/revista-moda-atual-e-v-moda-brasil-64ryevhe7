routerAdd(
  'GET',
  '/backend/v1/social-engagement/metrics',
  (e) => {
    try {
      var userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')

      var logs = $app.findRecordsByFilter('engagement_log', '', '-created', 0, 0)
      var leads = $app.findRecordsByFilter('dm_leads', '', '-created', 0, 0)
      var convs = $app.findRecordsByFilter('ig_conversations', '', '-last_message_at', 0, 0)

      var totalLogs = logs.length
      var totalComments = 0
      var totalDMs = 0
      var respondedCount = 0
      var pendingCount = 0
      var humanCount = 0
      var ignoredCount = 0
      var byIntent = {}
      var byType = {}

      for (var i = 0; i < logs.length; i++) {
        var l = logs[i]
        var t = l.getString('type')
        var intent = l.getString('intent')
        var status = l.getString('status')

        if (t === 'comment') totalComments++
        if (t === 'dm') totalDMs++

        byIntent[intent] = (byIntent[intent] || 0) + 1
        byType[t] = (byType[t] || 0) + 1

        if (status === 'respondido') respondedCount++
        if (status === 'pendente') pendingCount++
        if (status === 'encaminhado_humano') humanCount++
        if (status === 'ignorado') ignoredCount++
      }

      var totalLeads = leads.length
      var newLeads = 0
      var contactedLeads = 0
      var convertedLeads = 0
      var leadsByIntent = {}

      for (var j = 0; j < leads.length; j++) {
        var ld = leads[j]
        var li = ld.getString('intent')
        var ls = ld.getString('status')
        leadsByIntent[li] = (leadsByIntent[li] || 0) + 1
        if (ls === 'novo') newLeads++
        if (ls === 'contatado') contactedLeads++
        if (ls === 'convertido') convertedLeads++
      }

      var responseRate = totalLogs > 0 ? Math.round((respondedCount / totalLogs) * 10000) / 100 : 0
      var conversionRate =
        totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 10000) / 100 : 0

      return e.json(200, {
        summary: {
          total_interactions: totalLogs,
          total_comments: totalComments,
          total_dms: totalDMs,
          responded: respondedCount,
          pending: pendingCount,
          forwarded_human: humanCount,
          ignored: ignoredCount,
          response_rate: responseRate,
        },
        leads: {
          total: totalLeads,
          novo: newLeads,
          contatado: contactedLeads,
          convertido: convertedLeads,
          conversion_rate: conversionRate,
          by_intent: leadsByIntent,
        },
        conversations: {
          total: convs.length,
        },
        by_intent: byIntent,
        by_type: byType,
      })
    } catch (err) {
      $app.logger().error('social-engagement metrics error', 'error', String(err))
      return e.json(500, { error: 'Failed to fetch metrics' })
    }
  },
  $apis.requireAuth(),
)
