routerAdd(
  'GET',
  '/backend/v1/concorrentes',
  (e) => {
    try {
      var competitors = $app.findRecordsByFilter('competitors', '', '-engagement_rate', 0, 0)
      var result = []
      var totalFollowers = 0
      var totalER = 0
      var totalFreq = 0

      for (var i = 0; i < competitors.length; i++) {
        var c = competitors[i]
        var catName = ''
        var catId = c.getString('category')
        if (catId) {
          try {
            var cat = $app.findRecordById('top60_categories', catId)
            catName = cat.getString('name')
          } catch (_) {}
        }

        var themes = c.getString('content_themes')
        try {
          themes = themes ? JSON.parse(themes) : []
        } catch (_) {
          themes = []
        }

        var er = c.getFloat('engagement_rate') || 0
        var followers = c.getInt('followers') || 0
        var freq = c.getFloat('post_frequency') || 0

        totalFollowers += followers
        totalER += er
        totalFreq += freq

        result.push({
          id: c.id,
          name: c.getString('name'),
          description: c.getString('description'),
          category_name: catName,
          platform: c.getString('platform'),
          social_handle: c.getString('social_handle'),
          website: c.getString('website'),
          followers: followers,
          engagement_rate: er,
          post_frequency: freq,
          content_themes: themes,
          last_checked_at: c.getString('last_checked_at'),
          notes: c.getString('notes'),
        })
      }

      var ranking = result
        .map(function (r) {
          return { name: r.name, engagement_rate: r.engagement_rate, followers: r.followers }
        })
        .sort(function (a, b) {
          return b.engagement_rate - a.engagement_rate
        })

      return e.json(200, {
        competitors: result,
        ranking: ranking,
        summary: {
          total: result.length,
          avg_followers: result.length > 0 ? Math.round(totalFollowers / result.length) : 0,
          avg_engagement_rate:
            result.length > 0 ? Math.round((totalER / result.length) * 100) / 100 : 0,
          avg_post_frequency:
            result.length > 0 ? Math.round((totalFreq / result.length) * 10) / 10 : 0,
        },
      })
    } catch (err) {
      $app.logger().error('concorrentes endpoint error', 'error', err.message)
      return e.json(500, { error: 'Failed to generate competitors report' })
    }
  },
  $apis.requireAuth(),
)
