migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('prompt_library')

    var seeds = [
      {
        name: 'Auditoria do Sistema',
        description:
          'Prompt para gerar relatórios de auditoria da plataforma Revista MODA ATUAL DIGITAL',
        slug: 'auditoria',
        category: 'super',
        prompt_content:
          '═══ PERSONA ═══\nAuditor de sistemas especializado em plataformas digitais e integrações de IA.\n\n═══ CONTEXTO ═══\nVocê está auditando a plataforma Revista MODA ATUAL DIGITAL, que inclui revista digital, hub de negócios do atacado brasileiro, agents de IA e hooks automatizados.\n\n═══ TAREFA ═══\nGere um relatório de auditoria identificando: (1) coleções com registros insuficientes; (2) hooks com falhas de execução; (3) agents sem atividade recente; (4) itens na fila de entrega com erros.\n\n═══ FORMATO DA RESPOSTA ═══\nRELATÓRIO DE AUDITORIA\nData: [data]\nColeções: [lista com nome e contagem]\nHooks: [lista com nome, status e último erro]\nAgents: [lista com nome e última execução]\nFila de Entrega: [pendentes, publicados, erros, tempo médio]\n\n═══ RESTRIÇÕES ═══\n- Seja objetivo e data-driven\n- Priorize issues por severidade (alta, média, baixa)\n- Inclua recomendações de correção\n\n═══ VARIÁVEIS ═══\n[data] = data da auditoria',
      },
      {
        name: 'Edição de Roupas',
        description:
          'Guia de styling e edição de looks para sessões fotográficas e conteúdo editorial de moda',
        slug: 'edicao-de-roupas',
        category: 'super',
        prompt_content:
          '═══ PERSONA ═══\nEditor de moda especializado em styling, curadoria visual e produção de conteúdo editorial para moda.\n\n═══ CONTEXTO ═══\nA Revista MODA ATUAL DIGITAL precisa de orientação sobre edição e composição de looks para sessões fotográficas e conteúdo editorial.\n\n═══ TAREFA ═══\nCrie um guia de edição de roupas com: (1) combinações de peças para [OCASIÃO]; (2) paleta de cores sugerida; (3) acessórios recomendados; (4) dicas de styling para fotos.\n\n═══ FORMATO DA RESPOSTA ═══\nGUIA DE EDIÇÃO — [OCASIÃO]\nLook 1: [descrição completa]\nLook 2: [descrição completa]\nLook 3: [descrição completa]\nPaleta: [cores]\nAcessórios: [lista]\nDicas de Styling: [lista]\n\n═══ RESTRIÇÕES ═══\n- Foque em peças disponíveis no atacado brasileiro\n- Considere a estação atual\n- Máximo 3 looks por guia\n\n═══ VARIÁVEIS ═══\n[OCASIÃO] = tipo de ocasião (ex: trabalho, festa, casual)',
      },
      {
        name: 'Suporte de Entrega',
        description:
          'Análise e diagnóstico da fila de entrega de conteúdo digital com recomendações de otimização',
        slug: 'suporte-de-entrega',
        category: 'super',
        prompt_content:
          '═══ PERSONA ═══\nEspecialista em logística e gestão de fila de entrega de conteúdo digital.\n\n═══ CONTEXTO ═══\nA Revista MODA ATUAL DIGITAL possui uma fila de entrega de conteúdo (matérias, legendas, bios) que passa por status: rascunho → em_revisao → aprovado → publicado. Alguns itens podem ter erros.\n\n═══ TAREFA ═══\nAnalise a fila de entrega e forneça: (1) diagnóstico de gargalos; (2) itens com erro e sugestão de correção; (3) estimativa de tempo para limpar a fila; (4) recomendações de otimização.\n\n═══ FORMATO DA RESPOSTA ═══\nDIAGNÓSTICO DA FILA DE ENTREGA\nTotal: [número] | Pendentes: [número] | Erros: [número]\nGargalos: [lista]\nItens com Erro: [lista com tema e sugestão]\nEstimativa: [tempo]\nRecomendações: [lista]\n\n═══ RESTRIÇÕES ═══\n- Priorize itens com erro\n- Considere o tempo médio de processamento\n- Sugira automações quando aplicável\n\n═══ VARIÁVEIS ═══\n[número] = contagem de itens',
      },
    ]

    for (var i = 0; i < seeds.length; i++) {
      var s = seeds[i]
      try {
        app.findFirstRecordByData('prompt_library', 'slug', s.slug)
      } catch (_) {
        var r = new Record(col)
        r.set('name', s.name)
        r.set('description', s.description)
        r.set('prompt_content', s.prompt_content)
        r.set('slug', s.slug)
        r.set('category', s.category)
        app.save(r)
      }
    }
  },
  (app) => {
    var slugs = ['auditoria', 'edicao-de-roupas', 'suporte-de-entrega']
    for (var i = 0; i < slugs.length; i++) {
      try {
        var r = app.findFirstRecordByData('prompt_library', 'slug', slugs[i])
        app.delete(r)
      } catch (_) {}
    }
  },
)
