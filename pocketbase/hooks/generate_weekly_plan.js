routerAdd(
  'POST',
  '/backend/v1/generate-weekly-plan',
  (e) => {
    const body = e.requestInfo().body || {}
    const dataInicio = (body.dataInicio || '').trim()
    const dataFim = (body.dataFim || '').trim()
    const tema1 = (body.tema1 || '').trim()
    const tema2 = (body.tema2 || '').trim()
    const tema3 = (body.tema3 || '').trim()

    if (!dataInicio || !dataFim || !tema1 || !tema2 || !tema3) {
      return e.badRequestError('Informe dataInicio, dataFim, tema1, tema2 e tema3')
    }

    var promptRecord
    try {
      promptRecord = $app.findFirstRecordByData('prompt_library', 'slug', 'plano-semanal')
    } catch (_) {
      return e.json(404, { message: 'Prompt "plano-semanal" não encontrado na biblioteca' })
    }

    var promptTemplate = promptRecord.getString('prompt_content')
    var prompt = promptTemplate
      .replace(/\[DATA_INÍCIO\]/g, dataInicio)
      .replace(/\[DATA_FIM\]/g, dataFim)
      .replace(/\[TEMA1\]/g, tema1)
      .replace(/\[TEMA2\]/g, tema2)
      .replace(/\[TEMA3\]/g, tema3)

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é uma estrategista de conteúdo digital especializada em moda e negócios. Siga o formato solicitado exatamente, usando os marcadores de seção para cada dia da semana. Responda apenas com o plano de conteúdo, sem aspas ou comentários adicionais.',
          },
          { role: 'user', content: prompt },
        ],
      })

      var content = reply.choices[0].message.content.trim()

      var dayNames = [
        'SEGUNDA-FEIRA',
        'TERÇA-FEIRA',
        'QUARTA-FEIRA',
        'QUINTA-FEIRA',
        'SEXTA-FEIRA',
        'SÁBADO',
        'DOMINGO',
      ]

      var daySections = {}
      for (var i = 0; i < dayNames.length; i++) {
        var day = dayNames[i]
        var startIdx = content.indexOf(day + ':')
        if (startIdx === -1) {
          startIdx = content.indexOf(day)
        }
        if (startIdx === -1) continue

        var contentStart = startIdx + day.length
        var endIdx = content.length
        for (var j = 0; j < dayNames.length; j++) {
          if (j === i) continue
          var idx = content.indexOf(dayNames[j] + ':', contentStart)
          if (idx === -1) idx = content.indexOf(dayNames[j], contentStart)
          if (idx !== -1 && idx < endIdx) endIdx = idx
        }
        var resumoIdx = content.indexOf('RESUMO SEMANAL:', contentStart)
        if (resumoIdx !== -1 && resumoIdx < endIdx) endIdx = resumoIdx

        daySections[day] = content
          .slice(contentStart, endIdx)
          .replace(/^[:\s]+/, '')
          .trim()
      }

      var resumoSection = ''
      var resumoStart = content.indexOf('RESUMO SEMANAL:')
      if (resumoStart !== -1) {
        resumoSection = content.slice(resumoStart + 'RESUMO SEMANAL:'.length).trim()
      }

      var subject = 'Plano Semanal: ' + tema1 + ' / ' + tema2 + ' / ' + tema3

      var recordId = ''
      try {
        var col = $app.findCollectionByNameOrId('story_texts')
        var record = new Record(col)
        record.set('subject', subject)
        record.set('options', {
          type: 'plano-semanal',
          plan: content,
          day_sections: daySections,
          resumo: resumoSection,
        })
        record.set('scheduled_date', null)
        $app.save(record)
        recordId = record.id
      } catch (saveErr) {
        console.log('Failed to save plano-semanal to story_texts:', saveErr.message)
      }

      return e.json(200, {
        content: content,
        day_sections: daySections,
        resumo: resumoSection,
        subject: subject,
        recordId: recordId,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { message: 'IA temporariamente indisponível' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { message: 'Falha ao gerar plano semanal. Tente novamente.' })
      }
      return e.json(500, { message: 'Erro inesperado ao gerar plano semanal' })
    }
  },
  $apis.requireAuth(),
)
