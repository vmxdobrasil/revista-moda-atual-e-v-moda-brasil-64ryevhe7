routerAdd(
  'POST',
  '/backend/v1/generate-reel',
  (e) => {
    const body = e.requestInfo().body || {}
    const subject = (body.subject || '').trim()
    if (!subject) {
      return e.badRequestError('Informe o tema do Reel (ex: /reel tendências de maquiagem 2026)')
    }

    var promptRecord
    try {
      promptRecord = $app.findFirstRecordByData('prompt_library', 'slug', 'reel')
    } catch (_) {
      return e.json(500, { message: 'Prompt "reel" não encontrado na biblioteca' })
    }

    var promptTemplate = promptRecord.getString('prompt_content')
    var prompt = promptTemplate.replace(/\[TEMA\]/g, subject)

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente especializado em criar roteiros curtos para Instagram Reels. Responda apenas com as opções de roteiro, sem aspas, sem prefixos, sem comentários.',
          },
          { role: 'user', content: prompt },
        ],
      })

      var content = reply.choices[0].message.content.trim()

      var options = []
      var regex = /Op[çc][ãa]o\s*\d+\s*:?\s*([\s\S]*?)(?=Op[çc][ãa]o\s*\d+|$)/gi
      var match
      while ((match = regex.exec(content)) !== null) {
        var text = match[1].trim()
        if (text) options.push(text)
      }

      if (options.length === 0) {
        var parts = content.split(/\n\s*\n/).filter(function (p) {
          return p.trim().length > 0
        })
        options = parts.slice(0, 3)
      }

      options = options.slice(0, 3)

      if (options.length === 0) {
        return e.json(500, {
          message: 'Não foi possível gerar roteiros. Tente novamente.',
        })
      }

      try {
        var col = $app.findCollectionByNameOrId('story_texts')
        var record = new Record(col)
        record.set('subject', subject)
        record.set('options', options)
        $app.save(record)
      } catch (saveErr) {
        console.log('Failed to save reel to story_texts:', saveErr.message)
      }

      return e.json(200, { options: options })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { message: 'IA temporariamente indisponível' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { message: 'Erro ao gerar roteiro. Tente novamente.' })
      }
      return e.json(500, { message: 'Erro inesperado ao gerar roteiro' })
    }
  },
  $apis.requireAuth(),
)
