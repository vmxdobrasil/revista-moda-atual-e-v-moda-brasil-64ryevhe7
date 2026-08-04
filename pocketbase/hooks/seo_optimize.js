routerAdd(
  'POST',
  '/backend/v1/seo',
  (e) => {
    var body = e.requestInfo().body || {}
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var articleText = (body.article || '').trim()
    var tema = (body.tema || '').trim()
    if (!articleText && !tema) {
      return e.badRequestError('Informe o conteúdo do artigo (article) ou tema (tema)')
    }

    function loadPrompt(slug) {
      var rec = $app.findFirstRecordByData('prompt_library', 'slug', slug)
      return rec.getString('prompt_content')
    }

    var promptTemplate
    try {
      promptTemplate = loadPrompt('seo-checklist')
    } catch (_) {
      promptTemplate =
        'Você é um Especialista em SEO. Analise o artigo e retorne JSON com meta_title, meta_description, slug, headings, keyword_density, og, internal_links, lsi_keywords, recommendations.'
    }

    var prompt = promptTemplate.replace(/\[ARTIGO\]/g, articleText).replace(/\[TEMA\]/g, tema)

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um Especialista em SEO para a Revista MODA ATUAL DIGITAL. Responda APENAS com JSON válido, sem markdown, sem texto antes ou depois.',
          },
          { role: 'user', content: prompt },
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
        parsed = {
          meta_title: (tema || articleText).slice(0, 60),
          meta_description: (tema || articleText).slice(0, 160),
          slug: (tema || 'artigo')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
          headings: { h1: [], h2: [], h3: [] },
          keyword_density: {},
          og: { title: '', description: '', image: '' },
          internal_links: [],
          lsi_keywords: [],
          recommendations: [
            'Resposta do AI não estava em JSON válido. Valores gerados automaticamente.',
          ],
        }
      }

      try {
        var alCol = $app.findCollectionByNameOrId('audit_logs')
        var alRec = new Record(alCol)
        alRec.set('integration_name', 'seo_optimize')
        alRec.set('integration_type', 'route')
        alRec.set('status', 'success')
        alRec.set('executed_at', new Date().toISOString())
        $app.save(alRec)
      } catch (_) {}

      return e.json(200, parsed)
    } catch (err) {
      var msg = err && err.message ? err.message : 'Erro desconhecido'
      if (err instanceof SkipAiConfigError) msg = 'IA não configurada'
      else if (err instanceof SkipAiError) msg = 'Erro de IA: ' + (err.message || '')

      try {
        var alColE = $app.findCollectionByNameOrId('audit_logs')
        var alRecE = new Record(alColE)
        alRecE.set('integration_name', 'seo_optimize')
        alRecE.set('integration_type', 'route')
        alRecE.set('status', 'error')
        alRecE.set('executed_at', new Date().toISOString())
        alRecE.set('error_message', msg)
        $app.save(alRecE)
      } catch (_) {}

      return e.json(500, { error: msg })
    }
  },
  $apis.requireAuth(),
)
