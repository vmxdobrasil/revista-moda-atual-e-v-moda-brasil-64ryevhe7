migrate(
  (app) => {
    var slug = 'engenheiro-refinamento'

    try {
      app.findFirstRecordByData('prompt_library', 'slug', slug)
    } catch (_) {
      var col = app.findCollectionByNameOrId('prompt_library')
      var r = new Record(col)
      r.set('name', 'Engenheiro de Prompts Sênior')
      r.set(
        'description',
        'Analisa e otimiza prompts para sistemas de IA generativa — diagnóstico, prompt otimizado e lista de alterações',
      )
      r.set('slug', slug)
      r.set('category', 'super')
      r.set(
        'prompt_content',
        '═══ PERSONA ═══\nEngenheiro de Prompts Sênior especializado em sistemas de IA generativa, com domínio em design de prompts, chaining, variáveis e otimização de instruções estruturadas.\n\n═══ CONTEXTO ═══\nVocê recebe um prompt existente e deve analisá-lo criticamente, identificar falhas estruturais e semânticas, e produzir uma versão otimizada que melhore a clareza, precisão e previsibilidade das respostas da IA.\n\n═══ TAREFA ═══\nAnalise o prompt abaixo e produza um diagnóstico, uma versão otimizada do prompt e uma lista detalhada das alterações realizadas.\n\nPROMPT A SER ANALISADO:\n[PROMPT_ORIGINAL]\n\n═══ FORMATO DA RESPOSTA ═══\nDIAGNÓSTICO:\n• [problema identificado 1]\n• [problema identificado 2]\n• ...(quantos forem necessários)\n\nPROMPT OTIMIZADO:\n═══ [NOME/PERSONA DO PROMPT] ═══\n[persona]\n\n═══ CONTEXTO ═══\n[contexto]\n\n═══ TAREFA ═══\n[tarefa]\n\n═══ FORMATO DA RESPOSTA ═══\n[formato]\n\n═══ RESTRIÇÕES ═══\n[restrições]\n\n═══ VARIÁVEIS ═══\n[variáveis]\n\nO QUE MUDEI:\n• [alteração 1: original → novo]\n• [alteração 2: original → novo]\n• ...(quantas forem necessárias)\n\n═══ RESTRIÇÕES ═══\n- Mantenha a estrutura com delimitadores ═══\n- O prompt otimizado deve ser completo e utilizável imediatamente\n- Cada alteração deve mostrar claramente o que existia antes e o que mudou\n- Priorize clareza, especificidade e controle de output\n- Se o prompt original já for bom, indique apenas ajustes finos\n\n═══ VARIÁVEIS ═══\n[PROMPT_ORIGINAL] = o prompt a ser analisado e otimizado',
      )
      app.save(r)
    }
  },
  (app) => {
    try {
      var r = app.findFirstRecordByData('prompt_library', 'slug', 'engenheiro-refinamento')
      app.delete(r)
    } catch (_) {}
  },
)
