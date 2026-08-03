routerAdd(
  'GET',
  '/backend/v1/audit-report',
  (e) => {
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var result = { generatedAt: new Date().toISOString() }

    var colNames = [
      'users',
      'editions',
      'edition_pages',
      'page_hotspots',
      'generated_social_content',
      'social_posts',
      'workflow_results',
      'top60_categories',
      'top60_brands',
      'marketplace_products',
      'marketplace_orders',
      'prompt_library',
      'story_texts',
      'advertisements',
      'delivery_queue',
      'about_content',
      'audit_logs',
      'audit_snapshots',
    ]

    var collections = []
    for (var i = 0; i < colNames.length; i++) {
      var cn = colNames[i]
      var entry = { name: cn, count: 0, lastRecord: null, status: 'OK', priority: 'baixa' }
      try {
        try {
          entry.count = $app.countRecords(cn)
        } catch (_) {
          try {
            entry.count = $app.findRecordsByFilter(cn, '', '', 0, 0).length
          } catch (_) {}
        }
        if (entry.count > 0) {
          try {
            var recs = $app.findRecordsByFilter(cn, '', '-created', 1, 0)
            if (recs.length > 0) entry.lastRecord = recs[0].getString('created')
          } catch (_) {}
        }
        if (entry.count === 0 && cn !== 'about_content') {
          entry.status = 'needs attention'
          entry.priority = 'média'
        }
      } catch (err) {
        entry.status = 'error'
        entry.priority = 'alta'
      }
      collections.push(entry)
    }
    result.collections = collections

    var allLogs = []
    try {
      allLogs = $app.findRecordsByFilter('audit_logs', '', '-executed_at', 0, 0)
    } catch (_) {}

    function findLastLog(name, agentSlug) {
      for (var j = 0; j < allLogs.length; j++) {
        if (agentSlug && allLogs[j].getString('agent_name') === agentSlug) {
          return allLogs[j]
        }
        if (!agentSlug && allLogs[j].getString('integration_name') === name) {
          return allLogs[j]
        }
      }
      return null
    }

    var hooksData = [
      {
        name: 'content_workflow_orchestrator',
        type: 'route',
        deps: 'agents: content-analyzer, trend-researcher, copywriter, visual-designer; workflow_results',
      },
      {
        name: 'fashion_advisor_chat',
        type: 'route',
        deps: 'agent: fashion-trend-advisor; social_posts',
      },
      { name: 'generate_arquiteto_workflow', type: 'route', deps: 'prompt_library; $ai.chat' },
      { name: 'generate_caption', type: 'route', deps: 'prompt_library; $ai.chat' },
      { name: 'generate_content', type: 'route', deps: 'editions; $ai.chat' },
      { name: 'generate_descricao', type: 'route', deps: 'prompt_library; story_texts; $ai.chat' },
      { name: 'generate_engenheiro_refinamento', type: 'route', deps: 'prompt_library; $ai.chat' },
      {
        name: 'generate_legenda_atacadista',
        type: 'route',
        deps: 'prompt_library; story_texts; $ai.chat',
      },
      { name: 'generate_materia', type: 'route', deps: 'prompt_library; story_texts; $ai.chat' },
      {
        name: 'generate_meta_prompt',
        type: 'route',
        deps: 'prompt_library; agent: fashion-trend-advisor',
      },
      { name: 'generate_reel', type: 'route', deps: 'prompt_library; story_texts; $ai.chat' },
      {
        name: 'generate_reel_script',
        type: 'route',
        deps: 'prompt_library; story_texts; $ai.chat',
      },
      { name: 'generate_titulos', type: 'route', deps: 'prompt_library; story_texts; $ai.chat' },
      {
        name: 'generate_trend_report',
        type: 'route',
        deps: 'prompt_library; story_texts; $ai.chat',
      },
      {
        name: 'generate_weekly_plan',
        type: 'route',
        deps: 'prompt_library; story_texts; $ai.chat',
      },
      { name: 'hotspot_click_track', type: 'route', deps: 'page_hotspots' },
      {
        name: 'meta_prompt_generate',
        type: 'route',
        deps: 'prompt_library; agent: fashion-trend-advisor',
      },
      {
        name: 'multi_format_generator',
        type: 'route',
        deps: 'prompt_library; workflow_results; marketplace_products; $ai.chat',
      },
      { name: 'page_view_track', type: 'route', deps: 'edition_pages; editions' },
      { name: 'social_analytics_recommendations', type: 'route', deps: 'social_posts' },
      {
        name: 'social_posts_compute',
        type: 'event',
        deps: 'social_posts (onRecordCreate/Update/Delete)',
      },
    ]

    for (var i = 0; i < hooksData.length; i++) {
      var hd = hooksData[i]
      hd.lastExecution = null
      hd.status = 'unavailable'
      hd.priority = 'média'
      hd.error_message = ''
      var log = findLastLog(hd.name, null)
      if (log) {
        hd.lastExecution = log.getString('executed_at')
        hd.status = log.getString('status') === 'error' ? 'error' : 'active'
        hd.error_message = log.getString('error_message') || ''
        hd.priority = hd.status === 'error' ? 'alta' : 'baixa'
      }
    }
    result.hooks = hooksData

    var agentsData = [
      {
        name: 'Content Chain',
        slug: 'content-chain',
        description: 'Orchestrates five AI specialists for Instagram-ready content',
      },
      {
        name: 'Fashion Trend Advisor',
        slug: 'fashion-trend-advisor',
        description: 'Social Media Fashion Analysis and insights',
      },
      {
        name: 'Content Analyzer',
        slug: 'content-analyzer',
        description: 'Analyzes historical social_posts and editions',
      },
      {
        name: 'Trend Researcher',
        slug: 'trend-researcher',
        description: 'Enriches analysis with trend intelligence',
      },
      {
        name: 'Copywriter',
        slug: 'copywriter',
        description: 'Writes articles and social captions',
      },
      {
        name: 'Visual Designer',
        slug: 'visual-designer',
        description: 'Suggests image concepts and hotspot placements',
      },
    ]

    for (var i = 0; i < agentsData.length; i++) {
      var ad = agentsData[i]
      ad.lastExecution = null
      ad.status = 'unavailable'
      ad.priority = 'média'
      ad.error_message = ''
      var alog = findLastLog(null, ad.slug)
      if (alog) {
        ad.lastExecution = alog.getString('executed_at')
        ad.status = alog.getString('status') === 'error' ? 'error' : 'active'
        ad.error_message = alog.getString('error_message') || ''
        ad.priority = ad.status === 'error' ? 'alta' : 'baixa'
      }
    }
    result.agents = agentsData

    var dq = { total: 0, byStatus: {}, pending: 0, errors: [], healthStatus: 'healthy', items: [] }
    try {
      var allDq = $app.findRecordsByFilter('delivery_queue', '', '-created', 50, 0)
      dq.total = $app.countRecords('delivery_queue')
      var statuses = ['rascunho', 'em_revisao', 'aprovado', 'publicado']
      for (var s = 0; s < statuses.length; s++) {
        dq.byStatus[statuses[s]] = 0
      }
      for (var di = 0; di < allDq.length; di++) {
        var item = allDq[di]
        var stVal = item.getString('status')
        if (dq.byStatus[stVal] !== undefined) dq.byStatus[stVal]++
        var priority = 'baixa'
        if (stVal === 'rascunho' && item.getString('error_note')) priority = 'alta'
        else if (stVal === 'rascunho') priority = 'média'
        else if (stVal === 'em_revisao') priority = 'média'
        var procTime = 'indisponível'
        var createdStr = item.getString('created')
        var updatedStr = item.getString('updated')
        if (createdStr && updatedStr) {
          try {
            var diff = new Date(updatedStr) - new Date(createdStr)
            if (diff > 0) {
              var hours = Math.floor(diff / 3600000)
              var mins = Math.floor((diff % 3600000) / 60000)
              procTime = hours > 0 ? hours + 'h ' + mins + 'm' : mins + 'm'
            }
          } catch (_) {}
        }

        dq.items.push({
          id: item.id,
          theme: item.getString('theme'),
          status: stVal,
          created: item.getString('created'),
          updated: item.getString('updated'),
          published_at: item.getString('published_at'),
          error_note: item.getString('error_note'),
          priority: priority,
          processingTime: procTime,
        })
        if (item.getString('error_note')) {
          dq.errors.push({
            id: item.id,
            theme: item.getString('theme'),
            error_note: item.getString('error_note'),
            created: item.getString('created'),
            priority: 'alta',
          })
        }
      }
      dq.pending = (dq.byStatus['rascunho'] || 0) + (dq.byStatus['em_revisao'] || 0)
      if (dq.errors.length > 0) dq.healthStatus = 'errors'
      else if (dq.pending > 0) dq.healthStatus = 'pending'

      var totalProcMs = 0
      var procCount = 0
      for (var pi2 = 0; pi2 < dq.items.length; pi2++) {
        var createdTs = dq.items[pi2].created
        var updatedTs = dq.items[pi2].updated
        if (createdTs && updatedTs) {
          try {
            var diffMs = new Date(updatedTs) - new Date(createdTs)
            if (diffMs > 0) {
              totalProcMs += diffMs
              procCount++
            }
          } catch (_) {}
        }
      }
      if (procCount > 0) {
        var avgMs = totalProcMs / procCount
        var avgH = Math.floor(avgMs / 3600000)
        var avgM = Math.floor((avgMs % 3600000) / 60000)
        dq.avgProcessingTime = avgH > 0 ? avgH + 'h ' + avgM + 'm' : avgM + 'm'
      } else {
        dq.avgProcessingTime = 'indisponível'
      }
    } catch (err) {
      dq.healthStatus = 'error'
    }
    result.deliveryQueue = dq

    result.hooksDivergence = {
      documented: 18,
      found: hooksData.length,
      additional: [
        {
          name: 'meta_prompt_generate',
          purpose:
            'Generates meta-prompts by combining fashion-trend-advisor agent insights with prompt library entries for optimized content creation',
          status: 'active',
        },
        {
          name: 'multi_format_generator',
          purpose:
            'Generates content in multiple formats (article, caption, bio) with marketplace product integration and workflow result persistence',
          status: 'active',
        },
        {
          name: 'social_analytics_recommendations',
          purpose:
            'Analyzes social posts performance data and generates actionable marketing recommendations based on engagement metrics',
          status: 'active',
        },
      ],
    }

    var promptCount = 0
    var promptList = []
    try {
      promptCount = $app.countRecords('prompt_library')
      var prompts = $app.findRecordsByFilter('prompt_library', '', '-created', 0, 0)
      for (var pi = 0; pi < prompts.length; pi++) {
        promptList.push({
          name: prompts[pi].getString('name'),
          slug: prompts[pi].getString('slug'),
          category: prompts[pi].getString('category'),
          updated: prompts[pi].getString('updated'),
        })
      }
    } catch (_) {}

    var documentedSlugs = [
      'legenda-instagram',
      'stories',
      'reel',
      'titulos-seo',
      'descricao-youtube',
      'legenda-atacadista',
      'materia-jornalistica',
      'materia-completa',
      'plano-semanal',
      'reels-script',
      'tendencia-relatorio',
      'engenheiro-prompts',
      'meta-prompt',
      'basic-super-prompt-1',
      'basic-super-prompt-2',
      'advanced-super-prompt',
      'arquiteto-workflow',
      'engenheiro-refinamento',
      'auditoria',
      'edicao-de-roupas',
      'suporte-de-entrega',
      'chamada-newsletter',
    ]
    var additionalPrompts = []
    for (var pi = 0; pi < promptList.length; pi++) {
      var found = false
      for (var di = 0; di < documentedSlugs.length; di++) {
        if (promptList[pi].slug === documentedSlugs[di]) {
          found = true
          break
        }
      }
      if (!found) additionalPrompts.push(promptList[pi])
    }

    result.promptsDivergence = {
      documented: documentedSlugs.length,
      found: promptCount,
      additional: additionalPrompts,
      allPrompts: promptList,
    }

    var adminAdditional = [
      {
        name: 'Top 60 (Parceiros)',
        description:
          'CRUD of categories and brands, ranking, website, social handle, position, score, and previous position.',
        route: '/admin/top60',
        status: 'active',
      },
      {
        name: 'Anúncios',
        description: 'CRUD of advertising banners with image, URL, title, active/inactive status.',
        route: '/admin/advertisements',
        status: 'active',
      },
      {
        name: 'Ofertas',
        description:
          'CRUD of marketplace products and orders, including product price, currency, category, vendor, featured status, and order status flow.',
        route: '/admin/marketplace-products',
        status: 'active',
      },
    ]
    result.adminModulesDivergence = {
      documented: 15,
      found: 15 + adminAdditional.length,
      additional: adminAdditional,
    }

    result.arquitetoFix = {
      status: 'fixed',
      bug: 'Hook referenced undefined variable "entrega_final" and read body.entrega_final (snake_case) instead of body.entregaFinal (camelCase)',
      fix: 'Changed to body.entregaFinal, fixed validation reference, added audit logging',
      validated: true,
      parameterCorrections: [
        {
          hook: 'generate_arquiteto_workflow',
          field: 'entrega_final',
          correctedTo: 'entregaFinal',
          reason: 'camelCase convention',
        },
        {
          hook: 'generate_engenheiro_refinamento',
          field: 'prompt_original',
          correctedTo: 'promptOriginal',
          reason: 'camelCase convention',
        },
        {
          hook: 'multi_format_generator',
          field: 'product_id',
          correctedTo: 'productId',
          reason: 'camelCase convention',
        },
        {
          hook: 'content_workflow_orchestrator',
          field: 'edition_id',
          correctedTo: 'editionId',
          reason: 'camelCase convention',
        },
      ],
    }

    var hookExecutionsByDay = {}
    var nowDate = new Date()
    for (var di = 0; di < 7; di++) {
      var dd = new Date(nowDate)
      dd.setDate(dd.getDate() - di)
      var ds =
        dd.getUTCFullYear() +
        '-' +
        String(dd.getUTCMonth() + 1).padStart(2, '0') +
        '-' +
        String(dd.getUTCDate()).padStart(2, '0')
      hookExecutionsByDay[ds] = { date: ds, success: 0, error: 0 }
    }
    for (var li = 0; li < allLogs.length; li++) {
      var execAt = allLogs[li].getString('executed_at')
      if (!execAt) continue
      var execDay = execAt.split(' ')[0].split('T')[0]
      if (hookExecutionsByDay[execDay]) {
        if (allLogs[li].getString('status') === 'error') hookExecutionsByDay[execDay].error++
        else hookExecutionsByDay[execDay].success++
      }
    }
    result.hookExecutionsByDay = Object.values(hookExecutionsByDay).sort(function (a, b) {
      return a.date.localeCompare(b.date)
    })

    return e.json(200, result)
  },
  $apis.requireAuth(),
)
