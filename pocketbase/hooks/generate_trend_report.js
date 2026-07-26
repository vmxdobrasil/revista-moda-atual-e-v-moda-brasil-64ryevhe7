routerAdd(
  'POST',
  '/backend/v1/generate-trend-report',
  (e) => {
    const body = e.requestInfo().body || {}
    const tendencia = (body.tendencia || '').trim()
    if (!tendencia) return e.badRequestError('Por favor, informe o nome da tendência')

    var promptRecord
    try {
      promptRecord = $app.findFirstRecordByData('prompt_library', 'slug', 'tendencia-relatorio')
    } catch (_) {
      return e.json(404, { message: 'Prompt "tendencia-relatorio" não encontrado na biblioteca' })
    }

    var promptTemplate = promptRecord.getString('prompt_content')
    var prompt = promptTemplate.replace(/\[TENDÊNCIA\]/g, tendencia)

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um analista de tendências de moda especializado no mercado atacadista brasileiro, com foco no Polo de Moda de Goiás. Siga o formato solicitado exatamente, usando os marcadores de seção. Responda apenas com o relatório, sem aspas ou comentários adicionais.',
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

      var nome = extractSection(content, 'NOME DA TENDÊNCIA:', [
        'ORIGEM:',
        'DESCRIÇÃO:',
        'POTENCIAL NO ATACADO:',
        'RELEVÂNCIA PARA O POLO DE GOIÁS:',
        'OPORTUNIDADES PARA FABRICANTES:',
        'SUGESTÃO DE ABORDAGEM EDITORIAL:',
        'PALAVRAS-CHAVE RELACIONADAS:',
      ])

      var origem = extractSection(content, 'ORIGEM:', [
        'DESCRIÇÃO:',
        'POTENCIAL NO ATACADO:',
        'RELEVÂNCIA PARA O POLO DE GOIÁS:',
        'OPORTUNIDADES PARA FABRICANTES:',
        'SUGESTÃO DE ABORDAGEM EDITORIAL:',
        'PALAVRAS-CHAVE RELACIONADAS:',
      ])

      var descricao = extractSection(content, 'DESCRIÇÃO:', [
        'POTENCIAL NO ATACADO:',
        'RELEVÂNCIA PARA O POLO DE GOIÁS:',
        'OPORTUNIDADES PARA FABRICANTES:',
        'SUGESTÃO DE ABORDAGEM EDITORIAL:',
        'PALAVRAS-CHAVE RELACIONADAS:',
      ])

      var potencialRaw = extractSection(content, 'POTENCIAL NO ATACADO:', [
        'RELEVÂNCIA PARA O POLO DE GOIÁS:',
        'OPORTUNIDADES PARA FABRICANTES:',
        'SUGESTÃO DE ABORDAGEM EDITORIAL:',
        'PALAVRAS-CHAVE RELACIONADAS:',
      ])

      var potencialNivel = ''
      var potencialJustificativa = ''
      var nivelMatch = potencialRaw.match(/N[ií]vel\s*:\s*(.+)/i)
      if (nivelMatch) {
        potencialNivel = nivelMatch[1].trim()
      }
      var justifMatch = potencialRaw.match(/Justificativa\s*:\s*([\s\S]+)/i)
      if (justifMatch) {
        potencialJustificativa = justifMatch[1].trim()
      }

      if (!potencialNivel && !potencialJustificativa) {
        potencialJustificativa = potencialRaw
      }

      var relevanciaPolo = extractSection(content, 'RELEVÂNCIA PARA O POLO DE GOIÁS:', [
        'OPORTUNIDADES PARA FABRICANTES:',
        'SUGESTÃO DE ABORDAGEM EDITORIAL:',
        'PALAVRAS-CHAVE RELACIONADAS:',
      ])

      var oportunidadesRaw = extractSection(content, 'OPORTUNIDADES PARA FABRICANTES:', [
        'SUGESTÃO DE ABORDAGEM EDITORIAL:',
        'PALAVRAS-CHAVE RELACIONADAS:',
      ])
      var oportunidades = []
      var opLines = oportunidadesRaw.split('\n').filter(function (l) {
        return l.trim()
      })
      for (var i = 0; i < opLines.length; i++) {
        var m = opLines[i].match(/^\[?op[çc][ãa]o\s*\d+\s*\]?\s*[:\-]?\s*(.+)/i)
        if (m) {
          oportunidades.push(m[1].trim())
        } else if (opLines[i].match(/^\d+\s*[.)\-:]?\s*(.+)/)) {
          var m2 = opLines[i].match(/^\d+\s*[.)\-:]?\s*(.+)/)
          oportunidades.push(m2[1].trim())
        } else if (opLines[i].trim().startsWith('-')) {
          oportunidades.push(opLines[i].trim().replace(/^[-\s]+/, ''))
        } else if (opLines[i].trim()) {
          oportunidades.push(opLines[i].trim())
        }
      }

      var abordagemEditorial = extractSection(content, 'SUGESTÃO DE ABORDAGEM EDITORIAL:', [
        'PALAVRAS-CHAVE RELACIONADAS:',
      ])

      var palavrasRaw = extractSection(content, 'PALAVRAS-CHAVE RELACIONADAS:', [])
      var palavrasChave = palavrasRaw
        .split(/[,;]/)
        .map(function (t) {
          return t.trim()
        })
        .filter(function (t) {
          return t
        })

      var report = {
        nome: nome || tendencia,
        origem: origem,
        descricao: descricao,
        potencial_atacado: {
          nivel: potencialNivel,
          justificativa: potencialJustificativa,
        },
        relevancia_polo: relevanciaPolo,
        oportunidades: oportunidades,
        abordagem_editorial: abordagemEditorial,
        palavras_chave: palavrasChave,
      }

      var recordId = ''
      try {
        var col = $app.findCollectionByNameOrId('story_texts')
        var record = new Record(col)
        record.set('subject', tendencia)
        record.set('options', {
          type: 'tendencia-relatorio',
          report: report,
        })
        record.set('scheduled_date', null)
        $app.save(record)
        recordId = record.id
      } catch (saveErr) {
        console.log('Failed to save trend report to story_texts:', saveErr.message)
      }

      return e.json(200, {
        nome: report.nome,
        origem: report.origem,
        descricao: report.descricao,
        potencial_atacado: report.potencial_atacado,
        relevancia_polo: report.relevancia_polo,
        oportunidades: report.oportunidades,
        abordagem_editorial: report.abordagem_editorial,
        palavras_chave: report.palavras_chave,
        raw: content,
        recordId: recordId,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { message: 'IA temporariamente indisponível' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { message: 'Falha ao gerar relatório de tendência. Tente novamente.' })
      }
      return e.json(500, { message: 'Erro inesperado ao gerar relatório de tendência' })
    }
  },
  $apis.requireAuth(),
)
