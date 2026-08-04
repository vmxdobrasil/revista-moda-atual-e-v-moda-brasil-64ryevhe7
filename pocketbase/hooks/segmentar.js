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

    if (typeof openedInLastDays === 'number' && !isNaN(openedInLastDays) && openedInLastDays > 0) {
      var openedDate = new Date()
      openedDate.setUTCDate(openedDate.getUTCDate() - openedInLastDays)
      filters.push('last_opened_at >= "' + openedDate.toISOString() + '"')
    }

    if (
      typeof clickedInLastDays === 'number' &&
      !isNaN(clickedInLastDays) &&
      clickedInLastDays > 0
    ) {
      var clickedDate = new Date()
      clickedDate.setUTCDate(clickedDate.getUTCDate() - clickedInLastDays)
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
    var totalEngagement = 0
    var ids = []

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

      if (seg) {
        bySegment[seg] = (bySegment[seg] || 0) + 1
      }
      byStatus[st] = (byStatus[st] || 0) + 1
      totalEngagement += engagement
      ids.push(sub.id)

      try {
        var interestsRaw = sub.get('interests')
        if (interestsRaw) {
          var subInterests = interestsRaw
          if (typeof subInterests === 'string') {
            try {
              subInterests = JSON.parse(subInterests)
            } catch (_) {
              subInterests = []
            }
          }
          if (Array.isArray(subInterests)) {
            for (var j = 0; j < subInterests.length; j++) {
              var interestKey = String(subInterests[j])
              if (interestKey) {
                byInterest[interestKey] = (byInterest[interestKey] || 0) + 1
              }
            }
          } else if (typeof subInterests === 'object' && subInterests !== null) {
            var keys = Object.keys(subInterests)
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

    if (campaignId) {
      try {
        var campaign = $app.findRecordById('newsletter_campaigns', campaignId)
        campaign.set('segments', {
          segment: segment || 'todos',
          interests: interests,
          min_engagement_score: typeof minEngagementScore === 'number' ? minEngagementScore : null,
          status: status || null,
          opened_in_last_days: typeof openedInLastDays === 'number' ? openedInLastDays : null,
          clicked_in_last_days: typeof clickedInLastDays === 'number' ? clickedInLastDays : null,
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
      avg_engagement_score: avgEngagement,
      ids: ids,
    })
  },
  $apis.requireAuth(),
)
