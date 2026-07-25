migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('prompt_library')

    const seeds = [
      {
        name: 'capa',
        description: 'Capa Editorial',
        prompt_content:
          'Você é um editor de moda. Crie uma descrição e título para a capa da próxima edição, destacando as tendências e marcas do TOP 60.',
        slug: 'capa',
        category: 'super',
      },
      {
        name: 'entrevista',
        description: 'Entrevista',
        prompt_content:
          'Você é um jornalista de moda. Elabore 5 perguntas para uma entrevista com um designer de moda nacional.',
        slug: 'entrevista',
        category: 'super',
      },
      {
        name: 'review',
        description: 'Review de Coleção',
        prompt_content:
          'Você é um crítico de moda. Escreva uma análise de 200 palavras sobre a coleção mais recente de [marca].',
        slug: 'review',
        category: 'super',
      },
      {
        name: 'social',
        description: 'Posts para Instagram',
        prompt_content:
          'Você é um estrategista de redes sociais. Gere 3 posts para Instagram Reels sobre o lançamento de [produto].',
        slug: 'social',
        category: 'super',
      },
      {
        name: 'workflow',
        description: 'Workflow de Conteúdo',
        prompt_content:
          'Inicie o workflow de conteúdo com o tema: [tema]. Os agentes irão criar conteúdo editorial, posts sociais e análise de tendências.',
        slug: 'workflow',
        category: 'super',
      },
    ]

    for (const s of seeds) {
      try {
        app.findFirstRecordByData('prompt_library', 'slug', s.slug)
      } catch (_) {
        const r = new Record(col)
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
    try {
      const col = app.findCollectionByNameOrId('prompt_library')
      app.truncateCollection(col)
    } catch (_) {}
  },
)
