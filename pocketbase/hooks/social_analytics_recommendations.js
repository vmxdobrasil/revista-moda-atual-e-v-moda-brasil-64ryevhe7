routerAdd(
  'GET',
  '/backend/v1/social-analytics/recommendations',
  (e) => {
    try {
      const allPosts = $app.findRecordsByFilter('social_posts', '', '-engagement_rate', 0, 0)
      if (allPosts.length === 0) {
        return e.json(200, {
          recommendations: [],
          patterns: { hooks: [], formats: [], themes: [] },
        })
      }

      var provocativeKeywords = [
        'não use',
        'pare de',
        'ninguém te conta',
        'eu disse',
        'sem erro',
        'segredo',
        'parecem baratas',
      ]
      var poeticKeywords = ['guia', 'tendência', 'lookbook', 'análise', 'tutorial', 'definitivo']

      var formatStats = {}
      var topHooks = []
      var bottomHooks = []
      var top25Pct = Math.max(1, Math.ceil(allPosts.length * 0.25))
      var bottom25Pct = Math.max(1, Math.ceil(allPosts.length * 0.25))

      for (var i = 0; i < allPosts.length; i++) {
        var p = allPosts[i]
        var fmt = p.getString('format')
        var er = p.getFloat('engagement_rate') || 0
        if (!formatStats[fmt]) {
          formatStats[fmt] = { count: 0, totalER: 0, totalViews: 0 }
        }
        formatStats[fmt].count++
        formatStats[fmt].totalER += er
        formatStats[fmt].totalViews += p.getInt('views') || 0
      }

      var formatAverages = []
      for (var fmtKey in formatStats) {
        var fs = formatStats[fmtKey]
        formatAverages.push({
          format: fmtKey,
          avgEngagement: fs.totalER / fs.count,
          avgViews: fs.totalViews / fs.count,
          count: fs.count,
        })
      }
      formatAverages.sort(function (a, b) {
        return b.avgEngagement - a.avgEngagement
      })

      for (var i = 0; i < allPosts.length; i++) {
        var hook = allPosts[i].getString('hook').toLowerCase()
        if (i < top25Pct) topHooks.push(hook)
        if (i >= allPosts.length - bottom25Pct) bottomHooks.push(hook)
      }

      var provTop = 0,
        provBottom = 0,
        poetTop = 0,
        poetBottom = 0
      for (var i = 0; i < topHooks.length; i++) {
        for (var j = 0; j < provocativeKeywords.length; j++) {
          if (topHooks[i].indexOf(provocativeKeywords[j]) !== -1) {
            provTop++
            break
          }
        }
        for (var j = 0; j < poeticKeywords.length; j++) {
          if (topHooks[i].indexOf(poeticKeywords[j]) !== -1) {
            poetTop++
            break
          }
        }
      }

      var wordCount = {}
      var stopWords = [
        'o',
        'a',
        'os',
        'as',
        'de',
        'do',
        'da',
        'dos',
        'das',
        'e',
        'em',
        'que',
        'um',
        'uma',
        'para',
        'sem',
        'com',
        'no',
        'na',
        'nos',
        'nas',
        'se',
        'vai',
        'vão',
        'eu',
        'você',
        'como',
        'por',
        'mais',
        'menos',
      ]
      for (var i = 0; i < topHooks.length; i++) {
        var words = topHooks[i].split(/[\s,().!?;:'"«»""-]+/)
        for (var w = 0; w < words.length; w++) {
          var word = words[w].trim().toLowerCase()
          if (word.length < 3) continue
          var isStop = false
          for (var s = 0; s < stopWords.length; s++) {
            if (word === stopWords[s]) {
              isStop = true
              break
            }
          }
          if (isStop) continue
          wordCount[word] = (wordCount[word] || 0) + 1
        }
      }
      var topThemes = []
      for (var word in wordCount) {
        topThemes.push({ word: word, count: wordCount[word] })
      }
      topThemes.sort(function (a, b) {
        return b.count - a.count
      })
      topThemes = topThemes.slice(0, 5)

      var recommendations = []

      if (formatAverages.length > 0) {
        var bestFormat = formatAverages[0]
        recommendations.push(
          'Formato "' +
            bestFormat.format +
            '" tem o maior engajamento médio (' +
            (bestFormat.avgEngagement * 100).toFixed(1) +
            '%). Priorize este formato.',
        )
      }

      var hookType = ''
      var hookPct = 0
      if (top25Pct > 0) {
        var provPct = (provTop / top25Pct) * 100
        var poetPct = (poetTop / top25Pct) * 100
        if (provPct > poetPct) {
          hookType = 'provocativo'
          hookPct = Math.round(provPct)
          recommendations.push(
            'Hooks provocativos representam ' +
              hookPct +
              '% do top ' +
              top25Pct +
              '. Esse estilo gera ' +
              Math.round((provPct / Math.max(poetPct, 1)) * 100 - 100) +
              '% mais engajamento que hooks poéticos.',
          )
        } else if (poetPct > 0) {
          hookType = 'poético'
          hookPct = Math.round(poetPct)
          recommendations.push(
            'Hooks poéticos representam ' +
              hookPct +
              '% do top ' +
              top25Pct +
              '. Continue explorando esse tom.',
          )
        }
      }

      if (topThemes.length > 0) {
        var themeStr = topThemes
          .slice(0, 3)
          .map(function (t) {
            return '"' + t.word + '"'
          })
          .join(', ')
        recommendations.push(
          'Temas mais frequentes nos top posts: ' +
            themeStr +
            '. Use essas palavras-chave nos próximos conteúdos.',
        )
      }

      if (topThemes.length > 0 && bestFormat) {
        var topThemeWord = topThemes[0].word
        var hookSuggestion =
          hookType === 'provocativo'
            ? 'Use um hook provocativo com o tema "' + topThemeWord + '"'
            : 'Crie um conteúdo sobre "' + topThemeWord + '" no formato ' + bestFormat.format
        recommendations.push(
          'Próxima sugestão: ' +
            hookSuggestion +
            ' — combina o melhor formato com o tema de maior recorrência.',
        )
      }

      var pautaSuggestions = []
      if (topThemes.length > 0) {
        for (var pi = 0; pi < Math.min(topThemes.length, 5); pi++) {
          var tw = topThemes[pi].word
          pautaSuggestions.push({
            topic: tw,
            rationale: 'Tema presente em ' + topThemes[pi].count + ' dos top posts',
            suggestedFormat: bestFormat ? bestFormat.format : 'Reel',
            suggestedHook: hookType === 'provocativo' ? 'Provocativo' : 'Poético',
            estimatedEngagement: bestFormat ? bestFormat.avgEngagement : avgER,
          })
        }
      }
      if (topHooks.length > 0) {
        var top3Hooks = topHooks.slice(0, 3)
        for (var hi = 0; hi < top3Hooks.length; hi++) {
          pautaSuggestions.push({
            topic: 'Variação do hook: "' + top3Hooks[hi].slice(0, 50) + '..."',
            rationale: 'Hook no top 25% de engajamento',
            suggestedFormat: bestFormat ? bestFormat.format : 'Reel',
            suggestedHook: 'Baseado em performance real',
            estimatedEngagement: avgER * 1.5,
          })
        }
      }
      var lowER = avgER * 0.5
      var underperformers = []
      for (var ui = 0; ui < allPosts.length; ui++) {
        var upER = allPosts[ui].getFloat('engagement_rate') || 0
        if (upER < lowER) {
          underperformers.push({
            hook: allPosts[ui].getString('hook').slice(0, 60),
            engagement: upER,
            format: allPosts[ui].getString('format'),
          })
        }
      }
      if (underperformers.length > 0) {
        recommendations.push(
          underperformers.length +
            ' posts estão com engajamento abaixo de 50% da média. Evite temas similares.',
        )
      }

      var totalViews = 0
      var totalER = 0
      for (var i = 0; i < allPosts.length; i++) {
        totalViews += allPosts[i].getInt('views') || 0
        totalER += allPosts[i].getFloat('engagement_rate') || 0
      }
      var avgER = totalER / allPosts.length
      recommendations.push(
        'Engajamento médio de todos os posts: ' +
          (avgER * 100).toFixed(1) +
          '%. Posts acima deste valor são considerados top performers.',
      )

      return e.json(200, {
        recommendations: recommendations,
        patterns: {
          hooks: [
            { type: 'provocativo', count: provTop },
            { type: 'poético', count: poetTop },
          ],
          formats: formatAverages,
          themes: topThemes,
        },
        pauta_suggestions: pautaSuggestions,
        underperformers: underperformers,
      })
    } catch (err) {
      $app.logger().error('recommendations endpoint error', 'error', err.message)
      return e.json(500, { error: 'Failed to generate recommendations' })
    }
  },
  $apis.requireAuth(),
)
