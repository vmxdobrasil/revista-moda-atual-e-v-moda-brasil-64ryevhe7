routerAdd(
  'POST',
  '/backend/v1/generate-materia',
  (e) => {
    const body = e.requestInfo().body || {}
    const tema = (body.tema || '').trim()
    if (!tema) return e.badRequestError('Por favor, informe o tema da matéria')

    var promptRecord
    try {
      promptRecord = $app.findFirstRecordByData('prompt_library', 'slug', 'materia-jornalistica')
    } catch (_) {
      return e.json(404, { message: 'Prompt "materia-jornalistica" não encontrado na biblioteca' })
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
              'Você é um repórter de moda especializado em criar matérias jornalísticas para o site da Revista MODA ATUAL DIGITAL. Siga o formato solicitado exatamente, usando os marcadores de seção. Responda apenas com a matéria, sem aspas ou comentários adicionais.',
          },
          { role: 'user', content: prompt },
        ],
      })

      var content = reply.choices[0].message.content.trim()

      function extractSection(text, startMarker, endMarkers) {
        var startIdx = text.indexOf(startMarker)
        if (startIdx === -1) return ''
        var contentStart = startIdx + startMarker.length
        var endIdx = text.length
        for (var i = 0; i < endMarkers.length; i++) {
          var idx = text.indexOf(endMarkers[i], contentStart)
          if (idx !== -1 && idx < endIdx) endIdx = idx
        }
        return text.slice(contentStart, endIdx).trim()
      }

      function cleanLeading(text) {
        return text
          .replace(/^\s*\(.*?\)\s*:?\s*/m, '')
          .replace(/^[\s:]+/, '')
          .trim()
      }

      var sections = {
        titulo: extractSection(content, 'TÍTULO PRINCIPAL:', [
          'SUBTÍTULO:',
          'OLHO:',
          'CORPO DA MATÉRIA:',
          'CALL TO ACTION',
          'TAGS DE SEO',
          'SUGESTÃO DE REDES SOCIAIS:',
        ]),
        subtitulo: extractSection(content, 'SUBTÍTULO:', [
          'OLHO:',
          'CORPO DA MATÉRIA:',
          'CALL TO ACTION',
          'TAGS DE SEO',
          'SUGESTÃO DE REDES SOCIAIS:',
        ]),
        olho: extractSection(content, 'OLHO:', [
          'CORPO DA MATÉRIA:',
          'CALL TO ACTION',
          'TAGS DE SEO',
          'SUGESTÃO DE REDES SOCIAIS:',
        ]),
        corpo: extractSection(content, 'CORPO DA MATÉRIA:', [
          'CALL TO ACTION',
          'TAGS DE SEO',
          'SUGESTÃO DE REDES SOCIAIS:',
        ]),
        cta: cleanLeading(
          extractSection(content, 'CALL TO ACTION', ['TAGS DE SEO', 'SUGESTÃO DE REDES SOCIAIS:']),
        ),
        tags: cleanLeading(extractSection(content, 'TAGS DE SEO', ['SUGESTÃO DE REDES SOCIAIS:'])),
        social: extractSection(content, 'SUGESTÃO DE REDES SOCIAIS:', []),
      }

      if (!sections.titulo && !sections.corpo) {
        sections.titulo = tema
        sections.corpo = content
      }

      var recordId = ''
      try {
        var col = $app.findCollectionByNameOrId('story_texts')
        var record = new Record(col)
        record.set('subject', tema)
        record.set('options', {
          type: 'materia-jornalistica',
          content: content,
          sections: sections,
        })
        record.set('scheduled_date', null)
        $app.save(record)
        recordId = record.id
      } catch (saveErr) {
        console.log('Failed to save materia to story_texts:', saveErr.message)
      }

      return e.json(200, {
        content: content,
        sections: sections,
        recordId: recordId,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { message: 'IA temporariamente indisponível' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { message: 'Falha ao gerar matéria. Tente novamente.' })
      }
      return e.json(500, { message: 'Erro inesperado ao gerar matéria' })
    }
  },
  $apis.requireAuth(),
)
