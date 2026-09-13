// pb_hook proxy seguro para integração com V MODA BRASIL
// Mantém os tokens em variáveis de ambiente ($secrets / $os.getenv) e nunca expõe no frontend.
// Aplica validação estrita dos campos e roteia as chamadas autenticadas com x-sync-token e Bearer.
// Rota GET: /backend/v1/vmoda/brands
// Rota PATCH: /backend/v1/vmoda/brands/{id}

routerAdd(
  'GET',
  '/backend/v1/vmoda/brands',
  (e) => {
    var token =
      $secrets.get('VMODA_SYNC_TOKEN') ||
      $os.getenv('VMODA_SYNC_TOKEN') ||
      'vmoda_sync_revistamodaatual_2026_sec'
    var baseUrl =
      $secrets.get('VMODA_SYNC_API_URL') ||
      $os.getenv('VMODA_SYNC_API_URL') ||
      'https://v-moda-brasil-d7c0f.goskip.app/backend/v1'

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
    var targetUrl = baseUrl + '/sales/brands' + queryString

    var res
    try {
      res = $http.send({
        url: targetUrl,
        method: 'GET',
        headers: {
          'x-sync-token': token,
          Authorization: 'Bearer ' + token,
          Accept: 'application/json',
        },
        timeout: 15,
      })
    } catch (err) {
      $app.logger().error('vmoda get brands request failed', 'error', String(err))
      return e.json(502, {
        success: false,
        error: 'Falha ao conectar com o sistema V MODA BRASIL: ' + String(err),
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
    var baseUrl =
      $secrets.get('VMODA_SYNC_API_URL') ||
      $os.getenv('VMODA_SYNC_API_URL') ||
      'https://v-moda-brasil-d7c0f.goskip.app/backend/v1'

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

    var targetUrl = baseUrl + '/sales/brands/' + encodeURIComponent(id)
    var res
    try {
      res = $http.send({
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
    } catch (err) {
      $app.logger().error('vmoda patch brand request failed', 'error', String(err))
      return e.json(502, {
        success: false,
        error: 'Falha ao conectar com o sistema V MODA BRASIL: ' + String(err),
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
