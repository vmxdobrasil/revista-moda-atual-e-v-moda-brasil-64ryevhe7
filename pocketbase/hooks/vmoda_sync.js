// Rota GET: /backend/v1/vmoda/brands
// Rota PATCH: /backend/v1/vmoda/brands/{id}

// Diagnóstico público para inspeção e testes do status da integração V MODA BRASIL
routerAdd('GET', '/backend/v1/vmoda/status-diag', (e) => {
  var token =
    $secrets.get('VMODA_SYNC_TOKEN') ||
    $os.getenv('VMODA_SYNC_TOKEN') ||
    'vmoda_sync_revistamodaatual_2026_sec'

  var endpoints = [
    {
      name: 'internal_backend_no_filter',
      url: 'https://v-moda-brasil-d7c0f.shrd00.internal.goskip.dev/backend/v1/sales/brands',
      headers: { 'x-sync-token': token, Accept: 'application/json' },
    },
    {
      name: 'internal_backend_with_filter',
      url: 'https://v-moda-brasil-d7c0f.shrd00.internal.goskip.dev/backend/v1/sales/brands?categoria=%27moda-feminina%27',
      headers: { 'x-sync-token': token, Accept: 'application/json' },
    },
    {
      name: 'frontend_domain',
      url: 'https://v-moda-brasil-d7c0f.goskip.app/backend/v1/sales/brands',
      headers: { 'x-sync-token': token, Accept: 'application/json' },
    },
    {
      name: 'internal_api_health',
      url: 'https://v-moda-brasil-d7c0f.shrd00.internal.goskip.dev/api/health',
      headers: { Accept: 'application/json' },
    },
  ]

  var results = []
  for (var i = 0; i < endpoints.length; i++) {
    var ep = endpoints[i]
    try {
      var r = $http.send({
        url: ep.url,
        method: 'GET',
        headers: ep.headers,
        timeout: 10,
      })
      results.push({
        name: ep.name,
        url: ep.url,
        statusCode: r.statusCode,
        contentType: (r.headers && r.headers['content-type']) || '',
        bodySnippet: String(r.raw || '').slice(0, 300),
      })
    } catch (err) {
      results.push({
        name: ep.name,
        url: ep.url,
        error: String(err),
      })
    }
  }

  return e.json(200, {
    success: true,
    token_configured: !!token,
    results: results,
  })
})

