routerAdd(
  'POST',
  '/backend/v1/generate-reel-script',
  (e) => {
    const body = e.requestInfo().body || {}
    const tema = (body.tema || '').trim()
    if (!tema) {
      return e.badRequestError('Informe o tema do Reel (ex: /reels Macacões de verão)')
    }

    var promptRecord
    try {
      promptRecord = $app.findFirstRecordByData('prompt_library', 'slug', 'reels-script')
    } catch (_) {
      return e.json(500, { message: 'Prompt "reels-script" não encontrado na biblioteca' })
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
              'Você é um assistente especializado em criar roteiros para Instagram Reels. Responda apenas com o roteiro no formato solicitado, sem aspas, sem prefixos, sem comentários.',
          },
          { role: 'user', content: prompt },
        ],
      })

      var content = reply.choices[0].message.content.trim()

      var script = {
        type: 'reels-script',
        hook: extractField(content, 'TEXTO NA TELA (HOOK)'),
        cena1: extractCena(content, 'CENA 1'),
        cena2: extractCena(content, 'CENA 2'),
        cena3: extractCena(content, 'CENA 3'),
        cenaFinal: extractCenaFinal(content, 'CENA FINAL'),
        legenda: extractField(content, 'LEGENDA'),
        hashtags: extractHashtags(content),
        audio: extractField(content, 'ÁUDIO SUGERIDO'),
        raw: content,
      }

      if (!script.hook && !script.legenda) {
        return e.json(500, {
          message: 'Não foi possível gerar o roteiro. Tente novamente.',
        })
      }

      var recordId = ''
      try {
        var col = $app.findCollectionByNameOrId('story_texts')
        var record = new Record(col)
        record.set('subject', tema)
        record.set('options', script)
        $app.save(record)
        recordId = record.id
      } catch (saveErr) {
        console.log('Failed to save reels-script to story_texts:', saveErr.message)
      }

      return e.json(200, { script: script, recordId: recordId })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { message: 'IA temporariamente indisponível' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { message: 'Erro ao gerar roteiro. Tente novamente.' })
      }
      return e.json(500, { message: 'Erro inesperado ao gerar roteiro' })
    }
  },
  $apis.requireAuth(),
)

function extractField(content, fieldName) {
  var regex = new RegExp(fieldName + '\\s*:\\s*(.+)', 'i')
  var match = regex.exec(content)
  if (match) return match[1].trim()
  var altRegex = new RegExp(fieldName + '\\s*\\n\\s*(.+)', 'i')
  match = altRegex.exec(content)
  if (match) return match[1].trim()
  return ''
}

function extractCena(content, cenaName) {
  var regex = new RegExp(
    cenaName + '\\s*\\(([^)]+)\\)\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\n[A-Z]|$)',
    'i',
  )
  var match = regex.exec(content)
  if (!match) return { timing: '', visual: '', text: '' }
  var timing = match[1] ? match[1].trim() : ''
  var block = match[2] ? match[2].trim() : ''
  var visual = ''
  var text = ''
  var visualMatch = /[-•*]\s*Visual\s*:\s*(.+)/i.exec(block)
  if (visualMatch) visual = visualMatch[1].trim()
  var textMatch = /[-•*]\s*Texto na tela\s*:\s*(.+)/i.exec(block)
  if (textMatch) text = textMatch[1].trim()
  return { timing: timing, visual: visual, text: text }
}

function extractCenaFinal(content, cenaName) {
  var regex = new RegExp(
    cenaName + '\\s*\\(([^)]+)\\)\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\n[A-Z]|$)',
    'i',
  )
  var match = regex.exec(content)
  if (!match) return { timing: '', visual: '', text: '', cta: '' }
  var timing = match[1] ? match[1].trim() : ''
  var block = match[2] ? match[2].trim() : ''
  var visual = ''
  var text = ''
  var cta = ''
  var visualMatch = /[-•*]\s*Visual\s*:\s*(.+)/i.exec(block)
  if (visualMatch) visual = visualMatch[1].trim()
  var textMatch = /[-•*]\s*Texto na tela\s*:\s*(.+)/i.exec(block)
  if (textMatch) text = textMatch[1].trim()
  var ctaMatch = /[-•*]\s*CTA\s*:\s*(.+)/i.exec(block)
  if (ctaMatch) cta = ctaMatch[1].trim()
  return { timing: timing, visual: visual, text: text, cta: cta }
}

function extractHashtags(content) {
  var match = /HASHTAGS\s*:\s*(.+)/i.exec(content)
  if (!match) return []
  var tagStr = match[1].trim()
  var tags = tagStr.split(/\s+/).filter(function (t) {
    return t.startsWith('#')
  })
  if (tags.length === 0) {
    tags = tagStr
      .split(/[,;]/)
      .map(function (t) {
        return t.trim()
      })
      .filter(function (t) {
        return t.length > 0
      })
  }
  return tags.slice(0, 10)
}
