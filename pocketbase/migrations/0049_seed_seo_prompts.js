migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('prompt_library')

    var seeds = [
      {
        name: 'SEO Specialist (Checklist)',
        description: 'Otimiza um artigo concluído com checklist completo de SEO',
        slug: 'seo-checklist',
        category: 'super',
        prompt_content:
          'Você é um Especialista em SEO para a Revista MODA ATUAL DIGITAL.\n\nCONTEXTO:\nArtigo: [ARTIGO]\nTema: [TEMA]\n\nTAREFA:\nAnalise e otimize o artigo seguindo este checklist:\n1. Meta Title (max 60 caracteres, com palavra-chave principal)\n2. Meta Description (max 160 caracteres, atrativa)\n3. Headings: valide H1 único, H2/H3 hierárquicos\n4. Densidade de palavra-chave (ideal 1-2%)\n5. URL amigável (slug)\n6. Open Graph: título, descrição e imagem sugerida\n7. Links internos sugeridos entre edições\n8. Palavras-chave LSI/semânticas\n\nFORMATO DE RESPOSTA:\nRetorne APENAS JSON válido:\n{"meta_title":"","meta_description":"","slug":"","keyword_density":{},"headings":{"h1":[],"h2":[],"h3":[]},"og":{"title":"","description":"","image":""},"internal_links":[],"lsi_keywords":[],"recommendations":[]}',
      },
      {
        name: 'Sugestão de Palavras-Chave',
        description: 'Sugere palavras-chave por tema/editorial',
        slug: 'palavras-chave',
        category: 'advanced',
        prompt_content:
          'Você é um analista de SEO para revista de moda brasileira.\n\nTEMA: [TEMA]\n\nTAREFA:\nSugira 15 palavras-chave relevantes para o tema, considerando o mercado de moda brasileiro e atacadista.\n\nPara cada palavra-chave, forneça:\n- keyword: a palavra-chave\n- estimated_volume: volume de busca estimado (baixo/médio/alto)\n- difficulty: dificuldade de ranqueamento (0-100)\n- intent: informacional/comercial/transacional\n- related: 2 variações relacionadas\n\nFORMATO:\nRetorne APENAS JSON: {"keywords":[{"keyword":"","estimated_volume":"","difficulty":0,"intent":"","related":["",""]}]}',
      },
      {
        name: 'Relatório Mensal de SEO',
        description: 'Gera relatório mensal de posicionamento com oportunidades',
        slug: 'seo-relatorio-mensal',
        category: 'super',
        prompt_content:
          'Você é um consultor de SEO para a Revista MODA ATUAL DIGITAL.\n\nDADOS DE POSICIONAMENTO:\n[DADOS]\n\nTAREFA:\nGere um relatório mensal de SEO contendo:\n1. Resumo executivo\n2. Keywords que subiram e caíram\n3. Oportunidades de ranqueamento (keywords na página 2 - posições 11-20)\n4. Sugestões de novas pautas baseadas em alta demanda\n5. Recomendações de otimização\n\nFORMATO:\nRetorne APENAS JSON: {"summary":"","improved":[],"declined":[],"opportunities":[],"pauta_suggestions":[],"recommendations":[]}',
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
    var slugs = ['seo-checklist', 'palavras-chave', 'seo-relatorio-mensal']
    for (var i = 0; i < slugs.length; i++) {
      try {
        var r = app.findFirstRecordByData('prompt_library', 'slug', slugs[i])
        app.delete(r)
      } catch (_) {}
    }
  },
)
