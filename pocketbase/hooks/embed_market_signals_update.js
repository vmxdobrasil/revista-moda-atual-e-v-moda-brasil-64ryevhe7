onRecordAfterUpdateSuccess((e) => {
  var titleChanged = e.record.getString('title') !== e.record.original().getString('title')
  var descChanged =
    e.record.getString('description') !== e.record.original().getString('description')
  if (!titleChanged && !descChanged) return e.next()
  var text = (e.record.getString('title') + '\n\n' + e.record.getString('description')).trim()
  if (!text) return e.next()
  try {
    var res = $ai.embed({ input: text })
    var record = $app.findRecordById('market_signals', e.record.id)
    record.set('vector', res.data[0].embedding)
    $app.save(record)
  } catch (err) {
    console.log('embedding failed for market_signal ' + e.record.id, err.message)
  }
  return e.next()
}, 'market_signals')