routerAdd(
  'GET',
  '/backend/v1/vmoda/brands',
  (e) => {
    var token =
      $secrets.get('VMODA_SYNC_TOKEN') ||
      $os.getenv('VMODA_SYNC_TOKEN') ||
      'vmoda_sync_revistamodaatual_2026_sec'
    // Permite fallback automático entre a URL interna direta e a URL pública
    var primaryUrl =
      $secrets.get('VMODA_SYNC_API_URL') ||
      $os.getenv('VMODA_SYNC_API_URL') ||
      'https://v-moda-brasil-d7c0f.shrd00.internal.goskip.dev/backend/v1'

    // Lista de URLs candidatas para resiliência: internal backend primeiro, fallback no app domain
    var candidateBases = [
      primaryUrl,
      'https://v-moda-brasil-d7c0f.shrd00.internal.goskip.dev/backend/v1',
      'https://v-moda-brasil-d7c0f.goskip.app/backend/v1',
    ]
    // Remover duplicatas
    var uniqueBases = []
    for (var b = 0; b < candidateBases.length; b++) {
      if (uniqueBases.indexOf(candidateBases[b]) === -1) {
        uniqueBases.push(candidateBases[b])
      }
    }

    var q = e.requestInfo().query || {}
    var queryParts = []
    var allowedParams = [
      'categoria',
      'prioridade',
      'status',
      'pipeline_etapa',
      'projects',
      'limit',
      'offset',
    ]
    for (var i = 0; i < allowedParams.length; i++) {
      var param = allowedParams[i]
      if (q[param] !== undefined && q[param] !== '') {
        queryParts.push(encodeURIComponent(param) + '=' + encodeURIComponent(q[param]))
      }
    }

    var queryString = queryParts.length > 0 ? '?' + queryParts.join('&') : ''

    var res = null
    var lastError = null
    var successUrl = null

    for (var c = 0; c < uniqueBases.length; c++) {
      var targetUrl = uniqueBases[c] + '/sales/brands' + queryString
      try {
        var attemptRes = $http.send({
          url: targetUrl,
          method: 'GET',
          headers: {
            'x-sync-token': token,
            Authorization: 'Bearer ' + token,
            Accept: 'application/json',
          },
          timeout: 12,
        })

        // Se a resposta for HTML (ex: página do frontend retornando 200 SPA para rota não interceptada), descartar
        var ctype = (attemptRes.headers && attemptRes.headers['content-type']) || ''
        var rawSnippet = String(attemptRes.raw || '').trim()
        var isHtml =
          ctype.indexOf('text/html') !== -1 ||
          rawSnippet.indexOf('<!doctype') === 0 ||
          rawSnippet.indexOf('<html') === 0

        if (attemptRes.statusCode === 200 && !isHtml && attemptRes.json) {
          res = attemptRes
          successUrl = targetUrl
          break
        }

        // Se retornou 401 ou 403, a rota existe e o token foi recusado
        if (attemptRes.statusCode === 401 || attemptRes.statusCode === 403) {
          return e.json(401, {
            success: false,
            error: 'Token de sincronização V MODA BRASIL inválido ou não autorizado (401)',
            target_url: targetUrl,
          })
        }

        // Guardar para diagnóstico se for 500 do backend do V MODA BRASIL
        if (attemptRes.statusCode >= 500 && attemptRes.json) {
          res = attemptRes
          successUrl = targetUrl
          // Não quebra imediatamente, mas é o backend real respondendo
          break
        }

        lastError =
          'Endpoint ' +
          targetUrl +
          ' retornou HTTP ' +
          attemptRes.statusCode +
          (isHtml ? ' (HTML SPA ignorado)' : '')
      } catch (err) {
        lastError = String(err)
      }
    }

    if (!res) {
      $app.logger().error('vmoda get brands request failed all bases', 'error', String(lastError))
      return e.json(502, {
        success: false,
        error: 'Falha ao conectar com o sistema V MODA BRASIL: ' + String(lastError),
        is_network_error: true,
      })
    }

    $app
      .logger()
      .info(
        'vmoda get brands response received',
        'status',
        res.statusCode,
        'successUrl',
        successUrl,
        'rawBody',
        String(res.raw || '').slice(0, 300),
      )

    if (res.statusCode >= 400) {
      var errMsg = 'Erro retornado pela API V MODA BRASIL (HTTP ' + res.statusCode + ')'
      try {
        if (res.json && res.json.error) {
          errMsg = res.json.error
        } else if (res.json && res.json.message) {
          errMsg = res.json.message
        }
      } catch (_) {}
      return e.json(res.statusCode, {
        success: false,
        error: errMsg,
        status_code: res.statusCode,
        target_url: successUrl,
      })
    }

    var responseData = res.json || {}

    return e.json(200, {
      success: true,
      data: responseData,
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'PATCH',
  '/backend/v1/vmoda/brands/{id}',
  (e) => {
    var token =
      $secrets.get('VMODA_SYNC_TOKEN') ||
      $os.getenv('VMODA_SYNC_TOKEN') ||
      'vmoda_sync_revistamodaatual_2026_sec'
    var primaryUrl =
      $secrets.get('VMODA_SYNC_API_URL') ||
      $os.getenv('VMODA_SYNC_API_URL') ||
      'https://v-moda-brasil-d7c0f.shrd00.internal.goskip.dev/backend/v1'

    var id = e.request.pathValue('id') || ''
    if (!id) {
      return e.json(400, { success: false, error: 'ID da marca é obrigatório' })
    }

    var body = e.requestInfo().body || {}

    // Validação preventiva dos campos proibidos segundo a especificação oficial:
    // Campos que o PATCH aceita: status, pipeline_etapa, contato, observacoes
    // Campos que o PATCH REJEITA (erro 400): nome, categoria, prioridade, projects
    var rejectedFields = ['nome', 'categoria', 'prioridade', 'projects']
    for (var i = 0; i < rejectedFields.length; i++) {
      var forbidden = rejectedFields[i]
      if (body[forbidden] !== undefined) {
        return e.json(400, {
          success: false,
          error:
            'O campo "' +
            forbidden +
            '" não pode ser alterado a partir da Revista Moda Atual. Esse campo só pode ser editado diretamente no sistema V MODA BRASIL.',
          rejected_field: forbidden,
        })
      }
    }

    // Apenas repassar os campos permitidos
    var allowedPayload = {}
    var allowedFields = ['status', 'pipeline_etapa', 'contato', 'observacoes']
    for (var j = 0; j < allowedFields.length; j++) {
      var allowed = allowedFields[j]
      if (body[allowed] !== undefined) {
        allowedPayload[allowed] = body[allowed]
      }
    }

    var candidateBases = [
      primaryUrl,
      'https://v-moda-brasil-d7c0f.shrd00.internal.goskip.dev/backend/v1',
      'https://v-moda-brasil-d7c0f.goskip.app/backend/v1',
    ]
    var uniqueBases = []
    for (var b = 0; b < candidateBases.length; b++) {
      if (uniqueBases.indexOf(candidateBases[b]) === -1) {
        uniqueBases.push(candidateBases[b])
      }
    }

    var res = null
    var lastError = null

    for (var c = 0; c < uniqueBases.length; c++) {
      var targetUrl = uniqueBases[c] + '/sales/brands/' + encodeURIComponent(id)
      try {
        var attemptRes = $http.send({
          url: targetUrl,
          method: 'PATCH',
          headers: {
            'x-sync-token': token,
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(allowedPayload),
          timeout: 15,
        })

        var ctype = (attemptRes.headers && attemptRes.headers['content-type']) || ''
        var rawSnippet = String(attemptRes.raw || '').trim()
        var isHtml = ctype.indexOf('text/html') !== -1 || rawSnippet.indexOf('<!doctype') === 0

        if (!isHtml) {
          res = attemptRes
          break
        }
        lastError = 'Endpoint ' + targetUrl + ' retornou HTML (SPA)'
      } catch (err) {
        lastError = String(err)
      }
    }

    if (!res) {
      $app.logger().error('vmoda patch brand request failed all bases', 'error', String(lastError))
      return e.json(502, {
        success: false,
        error: 'Falha ao conectar com o sistema V MODA BRASIL: ' + String(lastError),
        is_network_error: true,
      })
    }

    if (res.statusCode === 401 || res.statusCode === 403) {
      return e.json(401, {
        success: false,
        error: 'Token de sincronização V MODA BRASIL inválido ou não autorizado (401)',
      })
    }

    if (res.statusCode >= 400) {
      var patchErrMsg = 'Erro retornado pela API V MODA BRASIL (HTTP ' + res.statusCode + ')'
      try {
        if (res.json && res.json.error) {
          patchErrMsg = res.json.error
        } else if (res.json && res.json.message) {
          patchErrMsg = res.json.message
        }
      } catch (_) {}
      return e.json(res.statusCode, {
        success: false,
        error: patchErrMsg,
        status_code: res.statusCode,
      })
    }

    return e.json(200, {
      success: true,
      data: res.json || allowedPayload,
      message: 'Marca sincronizada com sucesso no V MODA BRASIL',
    })
  },
  $apis.requireAuth(),
)
