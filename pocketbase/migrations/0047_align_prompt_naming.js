migrate(
  (app) => {
    var nameUpdates = [
      {
        slug: 'legenda-instagram',
        name: 'Legenda Instagram (generate_caption)',
        category: 'super',
      },
      {
        slug: 'descricao-youtube',
        name: 'Descricao YouTube (generate_descricao)',
        category: 'super',
      },
      {
        slug: 'materia-jornalistica',
        name: 'Materia Jornalistica (generate_materia)',
        category: 'super',
      },
      { slug: 'materia-completa', name: 'Materia Completa (generate_materia)', category: 'super' },
      { slug: 'reels-script', name: 'Roteiro de Reels (generate_reel_script)', category: 'super' },
      { slug: 'titulos-seo', name: 'Titulos SEO (generate_titulos)', category: 'super' },
      {
        slug: 'tendencia-relatorio',
        name: 'Relatorio de Tendencias (generate_trend_report)',
        category: 'super',
      },
      { slug: 'plano-semanal', name: 'Plano Semanal (generate_weekly_plan)', category: 'super' },
      { slug: 'reel', name: 'Roteiro de Reel (generate_reel)', category: 'super' },
      {
        slug: 'legenda-atacadista',
        name: 'Legenda Atacadista (generate_legenda_atacadista)',
        category: 'super',
      },
      { slug: 'meta-prompt', name: 'Meta Prompt (generate_meta_prompt)', category: 'super' },
      {
        slug: 'arquiteto-workflow',
        name: 'Arquiteto de Workflow (generate_arquiteto_workflow)',
        category: 'super',
      },
      {
        slug: 'engenheiro-refinamento',
        name: 'Engenheiro de Prompts (generate_engenheiro_refinamento)',
        category: 'super',
      },
      { slug: 'stories', name: 'Texto para Stories', category: 'super' },
      { slug: 'auditoria', name: 'Auditoria do Sistema', category: 'super' },
      { slug: 'edicao-de-roupas', name: 'Edicao de Roupas', category: 'super' },
      { slug: 'suporte-de-entrega', name: 'Suporte de Entrega', category: 'super' },
    ]

    for (var i = 0; i < nameUpdates.length; i++) {
      var u = nameUpdates[i]
      try {
        var r = app.findFirstRecordByData('prompt_library', 'slug', u.slug)
        r.set('name', u.name)
        r.set('category', u.category)
        app.save(r)
      } catch (_) {}
    }

    var categoryFixes = [
      { slug: 'basic-super-prompt-1', category: 'basic' },
      { slug: 'basic-super-prompt-2', category: 'basic' },
      { slug: 'advanced-super-prompt', category: 'advanced' },
    ]
    for (var j = 0; j < categoryFixes.length; j++) {
      var cf = categoryFixes[j]
      try {
        var r2 = app.findFirstRecordByData('prompt_library', 'slug', cf.slug)
        r2.set('category', cf.category)
        app.save(r2)
      } catch (_) {}
    }

    try {
      var ep = app.findFirstRecordByData('prompt_library', 'slug', 'engenheiro-prompts')
      ep.set('name', 'Engenheiro de Prompts (Legado)')
      ep.set('category', 'super')
      app.save(ep)
    } catch (_) {}

    try {
      app.findFirstRecordByData('prompt_library', 'slug', 'chamada-newsletter')
    } catch (_) {
      try {
        var col = app.findCollectionByNameOrId('prompt_library')
        var nr = new Record(col)
        nr.set('name', 'Chamada Newsletter')
        nr.set(
          'description',
          'Prompt para gerar chamadas atrativas para newsletter da Revista MODA ATUAL',
        )
        nr.set('slug', 'chamada-newsletter')
        nr.set('category', 'super')
        nr.set(
          'prompt_content',
          '\u2550\u2550\u2550 PERSONA \u2550\u2550\u2550\nCopywriter especialista em email marketing para revista de moda.\n\n\u2550\u2550\u2550 CONTEXTO \u2550\u2550\u2550\nA Revista MODA ATUAL DIGITAL vai enviar uma newsletter sobre [TEMA].\n\n\u2550\u2550\u2550 TAREFA \u2550\u2550\u2550\nCrie uma chamada atrativa para a newsletter, com no maximo 100 caracteres, que gere curiosidade e cliques.\n\n\u2550\u2550\u2550 FORMATO DA RESPOSTA \u2550\u2550\u2550\nApenas a chamada, texto corrido.\n\n\u2550\u2550\u2550 RESTRICOES \u2550\u2550\u2550\n- Nao use cliches\n- Tom profissional e informativo\n- Maximo 100 caracteres\n\n\u2550\u2550\u2550 VARIAVEIS \u2550\u2550\u2550\n[TEMA] = assunto da newsletter',
        )
        app.save(nr)
      } catch (_) {}
    }
  },
  (app) => {
    try {
      var r = app.findFirstRecordByData('prompt_library', 'slug', 'chamada-newsletter')
      app.delete(r)
    } catch (_) {}
  },
)
