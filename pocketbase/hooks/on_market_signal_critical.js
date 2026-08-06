onRecordAfterCreateSuccess((e) => {
  var severity = e.record.getString('severity')
  if (severity !== 'critico') return e.next()

  try {
    var col = $app.findCollectionByNameOrId('notifications')
    var rec = new Record(col)
    var title = e.record.getString('title')
    var desc = e.record.getString('description')
    var signalType = e.record.getString('signal_type')

    rec.set('title', 'Sinal crítico de mercado: ' + (title || signalType || 'Alerta'))
    rec.set('message', (desc || title || '') + ' — Ver em /admin/market-watch')
    rec.set('type', 'alert')
    rec.set('is_read', false)
    $app.save(rec)
  } catch (err) {
    $app.logger().error('Failed to create market signal alert', 'error', String(err))
  }

  return e.next()
}, 'market_signals')
