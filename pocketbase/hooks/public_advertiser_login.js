routerAdd('POST', '/backend/v1/public/anunciante/login', (e) => {
  var body = e.requestInfo().body || {}
  var advertiser = (body.advertiser || '').trim()
  var email = (body.email || '').trim()

  if (!advertiser) return e.badRequestError('Anunciante é obrigatório')
  if (!email) return e.badRequestError('E-mail é obrigatório')

  var proposals = []
  try {
    proposals = $app.findRecordsByFilter(
      'ad_proposals',
      'advertiser = {:adv} && advertiser_email = {:eml}',
      '-created',
      0,
      0,
      { adv: advertiser, eml: email },
    )
  } catch (_) {
    return e.json(401, { message: 'Credenciais inválidas' })
  }

  if (proposals.length === 0) {
    return e.json(401, { message: 'Anunciante ou e-mail não encontrado' })
  }

  var token = $security.randomString(32)
  for (var i = 0; i < proposals.length; i++) {
    proposals[i].set('access_token', token)
    $app.saveNoValidate(proposals[i])
  }

  return e.json(200, { access_token: token, advertiser: advertiser })
})
