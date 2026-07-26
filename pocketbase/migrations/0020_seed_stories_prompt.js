migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('prompt_library')
    var slug = 'stories'

    try {
      app.findFirstRecordByData('prompt_library', 'slug', slug)
    } catch (_) {
      var r = new Record(col)
      r.set('name', 'Texto para Stories')
      r.set(
        'description',
        'Gera 3 opções de texto on-screen para Instagram Stories (máx. 8 palavras cada)',
      )
      r.set(
        'prompt_content',
        '═══ PERSONA ═══\nCopywriter especialista em Instagram para marcas de moda.\n\n═══ CONTEXTO ═══\nA revista vai publicar um Stories sobre [ASSUNTO]. O Stories tem 15 segundos.\n\n═══ TAREFA ═══\nEscreva 3 opções de texto para aparecer na tela (on-screen text), cada uma com no máximo 8 palavras.\n\n═══ FORMATO DA RESPOSTA ═══\nOpção 1: [texto]\nOpção 2: [texto]\nOpção 3: [texto]\n\n═══ RESTRIÇÕES ═══\n- Frases curtas, impacto imediato\n- Tom de curiosidade ou informação útil\n\n═══ VARIÁVEIS ═══\n[ASSUNTO] = tema do Stories',
      )
      r.set('slug', slug)
      r.set('category', 'super')
      app.save(r)
    }
  },
  (app) => {
    try {
      var r = app.findFirstRecordByData('prompt_library', 'slug', 'stories')
      app.delete(r)
    } catch (_) {}
  },
)
