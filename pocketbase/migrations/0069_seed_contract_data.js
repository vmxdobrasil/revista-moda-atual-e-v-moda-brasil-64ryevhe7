migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('ad_proposals')

    var editions = []
    try {
      editions = app.findRecordsByFilter('editions', '', '-created', 0, 0)
    } catch (_) {}

    var now = new Date()
    var inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    var deliverySoon = inThreeDays.toISOString().split('T')[0]
    var todayStr = now.toISOString().split('T')[0]

    try {
      var existing = app.findFirstRecordByData('ad_proposals', 'advertiser', 'Atacado Modal')
      if (!existing.getString('contract_number')) {
        existing.set('contract_number', 'CT-2026-001')
        existing.set('contract_date_formal', '2026-04-15')
        existing.set('contract_signed_at', '2026-04-15')
        existing.set('contract_terms', {
          parties: { advertiser: 'Atacado Modal', publisher: 'Revista MODA ATUAL' },
          scope: {
            campaign: 'Campanha Atacado Outono',
            format: 'sponsored_content',
            position: 'Editorial destaque',
            audience_reach: 32000,
          },
          commercial: { agreed_price: 6800, currency: 'BRL' },
          delivery: { delivery_date: '2026-05-01' },
          validity: '30 dias a partir da assinatura',
          clauses: [
            'O anunciante autoriza o uso de imagem e marca na edição contratada.',
            'O conteúdo seguirá as diretrizes editoriais da Revista MODA ATUAL.',
            'O pagamento deve ser efetuado em até 15 dias após a assinatura.',
          ],
        })
        existing.set('status', 'contrato')
        app.save(existing)
      }
    } catch (_) {}

    try {
      app.findFirstRecordByData('ad_proposals', 'advertiser', 'Fashion Express')
    } catch (_) {
      var rec = new Record(col)
      rec.set('advertiser', 'Fashion Express')
      rec.set('campaign', 'Lançamento Primavera')
      rec.set('format', 'capa')
      rec.set('position', 'Capa principal')
      rec.set('audience_reach', 52000)
      rec.set('suggested_price', 15000)
      rec.set('match_score', 88)
      rec.set('status', 'contrato')
      rec.set('delivery_date', deliverySoon)
      rec.set('contract_number', 'CT-2026-002')
      rec.set('contract_date_formal', todayStr)
      rec.set('contract_signed_at', todayStr)
      rec.set('contract_terms', {
        parties: { advertiser: 'Fashion Express', publisher: 'Revista MODA ATUAL' },
        scope: {
          campaign: 'Lançamento Primavera',
          format: 'capa',
          position: 'Capa principal',
          audience_reach: 52000,
        },
        commercial: { agreed_price: 15000, currency: 'BRL' },
        delivery: { delivery_date: deliverySoon },
        validity: '30 dias a partir da assinatura',
        clauses: [
          'O anunciante autoriza o uso de imagem e marca na capa da edição.',
          'O conteúdo seguirá as diretrizes editoriais da Revista MODA ATUAL.',
          'O pagamento deve ser efetuado em até 15 dias após a assinatura.',
        ],
      })
      rec.set('proposal_data', {
        intro: 'Proposta para Fashion Express destacar o Lançamento Primavera na capa.',
        value_proposition: 'Associação premium da marca à edição de maior repercussão da estação.',
        matched_theme: 'Primavera Verão 2026',
        format_description: 'Capa principal com identidade visual integrada.',
        reach_summary: 'Estimativa de 52.000 impactos.',
        pricing_summary: 'R$ 15.000,00 — formato capa premium.',
        cta: 'Garanta a exposição da sua marca na próxima edição.',
        suggested_audiences: [],
      })
      if (editions.length > 0) {
        rec.set('edition', editions[0].id)
      }
      app.save(rec)
    }

    try {
      var lc = app.findFirstRecordByData('ad_proposals', 'advertiser', 'Loja Center')
      if (!lc.getString('delivery_date')) {
        var inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
        lc.set('delivery_date', inFiveDays.toISOString().split('T')[0])
        lc.set('status', 'aceito')
        app.save(lc)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      var rec = app.findFirstRecordByData('ad_proposals', 'advertiser', 'Fashion Express')
      app.delete(rec)
    } catch (_) {}
  },
)
