routerAdd(
  'GET',
  '/backend/v1/funil',
  (e) => {
    try {
      var query = e.requestInfo().query || {}

      var filterParts = []
      if (query.period)
        filterParts.push("period = '" + String(query.period).replace(/[^0-9-]/g, '') + "'")
      if (query.content_type)
        filterParts.push(
          "content_type = '" + String(query.content_type).replace(/[^a-z]/g, '') + "'",
        )
      if (query.link_origin)
        filterParts.push("link_origin = '" + String(query.link_origin).replace(/[^a-z]/g, '') + "'")
      if (query.cta_variant)
        filterParts.push(
          "cta_variant = '" + String(query.cta_variant).replace(/[^a-zA-Z0-9_-]/g, '') + "'",
        )

      var filterStr = filterParts.join(' && ')
      var records = $app.findRecordsByFilter('conversion_metrics', filterStr, '-created', 0, 0)

      if (records.length === 0) {
        return e.json(200, {
          kpis: { impressions: 0, clicks: 0, orders: 0, conversion_rate: 0 },
          top_contents: [],
          by_link_origin: [],
          by_cta_variant: [],
        })
      }

      var totalImp = 0,
        totalClk = 0,
        totalOrd = 0
      var contentMap = {},
        originMap = {},
        variantMap = {}

      function calcCR(imp, ord) {
        return imp > 0 ? Math.round((ord / imp) * 10000) / 100 : 0
      }

      for (var i = 0; i < records.length; i++) {
        var r = records[i]
        var imp = r.getInt('impressions') || 0
        var clk = r.getInt('clicks') || 0
        var ord = r.getInt('orders') || 0
        totalImp += imp
        totalClk += clk
        totalOrd += ord

        var cid = r.getString('content_id')
        if (!contentMap[cid]) {
          contentMap[cid] = {
            content_id: cid,
            content_title: r.getString('content_title'),
            content_type: r.getString('content_type'),
            impressions: 0,
            clicks: 0,
            orders: 0,
            cta_variant: r.getString('cta_variant'),
            link_origin: r.getString('link_origin'),
          }
        }
        contentMap[cid].impressions += imp
        contentMap[cid].clicks += clk
        contentMap[cid].orders += ord

        var origin = r.getString('link_origin') || 'unknown'
        if (!originMap[origin])
          originMap[origin] = { link_origin: origin, impressions: 0, clicks: 0, orders: 0 }
        originMap[origin].impressions += imp
        originMap[origin].clicks += clk
        originMap[origin].orders += ord

        var variant = r.getString('cta_variant') || 'default'
        if (!variantMap[variant])
          variantMap[variant] = { cta_variant: variant, impressions: 0, clicks: 0, orders: 0 }
        variantMap[variant].impressions += imp
        variantMap[variant].clicks += clk
        variantMap[variant].orders += ord
      }

      var topContents = []
      for (var key in contentMap) {
        var c = contentMap[key]
        if (c.clicks >= 5) {
          c.conversion_rate = calcCR(c.impressions, c.orders)
          topContents.push(c)
        }
      }
      topContents.sort(function (a, b) {
        return b.conversion_rate - a.conversion_rate
      })
      topContents = topContents.slice(0, 10)

      var byOrigin = []
      for (var ok in originMap) {
        originMap[ok].conversion_rate = calcCR(originMap[ok].impressions, originMap[ok].orders)
        byOrigin.push(originMap[ok])
      }
      byOrigin.sort(function (a, b) {
        return b.impressions - a.impressions
      })

      var byVariant = []
      for (var vk in variantMap) {
        variantMap[vk].conversion_rate = calcCR(variantMap[vk].impressions, variantMap[vk].orders)
        byVariant.push(variantMap[vk])
      }
      byVariant.sort(function (a, b) {
        return b.conversion_rate - a.conversion_rate
      })

      return e.json(200, {
        kpis: {
          impressions: totalImp,
          clicks: totalClk,
          orders: totalOrd,
          conversion_rate: calcCR(totalImp, totalOrd),
        },
        top_contents: topContents,
        by_link_origin: byOrigin,
        by_cta_variant: byVariant,
      })
    } catch (err) {
      $app.logger().error('funil endpoint error', 'error', String(err))
      return e.json(500, { error: 'Failed to generate funnel report' })
    }
  },
  $apis.requireAuth(),
)
