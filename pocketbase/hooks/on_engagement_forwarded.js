onRecordAfterUpdateSuccess((e) => {
  var status = e.record.getString('status')
  if (status !== 'encaminhado_humano') return e.next()

  var prevStatus = ''
  try {
    prevStatus = e.record.original().getString('status')
  } catch (_) {}
  if (prevStatus === 'encaminhado_humano') return e.next()

  try {
    var col = $app.findCollectionByNameOrId('notifications')
    var rec = new Record(col)
    var username = e.record.getString('ig_username')
    var intent = e.record.getString('intent')
    var msg = e.record.getString('message_text')
    var forwardedTo = e.record.getString('forwarded_to')

    rec.set('title', 'Interação encaminhada para atendimento humano')
    rec.set(
      'message',
      '@' +
        username +
        ' (' +
        intent +
        ') encaminhado para ' +
        (forwardedTo || 'equipe') +
        '. Ver em /admin/social-engagement — "' +
        msg +
        '"',
    )
    rec.set('type', 'alert')
    rec.set('is_read', false)
    $app.save(rec)
  } catch (err) {
    $app.logger().error('Failed to create engagement alert', 'error', String(err))
  }

  return e.next()
}, 'engagement_log')
