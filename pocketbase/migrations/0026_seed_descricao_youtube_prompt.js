migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('prompt_library')
    var slug = 'descricao-youtube'

    try {
      app.findFirstRecordByData('prompt_library', 'slug', slug)
    } catch (_) {
      var r = new Record(col)
      r.set('name', 'Descrição YouTube')
      r.set('description', 'Gera descrição SEO para vídeos no YouTube da Revista MODA ATUAL')
      r.set(
        'prompt_content',
        '═══ PERSONA ═══\nEspecialista em SEO para YouTube e moda.\n\n═══ CONTEXTO ═══\nO vídeo [TÍTULO DO VÍDEO] será publicado no canal da Revista MODA ATUAL no YouTube.\n\n═══ TAREFA ═══\nEscreva uma descrição de 3 parágrafos:\n1º parágrafo: resumo do vídeo (2 linhas)\n2º parágrafo: contexto/credibilidade da revista\n3º parágrafo: call to action + hashtags\n\n═══ FORMATO DA RESPOSTA ═══\nDescrição completa, pronta para copiar e colar.\n\n═══ RESTRIÇÕES ═══\n- Incluir 3 hashtags relevantes\n- Mencionar o V MODA BRASIL no 2º parágrafo\n- Link para o site no final\n\n═══ VARIÁVEIS ═══\n[TÍTULO DO VÍDEO] = título do vídeo',
      )
      r.set('slug', slug)
      r.set('category', 'basic')
      app.save(r)
    }
  },
  (app) => {
    try {
      var r = app.findFirstRecordByData('prompt_library', 'slug', 'descricao-youtube')
      app.delete(r)
    } catch (_) {}
  },
)
