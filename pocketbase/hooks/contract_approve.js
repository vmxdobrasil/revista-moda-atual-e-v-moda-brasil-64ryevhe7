routerAdd('POST', '/backend/v1/public/anunciante/contrato/aprovar', (e) => {
  var body = e.requestInfo().body || {}
  var accessToken = (body.access_token || '').trim()
  var proposalId = (body.proposal_id || '').trim()

  if (!accessToken) return e.badRequestError('Token de acesso é obrigatório')
  if (!proposalId) return e.badRequestError('ID da proposta é obrigatório')

  var record
  try {
    record = $app.findRecordById('ad_proposals', proposalId)
  } catch (_) {
    return e.json(404, { message: 'Proposta não encontrada' })
  }

  if (record.getString('access_token') !== accessToken) {
    return e.json(403, { message: 'Token de acesso inválido' })
  }

  if (record.getString('status') !== 'contrato') {
    return e.json(400, { message: 'Apenas propostas com contrato gerado podem ser aprovadas' })
  }

  var todayStr = new Date().toISOString().split('T')[0]
  record.set('status', 'entregue')
  record.set('contract_signed_at', todayStr)
  $app.save(record)

  try {
    var notifCol = $app.findCollectionByNameOrId('notifications')
    var notif = new Record(notifCol)
    notif.set('title', '[CONTRATO APROVADO] ' + record.getString('advertiser'))
    notif.set('message', 'Contrato aprovado pelo anunciante: ' + record.getString('advertiser'))
    notif.set('type', 'info')
    notif.set('is_read', false)
    $app.save(notif)
  } catch (_) {}

  return e.json(200, { message: 'Contrato aprovado com sucesso', status: 'entregue' })
})
