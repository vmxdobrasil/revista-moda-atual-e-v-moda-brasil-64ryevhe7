routerAdd(
  'POST',
  '/backend/v1/cta',
  (e) => {
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var body = e.requestInfo().body || {}
    var contentId = (body.content_id || '').trim()
    var contentType = (body.content_type || '').trim()
    var theme = (body.theme || '').trim()
    var link = (body.link || '').trim()

    var validTypes = ['materia', 'legenda', 'story', 'banner', 'hotspot']
    var errors = {}
    if (!contentId) errors.content_id = 'content_id é obrigatório'
    if (!contentType) errors.content_type = 'content_type é obrigatório'
    else if (validTypes.indexOf(contentType) === -1)
      errors.content_type = 'Valores aceitos: materia, legenda, story, banner, hotspot'

    var errorKeys = Object.keys(errors)
    if (errorKeys.length > 0) {
      throw new BadRequestError('Dados inválidos', errors)
    }

    var contentMetrics = []
    try {
      contentMetrics = $app.findRecordsByFilter(
        'conversion_metrics',
        'content_id = {:cid}',
        '-created',
        10,
        0,
        { cid: contentId },
      )
    } catch (_) {}

    var typeMetrics = []
    try {
      typeMetrics = $app.findRecordsByFilter(
        'conversion_metrics',
        'content_type = {:ct}',
        '-conversion_rate',
        30,
        0,
        { ct: contentType },
      )
    } catch (_) {}

    var variantStats = {}
    var originStats = {}
    for (var i = 0; i < typeMetrics.length; i++) {
      var m = typeMetrics[i]
      var variant = m.getString('cta_variant') || 'default'
      var origin = m.getString('link_origin') || 'revista'
      var cr = m.getFloat('conversion_rate') || 0
      var clicks = m.getInt('clicks') || 0
      var orders = m.getInt('orders') || 0
      var impressions = m.getInt('impressions') || 0

      if (!variantStats[variant])
        variantStats[variant] = { impressions: 0, clicks: 0, orders: 0, count: 0, totalCr: 0 }
      variantStats[variant].impressions += impressions
      variantStats[variant].clicks += clicks
      variantStats[variant].orders += orders
      variantStats[variant].count++
      variantStats[variant].totalCr += cr

      if (!originStats[origin])
        originStats[origin] = { impressions: 0, clicks: 0, orders: 0, count: 0, totalCr: 0 }
      originStats[origin].impressions += impressions
      originStats[origin].clicks += clicks
      originStats[origin].orders += orders
      originStats[origin].count++
      originStats[origin].totalCr += cr
    }

    var bestVariant = 'default'
    var bestVariantCr = 0
    for (var v in variantStats) {
      var avgV = variantStats[v].count > 0 ? variantStats[v].totalCr / variantStats[v].count : 0
      if (avgV > bestVariantCr) {
        bestVariantCr = avgV
        bestVariant = v
      }
    }

    var bestOrigin = 'revista'
    var bestOriginCr = 0
    for (var o in originStats) {
      var avgO = originStats[o].count > 0 ? originStats[o].totalCr / originStats[o].count : 0
      if (avgO > bestOriginCr) {
        bestOriginCr = avgO
        bestOrigin = o
      }
    }

    var hotspotData = []
    try {
      hotspotData = $app.findRecordsByFilter(
        'page_hotspots',
        "cta_variant != ''",
        '-conversion_rate',
        10,
        0,
      )
    } catch (_) {}

    var ordersByOrigin = { revista: 0, hotspot: 0, whatsapp: 0 }
    try {
      var allOrders = $app.findRecordsByFilter('marketplace_orders', '', '-created', 200, 0)
      for (var oi = 0; oi < allOrders.length; oi++) {
        var ordOrigin = allOrders[oi].getString('origin') || 'revista'
        if (ordersByOrigin[ordOrigin] !== undefined) ordersByOrigin[ordOrigin]++
      }
    } catch (_) {}

    var contextStr = JSON.stringify({
      content_id: contentId,
      content_type: contentType,
      theme: theme,
      link: link,
      existing_metrics: contentMetrics.map(function (m) {
        return {
          cta_variant: m.getString('cta_variant'),
          link_origin: m.getString('link_origin'),
          impressions: m.getInt('impressions'),
          clicks: m.getInt('clicks'),
          orders: m.getInt('orders'),
          conversion_rate: m.getFloat('conversion_rate'),
        }
      }),
      best_performing_variant: bestVariant,
      best_variant_avg_conversion_rate: bestVariantCr,
      best_performing_origin: bestOrigin,
      best_origin_avg_conversion_rate: bestOriginCr,
      variant_stats: variantStats,
      origin_stats: originStats,
      orders_by_origin: ordersByOrigin,
      top_hotspots: hotspotData.map(function (h) {
        return {
          title: h.getString('title'),
          cta_variant: h.getString('cta_variant'),
          link_origin: h.getString('link_origin'),
          click_count: h.getInt('click_count'),
          conversion_rate: h.getFloat('conversion_rate'),
        }
      }),
    })

    var systemPrompt = [
      'Você é o agente de conversão da Revista MODA ATUAL.',
      'Sua tarefa é sugerir CTAs otimizados para conteúdos baseados em dados reais de conversão.',
      'Cada sugestão deve incluir um cta_variant (texto curto do CTA) e um link_origin (revista, hotspot ou whatsapp).',
      'Baseie-se nos dados de performance histórica fornecidos no contexto.',
      'Retorne APENAS JSON válido (sem markdown, sem code fences) com esta estrutura:',
      '{"suggestions":[{"cta_variant":"","link_origin":"","rationale":"","expected_conversion_rate":0}]}',
      'Forneça exatamente 3 sugestões. link_origin deve ser um de: revista, hotspot, whatsapp.',
      'Idioma: Português Brasileiro.',
    ].join('\n')

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'CONTEXTO:\n' + contextStr },
        ],
      })

      var rawContent = reply.choices[0].message.content
      var jsonStr = rawContent
      var fenceMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (fenceMatch) {
        jsonStr = fenceMatch[1].trim()
      } else {
        var braceMatch = rawContent.match(/\{[\s\S]*\}/)
        if (braceMatch) jsonStr = braceMatch[0]
      }

      var result
      try {
        result = JSON.parse(jsonStr)
      } catch (_) {
        result = { suggestions: [] }
      }

      var validOrigins = ['revista', 'hotspot', 'whatsapp']
      var suggestions = (result.suggestions || []).filter(function (s) {
        return s.cta_variant && validOrigins.indexOf(s.link_origin) !== -1
      })

      if (suggestions.length === 0) {
        suggestions = [
          {
            cta_variant: bestVariant || 'Compre agora',
            link_origin: bestOrigin || 'revista',
            rationale: 'Baseado no melhor desempenho histórico para ' + contentType,
            expected_conversion_rate: bestVariantCr,
          },
          {
            cta_variant: 'Ver na revista',
            link_origin: 'revista',
            rationale: 'Direciona para a página da revista',
            expected_conversion_rate: 0,
          },
          {
            cta_variant: 'Pedir no WhatsApp',
            link_origin: 'whatsapp',
            rationale: 'Conversão direta via WhatsApp',
            expected_conversion_rate: 0,
          },
        ]
      }

      try {
        var alCol = $app.findCollectionByNameOrId('audit_logs')
        var alRec = new Record(alCol)
        alRec.set('integration_name', 'cta')
        alRec.set('integration_type', 'route')
        alRec.set('status', 'success')
        alRec.set('executed_at', new Date().toISOString())
        alRec.set('agent_name', 'conversion')
        alRec.set('workflow_id', contentId)
        $app.save(alRec)
      } catch (_) {}

      return e.json(200, {
        content_id: contentId,
        content_type: contentType,
        data_context: {
          best_variant: bestVariant,
          best_origin: bestOrigin,
          orders_by_origin: ordersByOrigin,
        },
        suggestions: suggestions,
      })
    } catch (err) {
      try {
        var alColE = $app.findCollectionByNameOrId('audit_logs')
        var alRecE = new Record(alColE)
        alRecE.set('integration_name', 'cta')
        alRecE.set('integration_type', 'route')
        alRecE.set('status', 'error')
        alRecE.set('executed_at', new Date().toISOString())
        alRecE.set('agent_name', 'conversion')
        alRecE.set('error_message', (err && err.message) || 'unknown error')
        $app.save(alRecE)
      } catch (_) {}

      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'IA temporariamente indisponível' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { error: 'Erro ao comunicar com IA' })
      }

      return e.json(200, {
        content_id: contentId,
        content_type: contentType,
        data_context: {
          best_variant: bestVariant,
          best_origin: bestOrigin,
          orders_by_origin: ordersByOrigin,
        },
        suggestions: [
          {
            cta_variant: bestVariant || 'Compre agora',
            link_origin: bestOrigin || 'revista',
            rationale: 'Sugestão baseada em dados históricos (IA indisponível)',
            expected_conversion_rate: bestVariantCr,
          },
          {
            cta_variant: 'Ver na revista',
            link_origin: 'revista',
            rationale: 'Direciona para a página da revista',
            expected_conversion_rate: 0,
          },
          {
            cta_variant: 'Pedir no WhatsApp',
            link_origin: 'whatsapp',
            rationale: 'Conversão direta via WhatsApp',
            expected_conversion_rate: 0,
          },
        ],
      })
    }
  },
  $apis.requireAuth(),
)
