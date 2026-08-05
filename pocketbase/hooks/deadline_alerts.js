cronAdd('deadline_alerts', '0 */6 * * *', () => {
  var now = new Date()
  var sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  var nowStr = now.toISOString().split('T')[0]
  var sevenStr = sevenDaysFromNow.toISOString().split('T')[0]

  var checkAndNotify = function (record, collectionName, dateField, titlePrefix) {
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
    var alertMessage
    if (isOverdue) {
      alertMessage =
        'ENTREGA ATRASADA: ' +
        advertiser +
        (campaign ? ' (' + campaign + ')' : '') +
        ' - vencida há ' +
        Math.abs(diffDays) +
        ' dia(s).'
    } else {
      alertMessage =
        'Entrega próxima: ' +
        advertiser +
        (campaign ? ' (' + campaign + ')' : '') +
        ' - faltam ' +
        diffDays +
        ' dia(s) (data: ' +
        deliveryDateStr +
        ').'
    }

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
      checkAndNotify(proposals[i], 'ad_proposals', 'delivery_date', 'Proposta')
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
      checkAndNotify(ads[j], 'advertisements', 'delivery', 'Anúncio')
    }
  } catch (_) {}
})
