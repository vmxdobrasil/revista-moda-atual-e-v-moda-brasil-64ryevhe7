routerAdd(
  'POST',
  '/backend/v1/generate-materia',
  (e) => {
    const body = e.requestInfo().body || {}
    const tema = (body.tema || '').trim()
    if (!tema) return e.badRequestError('Por favor, informe o tema da matéria')

    var promptRecord
    try {
      promptRecord = $app.findFirstRecordByData('prompt_library', 'slug', 'materia-completa')
    } catch (_) {
      return e.json(404, { message: 'Prompt "materia-completa" não encontrado na biblioteca' })
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
              'Você é uma equipe editorial completa (Repórter, Coolhunter, SEO, Revisor) especializada em criar matérias jornalísticas para o site da Revista MODA ATUAL DIGITAL. Siga o formato solicitado exatamente, usando os marcadores de seção. Responda apenas com a matéria, sem aspas ou comentários adicionais.',
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

      var tituloPrincipal = extractSection(content, 'TÍTULO PRINCIPAL:', [
        'SUBTÍTULO:',
        'OLHO:',
        'CORPO DA MATÉRIA:',
        'CALL TO ACTION',
        'TAGS DE SEO',
        'SUGESTÃO DE REDES SOCIAIS',
      ])

      var subtitulo = extractSection(content, 'SUBTÍTULO:', [
        'OLHO:',
        'CORPO DA MATÉRIA:',
        'CALL TO ACTION',
        'TAGS DE SEO',
        'SUGESTÃO DE REDES SOCIAIS',
      ])

      var olho = extractSection(content, 'OLHO:', [
        'CORPO DA MATÉRIA:',
        'CALL TO ACTION',
        'TAGS DE SEO',
        'SUGESTÃO DE REDES SOCIAIS',
      ])

      var corpo = extractSection(content, 'CORPO DA MATÉRIA:', [
        'CALL TO ACTION',
        'TAGS DE SEO',
        'SUGESTÃO DE REDES SOCIAIS',
      ])

      var ctaRaw = cleanLeading(
        extractSection(content, 'CALL TO ACTION', ['TAGS DE SEO', 'SUGESTÃO DE REDES SOCIAIS']),
      )
      var callToAction = []
      var ctaLines = ctaRaw.split('\n').filter(function (l) {
        return l.trim()
      })
      for (var i = 0; i < ctaLines.length; i++) {
        var m = ctaLines[i].match(/^\d+\s*[.)\-:]?\s*(.+)/)
        if (m) callToAction.push(m[1].trim())
      }

      var tagsRaw = cleanLeading(
        extractSection(content, 'TAGS DE SEO', ['SUGESTÃO DE REDES SOCIAIS']),
      )
      var tagsSeo = tagsRaw
        .split(/[,;]/)
        .map(function (t) {
          return t.trim()
        })
        .filter(function (t) {
          return t
        })

      var socialSection = extractSection(content, 'SUGESTÃO DE REDES SOCIAIS', [])
      var instagramMatch = socialSection.match(/Texto Instagram:\s*(.+)/i)
      var arteMatch = socialSection.match(/Sugest[ãa]o de arte:\s*(.+)/i)
      var sugestaoRedes = {
        instagram_text: instagramMatch ? instagramMatch[1].trim() : '',
        arte_description: arteMatch ? arteMatch[1].trim() : '',
      }

      if (!tituloPrincipal && !corpo) {
        return e.json(500, {
          message:
            'A resposta da IA está incompleta — título e corpo não encontrados. Tente novamente.',
        })
      }
      if (!tituloPrincipal) {
        return e.json(500, {
          message: 'Título principal não encontrado na resposta. Tente novamente.',
        })
      }
      if (!corpo) {
        return e.json(500, {
          message: 'Corpo da matéria não encontrado na resposta. Tente novamente.',
        })
      }
      if (callToAction.length < 2) {
        return e.json(500, {
          message: 'A resposta não contém 2 opções de Call to Action. Tente novamente.',
        })
      }
      if (tagsSeo.length < 5) {
        return e.json(500, {
          message: 'A resposta não contém tags de SEO suficientes (mínimo 5). Tente novamente.',
        })
      }
      if (!sugestaoRedes.instagram_text || !sugestaoRedes.arte_description) {
        return e.json(500, {
          message: 'A sugestão de redes sociais está incompleta. Tente novamente.',
        })
      }

      var article = {
        titulo_principal: tituloPrincipal,
        subtitulo: subtitulo,
        olho: olho,
        corpo: corpo,
        call_to_action: callToAction,
        tags_seo: tagsSeo,
        sugestao_redes: sugestaoRedes,
      }

      var recordId = ''
      try {
        var col = $app.findCollectionByNameOrId('story_texts')
        var record = new Record(col)
        record.set('subject', tema)
        record.set('options', {
          type: 'materia_completa',
          content: article,
        })
        record.set('scheduled_date', null)
        $app.save(record)
        recordId = record.id
      } catch (saveErr) {
        console.log('Failed to save materia_completa to story_texts:', saveErr.message)
      }

      return e.json(200, {
        content: content,
        titulo_principal: article.titulo_principal,
        subtitulo: article.subtitulo,
        olho: article.olho,
        corpo: article.corpo,
        call_to_action: article.call_to_action,
        tags_seo: article.tags_seo,
        sugestao_redes: article.sugestao_redes,
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
