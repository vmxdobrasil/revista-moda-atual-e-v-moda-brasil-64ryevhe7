routerAdd(
  'GET',
  '/backend/v1/market-benchmarks',
  (e) => {
    try {
      var posts = $app.findRecordsByFilter('social_posts', '', '-post_date', 0, 0)
      var totalER = 0
      var recentPosts = 0
      var now = new Date()
      var thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      for (var i = 0; i < posts.length; i++) {
        totalER += posts[i].getFloat('engagement_rate') || 0
        var pd = posts[i].getString('post_date')
        if (pd && new Date(pd) >= thirtyDaysAgo) recentPosts++
      }
      var magazineER = posts.length > 0 ? totalER / posts.length : 0
      var magazineFreq = Math.round((recentPosts / 4.3) * 10) / 10

      var comps = $app.findRecordsByFilter('competitors', '', '-engagement_rate', 0, 0)
      var compER = 0
      var compFreq = 0
      var ranking = []

      for (var j = 0; j < comps.length; j++) {
        var er = comps[j].getFloat('engagement_rate') || 0
        var freq = comps[j].getFloat('post_frequency') || 0
        compER += er
        compFreq += freq
        ranking.push({
          name: comps[j].getString('name'),
          platform: comps[j].getString('platform'),
          engagement_rate: er,
          post_frequency: freq,
          followers: comps[j].getInt('followers') || 0,
        })
      }

      var avgCompER = comps.length > 0 ? Math.round((compER / comps.length) * 100) / 100 : 0
      var avgCompFreq = comps.length > 0 ? Math.round((compFreq / comps.length) * 10) / 10 : 0

      return e.json(200, {
        magazine: {
          engagement_rate: Math.round(magazineER * 10000) / 10000,
          post_frequency: magazineFreq,
          total_posts: posts.length,
        },
        competitors_avg: {
          engagement_rate: avgCompER,
          post_frequency: avgCompFreq,
          total_competitors: comps.length,
        },
        ranking: ranking,
      })
    } catch (err) {
      $app.logger().error('market-benchmarks endpoint error', 'error', err.message)
      return e.json(500, { error: 'Failed to generate benchmarks' })
    }
  },
  $apis.requireAuth(),
)
