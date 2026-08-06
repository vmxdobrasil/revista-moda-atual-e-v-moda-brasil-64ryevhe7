routerAdd(
  'GET',
  '/backend/v1/market-watch/per-platform',
  (e) => {
    try {
      const platforms = ['instagram', 'facebook', 'youtube', 'whatsapp']
      const result = { platforms: [] }

      for (let p = 0; p < platforms.length; p++) {
        const plat = platforms[p]
        const magazineData = { platform: plat, avg_engagement: 0, total_posts: 0, has_data: false }
        const competitorData = { platform: plat, competitors: [], avg_engagement: 0 }

        try {
          const posts = $app.findRecordsByFilter(
            'social_posts',
            "platform = '" + plat + "'",
            '-post_date',
            100,
            0,
          )
          if (posts.length > 0) {
            let totalEng = 0
            for (let i = 0; i < posts.length; i++) {
              totalEng += posts[i].getNumber('engagement_rate') || 0
            }
            magazineData.avg_engagement = totalEng / posts.length
            magazineData.total_posts = posts.length
            magazineData.has_data = true
          }
        } catch (_) {}

        try {
          const comps = $app.findRecordsByFilter(
            'competitors',
            "platform = '" + plat + "'",
            '-engagement_rate',
            20,
            0,
          )
          let compEng = 0
          for (let i = 0; i < comps.length; i++) {
            const c = comps[i]
            const er = c.getNumber('engagement_rate') || 0
            compEng += er
            competitorData.competitors.push({
              name: c.getString('name'),
              engagement_rate: er,
              followers: c.getNumber('followers') || 0,
              post_frequency: c.getNumber('post_frequency') || 0,
            })
          }
          if (comps.length > 0) {
            competitorData.avg_engagement = compEng / comps.length
          }
        } catch (_) {}

        result.platforms.push({ magazine: magazineData, competitors: competitorData })
      }

      return e.json(200, result)
    } catch (err) {
      return e.json(500, { error: 'Failed to load per-platform benchmarks' })
    }
  },
  $apis.requireAuth(),
)
