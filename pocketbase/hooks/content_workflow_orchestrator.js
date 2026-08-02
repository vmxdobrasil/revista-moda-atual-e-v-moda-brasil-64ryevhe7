routerAdd(
  'POST',
  '/backend/v1/content-workflow/run',
  (e) => {
    var body = e.requestInfo().body || {}
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    var editionId = body.editionId || ''
    var theme = body.theme || ''

    if (!editionId && !theme) {
      return e.badRequestError('Either edition_id or theme is required.')
    }

    function parseAgentJson(content) {
      var jsonStr = (content || '').trim()
      var fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (fenceMatch) {
        jsonStr = fenceMatch[1].trim()
      } else {
        var braceMatch = jsonStr.match(/\{[\s\S]*\}/)
        if (braceMatch) {
          jsonStr = braceMatch[0]
        }
      }
      return JSON.parse(jsonStr)
    }

    var agentOutputs = {}
    var currentStep = ''

    try {
      currentStep = 'content-analyzer'
      var analyzerMsg = editionId
        ? 'Analyze editions, social posts, and generated content for edition ' + editionId + '.'
        : 'Analyze editions, social posts, and generated content for theme: ' + theme + '.'
      var analyzerResult = $ai.agent('content-analyzer').chat({
        user_id: userId,
        message: analyzerMsg,
      })
      var analysis = parseAgentJson(analyzerResult.content)
      agentOutputs.analysis = analysis

      currentStep = 'trend-researcher'
      var trendResult = $ai.agent('trend-researcher').chat({
        user_id: userId,
        message:
          'Based on this content analysis, research current digital editorial trends and produce a trend brief:\n\n' +
          JSON.stringify(analysis),
      })
      var trendBrief = parseAgentJson(trendResult.content)
      agentOutputs.trend_brief = trendBrief

      currentStep = 'copywriter'
      var copyResult = $ai.agent('copywriter').chat({
        user_id: userId,
        message:
          'Write a 300-word article or social caption based on this trend brief:\n\n' +
          JSON.stringify(trendBrief),
      })
      var copy = parseAgentJson(copyResult.content)
      agentOutputs.copy = copy

      currentStep = 'visual-designer'
      var visualResult = $ai.agent('visual-designer').chat({
        user_id: userId,
        message: 'Based on this copy, suggest visual design elements:\n\n' + JSON.stringify(copy),
      })
      var visual = parseAgentJson(visualResult.content)
      agentOutputs.visual = visual

      var finalContent = {
        copy: copy,
        visual: visual,
        analysis: analysis,
        trend_brief: trendBrief,
      }

      var wfCol = $app.findCollectionByNameOrId('workflow_results')
      var record = new Record(wfCol)
      if (editionId) record.set('edition_id', editionId)
      if (theme) {
        record.set('theme', theme)
      } else {
        try {
          var ed = $app.findRecordById('editions', editionId)
          record.set('theme', ed.getString('title'))
        } catch (_) {
          record.set('theme', '')
        }
      }
      record.set('agent_outputs', agentOutputs)
      record.set('final_content', finalContent)
      $app.save(record)

      try {
        var alCol = $app.findCollectionByNameOrId('audit_logs')
        var alRec = new Record(alCol)
        alRec.set('integration_name', 'content_workflow_orchestrator')
        alRec.set('integration_type', 'route')
        alRec.set('status', 'success')
        alRec.set('executed_at', new Date().toISOString())
        alRec.set('workflow_id', record.id)
        $app.save(alRec)
      } catch (_) {}

      $app.logger().info('content workflow completed', 'workflow_result_id', record.id)

      return e.json(200, {
        success: true,
        agent_outputs: agentOutputs,
        final_content: finalContent,
        workflow_result_id: record.id,
      })
    } catch (err) {
      var errorMsg = err && err.message ? err.message : 'Unknown error'
      if (err instanceof SkipAiConfigError) {
        errorMsg = 'AI service not configured'
      } else if (err instanceof SkipAiAgentsError) {
        errorMsg = 'Agent error: ' + (err.message || 'unknown')
      } else if (err instanceof SkipAiError) {
        errorMsg = 'AI service error: ' + (err.message || 'unknown')
      }

      try {
        var alColE = $app.findCollectionByNameOrId('audit_logs')
        var alRecE = new Record(alColE)
        alRecE.set('integration_name', 'content_workflow_orchestrator')
        alRecE.set('integration_type', 'route')
        alRecE.set('status', 'error')
        alRecE.set('executed_at', new Date().toISOString())
        alRecE.set('error_message', errorMsg)
        $app.save(alRecE)
      } catch (_) {}

      $app.logger().error('content workflow failed', 'step', currentStep, 'error', errorMsg)

      return e.json(500, {
        success: false,
        error: errorMsg,
        failed_step: currentStep,
        partial_outputs: agentOutputs,
      })
    }
  },
  $apis.requireAuth(),
)
