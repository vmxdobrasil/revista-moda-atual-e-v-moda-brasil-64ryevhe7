routerAdd('GET', '/backend/v1/public/anunciante', (e) => {
  var advertiser = e.requestInfo().query['advertiser'] || ''
  var accessToken = e.requestInfo().query['token'] || ''

  if (!advertiser) {
    return e.badRequestError('Parâmetro "advertiser" é obrigatório')
  }
  if (!accessToken) {
    return e.json(401, { message: 'Token de acesso é obrigatório. Faça login para continuar.' })
  }

  var proposals = []
  try {
    proposals = $app.findRecordsByFilter(
      'ad_proposals',
      'advertiser = {:adv} && access_token = {:tok}',
      '-created',
      0,
      0,
      { adv: advertiser, tok: accessToken },
    )
  } catch (_) {
    return e.json(401, { message: 'Credenciais inválidas' })
  }

  if (proposals.length === 0) {
    return e.json(401, { message: 'Credenciais inválidas' })
  }

  var formatLabels = {
    banner: 'Banner',
    capa: 'Capa',
    pagina_inteira: 'Página Inteira',
    sponsored_content: 'Conteúdo Patrocinado',
    story: 'Story',
    editorial_destaque: 'Editorial Destaque',
  }

  var campaigns = []
  var totalReach = 0
  var totalEngagement = 0

  for (var i = 0; i < proposals.length; i++) {
    var p = proposals[i]
    var editionId = p.getString('edition')
    var editionTitle = ''
    if (editionId) {
      try {
        var ed = $app.findRecordById('editions', editionId)
        editionTitle = ed.getString('title')
      } catch (_) {}
    }

    var totalViews = 0,
      totalLikes = 0,
      totalComments = 0,
      totalShares = 0,
      totalSaves = 0,
      avgEngagement = 0,
      postCount = 0

    if (editionId) {
      try {
        var posts = $app.findRecordsByFilter(
          'social_posts',
          'edition = {:eid}',
          '-post_date',
          0,
          0,
          { eid: editionId },
        )
        postCount = posts.length
        for (var j = 0; j < posts.length; j++) {
          totalViews += posts[j].getInt('views') || 0
          totalLikes += posts[j].getInt('likes') || 0
          totalComments += posts[j].getInt('comments') || 0
          totalShares += posts[j].getInt('shares') || 0
          totalSaves += posts[j].getInt('saves') || 0
          avgEngagement += posts[j].getFloat('engagement_rate') || 0
        }
        if (postCount > 0) avgEngagement = avgEngagement / postCount
      } catch (_) {}
    }

    totalReach += totalViews
    totalEngagement += totalLikes + totalComments + totalShares + totalSaves

    var fmt = p.getString('format')
    campaigns.push({
      id: p.id,
      campaign: p.getString('campaign'),
      edition_title: editionTitle,
      format: fmt,
      format_label: formatLabels[fmt] || fmt,
      position: p.getString('position'),
      status: p.getString('status'),
      delivery_date: p.getString('delivery_date'),
      audience_reach: p.getInt('audience_reach'),
      contract_number: p.getString('contract_number'),
      contract_date_formal: p.getString('contract_date_formal'),
      metrics: {
        total_views: totalViews,
        total_likes: totalLikes,
        total_comments: totalComments,
        total_shares: totalShares,
        total_saves: totalSaves,
        avg_engagement_rate: Math.round(avgEngagement * 10000) / 10000,
        post_count: postCount,
      },
    })
  }

  return e.json(200, {
    advertiser: advertiser,
    campaigns: campaigns,
    summary: {
      total_campaigns: campaigns.length,
      total_reach: totalReach,
      total_engagement: totalEngagement,
    },
  })
})
