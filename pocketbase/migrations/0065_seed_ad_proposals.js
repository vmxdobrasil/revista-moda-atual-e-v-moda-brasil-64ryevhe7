migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('ad_proposals')

    var editions = []
    try {
      editions = app.findRecordsByFilter('editions', '', '-created', 0, 0)
    } catch (_) {}

    var seeds = [
      {
        advertiser: 'Boutique Glamour',
        campaign: 'Coleção Verão 2026',
        format: 'capa',
        position: 'Capa principal',
        audience_reach: 45000,
        suggested_price: 12500,
        match_score: 85,
        status: 'enviado',
        proposal_data: {
          intro:
            'Proposta comercial para a Boutique Glamour destacar a Coleção Verão 2026 na capa da Revista MODA ATUAL.',
          value_proposition:
            'Associação da marca a uma edição de alta relevância no mercado da moda brasileira.',
          matched_theme: 'Tendências de Verão 2026',
          format_description:
            'Capa principal com identidade visual da marca integrada ao editorial.',
          reach_summary:
            'Estimativa de 45.000 impactos entre leitoras digitais e seguidores sociais.',
          pricing_summary:
            'R$ 12.500,00 — formato capa com ajuste por alcance e posicionamento premium.',
          cta: 'Garanta a exposição da sua marca na próxima edição.',
        },
        contract_date: '',
        delivery_date: '',
      },
      {
        advertiser: 'Atacado Modal',
        campaign: 'Campanha Atacado Outono',
        format: 'sponsored_content',
        position: 'Editorial destaque',
        audience_reach: 32000,
        suggested_price: 6800,
        match_score: 72,
        status: 'contrato',
        proposal_data: {
          intro: 'Proposta para conteúdo patrocinado do Atacado Modal no editorial de Outono.',
          value_proposition:
            'Conteúdo nativo que conecta compradores em escala às tendências da estação.',
          matched_theme: 'Compras em escala e tendências de atacado',
          format_description:
            'Artigo patrocinado com até 800 palavras, integrado ao fluxo editorial.',
          reach_summary:
            'Estimativa de 32.000 impactos combinando visualizações da edição e redes sociais.',
          pricing_summary: 'R$ 6.800,00 — sponsored_content com ajuste por alcance.',
          cta: 'Reserve seu espaço no editorial de Outono.',
        },
        contract_date: '2026-04-15',
        delivery_date: '2026-05-01',
      },
      {
        advertiser: 'Loja Center',
        campaign: 'Moda Praia 2026',
        format: 'banner',
        position: 'Banner lateral',
        audience_reach: 18000,
        suggested_price: 2160,
        match_score: 55,
        status: 'rascunho',
        proposal_data: {
          intro: 'Proposta para banner da Loja Center no especial de Moda Praia 2026.',
          value_proposition:
            'Visibilidade direta para produtos de moda praia com CTA para o e-commerce.',
          matched_theme: 'Moda Praia e Acessórios',
          format_description: 'Banner lateral com link direto para a loja virtual.',
          reach_summary: 'Estimativa de 18.000 impactos.',
          pricing_summary: 'R$ 2.160,00 — formato banner com ajuste por alcance.',
          cta: 'Destaque seus produtos no especial de Moda Praia.',
        },
        contract_date: '',
        delivery_date: '',
      },
    ]

    for (var i = 0; i < seeds.length; i++) {
      var s = seeds[i]
      try {
        app.findFirstRecordByData('ad_proposals', 'advertiser', s.advertiser)
      } catch (_) {
        var rec = new Record(col)
        rec.set('advertiser', s.advertiser)
        rec.set('campaign', s.campaign)
        rec.set('format', s.format)
        rec.set('position', s.position)
        rec.set('audience_reach', s.audience_reach)
        rec.set('suggested_price', s.suggested_price)
        rec.set('match_score', s.match_score)
        rec.set('proposal_data', s.proposal_data)
        rec.set('status', s.status)
        if (s.contract_date) rec.set('contract_date', s.contract_date)
        if (s.delivery_date) rec.set('delivery_date', s.delivery_date)
        if (editions.length > 0) {
          rec.set('edition', editions[i % editions.length].id)
        }
        app.save(rec)
      }
    }
  },
  (app) => {
    try {
      app.truncateCollection(app.findCollectionByNameOrId('ad_proposals'))
    } catch (_) {}
  },
)
