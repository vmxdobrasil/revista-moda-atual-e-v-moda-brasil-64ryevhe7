routerAdd(
  'POST',
  '/backend/v1/multi-format-generator/run',
  (e) => {
    var body = e.requestInfo().body || {}
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')
    var theme = (body.theme || '').trim()
    if (!theme) return e.badRequestError('Tema é obrigatório')
    var productId = body.productId || ''

    function loadPrompt(slug) {
      var rec = $app.findFirstRecordByData('prompt_library', 'slug', slug)
      return rec.getString('prompt_content')
    }

    function aiChat(prompt, sys) {
      var reply = $ai.chat({
        model: 'fast',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: prompt },
        ],
      })
      return reply.choices[0].message.content.trim()
    }

    function extractSection(text, start, ends) {
      var i = text.indexOf(start)
      if (i === -1) return ''
      var s = i + start.length
      var e = text.length
      for (var j = 0; j < ends.length; j++) {
        var idx = text.indexOf(ends[j], s)
        if (idx !== -1 && idx < e) e = idx
      }
      return text.slice(s, e).trim()
    }

    var wfCol = $app.findCollectionByNameOrId('workflow_results')
    var record = new Record(wfCol)
    record.set('theme', theme)
    record.set('agent_outputs', {})
    record.set('final_content', {})
    record.set('status', 'processing')
    record.set('error_note', '')
    $app.save(record)

    var outputs = {}
    var pLink = '',
      pName = '',
      pPrice = ''
    if (productId) {
      try {
        var p = $app.findRecordById('marketplace_products', productId)
        pLink = p.getString('link') || ''
        pName = p.getString('name') || ''
        pPrice = String(p.get('price') || '')
      } catch (_) {}
    }

    try {
      var tPrompt = loadPrompt('tendencia-relatorio').replace(/\[TENDÊNCIA\]/g, theme)
      outputs.trend_analysis = {
        raw: aiChat(
          tPrompt,
          'Você é um analista de tendências de moda especializado no mercado atacadista brasileiro.',
        ),
      }
      record.set('agent_outputs', outputs)
      $app.save(record)

      var mPrompt = loadPrompt('materia-completa').replace(/\[TEMA\]/g, theme)
      var mRaw = aiChat(
        mPrompt,
        'Você é uma equipe editorial completa especializada em moda. Siga o formato exatamente.',
      )
      var titulo = extractSection(mRaw, 'TÍTULO PRINCIPAL:', [
        'SUBTÍTULO:',
        'OLHO:',
        'CORPO DA MATÉRIA:',
      ])
      var corpo = extractSection(mRaw, 'CORPO DA MATÉRIA:', ['CALL TO ACTION', 'TAGS DE SEO'])
      outputs.article_content = { raw: mRaw, titulo_principal: titulo, corpo: corpo }
      record.set('agent_outputs', outputs)
      $app.save(record)

      var cPrompt = loadPrompt('legenda-instagram').replace(/\[TEMA\]/g, titulo || theme)
      var caption = aiChat(cPrompt, 'Responda apenas com a legenda, sem aspas, sem prefixos.')
        .replace(/^["'""]+|["'""]+$/g, '')
        .trim()
      if (pLink) caption += '\n\nVEJA O CATÁLOGO\n' + pLink
      outputs.instagram_caption = caption
      record.set('agent_outputs', outputs)
      $app.save(record)

      var rPrompt = loadPrompt('reels-script').replace(/\[TEMA\]/g, theme)
      var rRaw = aiChat(
        rPrompt,
        'Você é um assistente especializado em roteiros para Instagram Reels.',
      )
      if (pName) {
        rRaw += '\n\nPRODUTO EM DESTAQUE: ' + pName
        if (pPrice) rRaw += ' - R$ ' + pPrice
      }
      outputs.reel_script = { raw: rRaw }
      record.set('agent_outputs', outputs)
      $app.save(record)

      var sPrompt = loadPrompt('titulos-seo').replace(/\[TEMA\]/g, theme)
      var sRaw = aiChat(sPrompt, 'Responda apenas com a lista de títulos numerados, sem aspas.')
      var titulos = []
      var re = /\d+\s*[.)\-:]?\s*(.+?)(?=\n\s*\d+|$)/gi
      var match
      while ((match = re.exec(sRaw)) !== null) {
        if (match[1].trim()) titulos.push(match[1].trim())
      }
      if (!titulos.length) {
        titulos = sRaw
          .split('\n')
          .filter(function (l) {
            return l.trim()
          })
          .slice(0, 5)
      }
      outputs.seo_title = titulos
      record.set('agent_outputs', outputs)
      $app.save(record)

      var dPrompt = loadPrompt('descricao-youtube').replace(/\[TÍTULO DO VÍDEO\]/g, titulo || theme)
      var desc = aiChat(dPrompt, 'Responda apenas com a descrição completa, sem aspas.')
        .replace(/^["'"']|["'"']$/g, '')
        .trim()
      if (pLink) desc += '\n\nLink do produto: ' + pLink
      outputs.youtube_description = desc
      record.set('agent_outputs', outputs)
      $app.save(record)

      var finalContent = {
        trend_analysis: outputs.trend_analysis,
        article_content: outputs.article_content,
        instagram_caption: outputs.instagram_caption,
        reel_script: outputs.reel_script,
        seo_title: outputs.seo_title,
        youtube_description: outputs.youtube_description,
      }
      record.set('final_content', finalContent)
      record.set('status', 'completed')
      $app.save(record)

      try {
        var alCol = $app.findCollectionByNameOrId('audit_logs')
        var alRec = new Record(alCol)
        alRec.set('integration_name', 'multi_format_generator')
        alRec.set('integration_type', 'route')
        alRec.set('status', 'success')
        alRec.set('executed_at', new Date().toISOString())
        alRec.set('workflow_id', record.id)
        $app.save(alRec)
      } catch (_) {}

      return e.json(200, { success: true, id: record.id, final_content: finalContent })
    } catch (err) {
      var msg = err && err.message ? err.message : 'Erro desconhecido'
      if (err instanceof SkipAiConfigError) msg = 'IA não configurada'
      else if (err instanceof SkipAiError) msg = 'Erro de IA: ' + (err.message || '')
      record.set('status', 'failed')
      record.set('error_note', msg)
      record.set('agent_outputs', outputs)
      $app.save(record)
      try {
        var alColE = $app.findCollectionByNameOrId('audit_logs')
        var alRecE = new Record(alColE)
        alRecE.set('integration_name', 'multi_format_generator')
        alRecE.set('integration_type', 'route')
        alRecE.set('status', 'error')
        alRecE.set('executed_at', new Date().toISOString())
        alRecE.set('workflow_id', record.id)
        alRecE.set('error_message', msg)
        $app.save(alRecE)
      } catch (_) {}
      return e.json(500, { success: false, id: record.id, error: msg })
    }
  },
  $apis.requireAuth(),
)
