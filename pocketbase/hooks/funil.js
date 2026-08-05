routerAdd(
  'GET',
  '/backend/v1/funil',
  (e) => {
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var query = e.requestInfo().query || {}
    var filterContentType = query['content_type'] || ''
    var filterLinkOrigin = query['link_origin'] || ''
    var filterCtaVariant = query['cta_variant'] || ''
    var filterPeriod = query['period'] || ''

    var filters = []
    var params = {}
    var paramIdx = 0

    if (filterContentType) {
      paramIdx++
      filters.push('content_type = {:p' + paramIdx + '}')
      params['p' + paramIdx] = filterContentType
    }
    if (filterLinkOrigin) {
      paramIdx++
      filters.push('link_origin = {:p' + paramIdx + '}')
      params['p' + paramIdx] = filterLinkOrigin
    }
    if (filterCtaVariant) {
      paramIdx++
      filters.push('cta_variant = {:p' + paramIdx + '}')
      params['p' + paramIdx] = filterCtaVariant
    }
    if (filterPeriod) {
      paramIdx++
      filters.push('period = {:p' + paramIdx + '}')
      params['p' + paramIdx] = filterPeriod
    }

    var filterStr = filters.length > 0 ? filters.join(' && ') : ''

    var allMetrics = []
    try {
      if (filterStr) {
        allMetrics = $app.findRecordsByFilter(
          'conversion_metrics',
          filterStr,
          '-conversion_rate',
          0,
          0,
          params,
        )
      } else {
        allMetrics = $app.findRecordsByFilter('conversion_metrics', '', '-conversion_rate', 0, 0)
      }
    } catch (_) {}

    var totalImpressions = 0
    var totalClicks = 0
    var totalOrders = 0
    var totalConversionRate = 0
    var metricCount = 0

    var byLinkOrigin = {}
    var byCtaVariant = {}
    var byContentType = {}
    var byPeriod = {}

    var contentRanking = []

    for (var i = 0; i < allMetrics.length; i++) {
      var m = allMetrics[i]
      var impressions = m.getInt('impressions') || 0
      var clicks = m.getInt('clicks') || 0
      var orders = m.getInt('orders') || 0
      var cr = m.getFloat('conversion_rate') || 0

      totalImpressions += impressions
      totalClicks += clicks
      totalOrders += orders
      totalConversionRate += cr
      metricCount++

      var origin = m.getString('link_origin') || 'revista'
      var variant = m.getString('cta_variant') || 'default'
      var ct = m.getString('content_type') || 'materia'
      var period = m.getString('period') || 'unknown'

      if (!byLinkOrigin[origin])
        byLinkOrigin[origin] = { impressions: 0, clicks: 0, orders: 0, count: 0, totalCr: 0 }
      byLinkOrigin[origin].impressions += impressions
      byLinkOrigin[origin].clicks += clicks
      byLinkOrigin[origin].orders += orders
      byLinkOrigin[origin].count++
      byLinkOrigin[origin].totalCr += cr

      if (!byCtaVariant[variant])
        byCtaVariant[variant] = { impressions: 0, clicks: 0, orders: 0, count: 0, totalCr: 0 }
      byCtaVariant[variant].impressions += impressions
      byCtaVariant[variant].clicks += clicks
      byCtaVariant[variant].orders += orders
      byCtaVariant[variant].count++
      byCtaVariant[variant].totalCr += cr

      if (!byContentType[ct])
        byContentType[ct] = { impressions: 0, clicks: 0, orders: 0, count: 0, totalCr: 0 }
      byContentType[ct].impressions += impressions
      byContentType[ct].clicks += clicks
      byContentType[ct].orders += orders
      byContentType[ct].count++
      byContentType[ct].totalCr += cr

      if (!byPeriod[period])
        byPeriod[period] = { impressions: 0, clicks: 0, orders: 0, count: 0, totalCr: 0 }
      byPeriod[period].impressions += impressions
      byPeriod[period].clicks += clicks
      byPeriod[period].orders += orders
      byPeriod[period].count++
      byPeriod[period].totalCr += cr

      contentRanking.push({
        content_id: m.getString('content_id'),
        content_title: m.getString('content_title') || '',
        content_type: ct,
        cta_variant: variant,
        link_origin: origin,
        period: period,
        impressions: impressions,
        clicks: clicks,
        orders: orders,
        conversion_rate: cr,
      })
    }

    contentRanking.sort(function (a, b) {
      return b.conversion_rate - a.conversion_rate
    })
    var top10 = contentRanking.slice(0, 10)

    function computeAverages(obj) {
      var result = {}
      for (var key in obj) {
        var v = obj[key]
        result[key] = {
          impressions: v.impressions,
          clicks: v.clicks,
          orders: v.orders,
          avg_conversion_rate: v.count > 0 ? Math.round((v.totalCr / v.count) * 10000) / 10000 : 0,
          count: v.count,
        }
      }
      return result
    }

    var overallCr =
      metricCount > 0 ? Math.round((totalConversionRate / metricCount) * 10000) / 10000 : 0
    var clickThroughRate =
      totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 10000 : 0
    var orderConversionRate =
      totalClicks > 0 ? Math.round((totalOrders / totalClicks) * 10000) / 10000 : 0

    var hotspotStats = { total: 0, totalClicks: 0 }
    try {
      var hotspots = $app.findRecordsByFilter('page_hotspots', '', '-click_count', 0, 0)
      hotspotStats.total = hotspots.length
      for (var hi = 0; hi < hotspots.length; hi++) {
        hotspotStats.totalClicks += hotspots[hi].getInt('click_count') || 0
      }
    } catch (_) {}

    var ordersStats = { total: 0, byOrigin: { revista: 0, hotspot: 0, whatsapp: 0 }, byStatus: {} }
    try {
      var allOrders = $app.findRecordsByFilter('marketplace_orders', '', '-created', 0, 0)
      ordersStats.total = allOrders.length
      for (var oi = 0; oi < allOrders.length; oi++) {
        var ordOrigin = allOrders[oi].getString('origin') || 'revista'
        if (ordersStats.byOrigin[ordOrigin] !== undefined) ordersStats.byOrigin[ordOrigin]++
        var ordStatus = allOrders[oi].getString('status') || 'pending'
        if (!ordersStats.byStatus[ordStatus]) ordersStats.byStatus[ordStatus] = 0
        ordersStats.byStatus[ordStatus]++
      }
    } catch (_) {}

    return e.json(200, {
      summary: {
        total_impressions: totalImpressions,
        total_clicks: totalClicks,
        total_orders: totalOrders,
        avg_conversion_rate: overallCr,
        click_through_rate: clickThroughRate,
        order_conversion_rate: orderConversionRate,
        metric_count: metricCount,
      },
      top_10_content: top10,
      breakdowns: {
        by_link_origin: computeAverages(byLinkOrigin),
        by_cta_variant: computeAverages(byCtaVariant),
        by_content_type: computeAverages(byContentType),
        by_period: computeAverages(byPeriod),
      },
      hotspots: hotspotStats,
      orders: ordersStats,
      filters: {
        content_type: filterContentType || null,
        link_origin: filterLinkOrigin || null,
        cta_variant: filterCtaVariant || null,
        period: filterPeriod || null,
      },
    })
  },
  $apis.requireAuth(),
)
