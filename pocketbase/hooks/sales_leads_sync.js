/**
 * Sincronização cruzada do Agente de IA de Vendas — coleção `sales_leads`
 * Single source of truth para Revista Moda Atual e V MODA BRASIL.
 *
 * Rotas:
 * - GET  /backend/v1/sales/leads
 * - POST /backend/v1/sales/leads
 * - PATCH /backend/v1/sales/leads/{id}
 *
 * NOTA DE ARQUITETURA PB_HOOKS:
 * Todas as funções auxiliares devem ficar INLINE dentro de cada callback de rota
 * para evitar ReferenceError no pool multi-VM do PocketBase.
 */

// ==========================================
// 1. GET /backend/v1/sales/leads
// ==========================================
routerAdd('GET', '/backend/v1/sales/leads', (e) => {
  // Verificação de autenticação inline
  var expectedToken =
    $secrets.get('VMODA_SYNC_TOKEN') ||
    $os.getenv('VMODA_SYNC_TOKEN') ||
    'vmoda_sync_revistamodaatual_2026_sec'

  var isAuthorized = false
  var headerSync = ''
  var headerAuth = ''

  try {
    if (e.request && e.request.header) {
      headerSync = e.request.header.get('x-sync-token') || ''
      headerAuth = e.request.header.get('Authorization') || ''
    }
  } catch (_) {}

  if (headerSync && headerSync === expectedToken) {
    isAuthorized = true
  } else if (headerAuth) {
    var parts = headerAuth.split(' ')
    var bearerToken =
      parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : headerAuth
    if (bearerToken === expectedToken) {
      isAuthorized = true
    }
  }

  if (!isAuthorized) {
    return e.json(401, {
      success: false,
      error: 'Acesso não autorizado: forneça x-sync-token ou Authorization: Bearer válido',
    })
  }

  var q = e.requestInfo().query || {}
  var filterParts = []

  // Filtros opcionais combináveis
  if (q.status && String(q.status).trim() !== '' && q.status !== 'todas' && q.status !== 'todos') {
    filterParts.push('status = {:status}')
  }

  if (
    q.prioridade &&
    String(q.prioridade).trim() !== '' &&
    q.prioridade !== 'todas' &&
    q.prioridade !== 'todos'
  ) {
    filterParts.push('prioridade = {:prioridade}')
  }

  if (
    q.categoria &&
    String(q.categoria).trim() !== '' &&
    q.categoria !== 'todas' &&
    q.categoria !== 'todos'
  ) {
    filterParts.push('categoria = {:categoria}')
  }

  if (
    q.etapa_atual &&
    String(q.etapa_atual).trim() !== '' &&
    q.etapa_atual !== 'todas' &&
    q.etapa_atual !== 'todos'
  ) {
    filterParts.push('etapa_atual = {:etapa_atual}')
  }

  if (q.regiao && String(q.regiao).trim() !== '' && q.regiao !== 'todas' && q.regiao !== 'todos') {
    filterParts.push('regiao = {:regiao}')
  }

  if (q.canal && String(q.canal).trim() !== '' && q.canal !== 'todas' && q.canal !== 'todos') {
    filterParts.push('canal = {:canal}')
  }

  if (q.data_proximo_followup && String(q.data_proximo_followup).trim() !== '') {
    filterParts.push(
      'data_proximo_followup >= {:followup_start} && data_proximo_followup <= {:followup_end}',
    )
  } else {
    if (q.data_proximo_followup_from && String(q.data_proximo_followup_from).trim() !== '') {
      filterParts.push('data_proximo_followup >= {:followup_from}')
    }
    if (q.data_proximo_followup_to && String(q.data_proximo_followup_to).trim() !== '') {
      filterParts.push('data_proximo_followup <= {:followup_to}')
    }
  }

  var limit = parseInt(q.limit || '50', 10)
  if (isNaN(limit) || limit < 0) limit = 50
  if (limit > 500) limit = 500

  var offset = parseInt(q.offset || '0', 10)
  if (isNaN(offset) || offset < 0) offset = 0

  var sort = q.sort || '-created'

  // ATENÇÃO CRÍTICA: quando NENHUM filtro for passado, a consulta deve retornar todos os leads
  // NUNCA passar expressão vazia ou mal formada para o banco
  var filterExpr = ''
  if (filterParts.length > 0) {
    filterExpr = filterParts.join(' && ')
  }

  var bindParams = {}
  if (q.status) bindParams.status = String(q.status).trim()
  if (q.prioridade) bindParams.prioridade = String(q.prioridade).trim()
  if (q.categoria) bindParams.categoria = String(q.categoria).trim()
  if (q.etapa_atual) bindParams.etapa_atual = String(q.etapa_atual).trim()
  if (q.regiao) bindParams.regiao = String(q.regiao).trim()
  if (q.canal) bindParams.canal = String(q.canal).trim()

  if (q.data_proximo_followup) {
    var fDate = String(q.data_proximo_followup).trim()
    if (fDate.length === 10) {
      bindParams.followup_start = fDate + ' 00:00:00.000Z'
      bindParams.followup_end = fDate + ' 23:59:59.999Z'
    } else {
      bindParams.followup_start = fDate
      bindParams.followup_end = fDate
    }
  }
  if (q.data_proximo_followup_from) {
    var fromD = String(q.data_proximo_followup_from).trim()
    bindParams.followup_from = fromD.length === 10 ? fromD + ' 00:00:00.000Z' : fromD
  }
  if (q.data_proximo_followup_to) {
    var toD = String(q.data_proximo_followup_to).trim()
    bindParams.followup_to = toD.length === 10 ? toD + ' 23:59:59.999Z' : toD
  }

  try {
    var records = []
    if (filterExpr) {
      records = $app.findRecordsByFilter('sales_leads', filterExpr, sort, limit, offset, bindParams)
    } else {
      records = $app.findRecordsByFilter('sales_leads', '', sort, limit, offset)
    }

    var total = 0
    try {
      if (filterExpr) {
        total = $app.countRecords('sales_leads', filterExpr, bindParams)
      } else {
        total = $app.countRecords('sales_leads')
      }
    } catch (_) {
      total = records.length
    }

    var items = []
    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      var hist = r.get('historico_contatos')
      if (typeof hist === 'string') {
        try {
          hist = JSON.parse(hist)
        } catch (_) {
          hist = []
        }
      } else if (!Array.isArray(hist)) {
        hist = []
      }
      items.push({
        id: r.id,
        marca: r.getString('marca'),
        categoria: r.getString('categoria'),
        porte: r.getString('porte'),
        regiao: r.getString('regiao'),
        contato_nome: r.getString('contato_nome'),
        contato_email: r.getString('contato_email'),
        contato_whatsapp: r.getString('contato_whatsapp'),
        prioridade: r.getString('prioridade'),
        status: r.getString('status'),
        etapa_atual: r.getString('etapa_atual'),
        canal: r.getString('canal'),
        historico_contatos: hist,
        data_ultimo_contato: r.getString('data_ultimo_contato'),
        data_proximo_followup: r.getString('data_proximo_followup'),
        id_top60: r.getString('id_top60'),
        id_marketplace: r.getString('id_marketplace'),
        created: r.getString('created'),
        updated: r.getString('updated'),
      })
    }

    return e.json(200, {
      success: true,
      items: items,
      total: total,
      limit: limit,
      offset: offset,
    })
  } catch (err) {
    $app.logger().error('GET /backend/v1/sales/leads error', 'error', String(err))
    return e.json(500, {
      success: false,
      error: 'Falha ao buscar leads de vendas: ' + String(err),
    })
  }
})

