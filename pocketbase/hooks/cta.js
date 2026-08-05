routerAdd(
  'POST',
  '/backend/v1/cta',
  (e) => {
    try {
      var body = e.requestInfo().body || {}

      var errors = {}
      if (!body.content_id || !String(body.content_id).trim()) {
        errors.content_id = 'content_id é obrigatório'
      }
      var validTypes = ['materia', 'legenda', 'story', 'banner', 'hotspot']
      if (!body.content_type || validTypes.indexOf(body.content_type) === -1) {
        errors.content_type = 'content_type deve ser: materia, legenda, story, banner ou hotspot'
      }
      if (Object.keys(errors).length > 0) {
        throw new BadRequestError('Dados inválidos', errors)
      }

      var prompt =
        'Você é um especialista em otimização de conversão para a Revista MODA ATUAL e V MODA BRASIL.\n\n' +
        'CONTEXTO DO CONTEÚDO:\n' +
        '- ID: ' +
        body.content_id +
        '\n' +
        '- Tipo: ' +
        body.content_type +
        '\n' +
        '- CTA atual: ' +
        (body.current_cta || 'Nenhum') +
        '\n' +
        '- Público-alvo: ' +
        (body.target_audience || 'Geral') +
        '\n' +
        '- Objetivo: ' +
        (body.objective || 'Aumentar conversão') +
        '\n\n' +
        'TAREFA: Gere uma sugestão de CTA otimizada para este conteúdo.\n\n' +
        'Retorne APENAS um JSON válido no formato:\n' +
        '{"cta_variant": "A|B|C ou nome descritivo", "link_origin": "revista|hotspot|whatsapp", "cta_text": "texto do CTA em português", "reasoning": "justificativa baseada em dados e boas práticas", "whatsapp_link": "link wa.me ou null"}'

      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente especializado em CTA para moda. Responda apenas com JSON válido.',
          },
          { role: 'user', content: prompt },
        ],
      })

      var rawContent = reply.choices[0].message.content.trim()
      var jsonMatch = rawContent.match(/\{[\s\S]*\}/)
      var suggestion

      if (jsonMatch) {
        try {
          suggestion = JSON.parse(jsonMatch[0])
        } catch (_) {
          suggestion = {
            cta_variant: 'A',
            link_origin: 'revista',
            cta_text: rawContent,
            reasoning: 'Sugestão gerada pelo modelo',
          }
        }
      } else {
        suggestion = {
          cta_variant: 'A',
          link_origin: 'revista',
          cta_text: rawContent,
          reasoning: 'Sugestão gerada pelo modelo',
        }
      }

      return e.json(200, { suggestion: suggestion })
    } catch (err) {
      if (err instanceof BadRequestError) throw err
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'IA temporariamente indisponível' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { error: 'Falha ao gerar sugestão de CTA' })
      }
      $app.logger().error('cta endpoint error', 'error', String(err))
      return e.json(500, { error: 'Erro inesperado ao gerar CTA' })
    }
  },
  $apis.requireAuth(),
)
