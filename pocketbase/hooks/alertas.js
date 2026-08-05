routerAdd(
  'GET',
  '/backend/v1/alertas',
  (e) => {
    var q = e.requestInfo().query || {}
    var signal_type = q.signal_type || ''
    var severity = q.severity || ''
    var status = q.status || ''
    var competitor = q.competitor || ''
    var from = q.from || ''
    var to = q.to || ''
    var limit = parseInt(q.limit || '100', 10) || 100

    var validSignalTypes = [
      'tendencia',
      'alerta_concorrente',
      'mencao_marca',
      'comportamento_consumidor',
    ]
    var validSeverities = ['info', 'atencao', 'critico']
    var validStatuses = ['novo', 'em_analise', 'notificado', 'arquivado']
    var errors = {}

    if (signal_type && validSignalTypes.indexOf(signal_type) === -1) {
      errors.signal_type = 'Invalid signal_type. Must be one of: ' + validSignalTypes.join(', ')
    }
    if (severity && validSeverities.indexOf(severity) === -1) {
      errors.severity = 'Invalid severity. Must be one of: ' + validSeverities.join(', ')
    }
    if (status && validStatuses.indexOf(status) === -1) {
      errors.status = 'Invalid status. Must be one of: ' + validStatuses.join(', ')
    }
    if (Object.keys(errors).length > 0) {
      throw new BadRequestError('Invalid query parameters', errors)
    }

    try {
      var filters = []
      var params = {}
      if (signal_type) {
        filters.push('signal_type = {:st}')
        params.st = signal_type
      }
      if (severity) {
        filters.push('severity = {:sev}')
        params.sev = severity
      }
      if (status) {
        filters.push('status = {:stat}')
        params.stat = status
      }
      if (competitor) {
        filters.push('competitor = {:comp}')
        params.comp = competitor
      }
      if (from) {
        filters.push('detected_at >= {:df}')
        params.df = from
      }
      if (to) {
        filters.push('detected_at <= {:dt}')
        params.dt = to
      }

      var filterStr = filters.join(' && ')
      var signals

      if (filterStr) {
        signals = $app.findRecordsByFilter(
          'market_signals',
          filterStr,
          '-detected_at',
          limit,
          0,
          params,
        )
      } else {
        signals = $app.findRecordsByFilter('market_signals', '', '-detected_at', limit, 0)
      }

      var result = []
      var byType = {}
      var bySeverity = {}
      var byStatus = {}

      for (var i = 0; i < signals.length; i++) {
        var s = signals[i]
        var compName = ''
        var compId = s.getString('competitor')
        if (compId) {
          try {
            var comp = $app.findRecordById('competitors', compId)
            compName = comp.getString('name')
          } catch (_) {}
        }

        var related = s.getString('related_data')
        try {
          related = related ? JSON.parse(related) : null
        } catch (_) {
          related = null
        }

        var st = s.getString('signal_type')
        var sev = s.getString('severity')
        var stat = s.getString('status')

        byType[st] = (byType[st] || 0) + 1
        bySeverity[sev] = (bySeverity[sev] || 0) + 1
        byStatus[stat] = (byStatus[stat] || 0) + 1

        result.push({
          id: s.id,
          signal_type: st,
          title: s.getString('title'),
          description: s.getString('description'),
          competitor_id: compId,
          competitor_name: compName,
          severity: sev,
          source: s.getString('source'),
          detected_at: s.getString('detected_at'),
          status: stat,
          related_data: related,
        })
      }

      return e.json(200, {
        signals: result,
        summary: {
          total: result.length,
          by_type: byType,
          by_severity: bySeverity,
          by_status: byStatus,
        },
      })
    } catch (err) {
      $app.logger().error('alertas endpoint error', 'error', err.message)
      return e.json(500, { error: 'Failed to fetch market signals' })
    }
  },
  $apis.requireSuperuserAuth(),
)
