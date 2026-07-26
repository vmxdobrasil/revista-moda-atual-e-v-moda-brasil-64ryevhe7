routerAdd(
  'POST',
  '/backend/v1/generate-titulos',
  (e) => {
    const body = e.requestInfo().body || {}
    const tema = (body.tema || '').trim()
    if (!tema) {
      return e.badRequestError('Por favor, informe o tema da matéria')
    }

    var promptRecord
    try {
      promptRecord = $app.findFirstRecordByData('prompt_library', 'slug', 'titulos-seo')
    } catch (_) {
      return e.json(500, { message: 'Prompt "titulos-seo" não encontrado na biblioteca' })
    }

    var promptTemplate = promptRecord.getString('prompt_content')
    var prompt = promptTemplate.replace(/\[TEMA\]/g, tema)

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente especializado em criar títulos SEO para matérias de moda. Responda apenas com a lista de títulos numerados, sem aspas, sem prefixos, sem comentários.',
          },
          { role: 'user', content: prompt },
        ],
      })

      var content = reply.choices[0].message.content.trim()

      var titulos = []
      var regex = /\d+\s*[.)\-:]?\s*(.+?)(?=\n\s*\d+|$)/gi
      var match
      while ((match = regex.exec(content)) !== null) {
        var title = match[1].trim()
        if (title) titulos.push(title)
      }

      if (titulos.length === 0) {
        var parts = content.split('\n').filter(function (p) {
          return p.trim().length > 0
        })
        titulos = parts.slice(0, 5)
      }

      titulos = titulos.slice(0, 5)

      if (titulos.length === 0) {
        return e.json(500, {
          message: 'Não foi possível gerar títulos. Tente novamente.',
        })
      }

      try {
        var col = $app.findCollectionByNameOrId('story_texts')
        var record = new Record(col)
        record.set('subject', 'SEO Titles: ' + tema)
        record.set('options', titulos)
        $app.save(record)
      } catch (saveErr) {
        console.log('Failed to save titulos to story_texts:', saveErr.message)
      }

      return e.json(200, { titulos: titulos })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { message: 'IA temporariamente indisponível' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { message: 'Erro ao gerar títulos. Tente novamente.' })
      }
      return e.json(500, { message: 'Erro inesperado ao gerar títulos' })
    }
  },
  $apis.requireAuth(),
)
