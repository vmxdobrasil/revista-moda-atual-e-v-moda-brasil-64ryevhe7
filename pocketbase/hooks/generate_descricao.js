routerAdd(
  'POST',
  '/backend/v1/generate-descricao',
  (e) => {
    const body = e.requestInfo().body || {}
    const tema = (body.tema || '').trim()
    if (!tema) {
      return e.badRequestError('Por favor, informe o título do vídeo')
    }

    var promptRecord
    try {
      promptRecord = $app.findFirstRecordByData('prompt_library', 'slug', 'descricao-youtube')
    } catch (_) {
      return e.json(404, { message: 'Prompt "descricao-youtube" não encontrado na biblioteca' })
    }

    var promptTemplate = promptRecord.getString('prompt_content')
    var prompt = promptTemplate.replace(/\[TÍTULO DO VÍDEO\]/g, tema)

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente especializado em criar descrições SEO para vídeos no YouTube. Responda apenas com a descrição completa, sem aspas, sem prefixos, sem comentários. A descrição deve ter exatamente 3 parágrafos separados por linha em branco. O 2º parágrafo deve mencionar "V MODA BRASIL". O 3º parágrafo deve terminar com um link para o site e conter 3 hashtags relevantes.',
          },
          { role: 'user', content: prompt },
        ],
      })

      var content = reply.choices[0].message.content.trim()
      content = content.replace(/^["'"']|["'"']$/g, '').trim()

      var paragraphs = content.split(/\n\n+/).filter(function (p) {
        return p.trim().length > 0
      })

      if (paragraphs.length < 3) {
        return e.json(400, {
          message: 'A descrição gerada não possui 3 parágrafos. Tente novamente.',
        })
      }

      if (content.toLowerCase().indexOf('v moda brasil') === -1) {
        return e.json(400, {
          message: 'A descrição gerada não menciona "V MODA BRASIL". Tente novamente.',
        })
      }

      var lowerContent = content.toLowerCase()
      var hashtagCount = (lowerContent.match(/#/g) || []).length
      if (hashtagCount < 3) {
        return e.json(400, {
          message: 'A descrição gerada não contém 3 hashtags. Tente novamente.',
        })
      }

      try {
        var col = $app.findCollectionByNameOrId('story_texts')
        var record = new Record(col)
        record.set('subject', tema)
        record.set('options', { description: content })
        record.set('scheduled_date', null)
        $app.save(record)
      } catch (saveErr) {
        console.log('Failed to save descricao to story_texts:', saveErr.message)
      }

      return e.json(200, { description: content })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { message: 'IA temporariamente indisponível' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { message: 'Erro ao gerar descrição. Tente novamente.' })
      }
      return e.json(500, { message: 'Erro inesperado ao gerar descrição' })
    }
  },
  $apis.requireAuth(),
)