// ==========================================
// 2. POST /backend/v1/sales/leads
// ==========================================
routerAdd('POST', '/backend/v1/sales/leads', (e) => {
  // Verificação de autenticação inline
  var expectedToken =
    $secrets.get('VMODA_SYNC_TOKEN') ||
    $os.getenv('VMODA_SYNC_TOKEN') ||
    'vmoda_sync_revistamodaatual_2026_sec'

  var isAuthorized = false
  var headerSync = ''
  var headerAuth = ''

  try {
    if (e.request && e.request.header) {
      headerSync = e.request.header.get('x-sync-token') || ''
      headerAuth = e.request.header.get('Authorization') || ''
    }
  } catch (_) {}

  if (headerSync && headerSync === expectedToken) {
    isAuthorized = true
  } else if (headerAuth) {
    var parts = headerAuth.split(' ')
    var bearerToken =
      parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : headerAuth
    if (bearerToken === expectedToken) {
      isAuthorized = true
    }
  }

  if (!isAuthorized) {
    return e.json(401, {
      success: false,
      error: 'Acesso não autorizado: forneça x-sync-token ou Authorization: Bearer válido',
    })
  }

  var body = e.requestInfo().body || {}
  var marca = String(body.marca || '').trim()

  if (!marca) {
    return e.json(400, {
      success: false,
      error: 'Campo obrigatório ausente: "marca"',
    })
  }

  var idMarketplace = String(body.id_marketplace || '').trim()
  var idTop60 = String(body.id_top60 || '').trim()

  var collection = null
  try {
    collection = $app.findCollectionByNameOrId('sales_leads')
  } catch (err) {
    return e.json(500, { success: false, error: 'Coleção sales_leads não encontrada' })
  }

  // UPSERT SEM DUPLICIDADE:
  // Se já existir lead com mesma marca + id_marketplace (ou, na ausência, marca + id_top60)
  var existingRecord = null

  try {
    if (idMarketplace) {
      var foundByMkt = $app.findRecordsByFilter(
        'sales_leads',
        'marca = {:marca} && id_marketplace = {:mkt}',
        '-created',
        1,
        0,
        { marca: marca, mkt: idMarketplace },
      )
      if (foundByMkt && foundByMkt.length > 0) {
        existingRecord = foundByMkt[0]
      }
    }

    if (!existingRecord && idTop60) {
      var foundByTop60 = $app.findRecordsByFilter(
        'sales_leads',
        'marca = {:marca} && id_top60 = {:top60}',
        '-created',
        1,
        0,
        { marca: marca, top60: idTop60 },
      )
      if (foundByTop60 && foundByTop60.length > 0) {
        existingRecord = foundByTop60[0]
      }
    }

    // Se ambos os IDs vierem vazios, evitar duplicata pela marca exata
    if (!existingRecord && !idMarketplace && !idTop60) {
      var foundByMarca = $app.findRecordsByFilter(
        'sales_leads',
        'marca = {:marca}',
        '-created',
        1,
        0,
        { marca: marca },
      )
      if (foundByMarca && foundByMarca.length > 0) {
        existingRecord = foundByMarca[0]
      }
    }
  } catch (findErr) {
    $app
      .logger()
      .warn('POST /backend/v1/sales/leads findExisting check warn', 'error', String(findErr))
  }

  // Se já existir, retornar 200 com created: false e dados existentes
  if (existingRecord) {
    var exHist = existingRecord.get('historico_contatos')
    if (typeof exHist === 'string') {
      try {
        exHist = JSON.parse(exHist)
      } catch (_) {
        exHist = []
      }
    } else if (!Array.isArray(exHist)) {
      exHist = []
    }
    return e.json(200, {
      success: true,
      created: false,
      message: 'Lead já existente na base central (duplicidade evitada)',
      data: {
        id: existingRecord.id,
        marca: existingRecord.getString('marca'),
        categoria: existingRecord.getString('categoria'),
        porte: existingRecord.getString('porte'),
        regiao: existingRecord.getString('regiao'),
        contato_nome: existingRecord.getString('contato_nome'),
        contato_email: existingRecord.getString('contato_email'),
        contato_whatsapp: existingRecord.getString('contato_whatsapp'),
        prioridade: existingRecord.getString('prioridade'),
        status: existingRecord.getString('status'),
        etapa_atual: existingRecord.getString('etapa_atual'),
        canal: existingRecord.getString('canal'),
        historico_contatos: exHist,
        data_ultimo_contato: existingRecord.getString('data_ultimo_contato'),
        data_proximo_followup: existingRecord.getString('data_proximo_followup'),
        id_top60: existingRecord.getString('id_top60'),
        id_marketplace: existingRecord.getString('id_marketplace'),
        created: existingRecord.getString('created'),
        updated: existingRecord.getString('updated'),
      },
    })
  }

  // Criar novo registro
  try {
    var record = new Record(collection)
    record.set('marca', marca)
    if (body.categoria !== undefined) record.set('categoria', String(body.categoria || '').trim())
    if (body.porte !== undefined) record.set('porte', String(body.porte || '').trim())
    if (body.regiao !== undefined) record.set('regiao', String(body.regiao || '').trim())
    if (body.contato_nome !== undefined)
      record.set('contato_nome', String(body.contato_nome || '').trim())
    if (body.contato_email !== undefined)
      record.set('contato_email', String(body.contato_email || '').trim())
    if (body.contato_whatsapp !== undefined)
      record.set('contato_whatsapp', String(body.contato_whatsapp || '').trim())

    // Validar select prioridade: baixa | media | alta | maxima
    if (body.prioridade !== undefined) {
      var prio = String(body.prioridade || '')
        .trim()
        .toLowerCase()
      if (['baixa', 'media', 'alta', 'maxima'].indexOf(prio) !== -1) {
        record.set('prioridade', prio)
      } else {
        record.set('prioridade', 'media')
      }
    } else {
      record.set('prioridade', 'media')
    }

    // Validar select status: novo | abordado | em_negociacao | fechado | perdido
    if (body.status !== undefined) {
      var st = String(body.status || '')
        .trim()
        .toLowerCase()
      if (['novo', 'abordado', 'em_negociacao', 'fechado', 'perdido'].indexOf(st) !== -1) {
        record.set('status', st)
      } else {
        record.set('status', 'novo')
      }
    } else {
      record.set('status', 'novo')
    }

    if (body.etapa_atual !== undefined)
      record.set('etapa_atual', String(body.etapa_atual || '').trim())
    if (body.canal !== undefined) record.set('canal', String(body.canal || '').trim())

    if (body.historico_contatos !== undefined) {
      record.set(
        'historico_contatos',
        Array.isArray(body.historico_contatos) ? body.historico_contatos : [],
      )
    } else {
      record.set('historico_contatos', [])
    }

    if (body.data_ultimo_contato) record.set('data_ultimo_contato', body.data_ultimo_contato)
    if (body.data_proximo_followup) record.set('data_proximo_followup', body.data_proximo_followup)

    if (idTop60) record.set('id_top60', idTop60)
    if (idMarketplace) record.set('id_marketplace', idMarketplace)

    $app.save(record)

    var createdHist = record.get('historico_contatos')
    if (typeof createdHist === 'string') {
      try {
        createdHist = JSON.parse(createdHist)
      } catch (_) {
        createdHist = []
      }
    } else if (!Array.isArray(createdHist)) {
      createdHist = []
    }
    return e.json(201, {
      success: true,
      created: true,
      message: 'Lead de vendas cadastrado com sucesso',
      data: {
        id: record.id,
        marca: record.getString('marca'),
        categoria: record.getString('categoria'),
        porte: record.getString('porte'),
        regiao: record.getString('regiao'),
        contato_nome: record.getString('contato_nome'),
        contato_email: record.getString('contato_email'),
        contato_whatsapp: record.getString('contato_whatsapp'),
        prioridade: record.getString('prioridade'),
        status: record.getString('status'),
        etapa_atual: record.getString('etapa_atual'),
        canal: record.getString('canal'),
        historico_contatos: createdHist,
        data_ultimo_contato: record.getString('data_ultimo_contato'),
        data_proximo_followup: record.getString('data_proximo_followup'),
        id_top60: record.getString('id_top60'),
        id_marketplace: record.getString('id_marketplace'),
        created: record.getString('created'),
        updated: record.getString('updated'),
      },
    })
  } catch (saveErr) {
    $app.logger().error('POST /backend/v1/sales/leads save error', 'error', String(saveErr))
    return e.json(500, {
      success: false,
      error: 'Erro ao salvar lead na base central: ' + String(saveErr),
    })
  }
})

