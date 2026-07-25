migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('social_posts')

    const seeds = [
      {
        hook: 'Não use calça alfaiataria se você quer parecer mais jovem',
        description: 'Dica de estilo que quebra expectativas',
        format: 'Reel',
        post_date: '2026-01-05',
        views: 245000,
        likes: 18900,
        comments: 1240,
        shares: 3200,
        saves: 8700,
        remixes: 45,
        new_followers: 1200,
      },
      {
        hook: '3 peças que vão sumir do guarda-roupa em 2026',
        description: 'Tendências que estão saindo de cena',
        format: 'Reel',
        post_date: '2026-01-12',
        views: 412000,
        likes: 32100,
        comments: 2800,
        shares: 6400,
        saves: 15200,
        remixes: 89,
        new_followers: 3100,
      },
      {
        hook: 'Como usar cor de moda sem parecer piada',
        description: 'Guia de combinação de cores ousadas',
        format: 'Reel',
        post_date: '2026-01-20',
        views: 189000,
        likes: 14200,
        comments: 980,
        shares: 2100,
        saves: 6300,
        remixes: 22,
        new_followers: 850,
      },
      {
        hook: 'O segredo das influenciadoras que ninguém te conta',
        description: 'Bastidores do mercado da moda',
        format: 'Reel',
        post_date: '2026-02-01',
        views: 567000,
        likes: 48200,
        comments: 5200,
        shares: 9800,
        saves: 22400,
        remixes: 156,
        new_followers: 5400,
      },
      {
        hook: 'Pare de comprar roupas pretas (eu disse isso)',
        description: 'Provocação sobre o básico seguro',
        format: 'Reel',
        post_date: '2026-02-10',
        views: 389000,
        likes: 36100,
        comments: 4100,
        shares: 7600,
        saves: 18900,
        remixes: 102,
        new_followers: 4200,
      },
      {
        hook: 'Tendência alfaiataria: o que usar no outono',
        description: 'Lookbook da estação',
        format: 'Reel',
        post_date: '2026-02-18',
        views: 98000,
        likes: 6200,
        comments: 340,
        shares: 890,
        saves: 2100,
        remixes: 8,
        new_followers: 320,
      },
      {
        hook: 'A cor que vai dominar 2026 segundo o Pinterest',
        description: 'Análise de tendência preditiva',
        format: 'Reel',
        post_date: '2026-03-01',
        views: 278000,
        likes: 21400,
        comments: 1670,
        shares: 4300,
        saves: 11200,
        remixes: 67,
        new_followers: 1800,
      },
      {
        hook: 'Por que suas roupas parecem baratas (e como resolver)',
        description: 'Dicas de qualidade de tecido e caimento',
        format: 'Reel',
        post_date: '2026-03-10',
        views: 445000,
        likes: 39800,
        comments: 3200,
        shares: 8100,
        saves: 19700,
        remixes: 134,
        new_followers: 4800,
      },
      {
        hook: 'Mix de estampas sem erro: o guia definitivo',
        description: 'Tutorial de combinação de patterns',
        format: 'Reel',
        post_date: '2026-03-18',
        views: 156000,
        likes: 10800,
        comments: 720,
        shares: 1800,
        saves: 5400,
        remixes: 15,
        new_followers: 640,
      },
    ]

    for (const s of seeds) {
      try {
        app.findFirstRecordByData('social_posts', 'hook', s.hook)
      } catch (_) {
        const record = new Record(col)
        record.set('hook', s.hook)
        record.set('description', s.description || '')
        record.set('format', s.format)
        record.set('post_date', s.post_date)
        record.set('views', s.views)
        record.set('likes', s.likes)
        record.set('comments', s.comments)
        record.set('shares', s.shares)
        record.set('saves', s.saves)
        record.set('remixes', s.remixes || 0)
        record.set('new_followers', s.new_followers || 0)
        app.save(record)
      }
    }

    const allPosts = app.findRecordsByFilter('social_posts', '', '-engagement_rate', 0, 0)
    const total = allPosts.length
    if (total === 0) return
    const threshold = Math.max(1, Math.ceil(total * 0.25))
    for (let i = 0; i < total; i++) {
      const isTop = i < threshold
      if (allPosts[i].getBool('is_top_performer') !== isTop) {
        allPosts[i].set('is_top_performer', isTop)
        app.save(allPosts[i])
      }
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('social_posts')
      app.truncateCollection(col)
    } catch (_) {}
  },
)
