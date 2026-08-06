routerAdd(
  'GET',
  '/backend/v1/concorrentes',
  (e) => {
    var q = e.requestInfo().query || {}
    var platform = q.platform || ''
    var category = q.category || ''
    var sort = q.sort || 'followers'
    var limit = parseInt(q.limit || '0', 10) || 0

    var validPlatforms = ['instagram', 'facebook', 'youtube', 'tiktok', 'site']
    var validSorts = ['followers', 'engagement_rate', 'post_frequency']
    var errors = {}

    if (platform && validPlatforms.indexOf(platform) === -1) {
      errors.platform = 'Invalid platform. Must be one of: ' + validPlatforms.join(', ')
    }
    if (sort && validSorts.indexOf(sort) === -1) {
      errors.sort = 'Invalid sort. Must be one of: ' + validSorts.join(', ')
    }
    if (Object.keys(errors).length > 0) {
      throw new BadRequestError('Invalid query parameters', errors)
    }

    try {
      var filters = []
      var params = {}
      if (platform) {
        filters.push('platform = {:platform}')
        params.platform = platform
      }
      if (category) {
        filters.push('category = {:category}')
        params.category = category
      }
      var filterStr = filters.join(' && ')

      var competitors
      if (filterStr) {
        competitors = $app.findRecordsByFilter(
          'competitors',
          filterStr,
          '-' + sort,
          limit,
          0,
          params,
        )
      } else {
        competitors = $app.findRecordsByFilter('competitors', '', '-' + sort, limit, 0)
      }

      var result = []
      var totalER = 0
      var themesCount = {}
      var topFollowers = null
      var topER = null
      var topFreq = null

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

        totalER += er

        for (var t = 0; t < themes.length; t++) {
          themesCount[themes[t]] = (themesCount[themes[t]] || 0) + 1
        }

        if (!topFollowers || followers > topFollowers.value) {
          topFollowers = { name: c.getString('name'), value: followers }
        }
        if (!topER || er > topER.value) {
          topER = { name: c.getString('name'), value: er }
        }
        if (!topFreq || freq > topFreq.value) {
          topFreq = { name: c.getString('name'), value: freq }
        }

        result.push({
          id: c.id,
          rank: i + 1,
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

      var themesBreakdown = Object.keys(themesCount)
        .map(function (theme) {
          return { theme: theme, count: themesCount[theme] }
        })
        .sort(function (a, b) {
          return b.count - a.count
        })

      return e.json(200, {
        competitors: result,
        summary: {
          total: result.length,
          avg_engagement_rate:
            result.length > 0 ? Math.round((totalER / result.length) * 100) / 100 : 0,
          top_followers: topFollowers,
          top_engagement_rate: topER,
          top_post_frequency: topFreq,
        },
        content_themes_breakdown: themesBreakdown,
      })
    } catch (err) {
      $app.logger().error('concorrentes endpoint error', 'error', err.message)
      return e.json(500, { error: 'Failed to generate competitors report' })
    }
  },
  $apis.requireAuth(),
)
