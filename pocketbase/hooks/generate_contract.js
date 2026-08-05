routerAdd(
  'POST',
  '/backend/v1/proposta-contrato',
  (e) => {
    var body = e.requestInfo().body || {}
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var proposalId = (body.proposal_id || '').trim()
    if (!proposalId) {
      return e.badRequestError('ID da proposta é obrigatório', {
        proposal_id: 'Informe o ID da proposta.',
      })
    }

    var record
    try {
      record = $app.findRecordById('ad_proposals', proposalId)
    } catch (_) {
      return e.json(404, { message: 'Proposta não encontrada.' })
    }

    var currentStatus = record.getString('status')
    if (currentStatus !== 'aceito') {
      return e.badRequestError('A proposta deve estar com status "aceito" para gerar contrato', {
        status:
          'Status atual: ' + currentStatus + '. Apenas propostas aceitas podem gerar contrato.',
      })
    }

    var existingContracts = []
    try {
      existingContracts = $app.findRecordsByFilter(
        'ad_proposals',
        "contract_number != ''",
        '',
        0,
        0,
      )
    } catch (_) {}

    var year = new Date().getFullYear()
    var nextNum = existingContracts.length + 1
    var contractNumber = 'CT-' + year + '-' + String(nextNum).padStart(3, '0')

    var now = new Date()
    var todayStr = now.toISOString().split('T')[0]

    var advertiser = record.getString('advertiser')
    var campaign = record.getString('campaign')
    var format = record.getString('format')
    var position = record.getString('position')
    var audienceReach = record.getInt('audience_reach')
    var suggestedPrice = record.getInt('suggested_price')
    var deliveryDate = record.getString('delivery_date')

    var contractTerms = {
      parties: {
        advertiser: advertiser,
        publisher: 'Revista MODA ATUAL',
      },
      scope: {
        campaign: campaign,
        format: format,
        position: position,
        audience_reach: audienceReach,
      },
      commercial: {
        agreed_price: suggestedPrice,
        currency: 'BRL',
      },
      delivery: {
        delivery_date: deliveryDate,
      },
      validity: '30 dias a partir da assinatura',
      clauses: [
        'O anunciante autoriza o uso de imagem e marca na edição contratada.',
        'O conteúdo seguirá as diretrizes editoriais da Revista MODA ATUAL.',
        'O pagamento deve ser efetuado em até 15 dias após a assinatura.',
        'A aceitação digital deste contrato registra a concordância com todos os termos.',
      ],
    }

    if (body.special_terms) {
      contractTerms.special_terms = body.special_terms
    }

    record.set('contract_number', contractNumber)
    record.set('contract_date_formal', todayStr)
    record.set('contract_signed_at', todayStr)
    record.set('contract_terms', contractTerms)
    record.set('status', 'contrato')
    $app.save(record)

    try {
      var notifCol = $app.findCollectionByNameOrId('notifications')
      var notif = new Record(notifCol)
      notif.set('title', '[CONTRATO] ' + advertiser + ' - ' + contractNumber)
      notif.set(
        'message',
        'Contrato ' +
          contractNumber +
          ' gerado para ' +
          advertiser +
          (campaign ? ' (' + campaign + ')' : '') +
          '.',
      )
      notif.set('type', 'info')
      notif.set('is_read', false)
      $app.save(notif)
    } catch (_) {}

    return e.json(200, {
      id: record.id,
      contract_number: record.getString('contract_number'),
      contract_date_formal: record.getString('contract_date_formal'),
      contract_signed_at: record.getString('contract_signed_at'),
      contract_terms: record.get('contract_terms'),
      status: record.getString('status'),
    })
  },
  $apis.requireAuth(),
)
