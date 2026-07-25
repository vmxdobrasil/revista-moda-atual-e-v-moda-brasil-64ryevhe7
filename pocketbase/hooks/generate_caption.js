routerAdd(
  'POST',
  '/backend/v1/generate-caption',
  (e) => {
    const body = e.requestInfo().body || {}
    const theme = (body.theme || '').trim()
    if (!theme) return e.badRequestError('Tema é obrigatório')

    const promptTemplate =
      'Você é um editor da Revista MODA ATUAL DIGITAL, especializada em moda, negócios e tendências do Polo de Moda de Goiás, com tom profissional, acolhedor e informativo.\n\n' +
      'Contexto: A revista publica um post no Instagram sobre [TEMA]. O público são mulheres empreendedoras da moda, lojistas e revendedoras.\n\n' +
      'Tarefa: Crie uma legenda de 120 a 180 caracteres que apresente o tema de forma atraente.\n\n' +
      'Restrições:\n' +
      '- Não use clichês ("arrase", "poderosa", "transforme seu look")\n' +
      '- Não comece com "Você sabia?"\n' +
      '- Tom informativo, não de venda\n' +
      '- Não use hashtags\n' +
      '- Responda apenas com a legenda, sem aspas ou comentários'

    const prompt = promptTemplate.replace('[TEMA]', theme)

    try {
      const reply = $ai.chat({
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

      try {
        $app.findFirstRecordByData('prompt_library', 'slug', 'legenda-instagram')
      } catch (_) {
        var col = $app.findCollectionByNameOrId('prompt_library')
        var r = new Record(col)
        r.set('name', 'Legenda Instagram – Revista MODA ATUAL')
        r.set('description', 'Gera legendas no estilo da Revista MODA ATUAL DIGITAL para Instagram')
        r.set('prompt_content', promptTemplate)
        r.set('slug', 'legenda-instagram')
        r.set('category', 'super')
        $app.save(r)
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