// ==========================================
// 3. PATCH /backend/v1/sales/leads/{id}
// ==========================================
routerAdd('PATCH', '/backend/v1/sales/leads/{id}', (e) => {
  // Verificação de autenticação inline
  var expectedToken =
    $secrets.get('VMODA_SYNC_TOKEN') ||
    $os.getenv('VMODA_SYNC_TOKEN') ||
    'vmoda_sync_revistamodaatual_2026_sec'

  var isAuthorized = false
  var headerSync = ''
  var headerAuth = ''

  try {
    if (e.request && e.request.header) {
      headerSync = e.request.header.get('x-sync-token') || ''
      headerAuth = e.request.header.get('Authorization') || ''
    }
  } catch (_) {}

  if (headerSync && headerSync === expectedToken) {
    isAuthorized = true
  } else if (headerAuth) {
    var parts = headerAuth.split(' ')
    var bearerToken =
      parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : headerAuth
    if (bearerToken === expectedToken) {
      isAuthorized = true
    }
  }

  if (!isAuthorized) {
    return e.json(401, {
      success: false,
      error: 'Acesso não autorizado: forneça x-sync-token ou Authorization: Bearer válido',
    })
  }

  var id = e.request.pathValue('id') || ''
  if (!id) {
    return e.json(400, { success: false, error: 'ID do lead é obrigatório' })
  }

  var body = e.requestInfo().body || {}

  // Rejeitar tentativas de alterar campos de identidade com erro 400 descritivo
  var forbiddenIdentityFields = ['marca', 'id_top60', 'id_marketplace']
  for (var f = 0; f < forbiddenIdentityFields.length; f++) {
    var forbidden = forbiddenIdentityFields[f]
    if (body[forbidden] !== undefined) {
      return e.json(400, {
        success: false,
        error:
          'O campo de identidade "' +
          forbidden +
          '" é imutável após a criação do lead e não pode ser alterado via PATCH.',
        rejected_field: forbidden,
      })
    }
  }

  var record = null
  try {
    record = $app.findFirstRecordByData('sales_leads', 'id', id)
  } catch (notFound) {
    return e.json(404, {
      success: false,
      error: 'Lead de vendas não encontrado com ID: ' + id,
    })
  }

  try {
    // Aceitar somente: status, etapa_atual, prioridade, canal, porte, regiao, contato_nome, contato_email, contato_whatsapp, data_ultimo_contato, data_proximo_followup, e historico_contatos_add
    if (body.status !== undefined) {
      var st = String(body.status || '')
        .trim()
        .toLowerCase()
      if (['novo', 'abordado', 'em_negociacao', 'fechado', 'perdido'].indexOf(st) !== -1) {
        record.set('status', st)
      } else {
        return e.json(400, {
          success: false,
          error:
            'Valor inválido para status. Valores permitidos: novo, abordado, em_negociacao, fechado, perdido',
        })
      }
    }

    if (body.prioridade !== undefined) {
      var prio = String(body.prioridade || '')
        .trim()
        .toLowerCase()
      if (['baixa', 'media', 'alta', 'maxima'].indexOf(prio) !== -1) {
        record.set('prioridade', prio)
      } else {
        return e.json(400, {
          success: false,
          error: 'Valor inválido para prioridade. Valores permitidos: baixa, media, alta, maxima',
        })
      }
    }

    if (body.etapa_atual !== undefined)
      record.set('etapa_atual', String(body.etapa_atual || '').trim())
    if (body.canal !== undefined) record.set('canal', String(body.canal || '').trim())
    if (body.porte !== undefined) record.set('porte', String(body.porte || '').trim())
    if (body.regiao !== undefined) record.set('regiao', String(body.regiao || '').trim())
    if (body.contato_nome !== undefined)
      record.set('contato_nome', String(body.contato_nome || '').trim())
    if (body.contato_email !== undefined)
      record.set('contato_email', String(body.contato_email || '').trim())
    if (body.contato_whatsapp !== undefined)
      record.set('contato_whatsapp', String(body.contato_whatsapp || '').trim())

    if (body.data_ultimo_contato !== undefined) {
      record.set('data_ultimo_contato', body.data_ultimo_contato || null)
    }
    if (body.data_proximo_followup !== undefined) {
      record.set('data_proximo_followup', body.data_proximo_followup || null)
    }

    // Append de histórico: aceitar campo "historico_contatos_add" com uma entrada única {data, canal, resumo, autor}
    if (body.historico_contatos_add !== undefined && body.historico_contatos_add !== null) {
      var addEntry = body.historico_contatos_add
      if (typeof addEntry !== 'object') {
        return e.json(400, {
          success: false,
          error: 'O campo "historico_contatos_add" deve ser um objeto {data, canal, resumo, autor}',
        })
      }

      var entryObj = {
        data: String(addEntry.data || new Date().toISOString()),
        canal: String(addEntry.canal || ''),
        resumo: String(addEntry.resumo || ''),
        autor: String(addEntry.autor || 'sistema'),
      }

      var rawHist = record.get('historico_contatos')
      var currentHistory = []
      if (rawHist) {
        if (typeof rawHist === 'string') {
          try {
            currentHistory = JSON.parse(rawHist)
          } catch (_) {
            currentHistory = []
          }
        } else if (Array.isArray(rawHist)) {
          // Clone array
          currentHistory = JSON.parse(JSON.stringify(rawHist))
        }
      }

      currentHistory.push(entryObj)
      // No PocketBase v0.36 goja/Record, campos JSON podem ser gravados com slice Go ou string JSON
      record.set('historico_contatos', currentHistory)
    }

    $app.save(record)

    var updatedHist = record.get('historico_contatos')
    if (typeof updatedHist === 'string') {
      try {
        updatedHist = JSON.parse(updatedHist)
      } catch (_) {
        updatedHist = []
      }
    } else if (!Array.isArray(updatedHist)) {
      updatedHist = []
    }
    return e.json(200, {
      success: true,
      message: 'Lead de vendas atualizado com sucesso',
      data: {
        id: record.id,
        marca: record.getString('marca'),
        categoria: record.getString('categoria'),
        porte: record.getString('porte'),
        regiao: record.getString('regiao'),
        contato_nome: record.getString('contato_nome'),
        contato_email: record.getString('contato_email'),
        contato_whatsapp: record.getString('contato_whatsapp'),
        prioridade: record.getString('prioridade'),
        status: record.getString('status'),
        etapa_atual: record.getString('etapa_atual'),
        canal: record.getString('canal'),
        historico_contatos: updatedHist,
        data_ultimo_contato: record.getString('data_ultimo_contato'),
        data_proximo_followup: record.getString('data_proximo_followup'),
        id_top60: record.getString('id_top60'),
        id_marketplace: record.getString('id_marketplace'),
        created: record.getString('created'),
        updated: record.getString('updated'),
      },
    })
  } catch (updateErr) {
    $app.logger().error('PATCH /backend/v1/sales/leads error', 'error', String(updateErr))
    return e.json(500, {
      success: false,
      error: 'Erro ao atualizar lead na base central: ' + String(updateErr),
      details: updateErr && updateErr.data ? updateErr.data : String(updateErr),
    })
  }
})
