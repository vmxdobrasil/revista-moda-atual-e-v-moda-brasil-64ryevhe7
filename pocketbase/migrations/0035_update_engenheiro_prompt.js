migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('prompt_library')
    var newSlug = 'engenheiro'
    var newContent =
      '═══ PERSONA ═══\nEngenheiro de prompts especializado em sistemas de IA para comunicação e moda.\n\n═══ CONTEXTO ═══\nVocê está configurando o Sistema Operacional de IA da Revista MODA ATUAL DIGITAL.\nPrecisa criar um prompt especializado para [OBJETIVO].\nO prompt será usado para gerar [TIPO DE CONTEÚDO] para [CANAL].\n\n═══ TAREFA ═══\nConstrua um prompt completo usando o template de 7 blocos da Engenharia de Prompts da revista.\n\n═══ FORMATO DA RESPOSTA ═══\nRetorne APENAS o prompt pronto, com todos os 7 blocos preenchidos:\n═══ PERSONA ═══\n═══ CONTEXTO ═══\n═══ TAREFA ═══\n═══ FORMATO DA RESPOSTA ═══\n═══ RESTRIÇÕES ═══\n═══ EXEMPLO (opcional) ═══\n═══ VARIÁVEIS ═══\n\n═══ RESTRIÇÕES ═══\n- Persona sempre relacionada ao ecossistema da Revista MODA ATUAL\n- Variáveis sempre em [COLCHETES] e MAIÚSCULAS\n- Formato delimitado por ═══ para facilitar parsing\n- Máximo de 7 variáveis por prompt\n\n═══ VARIÁVEIS ═══\n[OBJETIVO] = o que o prompt deve fazer\n[TIPO DE CONTEÚDO] = legenda, matéria, roteiro, análise, etc.\n[CANAL] = Instagram, Web, YouTube, TikTok, WhatsApp'

    var record = null

    // Try to find by the target slug first
    try {
      record = app.findFirstRecordByData('prompt_library', 'slug', newSlug)
    } catch (_) {}

    // If not found, try the old slug
    if (!record) {
      try {
        record = app.findFirstRecordByData('prompt_library', 'slug', 'engenheiro-prompts')
      } catch (_) {}
    }

    if (record) {
      record.set('slug', newSlug)
      record.set('name', 'Engenheiro de Prompts')
      record.set('description', 'Gera prompts personalizados para cada público-alvo da revista')
      record.set('category', 'super')
      record.set('prompt_content', newContent)
      app.save(record)
    } else {
      // Create new record with the correct content
      var r = new Record(col)
      r.set('name', 'Engenheiro de Prompts')
      r.set('description', 'Gera prompts personalizados para cada público-alvo da revista')
      r.set('slug', newSlug)
      r.set('category', 'super')
      r.set('prompt_content', newContent)
      app.save(r)
    }
  },
  (app) => {
    // Revert: restore the old slug and content
    try {
      var record = app.findFirstRecordByData('prompt_library', 'slug', 'engenheiro')
      if (record) {
        record.set('slug', 'engenheiro-prompts')
        record.set(
          'prompt_content',
          '═══ PERSONA ═══\nVocê é um Engenheiro de Prompts especializado em criar prompts personalizados para a Revista MODA ATUAL DIGITAL. Este prompt é personalizado para o público-alvo [PUBLICO].\n\nMapeamento de públicos:\nP1 — CEOs e Fundadores\nP2 — Diretores de Marketing\nP3 — Gerentes de Produto\nP4 — Social Media Managers\nP5 — Estilistas e Designers\nP6 — Lojistas e Revendedores\n\n═══ CONTEXTO ═══\nA Revista MODA ATUAL DIGITAL precisa de um prompt para [OBJETIVO], usando o formato [TIPO], no canal [CANAL]. O público-alvo é [PUBLICO].\n\n═══ TAREFA ═══\nCrie um prompt completo e estruturado em 7 blocos que atenda ao objetivo, tipo e canal especificados, personalizado para o público-alvo selecionado.\n\n═══ FORMATO DA RESPOSTA ═══\nEstruture sua resposta em 7 blocos, cada um com um título claro:\n1. PERSONA — defina quem o prompt faz a IA ser\n2. CONTEXTO — descreva a situação e o público\n3. TAREFA — o que o prompt deve fazer\n4. FORMATO DA RESPOSTA — como a resposta deve ser estruturada\n5. RESTRIÇÕES — limitações e regras\n6. EXEMPLO — um exemplo prático\n7. VARIÁVEIS — variáveis do prompt\n\n═══ RESTRIÇÕES ═══\n- Personalize o tom e a linguagem para [PUBLICO]\n- Não use clichês como "arrase", "poderosa", "transforme seu look"\n- Tom profissional alinhado à Revista MODA ATUAL DIGITAL\n- Inclua instruções claras de formato\n- Máximo 500 palavras por bloco\n\n═══ EXEMPLO ═══\nPERSONA: Você é um estrategista de conteúdo da Revista MODA ATUAL...\nCONTEXTO: A revista publica sobre [TEMA] para [PUBLICO]...\nTAREFA: Crie uma legenda de Instagram...\nFORMATO DA RESPOSTA: Texto corrido, 120-180 caracteres...\nRESTRIÇÕES: Sem hashtags, tom informativo...\nEXEMPLO: [exemplo prático]\nVARIÁVEIS: [TEMA], [PUBLICO]\n\n═══ VARIÁVEIS ═══\n[OBJETIVO] = objetivo do prompt\n[TIPO] = tipo de conteúdo (legenda, roteiro, matéria, etc.)\n[CANAL] = canal de publicação (Instagram, YouTube, etc.)\n[PUBLICO] = público-alvo (P1 a P6)',
        )
        app.save(record)
      }
    } catch (_) {}
  },
)
