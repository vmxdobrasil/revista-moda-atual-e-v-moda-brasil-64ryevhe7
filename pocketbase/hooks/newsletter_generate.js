routerAdd(
  'POST',
  '/backend/v1/newsletter',
  (e) => {
    var body = e.requestInfo().body || {}
    var editionId = body.edition_id || ''
    var segments = body.segments || ['varejo', 'atacado', 'consumidora']

    var edition = null
    var editionPages = []
    var topBrands = []
    var products = []
    var socialPosts = []

    try {
      if (editionId) {
        edition = $app.findRecordById('editions', editionId)
      } else {
        var editions = $app.findRecordsByFilter('editions', '', '-created', 1, 0)
        if (editions.length > 0) edition = editions[0]
      }
    } catch (_) {}

    if (edition) {
      try {
        editionPages = $app.findRecordsByFilter(
          'edition_pages',
          'edition = "' + edition.id + '"',
          'page_number',
          10,
          0,
        )
      } catch (_) {}
    }

    try {
      topBrands = $app.findRecordsByFilter('top60_brands', '', 'position', 5, 0)
    } catch (_) {}

    try {
      products = $app.findRecordsByFilter(
        'marketplace_products',
        'featured = true',
        '-created',
        5,
        0,
      )
    } catch (_) {}

    try {
      socialPosts = $app.findRecordsByFilter('social_posts', '', '-views', 3, 0)
    } catch (_) {}

    var contextParts = []
    if (edition) {
      contextParts.push(
        'EDIÇÃO: ' + edition.getString('title') + ' — ' + edition.getString('description'),
      )
    }
    if (editionPages.length > 0) {
      var pageSummaries = []
      for (var pi = 0; pi < editionPages.length; pi++) {
        var p = editionPages[pi]
        pageSummaries.push(
          'Página ' +
            p.get('page_number') +
            ': ' +
            (p.getString('toc_title') || p.getString('template') || 'editorial'),
        )
      }
      contextParts.push('PÁGINAS DA EDIÇÃO:\n' + pageSummaries.join('\n'))
    }
    if (topBrands.length > 0) {
      var brandNames = []
      for (var bi = 0; bi < topBrands.length; bi++) {
        brandNames.push(
          topBrands[bi].getString('name') + ' (#' + topBrands[bi].get('position') + ')',
        )
      }
      contextParts.push('TOP MARCAS: ' + brandNames.join(', '))
    }
    if (products.length > 0) {
      var prodSummaries = []
      for (var pri = 0; pri < products.length; pri++) {
        var pr = products[pri]
        prodSummaries.push(pr.getString('name') + ' — R$' + pr.get('price'))
      }
      contextParts.push('PRODUTOS EM DESTAQUE:\n' + prodSummaries.join('\n'))
    }
    if (socialPosts.length > 0) {
      var postHooks = []
      for (var si = 0; si < socialPosts.length; si++) {
        postHooks.push(
          socialPosts[si].getString('hook') + ' (' + socialPosts[si].get('views') + ' views)',
        )
      }
      contextParts.push('POSTS SOCIAIS DESTAQUE:\n' + postHooks.join('\n'))
    }
    contextParts.push('SEGMENTOS ALVO: ' + segments.join(', '))

    var context = contextParts.join('\n\n')

    var systemPrompt = [
      'You are the Audience Nurture agent for Revista MODA ATUAL, a Brazilian fashion magazine.',
      'Generate a ready-to-review editorial newsletter from the provided content context.',
      '',
      'NEWSLETTER STRUCTURE:',
      '1. subject: email subject line (under 60 chars, Brazilian Portuguese)',
      '2. preheader: preview text (under 100 chars)',
      '3. content: JSON object with these blocks:',
      '   - header: { edition_title, date }',
      '   - intro: 2-3 sentence editorial introduction',
      '   - sections: array of 3-5 objects { headline, summary (1-2 sentences), cta }',
      '   - segment_blocks: one object per targeted segment { segment, title, content }',
      '     varejo -> ofertas/atacado and top60 brands',
      '     atacado -> tendências e compras em escala',
      '     consumidora -> looks e guias de estilo',
      '   - social_highlight: { hook, description }',
      '   - footer: { preferences_note, unsubscribe_note }',
      '',
      'OUTPUT: Return ONLY valid JSON (no markdown, no code fences) with this exact top-level structure:',
      '{"subject":"...","preheader":"...","content":{"header":{},"intro":"...","sections":[],"segment_blocks":[],"social_highlight":{},"footer":{}}}',
      '',
      'RULES: Brazilian Portuguese only. Be editorial, aspirational. CTAs should promote edition pages or V MODA BRASIL.',
    ].join('\n')

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: 'Gere a newsletter editorial com base no seguinte contexto:\n\n' + context,
          },
        ],
      })

      var rawContent = reply.choices[0].message.content

      var jsonStr = rawContent
      var fenceMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (fenceMatch) {
        jsonStr = fenceMatch[1].trim()
      } else {
        var braceMatch = rawContent.match(/\{[\s\S]*\}/)
        if (braceMatch) jsonStr = braceMatch[0]
      }

      var parsed
      try {
        parsed = JSON.parse(jsonStr)
      } catch (parseErr) {
        return e.json(500, { error: 'Falha ao processar resposta do AI. Tente novamente.' })
      }

      var audienceSize = 0
      try {
        var segFilter = segments
          .map(function (s) {
            return 'segment = "' + s + '"'
          })
          .join(' || ')
        var activeFilter = segFilter + ' && status = "ativo"'
        var subs = $app.findRecordsByFilter('subscribers', activeFilter, '', 0, 0)
        audienceSize = subs.length
      } catch (_) {}

      var title = parsed.subject || (edition ? edition.getString('title') : 'Newsletter MODA ATUAL')

      try {
        var col = $app.findCollectionByNameOrId('newsletter_campaigns')
        var record = new Record(col)
        record.set('title', title)
        record.set('subject', parsed.subject || '')
        record.set('preheader', parsed.preheader || '')
        record.set('content', parsed.content || {})
        if (edition) record.set('edition', edition.id)
        record.set('segments', segments)
        record.set('audience_size', audienceSize)
        record.set('status', 'rascunho')
        $app.save(record)

        return e.json(200, {
          success: true,
          campaign_id: record.id,
          subject: parsed.subject,
          preheader: parsed.preheader,
          content: parsed.content,
          audience_size: audienceSize,
          segments: segments,
        })
      } catch (saveErr) {
        return e.json(200, {
          success: true,
          subject: parsed.subject,
          preheader: parsed.preheader,
          content: parsed.content,
          audience_size: audienceSize,
          segments: segments,
          save_error: saveErr.message,
        })
      }
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'Serviço de IA temporariamente indisponível.' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { error: 'Falha na comunicação com o serviço de IA.' })
      }
      return e.json(500, { error: 'Erro inesperado ao gerar newsletter.' })
    }
  },
  $apis.requireAuth(),
)
