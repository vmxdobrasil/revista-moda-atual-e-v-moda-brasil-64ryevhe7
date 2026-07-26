migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('prompt_library')
    var slug = 'reels-script'

    try {
      app.findFirstRecordByData('prompt_library', 'slug', slug)
    } catch (_) {
      var r = new Record(col)
      r.set('name', 'Roteiro de Reels')
      r.set(
        'description',
        'Gera um roteiro completo de Reels para Instagram com cenas, legenda, hashtags e áudio sugerido.',
      )
      r.set('slug', slug)
      r.set('category', 'super')
      r.set(
        'prompt_content',
        '═══ PERSONA ═══\nVocê é um roteirista especialista em Instagram Reels para moda, com foco em tendências do Polo de Moda de Goiás e do mercado fashion brasileiro. Tom profissional, dinâmico, criativo e focado em engajamento.\n\n═══ CONTEXTO ═══\nA Revista MODA ATUAL DIGITAL vai produzir um Reel de 15 segundos sobre [TEMA]. O público são mulheres empreendedoras da moda, lojistas e revendedoras.\n\n═══ TAREFA ═══\nCrie um roteiro completo e detalhado para Instagram Reel de 15 segundos, com cenas cronometradas, texto na tela, legenda, hashtags e sugestão de áudio.\n\n═══ FORMATO DA RESPOSTA ═══\nResponda EXATAMENTE no formato abaixo, usando os marcadores em cada linha:\n\nTEXTO NA TELA (HOOK): [máximo 3 palavras]\n\nCENA 1 (0-3s):\n- Visual: [descrição da cena]\n- Texto na tela: [texto curto]\n\nCENA 2 (3-8s):\n- Visual: [descrição da cena]\n- Texto na tela: [texto curto]\n\nCENA 3 (8-15s):\n- Visual: [descrição da cena]\n- Texto na tela: [texto curto]\n\nCENA FINAL (últimos 3s):\n- Visual: [descrição da cena]\n- Texto na tela: [texto do CTA]\n- CTA: VEJA O CATÁLOGO\n\nLEGENDA: [legenda de 120 a 150 caracteres terminando com "VEJA O CATÁLOGO no link da bio"]\n\nHASHTAGS: [exatamente 10 hashtags separadas por espaço, começando com #]\n\nÁUDIO SUGERIDO: [estilo musical ou trend atual]\n\n═══ RESTRIÇÕES ═══\n- O hook (texto na tela inicial) deve ter no máximo 3 palavras\n- O Reel deve ter exatamente 15 segundos\n- A legenda deve ter entre 120 e 150 caracteres\n- A legenda deve terminar obrigatoriamente com "VEJA O CATÁLOGO no link da bio"\n- Exatamente 10 hashtags devem ser sugeridas\n- O CTA da cena final deve ser sempre "VEJA O CATÁLOGO"\n- Não use clichês como "arrase", "poderosa", "transforme seu look"\n- Tom informativo e inspirador, não de venda agressiva\n- Inclua indicação de cena/visual detalhada\n- Responda apenas com o roteiro, sem aspas, sem comentários adicionais\n\n═══ VARIÁVEIS ═══\n[TEMA] = tema do Reel',
      )
      app.save(r)
    }
  },
  (app) => {
    try {
      var r = app.findFirstRecordByData('prompt_library', 'slug', 'reels-script')
      app.delete(r)
    } catch (_) {}
  },
)
