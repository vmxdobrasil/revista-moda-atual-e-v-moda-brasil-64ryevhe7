cronAdd('deadline_alerts', '0 */6 * * *', () => {
  var now = new Date()

  var smtpReady = false
  try {
    var s = $app.settings()
    if (s && s.Smtp && s.Smtp.Host) smtpReady = true
  } catch (_) {}

  var sendDeadlineEmail = function (
    advertiserEmail,
    advertiser,
    campaign,
    deliveryDateStr,
    isOverdue,
    diffDays,
  ) {
    if (!advertiserEmail || !smtpReady) return
    var subject = isOverdue
      ? 'ENTREGA ATRASADA - ' + advertiser
      : 'Prazo de entrega próximo - ' + advertiser
    var htmlBody =
      '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">'
    htmlBody +=
      '<div style="background:#f97316;color:#fff;padding:20px;border-radius:8px 8px 0 0;text-align:center">'
    htmlBody += '<h1 style="margin:0;font-size:24px">Revista MODA ATUAL</h1>'
    htmlBody += '<p style="margin:5px 0 0;opacity:0.9">Notificação de Prazo de Entrega</p></div>'
    htmlBody +=
      '<div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">'
    if (isOverdue) {
      htmlBody += '<p style="font-size:16px;color:#dc2626;font-weight:bold">ENTREGA ATRASADA</p>'
      htmlBody += '<p>Anunciante: <strong>' + advertiser + '</strong></p>'
      if (campaign) htmlBody += '<p>Campanha: ' + campaign + '</p>'
      htmlBody += '<p>Vencida há <strong>' + Math.abs(diffDays) + ' dia(s)</strong>.</p>'
      htmlBody += '<p>Data prevista: ' + deliveryDateStr + '</p>'
    } else {
      htmlBody +=
        '<p style="font-size:16px;color:#f59e0b;font-weight:bold">Prazo de entrega próximo</p>'
      htmlBody += '<p>Anunciante: <strong>' + advertiser + '</strong></p>'
      if (campaign) htmlBody += '<p>Campanha: ' + campaign + '</p>'
      htmlBody += '<p>Faltam <strong>' + diffDays + ' dia(s)</strong> para a entrega.</p>'
      htmlBody += '<p>Data prevista: ' + deliveryDateStr + '</p>'
    }
    htmlBody +=
      '<p style="margin-top:16px;font-size:12px;color:#9ca3af">© ' +
      new Date().getFullYear() +
      ' Revista MODA ATUAL. Todos os direitos reservados.</p>'
    htmlBody += '</div></body></html>'
    try {
      var message = new MailerMessage({
        from: { address: 'noreply@revistamodaatual.com.br', name: 'Revista MODA ATUAL' },
        to: [{ address: advertiserEmail }],
        subject: subject,
        html: htmlBody,
      })
      $app.mailClient().send(message)
    } catch (err) {
      $app.logger().error('deadline email failed', 'error', String(err))
    }
  }

  var checkAndNotify = function (record, dateField, titlePrefix) {
    var deliveryDateStr = record.getString(dateField)
    if (!deliveryDateStr) return
    var deliveryDate = new Date(deliveryDateStr + 'T00:00:00')
    var diffMs = deliveryDate.getTime() - now.getTime()
    var diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    var isOverdue = diffDays < 0
    var isApproaching = diffDays >= 0 && diffDays <= 7
    if (!isOverdue && !isApproaching) return

    var advertiser = record.getString('advertiser') || record.getString('title') || 'Desconhecido'
    var campaign = record.getString('campaign') || ''
    var recordId = record.id
    var advertiserEmail = record.getString('advertiser_email') || ''

    var alertTitle =
      '[PRAZO] ' +
      titlePrefix +
      ' ' +
      advertiser +
      (campaign ? ' - ' + campaign : '') +
      ' #' +
      recordId
    try {
      $app.findFirstRecordByData('notifications', 'title', alertTitle)
      return
    } catch (_) {}

    var alertType = isOverdue ? 'alert' : 'warning'
    var alertMessage = isOverdue
      ? 'ENTREGA ATRASADA: ' +
        advertiser +
        (campaign ? ' (' + campaign + ')' : '') +
        ' - vencida há ' +
        Math.abs(diffDays) +
        ' dia(s).'
      : 'Entrega próxima: ' +
        advertiser +
        (campaign ? ' (' + campaign + ')' : '') +
        ' - faltam ' +
        diffDays +
        ' dia(s) (data: ' +
        deliveryDateStr +
        ').'

    try {
      var notifCol = $app.findCollectionByNameOrId('notifications')
      var notif = new Record(notifCol)
      notif.set('title', alertTitle)
      notif.set('message', alertMessage)
      notif.set('type', alertType)
      notif.set('is_read', false)
      $app.save(notif)
    } catch (err) {
      $app.logger().error('deadline alert failed', 'error', String(err), 'record', recordId)
    }

    sendDeadlineEmail(advertiserEmail, advertiser, campaign, deliveryDateStr, isOverdue, diffDays)
  }

  try {
    var proposals = $app.findRecordsByFilter(
      'ad_proposals',
      "delivery_date != '' && delivery_date != null",
      '-delivery_date',
      0,
      0,
    )
    for (var i = 0; i < proposals.length; i++) {
      checkAndNotify(proposals[i], 'delivery_date', 'Proposta')
    }
  } catch (_) {}

  try {
    var ads = $app.findRecordsByFilter(
      'advertisements',
      "delivery != '' && delivery != null",
      '-delivery',
      0,
      0,
    )
    for (var j = 0; j < ads.length; j++) {
      checkAndNotify(ads[j], 'delivery', 'Anúncio')
    }
  } catch (_) {}
})
