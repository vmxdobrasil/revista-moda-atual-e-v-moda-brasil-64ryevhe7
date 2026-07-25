routerAdd(
  'POST',
  '/backend/v1/agents/meta-prompt',
  (e) => {
    const body = e.requestInfo().body || {}
    const userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')
    if (!body.objective || !body.objective.trim()) {
      return e.badRequestError('objective is required')
    }

    const metaInstruction =
      'Você é um Meta-prompt. Receba um objetivo e crie um prompt completo e otimizado com nome, descrição e conteúdo. Responda em JSON com os campos: name, description, prompt_content, slug, category.'

    let result
    try {
      result = $ai.agent('fashion-trend-advisor').chat({
        user_id: userId,
        message: metaInstruction + '\n\nObjetivo do usuário: ' + body.objective,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'AI temporariamente indisponível' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { error: 'AI temporariamente indisponível' })
      }
      return e.json(500, { error: 'Falha ao comunicar com o assistente' })
    }

    let parsed
    try {
      const content = result.content || ''
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
    } catch (err) {
      return e.json(500, { error: 'Falha ao parsear resposta do agente' })
    }

    if (!parsed.name || !parsed.prompt_content) {
      return e.json(400, { error: 'Resposta do agente não contém campos obrigatórios' })
    }

    let slug = parsed.slug || ''
    if (!slug) {
      slug = parsed.name
        .toLowerCase()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    let uniqueSlug = slug
    let counter = 1
    while (true) {
      try {
        $app.findFirstRecordByData('prompt_library', 'slug', uniqueSlug)
        uniqueSlug = slug + '-' + counter
        counter++
      } catch (_) {
        break
      }
    }

    let category = 'advanced'
    if (parsed.category && ['basic', 'advanced', 'super'].indexOf(parsed.category) !== -1) {
      category = parsed.category
    }

    const col = $app.findCollectionByNameOrId('prompt_library')
    const record = new Record(col)
    record.set('name', parsed.name)
    record.set('description', parsed.description || '')
    record.set('prompt_content', parsed.prompt_content)
    record.set('slug', uniqueSlug)
    record.set('category', category)
    $app.save(record)

    return e.json(200, {
      id: record.id,
      name: parsed.name,
      description: parsed.description || '',
      prompt_content: parsed.prompt_content,
      slug: uniqueSlug,
      category: category,
      created: record.getString('created'),
      updated: record.getString('updated'),
    })
  },
  $apis.requireAuth(),
)
