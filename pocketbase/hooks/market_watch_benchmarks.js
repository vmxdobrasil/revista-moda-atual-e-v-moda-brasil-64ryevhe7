routerAdd(
  'GET',
  '/backend/v1/market-watch/benchmarks',
  (e) => {
    try {
      var posts = $app.findRecordsByFilter('social_posts', '', '-engagement_rate', 0, 0)
      var competitors = $app.findRecordsByFilter('competitors', '', '-engagement_rate', 0, 0)

      var totalViews = 0
      var totalER = 0
      var totalPosts = posts.length

      for (var i = 0; i < posts.length; i++) {
        totalViews += posts[i].getInt('views') || 0
        totalER += posts[i].getFloat('engagement_rate') || 0
      }

      var avgER = totalPosts > 0 ? Math.round((totalER / totalPosts) * 10000) / 10000 : 0

      var compData = []
      for (var j = 0; j < competitors.length; j++) {
        var c = competitors[j]
        compData.push({
          name: c.getString('name'),
          followers: c.getInt('followers') || 0,
          engagement_rate: c.getFloat('engagement_rate') || 0,
          post_frequency: c.getInt('post_frequency') || 0,
        })
      }

      return e.json(200, {
        revista_moda_atual: {
          avg_engagement_rate: avgER,
          total_posts: totalPosts,
          total_views: totalViews,
        },
        competitors: compData,
        comparison: {
          engagement_vs_avg:
            avgER > 0
              ? Math.round(
                  ((avgER -
                    compData.reduce(function (s, c) {
                      return s + c.engagement_rate
                    }, 0) /
                      (compData.length || 1)) /
                    avgER) *
                    10000,
                ) / 100
              : 0,
          best_competitor: compData.length > 0 ? compData[0].name : '',
          best_competitor_er: compData.length > 0 ? compData[0].engagement_rate : 0,
        },
      })
    } catch (err) {
      return e.json(500, { error: 'Failed to generate benchmarks' })
    }
  },
  $apis.requireAuth(),
)
