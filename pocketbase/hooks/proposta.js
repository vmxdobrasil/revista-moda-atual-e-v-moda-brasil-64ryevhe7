routerAdd(
  'POST',
  '/backend/v1/proposta',
  (e) => {
    var body = e.requestInfo().body || {}
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var advertiser = (body.advertiser || '').trim()
    var campaign = (body.campaign || '').trim()
    var advertiserEmail = (body.advertiser_email || '').trim()
    if (!advertiser) {
      return e.badRequestError('Anunciante é obrigatório', {
        advertiser: 'Informe o nome do anunciante.',
      })
    }

    var editionId = (body.edition_id || '').trim()
    var format = body.format || 'banner'
    var position = (body.position || '').trim()

    var editions = []
    try {
      editions = $app.findRecordsByFilter('editions', '', '-created', 0, 0)
    } catch (_) {}

    if (editions.length === 0) {
      return e.json(404, { message: 'Nenhuma edição encontrada para matching.' })
    }

    var matchedEdition = null
    var matchScore = 0

    if (editionId) {
      try {
        matchedEdition = $app.findRecordById('editions', editionId)
        matchScore = 75
      } catch (_) {
        matchedEdition = null
      }
    }

    if (!matchedEdition) {
      var advertiserWords = (advertiser + ' ' + campaign).toLowerCase().split(/\s+/)
      var bestScore = 0
      var bestEdition = null
      for (var i = 0; i < editions.length; i++) {
        var ed = editions[i]
        var edText = (ed.getString('title') + ' ' + ed.getString('description')).toLowerCase()
        var score = 0
        for (var w = 0; w < advertiserWords.length; w++) {
          if (advertiserWords[w].length > 2 && edText.indexOf(advertiserWords[w]) !== -1) {
            score += 20
          }
        }
        if (score > bestScore) {
          bestScore = score
          bestEdition = ed
        }
      }
      if (bestEdition) {
        matchedEdition = bestEdition
        matchScore = Math.min(100, bestScore + 30)
      } else {
        matchedEdition = editions[0]
        matchScore = 25
      }
    }

    var editionViews = matchedEdition.getInt('view_count') || 0
    var socialReach = 0
    try {
      var posts = $app.findRecordsByFilter('social_posts', '', '-views', 0, 0)
      for (var p = 0; p < posts.length; p++) {
        socialReach += posts[p].getInt('views') || 0
      }
    } catch (_) {}
    var audienceReach = editionViews + Math.round(socialReach / 3)

    var basePrice = 500
    var reachDivisor = 10000
    var reachMaxAddition = 2
    var posPremium = 1.3
    var posStandard = 1.0
    var posBottom = 0.8

    try {
      var pRules = $app.findRecordsByFilter(
        'ad_pricing_rules',
        'format = "' + format + '" && active = true',
        '',
        1,
        0,
      )
      if (pRules.length > 0) {
        var pRule = pRules[0]
        basePrice = pRule.getInt('base_price') || basePrice
        var pReachRaw = pRule.get('reach_multiplier')
        var pReach = pReachRaw
        if (typeof pReachRaw === 'string') {
          try {
            pReach = JSON.parse(pReachRaw)
          } catch (_) {
            pReach = {}
          }
        }
        if (pReach && typeof pReach === 'object') {
          if (typeof pReach.divisor === 'number') reachDivisor = pReach.divisor
          if (typeof pReach.max_addition === 'number') reachMaxAddition = pReach.max_addition
        }
        var pPosRaw = pRule.get('position_multiplier')
        var pPos = pPosRaw
        if (typeof pPosRaw === 'string') {
          try {
            pPos = JSON.parse(pPosRaw)
          } catch (_) {
            pPos = {}
          }
        }
        if (pPos && typeof pPos === 'object') {
          if (typeof pPos.premium === 'number') posPremium = pPos.premium
          if (typeof pPos.standard === 'number') posStandard = pPos.standard
          if (typeof pPos.bottom === 'number') posBottom = pPos.bottom
        }
      }
    } catch (_) {}

    var reachMultiplier = 1 + Math.min(audienceReach / reachDivisor, reachMaxAddition)
    var positionMultiplier = posStandard
    var posLower = position.toLowerCase()
    if (
      posLower.indexOf('premium') !== -1 ||
      posLower.indexOf('topo') !== -1 ||
      posLower.indexOf('capa') !== -1
    ) {
      positionMultiplier = posPremium
    } else if (posLower.indexOf('rodape') !== -1 || posLower.indexOf('bottom') !== -1) {
      positionMultiplier = posBottom
    }
    var suggestedPrice = Math.round(basePrice * reachMultiplier * positionMultiplier)

    try {
      var editionTitle = matchedEdition.getString('title')
      var editionDesc = matchedEdition.getString('description') || ''

      var aiPrompt =
        'Você é o diretor comercial da Revista MODA ATUAL.\n' +
        'Gere uma proposta comercial personalizada em português brasileiro para:\n' +
        'Anunciante: ' +
        advertiser +
        '\n' +
        'Campanha: ' +
        campaign +
        '\n' +
        'Edição/theme: ' +
        editionTitle +
        ' — ' +
        editionDesc +
        '\n' +
        'Formato: ' +
        format +
        '\n' +
        'Posição: ' +
        position +
        '\n' +
        'Alcance estimado: ' +
        audienceReach +
        ' impactos\n' +
        'Preço sugerido: R$ ' +
        suggestedPrice +
        '\n' +
        'Match score: ' +
        matchScore +
        '/100\n\n' +
        'Responda APENAS com JSON válido (sem markdown) no formato:\n' +
        '{"intro":"introdução","value_proposition":"proposta de valor","matched_theme":"tema editorial","format_description":"descrição do formato","reach_summary":"resumo de alcance","pricing_summary":"resumo de preço","cta":"chamada para ação"}'

      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content: 'Você é um diretor comercial. Responda apenas com JSON válido.',
          },
          { role: 'user', content: aiPrompt },
        ],
      })

      var rawContent = reply.choices[0].message.content.trim()
      if (rawContent.indexOf('```') !== -1) {
        rawContent = rawContent
          .replace(/^```(?:json)?\n?/, '')
          .replace(/\n?```$/, '')
          .trim()
      }
      var jsonStart = rawContent.indexOf('{')
      var jsonEnd = rawContent.lastIndexOf('}')
      if (jsonStart !== -1 && jsonEnd !== -1) {
        rawContent = rawContent.substring(jsonStart, jsonEnd + 1)
      }

      var parsed
      try {
        parsed = JSON.parse(rawContent)
      } catch (_) {
        parsed = {
          intro: rawContent,
          value_proposition: '',
          matched_theme: editionTitle,
          format_description: format,
          reach_summary: audienceReach + ' impactos',
          pricing_summary: 'R$ ' + suggestedPrice,
          cta: 'Entre em contato para confirmar.',
        }
      }

      var suggestedAudiences = []
      try {
        var activeSubs = $app.findRecordsByFilter('subscribers', 'status = "ativo"', '', 0, 0)
        var segmentAgg = {}
        for (var sai = 0; sai < activeSubs.length; sai++) {
          var asub = activeSubs[sai]
          var aseg = asub.getString('segment')
          if (!aseg) continue
          if (!segmentAgg[aseg]) {
            segmentAgg[aseg] = {
              segment: aseg,
              audience_size: 0,
              total_engagement: 0,
              interests: {},
            }
          }
          segmentAgg[aseg].audience_size++
          segmentAgg[aseg].total_engagement += asub.getFloat('engagement_score') || 0
          var asubIntsRaw = asub.get('interests')
          if (asubIntsRaw) {
            var asubInts = asubIntsRaw
            if (typeof asubInts === 'string') {
              try {
                asubInts = JSON.parse(asubInts)
              } catch (_) {
                asubInts = []
              }
            }
            if (Array.isArray(asubInts)) {
              for (var aii = 0; aii < asubInts.length; aii++) {
                var aintKey = String(asubInts[aii])
                if (aintKey) {
                  segmentAgg[aseg].interests[aintKey] =
                    (segmentAgg[aseg].interests[aintKey] || 0) + 1
                }
              }
            }
          }
        }
        var segKeys = Object.keys(segmentAgg)
        for (var sk = 0; sk < segKeys.length; sk++) {
          var sData = segmentAgg[segKeys[sk]]
          var avgEng =
            sData.audience_size > 0
              ? Math.round((sData.total_engagement / sData.audience_size) * 100) / 100
              : 0
          var engLevel = avgEng >= 70 ? 'alta' : avgEng >= 35 ? 'media' : 'baixa'
          var sortedInts = Object.keys(sData.interests)
            .sort(function (a, b) {
              return sData.interests[b] - sData.interests[a]
            })
            .slice(0, 5)
            .map(function (k) {
              return { interest: k, count: sData.interests[k] }
            })
          suggestedAudiences.push({
            segment: sData.segment,
            audience_size: sData.audience_size,
            avg_engagement_score: avgEng,
            engagement_level: engLevel,
            top_interests: sortedInts,
          })
        }
      } catch (_) {
        suggestedAudiences = []
      }
      parsed.suggested_audiences = suggestedAudiences

      var col = $app.findCollectionByNameOrId('ad_proposals')
      var record = new Record(col)
      record.set('advertiser', advertiser)
      record.set('campaign', campaign)
      record.set('advertiser_email', advertiserEmail)
      record.set('edition', matchedEdition.id)
      record.set('format', format)
      record.set('position', position)
      record.set('audience_reach', audienceReach)
      record.set('suggested_price', suggestedPrice)
      record.set('match_score', matchScore)
      record.set('proposal_data', parsed)
      record.set('status', 'rascunho')
      $app.save(record)

      return e.json(200, {
        id: record.id,
        advertiser: record.getString('advertiser'),
        campaign: record.getString('campaign'),
        edition: record.getString('edition'),
        format: record.getString('format'),
        position: record.getString('position'),
        audience_reach: record.getInt('audience_reach'),
        suggested_price: record.getInt('suggested_price'),
        match_score: record.getInt('match_score'),
        proposal_data: record.get('proposal_data'),
        status: record.getString('status'),
        created: record.getString('created'),
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { message: 'IA temporariamente indisponível' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { message: 'Falha ao gerar proposta. Tente novamente.' })
      }
      return e.json(500, { message: 'Erro inesperado ao gerar proposta' })
    }
  },
  $apis.requireAuth(),
)
