routerAdd(
  'POST',
  '/backend/v1/precificar',
  (e) => {
    var body = e.requestInfo().body || {}
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var format = (body.format || 'banner').trim()
    var audienceReach = body.audience_reach || 0
    var position = (body.position || '').trim()

    var validFormats = [
      'banner',
      'capa',
      'pagina_inteira',
      'sponsored_content',
      'story',
      'editorial_destaque',
    ]
    if (validFormats.indexOf(format) === -1) {
      return e.badRequestError('Formato inválido', {
        format:
          'Valores aceitos: banner, capa, pagina_inteira, sponsored_content, story, editorial_destaque.',
      })
    }

    var basePrice = 500
    var reachDivisor = 10000
    var reachMaxAddition = 2
    var posPremium = 1.3
    var posStandard = 1.0
    var posBottom = 0.8

    try {
      var rules = $app.findRecordsByFilter(
        'ad_pricing_rules',
        'format = "' + format + '" && active = true',
        '',
        1,
        0,
      )
      if (rules.length > 0) {
        var rule = rules[0]
        basePrice = rule.getInt('base_price') || basePrice

        var reachMultRaw = rule.get('reach_multiplier')
        var reachMult = reachMultRaw
        if (typeof reachMultRaw === 'string') {
          try {
            reachMult = JSON.parse(reachMultRaw)
          } catch (_) {
            reachMult = {}
          }
        }
        if (reachMult && typeof reachMult === 'object') {
          if (typeof reachMult.divisor === 'number') reachDivisor = reachMult.divisor
          if (typeof reachMult.max_addition === 'number') reachMaxAddition = reachMult.max_addition
        }

        var posMultRaw = rule.get('position_multiplier')
        var posMult = posMultRaw
        if (typeof posMultRaw === 'string') {
          try {
            posMult = JSON.parse(posMultRaw)
          } catch (_) {
            posMult = {}
          }
        }
        if (posMult && typeof posMult === 'object') {
          if (typeof posMult.premium === 'number') posPremium = posMult.premium
          if (typeof posMult.standard === 'number') posStandard = posMult.standard
          if (typeof posMult.bottom === 'number') posBottom = posMult.bottom
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
      var prompt =
        'Você é o diretor comercial da Revista MODA ATUAL. ' +
        'Gere uma justificativa curta (2-3 frases) para o preço sugerido de R$ ' +
        suggestedPrice +
        ' para um anúncio no formato "' +
        format +
        '", alcance de ' +
        audienceReach +
        ' impactos e posição "' +
        position +
        '". Responda apenas o texto da justificativa, sem JSON ou markdown.'

      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content: 'Você é um diretor comercial conciso. Responda apenas com texto.',
          },
          { role: 'user', content: prompt },
        ],
      })

      var rationale = reply.choices[0].message.content.trim()

      return e.json(200, {
        suggested_price: suggestedPrice,
        base_price: basePrice,
        reach_adjustment: Math.round(reachMultiplier * 100) / 100,
        position_adjustment: positionMultiplier,
        rationale: rationale,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { message: 'IA temporariamente indisponível' })
      }
      return e.json(200, {
        suggested_price: suggestedPrice,
        base_price: basePrice,
        reach_adjustment: Math.round(reachMultiplier * 100) / 100,
        position_adjustment: positionMultiplier,
        rationale: 'Preço calculado com base no formato, alcance e posição.',
      })
    }
  },
  $apis.requireAuth(),
)
