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

    var basePrices = {
      banner: 500,
      capa: 5000,
      pagina_inteira: 3000,
      sponsored_content: 2500,
      story: 800,
      editorial_destaque: 4000,
    }

    if (!basePrices[format]) {
      return e.badRequestError('Formato inválido', {
        format:
          'Valores aceitos: banner, capa, pagina_inteira, sponsored_content, story, editorial_destaque.',
      })
    }

    var basePrice = basePrices[format]
    var reachMultiplier = 1 + Math.min(audienceReach / 10000, 2)
    var positionMultiplier = 1
    var posLower = position.toLowerCase()
    if (
      posLower.indexOf('premium') !== -1 ||
      posLower.indexOf('topo') !== -1 ||
      posLower.indexOf('capa') !== -1
    ) {
      positionMultiplier = 1.3
    } else if (posLower.indexOf('rodape') !== -1 || posLower.indexOf('bottom') !== -1) {
      positionMultiplier = 0.8
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
