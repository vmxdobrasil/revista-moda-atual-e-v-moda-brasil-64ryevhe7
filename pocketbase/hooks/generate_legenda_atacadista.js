routerAdd(
  'POST',
  '/backend/v1/generate-legenda-atacadista',
  (e) => {
    const body = e.requestInfo().body || {}
    const marca = (body.marca || '').trim()
    const produto = (body.produto || '').trim()

    if (!marca) return e.badRequestError('marca é obrigatório')
    if (!produto) return e.badRequestError('produto é obrigatório')

    var promptRecord
    try {
      promptRecord = $app.findFirstRecordByData('prompt_library', 'slug', 'legenda-atacadista')
    } catch (_) {
      return e.json(404, { message: 'Prompt "legenda-atacadista" não encontrado na biblioteca' })
    }

    var promptTemplate = promptRecord.getString('prompt_content')
    var prompt = promptTemplate
      .replace(/\[NOME DA MARCA\]/g, marca)
      .replace(/\[PRODUTO\]/g, produto)

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente especializado em criar legendas para Instagram de marcas de moda atacadista. Responda no seguinte formato exato, sem aspas ou comentários adicionais:\nCAPTION: [sua legenda aqui, até 200 caracteres]\nHASHTAGS: [#hashtag1 #hashtag2 #hashtag3]',
          },
          { role: 'user', content: prompt },
        ],
      })

      var content = reply.choices[0].message.content.trim()

      var caption = ''
      var hashtags = []

      var captionMatch = content.match(/CAPTION:\s*(.+)/i)
      if (captionMatch) {
        caption = captionMatch[1]
          .trim()
          .replace(/^["'"]+|["'"]+$/g, '')
          .trim()
      }

      var hashtagsMatch = content.match(/HASHTAGS:\s*(.+)/i)
      if (hashtagsMatch) {
        hashtags = hashtagsMatch[1].trim().match(/#\w[\w]*/g) || []
      }

      if (!caption) {
        var lines = content.split('\n').filter(function (l) {
          return l.trim()
        })
        if (lines.length > 0) {
          caption = lines[0]
            .replace(/^[-•]\s*/, '')
            .replace(/^["'"]+|["'"]+$/g, '')
            .trim()
        }
        if (lines.length > 1) {
          var tagLine = lines[lines.length - 1]
          hashtags = tagLine.match(/#\w[\w]*/g) || []
        }
      }

      if (!caption) {
        return e.json(400, {
          message: 'Não foi possível extrair a legenda da resposta. Tente novamente.',
        })
      }

      var recordId = ''
      try {
        var col = $app.findCollectionByNameOrId('story_texts')
        var record = new Record(col)
        record.set('subject', marca)
        record.set('options', {
          marca: marca,
          produto: produto,
          type: 'legenda-atacadista',
          caption: caption,
          hashtags: hashtags,
        })
        record.set('scheduled_date', null)
        $app.save(record)
        recordId = record.id
      } catch (saveErr) {
        console.log('Failed to save legenda atacadista to story_texts:', saveErr.message)
      }

      return e.json(200, {
        caption: caption,
        hashtags: hashtags,
        recordId: recordId,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { message: 'IA temporariamente indisponível' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { message: 'Falha ao gerar legenda. Tente novamente.' })
      }
      return e.json(500, { message: 'Erro inesperado ao gerar legenda' })
    }
  },
  $apis.requireAuth(),
)
