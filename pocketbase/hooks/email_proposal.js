routerAdd(
  'POST',
  '/backend/v1/proposta-email',
  (e) => {
    var body = e.requestInfo().body || {}
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var proposalId = (body.proposal_id || '').trim()
    var email = (body.email || '').trim()

    if (!proposalId) {
      return e.badRequestError('ID da proposta é obrigatório', {
        proposal_id: 'Informe o ID da proposta.',
      })
    }
    if (!email) {
      return e.badRequestError('E-mail é obrigatório', {
        email: 'Informe o e-mail do anunciante.',
      })
    }

    var record
    try {
      record = $app.findRecordById('ad_proposals', proposalId)
    } catch (_) {
      return e.json(404, { message: 'Proposta não encontrada.' })
    }

    var advertiser = record.getString('advertiser')
    var campaign = record.getString('campaign')
    var format = record.getString('format')
    var position = record.getString('position')
    var audienceReach = record.getInt('audience_reach')
    var suggestedPrice = record.getInt('suggested_price')
    var matchScore = record.getInt('match_score')
    var status = record.getString('status')
    var deliveryDate = record.getString('delivery_date')
    var contractNumber = record.getString('contract_number')

    var editionTitle = ''
    try {
      var editionId = record.getString('edition')
      if (editionId) {
        var ed = $app.findRecordById('editions', editionId)
        editionTitle = ed.getString('title')
      }
    } catch (_) {}

    var proposalData = record.get('proposal_data')
    if (typeof proposalData === 'string') {
      try {
        proposalData = JSON.parse(proposalData)
      } catch (_) {
        proposalData = {}
      }
    }
    if (!proposalData) proposalData = {}

    var smtpReady = false
    try {
      var s = $app.settings()
      if (s && s.Smtp && s.Smtp.Host) smtpReady = true
    } catch (_) {}

    if (!smtpReady) {
      return e.json(503, {
        message:
          'O envio de e-mails requer configuração SMTP. Configure o SMTP no painel do Skip Cloud para habilitar esta funcionalidade.',
        field: 'email',
        smtp_not_configured: true,
      })
    }

    var formatLabels = {
      banner: 'Banner',
      capa: 'Capa',
      pagina_inteira: 'Página Inteira',
      sponsored_content: 'Conteúdo Patrocinado',
      story: 'Story',
      editorial_destaque: 'Editorial Destaque',
    }
    var formatLabel = formatLabels[format] || format

    var htmlBody =
      '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">'
    htmlBody +=
      '<div style="background:#f97316;color:#fff;padding:20px;border-radius:8px 8px 0 0;text-align:center">'
    htmlBody += '<h1 style="margin:0;font-size:24px">Revista MODA ATUAL</h1>'
    htmlBody += '<p style="margin:5px 0 0;opacity:0.9">Proposta Comercial</p></div>'
    htmlBody +=
      '<div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">'
    htmlBody += '<h2 style="color:#f97316;margin:0 0 16px">' + advertiser + '</h2>'
    if (campaign) htmlBody += '<p><strong>Campanha:</strong> ' + campaign + '</p>'
    if (editionTitle) htmlBody += '<p><strong>Edição:</strong> ' + editionTitle + '</p>'
    htmlBody += '<p><strong>Formato:</strong> ' + formatLabel + '</p>'
    if (position) htmlBody += '<p><strong>Posição:</strong> ' + position + '</p>'
    htmlBody += '<p><strong>Alcance estimado:</strong> ' + audienceReach + ' impactos</p>'
    htmlBody +=
      '<p><strong>Preço sugerido:</strong> R$ ' + suggestedPrice.toLocaleString('pt-BR') + '</p>'
    htmlBody += '<p><strong>Match score:</strong> ' + matchScore + '/100</p>'
    htmlBody += '<p><strong>Status:</strong> ' + status + '</p>'
    if (deliveryDate) htmlBody += '<p><strong>Data de entrega:</strong> ' + deliveryDate + '</p>'
    if (contractNumber) {
      htmlBody += '<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">'
      htmlBody += '<h3 style="color:#f97316;margin:0 0 8px">Contrato</h3>'
      htmlBody += '<p><strong>Número:</strong> ' + contractNumber + '</p>'
      var contractDateFormal = record.getString('contract_date_formal')
      if (contractDateFormal)
        htmlBody += '<p><strong>Data do contrato:</strong> ' + contractDateFormal + '</p>'
    }
    if (proposalData.intro) {
      htmlBody += '<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">'
      htmlBody += '<h3 style="color:#f97316;margin:0 0 8px">Detalhes da Proposta</h3>'
      if (proposalData.intro)
        htmlBody += '<p><strong>Introdução:</strong> ' + proposalData.intro + '</p>'
      if (proposalData.value_proposition)
        htmlBody +=
          '<p><strong>Proposta de valor:</strong> ' + proposalData.value_proposition + '</p>'
      if (proposalData.matched_theme)
        htmlBody += '<p><strong>Tema:</strong> ' + proposalData.matched_theme + '</p>'
      if (proposalData.format_description)
        htmlBody += '<p><strong>Formato:</strong> ' + proposalData.format_description + '</p>'
      if (proposalData.reach_summary)
        htmlBody += '<p><strong>Alcance:</strong> ' + proposalData.reach_summary + '</p>'
      if (proposalData.pricing_summary)
        htmlBody += '<p><strong>Preço:</strong> ' + proposalData.pricing_summary + '</p>'
      if (proposalData.cta)
        htmlBody +=
          '<p style="background:#fff7ed;padding:12px;border-radius:6px;border-left:3px solid #f97316">' +
          proposalData.cta +
          '</p>'
      if (proposalData.suggested_audiences && proposalData.suggested_audiences.length > 0) {
        htmlBody += '<h4 style="margin:12px 0 4px">Públicos Sugeridos</h4>'
        for (var i = 0; i < proposalData.suggested_audiences.length; i++) {
          var aud = proposalData.suggested_audiences[i]
          htmlBody +=
            '<p style="margin:4px 0">• ' +
            aud.segment +
            ' — ' +
            aud.audience_size +
            ' contatos, engajamento ' +
            (aud.engagement_level || '') +
            '</p>'
        }
      }
    }
    htmlBody += '<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">'
    htmlBody +=
      '<p style="font-size:12px;color:#9ca3af;text-align:center">© ' +
      new Date().getFullYear() +
      ' Revista MODA ATUAL. Todos os direitos reservados.</p>'
    htmlBody += '</div></body></html>'

    try {
      var message = new MailerMessage({
        from: { address: 'noreply@revistamodaatual.com.br', name: 'Revista MODA ATUAL' },
        to: [{ address: email }],
        subject: 'Proposta Comercial - ' + advertiser + (campaign ? ' | ' + campaign : ''),
        html: htmlBody,
      })
      $app.mailClient().send(message)
      return e.json(200, { message: 'E-mail enviado com sucesso para ' + email })
    } catch (err) {
      var errStr = String(err)
      if (
        errStr.indexOf('smtp') !== -1 ||
        errStr.indexOf('SMTP') !== -1 ||
        errStr.indexOf('dial') !== -1 ||
        errStr.indexOf('connect') !== -1 ||
        errStr.indexOf('no such host') !== -1
      ) {
        return e.json(503, {
          message:
            'O envio de e-mails requer configuração SMTP. Configure o SMTP no painel do Skip Cloud.',
          field: 'email',
          smtp_not_configured: true,
        })
      }
      return e.json(502, { message: 'Falha ao enviar e-mail. Tente novamente.' })
    }
  },
  $apis.requireAuth(),
)
