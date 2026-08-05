migrate(
  (app) => {
    var compCol = app.findCollectionByNameOrId('competitors')
    var sigCol = app.findCollectionByNameOrId('market_signals')

    var competitorsData = [
      [
        'Renner',
        'Varejista de moda brasileira com forte presenca digital',
        'instagram',
        '@renneroficial',
        'https://www.lojasrenner.com.br',
        8200000,
        1.2,
        12,
        ['tendencias', 'lifestyle', 'promocoes'],
        '2026-07-20',
        'Lider em varejo de moda nacional',
      ],
      [
        'C&A',
        'Rede de varejo de moda com foco em acessibilidade',
        'instagram',
        '@cea',
        'https://www.cea.com.br',
        5200000,
        0.9,
        10,
        ['sustentabilidade', 'casual', 'promocoes'],
        '2026-07-18',
        'Forte em moda casual e sustentavel',
      ],
      [
        'Riachuelo',
        'Varejista de moda com apelo jovem',
        'instagram',
        '@riachuelo',
        'https://www.riachuelo.com.br',
        3100000,
        1.5,
        8,
        ['jovem', 'tendencias', 'acessorios'],
        '2026-07-22',
        'Crescimento em engajamento recente',
      ],
      [
        'Shein',
        'Fast fashion global com crescimento acelerado no Brasil',
        'tiktok',
        '@shein_official',
        'https://www.shein.com.br',
        25500000,
        3.2,
        25,
        ['fast-fashion', 'tendencias', 'viral'],
        '2026-07-25',
        'Alto engajamento no TikTok, frequencia de posts elevada',
      ],
      [
        'Farm Rio',
        'Marca brasileira de moda feminina premium',
        'instagram',
        '@farmrio',
        'https://www.farmrio.com.br',
        2500000,
        2.1,
        15,
        ['premium', 'estampas', 'lifestyle'],
        '2026-07-23',
        'Marca aspiracional com forte identidade visual',
      ],
    ]

    var compIds = {}
    for (var i = 0; i < competitorsData.length; i++) {
      var d = competitorsData[i]
      try {
        app.findFirstRecordByData('competitors', 'name', d[0])
        continue
      } catch (_) {}
      var rec = new Record(compCol)
      rec.set('name', d[0])
      rec.set('description', d[1])
      rec.set('platform', d[2])
      rec.set('social_handle', d[3])
      rec.set('website', d[4])
      rec.set('logo_file', null)
      rec.set('followers', d[5])
      rec.set('engagement_rate', d[6])
      rec.set('post_frequency', d[7])
      rec.set('content_themes', d[8])
      rec.set('last_checked_at', d[9])
      rec.set('notes', d[10])
      app.save(rec)
      compIds[d[0]] = rec.id
    }

    for (var key in compIds) {
      // already have ids
    }
    if (Object.keys(compIds).length === 0) {
      for (var j = 0; j < competitorsData.length; j++) {
        try {
          var existing = app.findFirstRecordByData('competitors', 'name', competitorsData[j][0])
          compIds[competitorsData[j][0]] = existing.id
        } catch (_) {}
      }
    }

    var signalsData = [
      [
        'alerta_concorrente',
        'Shein lanca campanha agressiva de precos',
        'Shein investe em promocoes com ate 80% de desconto, impactando o mercado de fast fashion nacional.',
        'Shein',
        'atencao',
        'Monitoramento Instagram',
        '2026-07-24',
        'novo',
        { discount: '80%', platform: 'tiktok' },
      ],
      [
        'tendencia',
        'Farm Rio parceria com influencer para colecao verao',
        'Farm Rio anuncia colaboracao com influencer de moda para colecao de verao 2027.',
        'Farm Rio',
        'info',
        'Monitoramento Instagram',
        '2026-07-20',
        'novo',
        { collaboration: true },
      ],
      [
        'comportamento_consumidor',
        'Renner aumenta presenca no TikTok',
        'Renner duplica frequencia de posts no TikTok, buscando alcancar publico jovem.',
        'Renner',
        'info',
        'Analise de plataforma',
        '2026-07-19',
        'em_analise',
        { platform: 'tiktok', growth: '100%' },
      ],
      [
        'tendencia',
        'C&A lanca linha de moda sustentavel',
        'C&A apresenta nova linha com materiais reciclados e certificacoes ambientais.',
        'C&A',
        'atencao',
        'Monitoramento Instagram',
        '2026-07-17',
        'novo',
        { sustainable: true },
      ],
      [
        'mencao_marca',
        'Critica a fast fashion da Shein viraliza',
        'Video criticando modelo de fast fashion da Shein alcanca 2M de views no TikTok.',
        'Shein',
        'critico',
        'Monitoramento TikTok',
        '2026-07-16',
        'notificado',
        { views: 2000000, sentiment: 'negativo' },
      ],
      [
        'comportamento_consumidor',
        'Revival Y2K ganha forca no mercado',
        'Estetica dos anos 2000 resurgence com forca entre consumidores jovens brasileiros.',
        null,
        'atencao',
        'Analise de tendencias',
        '2026-07-15',
        'novo',
        { trend: 'Y2K', growth: 'alto' },
      ],
      [
        'alerta_concorrente',
        'Riachuelo expande colecao plus size',
        'Riachuelo amplia linha plus size com nova colecao exclusiva.',
        'Riachuelo',
        'info',
        'Monitoramento Instagram',
        '2026-07-14',
        'arquivado',
        { segment: 'plus-size' },
      ],
      [
        'mencao_marca',
        'Farm Rio em semana de moda internacional',
        'Farm Rio e destaque em semana de moda internacional, aumentando visibilidade da marca.',
        'Farm Rio',
        'atencao',
        'Monitoramento Instagram',
        '2026-07-12',
        'notificado',
        { event: 'fashion_week', visibility: 'internacional' },
      ],
    ]

    for (var s = 0; s < signalsData.length; s++) {
      var sd = signalsData[s]
      try {
        app.findFirstRecordByData('market_signals', 'title', sd[1])
        continue
      } catch (_) {}
      var sigRec = new Record(sigCol)
      sigRec.set('signal_type', sd[0])
      sigRec.set('title', sd[1])
      sigRec.set('description', sd[2])
      if (sd[3] && compIds[sd[3]]) {
        sigRec.set('competitor', compIds[sd[3]])
      }
      sigRec.set('severity', sd[4])
      sigRec.set('source', sd[5])
      sigRec.set('detected_at', sd[6])
      sigRec.set('status', sd[7])
      sigRec.set('related_data', sd[8])
      app.save(sigRec)
    }
  },
  (app) => {
    try {
      app.truncateCollection(app.findCollectionByNameOrId('market_signals'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('competitors'))
    } catch (_) {}
  },
)
