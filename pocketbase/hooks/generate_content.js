routerAdd(
  'POST',
  '/backend/v1/generate-content',
  (e) => {
    const body = e.requestInfo().body || {}
    const theme = (body.theme || '').trim()
    if (!theme || theme.length < 3) {
      return e.badRequestError('Forneça um tema com pelo menos 3 caracteres.')
    }

    let editionContext = ''
    if (body.editionId) {
      try {
        const edition = $app.findRecordById('editions', body.editionId)
        const edTitle = edition.getString('title')
        const edDesc = edition.getString('description')
        const edCover = edition.getString('cover_url')
        editionContext =
          '\n\nCONTEXTO DA EDICAO SELECIONADA:\nTitulo: ' +
          edTitle +
          '\nDescricao: ' +
          edDesc +
          '\nURL da Capa: ' +
          edCover
      } catch (err) {
        // edition not found — continue without context
      }
    }

    const systemPrompt = [
      'You are a senior content strategist for Revista MODA ATUAL, a Brazilian fashion magazine and business hub.',
      'Your job is to orchestrate five specialists sequentially to produce complete Instagram-ready content.',
      '',
      'SPECIALISTS CHAIN:',
      '1. Jornalista de Moda: Write a 500-800 word journalistic article in Brazilian Portuguese about the given theme. Use ## for subtitles.',
      '2. Coolhunter: Validate trends mentioned, check for buzzwords, enrich with relevant fashion references.',
      '3. Copywriter: Adapt the article into an Instagram feed caption (150-300 words). Tone: aspirational, informative, accessible.',
      '4. Especialista em SEO: Rewrite the caption with primary and secondary keywords (moda, negocios, V MODA BRASIL). Generate an SEO-optimized title.',
      '5. Especialista em Reels: Convert the main idea into a 30-60 second video script with scene descriptions, text overlays, and audio suggestions.',
      '',
      'OUTPUT: Return ONLY valid JSON (no markdown, no code fences, no text before or after) with this exact structure:',
      '{"materia_completa":"full article text using ## for subtitles and line breaks for paragraphs","post_feed":{"titulo":"SEO title","legenda":"optimized caption"},"roteiro_reel":{"duracao":"30-60s","cenas":[{"numero":1,"tempo":"0-10s","descricao":"scene description","texto_overlay":"text on screen","audio":"audio suggestion"}]},"stories":[{"numero":1,"texto":"story text","design":"design suggestion","cta":"call to action"}],"hashtags":{"principais":["#tag1","#tag2","#tag3","#tag4","#tag5"],"alcance":["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10"]},"cta":"final call to action for V MODA BRASIL"}',
      '',
      'RULES:',
      '- Language: Brazilian Portuguese ONLY',
      '- The article must be 500-800 words',
      '- Generate exactly 3 stories',
      '- Generate 5 principal hashtags and 10 reach hashtags',
      '- Hashtags must be relevant to the theme and Brazilian fashion market',
      '- The CTA should promote V MODA BRASIL or the magazine',
      '- Do not include any text outside the JSON object',
    ].join('\n')

    const userPrompt = 'TEMA: ' + theme + editionContext

    try {
      const reply = $ai.chat({
        model: 'fast',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      })

      const rawContent = reply.choices[0].message.content

      let jsonStr = rawContent
      const fenceMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (fenceMatch) {
        jsonStr = fenceMatch[1].trim()
      } else {
        const braceMatch = rawContent.match(/\{[\s\S]*\}/)
        if (braceMatch) {
          jsonStr = braceMatch[0]
        }
      }

      let parsed
      try {
        parsed = JSON.parse(jsonStr)
      } catch (parseErr) {
        return e.json(500, { error: 'Falha ao processar resposta do AI. Tente novamente.' })
      }

      if (
        !parsed.materia_completa ||
        !parsed.post_feed ||
        !parsed.roteiro_reel ||
        !parsed.stories ||
        !parsed.hashtags ||
        !parsed.cta
      ) {
        return e.json(500, { error: 'Resposta do AI incompleta. Tente novamente.' })
      }

      try {
        var alCol = $app.findCollectionByNameOrId('audit_logs')
        var alRec = new Record(alCol)
        alRec.set('integration_name', 'generate_content')
        alRec.set('integration_type', 'route')
        alRec.set('status', 'success')
        alRec.set('executed_at', new Date().toISOString())
        $app.save(alRec)
      } catch (_) {}

      return e.json(200, parsed)
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'Servico de AI temporariamente indisponivel.' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { error: 'Falha na comunicacao com o servico de AI.' })
      }
      return e.json(500, { error: 'Erro inesperado ao gerar conteudo.' })
    }
  },
  $apis.requireAuth(),
)
