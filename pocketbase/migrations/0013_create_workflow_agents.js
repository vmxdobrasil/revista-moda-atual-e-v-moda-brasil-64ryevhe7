migrate(
  (app) => {
    var editionsCol = app.findCollectionByNameOrId('editions')

    var collection = new Collection({
      name: 'workflow_results',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'edition_id',
          type: 'relation',
          collectionId: editionsCol.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'theme', type: 'text' },
        { name: 'agent_outputs', type: 'json' },
        { name: 'final_content', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_workflow_results_edition ON workflow_results (edition_id)',
        'CREATE INDEX idx_workflow_results_created ON workflow_results (created)',
      ],
    })
    app.save(collection)

    $ai.agents.define(app, {
      slug: 'content-analyzer',
      name: 'Content Analyzer',
      description:
        'Analyzes historical social_posts, editions, and generated_social_content to identify best-performing topics, hooks, and formats.',
      systemPrompt:
        'You are a content analyst. Analyze the given data from the existing social posts and editions to identify top-performing themes, hooks, and formats. Output a structured JSON with keys: top_themes[], best_hooks[], recommended_format.',
      tier: 'fast',
      tools: [
        { collection: 'social_posts', perms: { read: true, list: true } },
        { collection: 'editions', perms: { read: true, list: true } },
        { collection: 'generated_social_content', perms: { read: true, list: true } },
      ],
    })

    $ai.agents.define(app, {
      slug: 'trend-researcher',
      name: 'Trend Researcher',
      description:
        'Reads the Content Analyzer output and enriches it with trend intelligence to produce a trend brief.',
      systemPrompt:
        'You are a trend researcher. From the Content Analyzer output, research current digital editorial trends (using your built-in knowledge). Produce a trend brief JSON with: trend_summary, target_audience, suggested_angle.',
      tier: 'fast',
      tools: [
        { collection: 'social_posts', perms: { read: true, list: true } },
        { collection: 'editions', perms: { read: true, list: true } },
      ],
    })

    $ai.agents.define(app, {
      slug: 'copywriter',
      name: 'Copywriter',
      description:
        'Takes the trend brief and writes a full article or social media caption following brand tone restrictions.',
      systemPrompt:
        'You are a copywriter for Revista MODA ATUAL DIGITAL. Write a 300-word article or social caption in Portuguese (Brazil) following brand tone: sophisticated, inclusive, data-driven. Use the trend brief as inspiration. Output as JSON with: title, body, suggested_hashtags[].',
      tier: 'fast',
      tools: [],
    })

    $ai.agents.define(app, {
      slug: 'visual-designer',
      name: 'Visual Designer',
      description:
        'Receives the copy and suggests image concepts, template types, and hotspot placements referencing existing editions.',
      systemPrompt:
        'You are a visual designer. Based on the copywriter output, suggest a cover image concept, a page template (editorial/marketing/holofote), and up to 3 hotspot placements on a page. Output JSON with: cover_concept, template, hotspots[{x,y,title}], page_title.',
      tier: 'fast',
      tools: [
        { collection: 'editions', perms: { read: true, list: true } },
        { collection: 'edition_pages', perms: { read: true, list: true } },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'content-analyzer')
    $ai.agents.delete(app, 'trend-researcher')
    $ai.agents.delete(app, 'copywriter')
    $ai.agents.delete(app, 'visual-designer')

    var collection = app.findCollectionByNameOrId('workflow_results')
    app.delete(collection)
  },
)
