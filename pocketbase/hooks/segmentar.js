routerAdd(
  'POST',
  '/backend/v1/segmentar',
  (e) => {
    var body = e.requestInfo().body || {}

    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var segment = (body.segment || '').trim()
    var interests = body.interests
    if (!Array.isArray(interests)) {
      interests = interests ? [interests] : []
    }
    var minEngagementScore = body.min_engagement_score
    var status = (body.status || '').trim()
    var openedInLastDays = body.opened_in_last_days
    var clickedInLastDays = body.clicked_in_last_days
    var campaignId = (body.campaign_id || '').trim()
    var engagementPeriodDays = body.engagement_period_days
    var behaviorDays = body.behavior_days
    var minEngagementRate = body.min_engagement_rate
    var minEngagement = body.min_engagement

    var validSegments = ['varejo', 'atacado', 'consumidora', 'todos']
    if (segment && validSegments.indexOf(segment) === -1) {
      return e.badRequestError('Segmento inválido', {
        segment: 'Valores aceitos: varejo, atacado, consumidora, todos.',
      })
    }

    var validStatuses = ['ativo', 'descadastrado', 'inativo']
    if (status && validStatuses.indexOf(status) === -1) {
      return e.badRequestError('Status inválido', {
        status: 'Valores aceitos: ativo, descadastrado, inativo.',
      })
    }

    if (campaignId) {
      try {
        $app.findRecordById('newsletter_campaigns', campaignId)
      } catch (_) {
        return e.badRequestError('Campaign inválido', {
          campaign_id: 'Campaign não encontrado.',
        })
      }
    }

    // --- Fetch social posts for engagement enrichment ---
    var socialPosts = []
    try {
      var postFilter = ''
      var postParams = []

      if (
        typeof engagementPeriodDays === 'number' &&
        !isNaN(engagementPeriodDays) &&
        engagementPeriodDays > 0
      ) {
        var periodDate = new Date()
        periodDate.setUTCDate(periodDate.getUTCDate() - engagementPeriodDays)
        postFilter = 'post_date >= "' + periodDate.toISOString() + '"'
      }

      socialPosts = $app.findRecordsByFilter('social_posts', postFilter, '-engagement_rate', 0, 0)
    } catch (_) {
      socialPosts = []
    }

    // Compute social engagement stats by edition
    var editionEngagement = {}
    var totalSocialER = 0
    var socialCount = 0

    for (var spi = 0; spi < socialPosts.length; spi++) {
      var sp = socialPosts[spi]
      var spER = sp.getFloat('engagement_rate') || 0
      var spViews = sp.getInt('views') || 0
      var spLikes = sp.getInt('likes') || 0
      var spEdition = sp.getString('edition')

      totalSocialER += spER
      socialCount++

      // Check min_engagement_rate threshold
      if (
        typeof minEngagementRate === 'number' &&
        !isNaN(minEngagementRate) &&
        spER < minEngagementRate
      ) {
        continue
      }

      // Check min_engagement threshold (views)
      if (typeof minEngagement === 'number' && !isNaN(minEngagement) && spViews < minEngagement) {
        continue
      }

      if (spEdition) {
        if (!editionEngagement[spEdition]) {
          editionEngagement[spEdition] = { count: 0, totalER: 0, totalViews: 0, totalLikes: 0 }
        }
        editionEngagement[spEdition].count++
        editionEngagement[spEdition].totalER += spER
        editionEngagement[spEdition].totalViews += spViews
        editionEngagement[spEdition].totalLikes += spLikes
      }
    }

    var avgSocialER = socialCount > 0 ? totalSocialER / socialCount : 0

    // --- Build subscriber filters ---
    var filters = []

    if (segment && segment !== 'todos') {
      filters.push('segment = "' + segment + '"')
    }

    if (status) {
      filters.push('status = "' + status + '"')
    }

    if (typeof minEngagementScore === 'number' && !isNaN(minEngagementScore)) {
      filters.push('engagement_score >= ' + minEngagementScore)
    }

    // behavior_days replaces opened_in_last_days / clicked_in_last_days if set
    var effectiveOpenedDays = openedInLastDays
    var effectiveClickedDays = clickedInLastDays
    if (typeof behaviorDays === 'number' && !isNaN(behaviorDays) && behaviorDays > 0) {
      effectiveOpenedDays = behaviorDays
      effectiveClickedDays = behaviorDays
    }

    if (
      typeof effectiveOpenedDays === 'number' &&
      !isNaN(effectiveOpenedDays) &&
      effectiveOpenedDays > 0
    ) {
      var openedDate = new Date()
      openedDate.setUTCDate(openedDate.getUTCDate() - effectiveOpenedDays)
      filters.push('last_opened_at >= "' + openedDate.toISOString() + '"')
    }

    if (
      typeof effectiveClickedDays === 'number' &&
      !isNaN(effectiveClickedDays) &&
      effectiveClickedDays > 0
    ) {
      var clickedDate = new Date()
      clickedDate.setUTCDate(clickedDate.getUTCDate() - effectiveClickedDays)
      filters.push('last_clicked_at >= "' + clickedDate.toISOString() + '"')
    }

    for (var i = 0; i < interests.length; i++) {
      var interestStr = String(interests[i]).replace(/"/g, '')
      if (interestStr) {
        filters.push('interests ~ "' + interestStr + '"')
      }
    }

    var filterStr = filters.join(' && ')

    var subscribers = []
    try {
      subscribers = $app.findRecordsByFilter('subscribers', filterStr, '', 0, 0)
    } catch (_) {}

    var bySegment = {}
    var byStatus = {}
    var byInterest = {}
    var engagementBreakdown = { alta: 0, media: 0, baixa: 0 }
    var totalEngagement = 0
    var ids = []
    var updatedScores = 0

    // Segment to interest mapping for social post matching
    var segmentInterests = {
      varejo: ['tendências', 'editoriais', 'top60', 'moda praia', 'acessórios', 'social media'],
      atacado: ['atacado', 'compras em escala', 'marketplace', 'V MODA BRASIL'],
      consumidora: ['looks', 'guias de estilo', 'tendências', 'moda masculina'],
    }

    for (var i = 0; i < subscribers.length; i++) {
      var sub = subscribers[i]
      var seg = sub.getString('segment')
      var st = sub.getString('status') || 'inativo'

      var engagementRaw = sub.get('engagement_score')
      var engagement = 0
      if (typeof engagementRaw === 'number') {
        engagement = engagementRaw
      } else if (typeof engagementRaw === 'string') {
        var parsed = parseFloat(engagementRaw)
        engagement = isNaN(parsed) ? 0 : parsed
      }

      // Enrich engagement with social data for this subscriber's segment
      var segInterestsList = segmentInterests[seg] || []
      var subInterestsRaw = sub.get('interests')
      var subInterests = []
      if (subInterestsRaw) {
        if (typeof subInterestsRaw === 'string') {
          try {
            subInterests = JSON.parse(subInterestsRaw)
          } catch (_) {
            subInterests = []
          }
        } else if (Array.isArray(subInterestsRaw)) {
          subInterests = subInterestsRaw
        }
      }

      // Check if any social posts match subscriber interests
      var matchedSocialER = 0
      var matchedCount = 0
      for (var j = 0; j < socialPosts.length; j++) {
        var post = socialPosts[j]
        var postDesc = (post.getString('description') || '').toLowerCase()
        var postHook = (post.getString('hook') || '').toLowerCase()
        var postText = postDesc + ' ' + postHook
        var matched = false

        for (var k = 0; k < segInterestsList.length; k++) {
          if (postText.indexOf(segInterestsList[k].toLowerCase()) !== -1) {
            matched = true
            break
          }
        }
        if (!matched) {
          for (var k = 0; k < subInterests.length; k++) {
            if (postText.indexOf(String(subInterests[k]).toLowerCase()) !== -1) {
              matched = true
              break
            }
          }
        }

        if (matched) {
          matchedSocialER += post.getFloat('engagement_rate') || 0
          matchedCount++
        }
      }

      // Combine email behavior score with social engagement
      if (matchedCount > 0) {
        var avgMatchedER = matchedSocialER / matchedCount
        var socialBoost = avgMatchedER * 15
        var newScore = Math.min(100, Math.round(engagement + socialBoost))
        if (newScore !== engagement) {
          try {
            var subRecord = $app.findRecordById('subscribers', sub.id)
            subRecord.set('engagement_score', newScore)
            $app.saveNoValidate(subRecord)
            updatedScores++
            engagement = newScore
          } catch (_) {}
        }
      }

      if (seg) {
        bySegment[seg] = (bySegment[seg] || 0) + 1
      }
      byStatus[st] = (byStatus[st] || 0) + 1
      totalEngagement += engagement
      ids.push(sub.id)

      // Engagement breakdown
      if (engagement >= 70) {
        engagementBreakdown.alta++
      } else if (engagement >= 35) {
        engagementBreakdown.media++
      } else {
        engagementBreakdown.baixa++
      }

      try {
        var interestsRaw = sub.get('interests')
        if (interestsRaw) {
          var subInts = interestsRaw
          if (typeof subInts === 'string') {
            try {
              subInts = JSON.parse(subInts)
            } catch (_) {
              subInts = []
            }
          }
          if (Array.isArray(subInts)) {
            for (var j = 0; j < subInts.length; j++) {
              var interestKey = String(subInts[j])
              if (interestKey) {
                byInterest[interestKey] = (byInterest[interestKey] || 0) + 1
              }
            }
          } else if (typeof subInts === 'object' && subInts !== null) {
            var keys = Object.keys(subInts)
            for (var k = 0; k < keys.length; k++) {
              var objKey = String(keys[k])
              byInterest[objKey] = (byInterest[objKey] || 0) + 1
            }
          }
        }
      } catch (_) {}
    }

    var avgEngagement =
      subscribers.length > 0 ? Math.round((totalEngagement / subscribers.length) * 100) / 100 : 0

    // --- Recommended editions ---
    var recommendedEditions = []
    var editionIds = Object.keys(editionEngagement)
    var editionScores = []
    for (var ei = 0; ei < editionIds.length; ei++) {
      var edId = editionIds[ei]
      var edData = editionEngagement[edId]
      var avgER = edData.count > 0 ? edData.totalER / edData.count : 0
      var avgViews = edData.count > 0 ? edData.totalViews / edData.count : 0

      // Match by subscriber interests
      var matchScore = 0
      for (var si = 0; si < subscribers.length; si++) {
        var subSeg = subscribers[si].getString('segment')
        var segInts = segmentInterests[subSeg] || []
        for (var sk = 0; sk < segInts.length; sk++) {
          matchScore += 1
        }
      }
      if (matchScore > 0 || avgER > 0) {
        editionScores.push({ id: edId, avgER: avgER, avgViews: avgViews, matchScore: matchScore })
      }
    }
    editionScores.sort(function (a, b) {
      return b.avgER + b.matchScore * 0.01 - (a.avgER + a.matchScore * 0.01)
    })

    for (var ri = 0; ri < Math.min(editionScores.length, 5); ri++) {
      try {
        var edRecord = $app.findRecordById('editions', editionScores[ri].id)
        recommendedEditions.push({
          id: edRecord.id,
          title: edRecord.getString('title'),
          slug: edRecord.getString('slug'),
          avg_engagement_rate: Math.round(editionScores[ri].avgER * 100) / 100,
          avg_views: Math.round(editionScores[ri].avgViews),
          match_score: editionScores[ri].matchScore,
        })
      } catch (_) {}
    }

    // --- Update campaign if requested ---
    if (campaignId) {
      try {
        var campaign = $app.findRecordById('newsletter_campaigns', campaignId)
        campaign.set('segments', {
          segment: segment || 'todos',
          interests: interests,
          min_engagement_score: typeof minEngagementScore === 'number' ? minEngagementScore : null,
          status: status || null,
          opened_in_last_days: typeof effectiveOpenedDays === 'number' ? effectiveOpenedDays : null,
          clicked_in_last_days:
            typeof effectiveClickedDays === 'number' ? effectiveClickedDays : null,
          engagement_period_days:
            typeof engagementPeriodDays === 'number' ? engagementPeriodDays : null,
          behavior_days: typeof behaviorDays === 'number' ? behaviorDays : null,
          min_engagement_rate: typeof minEngagementRate === 'number' ? minEngagementRate : null,
          min_engagement: typeof minEngagement === 'number' ? minEngagement : null,
        })
        campaign.set('audience_size', subscribers.length)
        $app.save(campaign)
      } catch (err) {
        $app.logger().error('Failed to update campaign audience', 'error', err.message)
      }
    }

    return e.json(200, {
      total: subscribers.length,
      by_segment: bySegment,
      by_status: byStatus,
      by_interest: byInterest,
      engagement_breakdown: engagementBreakdown,
      avg_engagement_score: avgEngagement,
      avg_social_engagement_rate: Math.round(avgSocialER * 100) / 100,
      updated_engagement_scores: updatedScores,
      recommended_editions: recommendedEditions,
      ids: ids,
    })
  },
  $apis.requireAuth(),
)
