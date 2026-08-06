routerAdd('POST', '/backend/v1/webhook-instagram', (e) => {
  var body = e.requestInfo().body || {}

  try {
    if (!body.entry || !Array.isArray(body.entry)) {
      return e.json(200, { status: 'ok', message: 'no entries' })
    }

    var logCol = $app.findCollectionByNameOrId('engagement_log')

    for (var i = 0; i < body.entry.length; i++) {
      var entry = body.entry[i]
      var igUserId = entry.id || ''

      if (entry.changes && Array.isArray(entry.changes)) {
        for (var c = 0; c < entry.changes.length; c++) {
          var change = entry.changes[c]
          if (change.field === 'comments' && change.value) {
            var v = change.value
            var rec = new Record(logCol)
            rec.set('ig_user_id', v.from ? v.from.id : '')
            rec.set('ig_username', v.from ? v.from.username : '')
            rec.set('type', 'comment')
            rec.set('message_text', v.text || '')
            rec.set('status', 'pendente')
            rec.set('media_id', v.media_id || '')
            rec.set('comment_id', v.id || '')
            $app.save(rec)
          }
        }
      }

      if (entry.messaging && Array.isArray(entry.messaging)) {
        for (var m = 0; m < entry.messaging.length; m++) {
          var msg = entry.messaging[m]
          var senderId = msg.sender ? msg.sender.id : ''
          var msgText = ''
          if (msg.message && msg.message.text) {
            msgText = msg.message.text
          }
          if (msgText) {
            var drec = new Record(logCol)
            drec.set('ig_user_id', senderId)
            drec.set('type', 'dm')
            drec.set('message_text', msgText)
            drec.set('status', 'pendente')
            $app.save(drec)
          }
        }
      }
    }

    return e.json(200, { status: 'ok', processed: body.entry.length })
  } catch (err) {
    $app.logger().error('webhook-instagram error', 'error', String(err))
    return e.json(200, { status: 'error', message: 'processing failed' })
  }
})
