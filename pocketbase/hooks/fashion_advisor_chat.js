routerAdd(
  'POST',
  '/backend/v1/agents/fashion-trend-advisor/chat',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const userId = e.auth?.id
      if (!userId) return e.unauthorizedError('auth required')
      if (!body.message?.trim()) return e.badRequestError('message is required')

      const marketIntel = { signals: [], competitors: [] }

      try {
        const signals = $app.findRecordsByFilter(
          'market_signals',
          "signal_type = 'tendencia' || signal_type = 'alerta_concorrente'",
          '-detected_at',
          5,
          0,
        )
        for (let i = 0; i < signals.length; i++) {
          const s = signals[i]
          let compName = ''
          try {
            const comp = $app.findRecordById('competitors', s.getString('competitor'))
            compName = comp.getString('name')
          } catch (_) {}
          marketIntel.signals.push({
            title: s.getString('title'),
            signal_type: s.getString('signal_type'),
            severity: s.getString('severity'),
            competitor_name: compName,
            description: s.getString('description'),
          })
        }
      } catch (_) {}

      try {
        const comps = $app.findRecordsByFilter('competitors', '', '-engagement_rate', 5, 0)
        for (let i = 0; i < comps.length; i++) {
          const c = comps[i]
          marketIntel.competitors.push({
            name: c.getString('name'),
            platform: c.getString('platform'),
            engagement_rate: c.getNumber('engagement_rate'),
            followers: c.getNumber('followers'),
            post_frequency: c.getNumber('post_frequency'),
          })
        }
      } catch (_) {}

      let enrichedMessage = body.message
      if (marketIntel.signals.length > 0 || marketIntel.competitors.length > 0) {
        let context = '\n\n[CONTEXTO DE INTELIGÊNCIA DE MERCADO - MARKET WATCH]\n'
        if (marketIntel.signals.length > 0) {
          context += 'Sinais de mercado recentes:\n'
          for (let i = 0; i < marketIntel.signals.length; i++) {
            const sig = marketIntel.signals[i]
            context += '- ' + sig.title + ' (' + sig.signal_type + ', ' + sig.severity + ')'
            if (sig.competitor_name) context += ' - ' + sig.competitor_name
            if (sig.description) context += ': ' + sig.description
            context += '\n'
          }
        }
        if (marketIntel.competitors.length > 0) {
          context += 'Top concorrentes por engajamento:\n'
          for (let i = 0; i < marketIntel.competitors.length; i++) {
            const cmp = marketIntel.competitors[i]
            context +=
              '- ' +
              cmp.name +
              ' (' +
              cmp.platform +
              '): ' +
              cmp.engagement_rate +
              '% engajamento, ' +
              cmp.followers +
              ' seguidores\n'
          }
        }
        context +=
          '\nUse este contexto para enriquecer suas recomendacoes, citando concorrentes e sinais quando relevante.'
        enrichedMessage = body.message + context
      }

      const conv = $ai.agent('fashion-trend-advisor').getOrCreateConversation({
        user_id: userId,
        id: body.conversation_id || null,
      })

      const iter = $ai.agent('fashion-trend-advisor').chat({
        user_id: userId,
        conversation_id: conv.id,
        message: enrichedMessage,
        stream: true,
      })

      try {
        const alCol = $app.findCollectionByNameOrId('audit_logs')
        const alRec = new Record(alCol)
        alRec.set('integration_name', 'fashion_advisor_chat')
        alRec.set('integration_type', 'route')
        alRec.set('status', 'success')
        alRec.set('executed_at', new Date().toISOString())
        alRec.set('agent_name', 'fashion-trend-advisor')
        $app.save(alRec)
      } catch (_) {}

      e.response.header().set('Content-Type', 'text/event-stream')
      e.response.header().set('Cache-Control', 'no-cache')
      e.response.header().set('X-Conversation-Id', conv.id)
      $response.stream(e, iter)
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'AI temporarily unavailable' })
      }
      if (err instanceof SkipAiAgentsError) {
        const status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'agent request failed' : err.message })
      }
      if (err instanceof SkipAiError) {
        const status = err.status || 502
        return e.json(status, { error: status >= 500 ? 'AI temporarily unavailable' : err.message })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
