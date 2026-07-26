routerAdd(
  'POST',
  '/backend/v1/generate-caption',
  (e) => {
    const body = e.requestInfo().body || {}
    const theme = (body.theme || '').trim()
    if (!theme) return e.badRequestError('Tema é obrigatório')

    var fallbackPrompt =
      '═══ PERSONA ═══\nVocê é o editor de conteúdo da Revista MODA ATUAL DIGITAL, uma revista especializada em moda, negócios e tendências do Polo de Moda de Goiás. Tom profissional, acolhedor e informativo.\n\n═══ CONTEXTO ═══\nA revista publica um post no Instagram sobre [TEMA]. O público são mulheres empreendedoras da moda, lojistas e revendedoras.\n\n═══ TAREFA ═══\nCrie uma legenda para Instagram de 120 a 180 caracteres que apresente o tema de forma atraente.\n\n═══ FORMATO DA RESPOSTA ═══\nApenas a legenda, sem hashtags. Texto corrido.\n\n═══ RESTRIÇÕES ═══\n- Não use clichês como "arrase", "poderosa", "transforme seu look"\n- Não comece com "Você sabia?"\n- Tom informativo, não de venda\n\n═══ VARIÁVEIS ═══\n[TEMA] = assunto do post'

    var promptTemplate = fallbackPrompt
    try {
      var promptRecord = $app.findFirstRecordByData('prompt_library', 'slug', 'legenda-instagram')
      var dbContent = promptRecord.getString('prompt_content')
      if (dbContent) promptTemplate = dbContent
    } catch (_) {}

    var prompt = promptTemplate.replace(/\[TEMA\]/g, theme)

    try {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente especializado em criar legendas curtas para Instagram. Responda apenas com o texto da legenda, sem aspas, sem prefixos, sem comentários.',
          },
          { role: 'user', content: prompt },
        ],
      })

      let caption = reply.choices[0].message.content.trim()
      caption = caption.replace(/^["'""]+|["'""]+$/g, '').trim()

      if (caption.length < 120 || caption.length > 180) {
        var lines = caption.split('\n').filter(function (l) {
          var t = l.trim()
          return t.length >= 120 && t.length <= 180
        })
        if (lines.length > 0) {
          caption = lines[0].trim()
        } else {
          return e.json(400, {
            message:
              'A legenda gerada tem ' +
              caption.length +
              ' caracteres. O ideal é entre 120 e 180. Tente novamente.',
          })
        }
      }

      return e.json(200, { caption: caption })
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
