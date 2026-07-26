migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('prompt_library')

    var slugLegenda = 'legenda-instagram'
    try {
      app.findFirstRecordByData('prompt_library', 'slug', slugLegenda)
    } catch (_) {
      var r1 = new Record(col)
      r1.set('name', 'Legenda Instagram – Revista MODA ATUAL')
      r1.set('description', 'Gera legendas no estilo da Revista MODA ATUAL DIGITAL para Instagram')
      r1.set(
        'prompt_content',
        '═══ PERSONA ═══\nVocê é um editor da Revista MODA ATUAL DIGITAL, especializada em moda, negócios e tendências do Polo de Moda de Goiás, com tom profissional, acolhedor e informativo.\n\n═══ CONTEXTO ═══\nA revista publica um post no Instagram sobre [TEMA]. O público são mulheres empreendedoras da moda, lojistas e revendedoras.\n\n═══ TAREFA ═══\nCrie uma legenda de 120 a 180 caracteres que apresente o tema de forma atraente.\n\n═══ FORMATO DA RESPOSTA ═══\nResponda apenas com a legenda, sem aspas ou comentários.\n\n═══ RESTRIÇÕES ═══\n- Não use clichês ("arrase", "poderosa", "transforme seu look")\n- Não comece com "Você sabia?"\n- Tom informativo, não de venda\n- Não use hashtags\n\n═══ VARIÁVEIS ═══\n[TEMA] = tema do post',
      )
      r1.set('slug', slugLegenda)
      r1.set('category', 'super')
      app.save(r1)
    }

    var slugNewsletter = 'chamada-newsletter'
    try {
      app.findFirstRecordByData('prompt_library', 'slug', slugNewsletter)
    } catch (_) {
      var r2 = new Record(col)
      r2.set('name', 'Chamada para Newsletter')
      r2.set(
        'description',
        'Gera 3 opções de call-to-action para newsletters de moda, com no máximo 12 palavras cada',
      )
      r2.set(
        'prompt_content',
        '═══ PERSONA ═══\nCopywriter especialista em marketing de moda e newsletters.\n\n═══ CONTEXTO ═══\nA revista vai enviar uma newsletter sobre [TEMA]. O objetivo é gerar uma chamada (call-to-action) que incentive a abertura e leitura.\n\n═══ TAREFA ═══\nEscreva 3 opções de chamada para newsletter, cada uma com no máximo 12 palavras.\n\n═══ FORMATO DA RESPOSTA ═══\nOpção 1: [texto]\nOpção 2: [texto]\nOpção 3: [texto]\n\n═══ RESTRIÇÕES ═══\n- Frases de impacto, gerando curiosidade\n- Tom profissional mas atraente\n- Foco no benefício para o leitor\n- Não use clichês\n\n═══ VARIÁVEIS ═══\n[TEMA] = tema da newsletter',
      )
      r2.set('slug', slugNewsletter)
      r2.set('category', 'super')
      app.save(r2)
    }
  },
  (app) => {
    try {
      var r2 = app.findFirstRecordByData('prompt_library', 'slug', 'chamada-newsletter')
      app.delete(r2)
    } catch (_) {}
  },
)
