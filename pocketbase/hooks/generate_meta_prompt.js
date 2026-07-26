routerAdd(
  'POST',
  '/backend/v1/generate-meta-prompt',
  (e) => {
    const body = e.requestInfo().body || {}
    const objetivo = (body.objetivo || '').trim()
    const tipo = (body.tipo || '').trim()
    const canal = (body.canal || '').trim()
    const publico = (body.publico || '').trim().toUpperCase()

    if (!objetivo) return e.badRequestError('objetivo é obrigatório')
    if (!tipo) return e.badRequestError('tipo é obrigatório')
    if (!canal) return e.badRequestError('canal é obrigatório')
    if (['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].indexOf(publico) === -1) {
      return e.badRequestError('publico deve ser P1, P2, P3, P4, P5 ou P6')
    }

    var audienceNames = {
      P1: 'CEOs e Fundadores',
      P2: 'Diretores de Marketing',
      P3: 'Gerentes de Produto',
      P4: 'Social Media Managers',
      P5: 'Estilistas e Designers',
      P6: 'Lojistas e Revendedores',
    }
    var publicoName = audienceNames[publico] || publico

    var promptRecord
    try {
      promptRecord = $app.findFirstRecordByData('prompt_library', 'slug', 'engenheiro-prompts')
    } catch (_) {
      return e.json(404, { message: 'Prompt "engenheiro-prompts" não encontrado na biblioteca' })
    }

    var promptTemplate = promptRecord.getString('prompt_content')
    var prompt = promptTemplate
      .replace(/\[OBJETIVO\]/g, objetivo)
      .replace(/\[TIPO\]/g, tipo)
      .replace(/\[CANAL\]/g, canal)
      .replace(/\[PUBLICO\]/g, publico + ' — ' + publicoName)

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um Engenheiro de Prompts especializado em moda e conteúdo editorial. Gere prompts estruturados em 7 blocos. Responda apenas com o prompt, sem aspas ou comentários adicionais.',
          },
          { role: 'user', content: prompt },
        ],
      })

      var content = reply.choices[0].message.content.trim()

      var blockMarkers = [
        'PERSONA',
        'CONTEXTO',
        'TAREFA',
        'FORMATO DA RESPOSTA',
        'RESTRIÇÕES',
        'EXEMPLO',
        'VARIÁVEIS',
      ]
      var blocks = []

      for (var i = 0; i < blockMarkers.length; i++) {
        var marker = blockMarkers[i]
        var startIdx = content.indexOf(marker)
        if (startIdx === -1) {
          blocks.push({ title: marker, content: '' })
          continue
        }
        var contentStart = startIdx + marker.length
        var newlineIdx = content.indexOf('\n', contentStart)
        if (newlineIdx !== -1) contentStart = newlineIdx + 1
        var endIdx = content.length
        for (var j = i + 1; j < blockMarkers.length; j++) {
          var nextIdx = content.indexOf(blockMarkers[j], contentStart)
          if (nextIdx !== -1 && nextIdx < endIdx) endIdx = nextIdx
        }
        var blockContent = content.slice(contentStart, endIdx).trim()
        blockContent = blockContent.replace(/^═+\s*/, '').trim()
        blocks.push({ title: marker, content: blockContent })
      }

      var recordId = ''
      try {
        var col = $app.findCollectionByNameOrId('story_texts')
        var record = new Record(col)
        record.set('subject', objetivo + ' - ' + tipo + ' - ' + canal + ' - ' + publico)
        record.set('options', {
          type: 'meta-prompt',
          publico: publico,
          publicoName: publicoName,
          content: content,
          blocks: blocks,
        })
        record.set('scheduled_date', null)
        $app.save(record)
        recordId = record.id
      } catch (saveErr) {
        console.log('Failed to save meta-prompt to story_texts:', saveErr.message)
      }

      return e.json(200, {
        blocks: blocks,
        content: content,
        publico: publico,
        publicoName: publicoName,
        recordId: recordId,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError)
        return e.json(503, { message: 'IA temporariamente indisponível' })
      if (err instanceof SkipAiError) return e.json(502, { message: 'Falha ao gerar meta-prompt' })
      return e.json(500, { message: 'Erro inesperado ao gerar meta-prompt' })
    }
  },
  $apis.requireAuth(),
)
