routerAdd(
  'POST',
  '/backend/v1/market-signals/search',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const query = (body.query || '').trim()
      if (!query) return e.badRequestError('query is required')

      const safeQuery = query.replace(/'/g, "''")
      const limit = body.limit || 10
      const results = []

      try {
        const signals = $app.findRecordsByFilter(
          'market_signals',
          "title ~ '" + safeQuery + "' || description ~ '" + safeQuery + "'",
          '-detected_at',
          limit,
          0,
        )
        for (let i = 0; i < signals.length; i++) {
          const s = signals[i]
          let compName = ''
          try {
            const comp = $app.findRecordById('competitors', s.getString('competitor'))
            compName = comp.getString('name')
          } catch (_) {}
          results.push({
            id: s.id,
            title: s.getString('title'),
            signal_type: s.getString('signal_type'),
            severity: s.getString('severity'),
            status: s.getString('status'),
            description: s.getString('description'),
            competitor_name: compName,
            detected_at: s.getString('detected_at'),
          })
        }
      } catch (err) {
        return e.json(500, { error: 'Failed to search market signals' })
      }

      return e.json(200, { signals: results })
    } catch (err) {
      return e.json(500, { error: 'Internal server error' })
    }
  },
  $apis.requireAuth(),
)
