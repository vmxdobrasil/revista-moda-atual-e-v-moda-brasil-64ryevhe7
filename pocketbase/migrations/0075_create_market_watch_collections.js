migrate(
  (app) => {
    var top60CatId = app.findCollectionByNameOrId('top60_categories').id

    var competitors = new Collection({
      name: 'competitors',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'relation', collectionId: top60CatId, maxSelect: 1 },
        {
          name: 'platform',
          type: 'select',
          values: ['instagram', 'facebook', 'youtube', 'tiktok', 'site'],
          maxSelect: 1,
        },
        { name: 'social_handle', type: 'text' },
        { name: 'website', type: 'url' },
        {
          name: 'logo_file',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'followers', type: 'number', min: 0 },
        { name: 'engagement_rate', type: 'number', min: 0 },
        { name: 'post_frequency', type: 'number', min: 0 },
        { name: 'content_themes', type: 'json' },
        { name: 'last_checked_at', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_competitors_platform ON competitors (platform)',
        'CREATE INDEX idx_competitors_category ON competitors (category)',
      ],
    })
    app.save(competitors)

    var competitorsId = app.findCollectionByNameOrId('competitors').id

    var marketSignals = new Collection({
      name: 'market_signals',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'signal_type',
          type: 'select',
          values: ['tendencia', 'alerta_concorrente', 'mencao_marca', 'comportamento_consumidor'],
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'competitor', type: 'relation', collectionId: competitorsId, maxSelect: 1 },
        {
          name: 'severity',
          type: 'select',
          values: ['info', 'atencao', 'critico'],
          maxSelect: 1,
        },
        { name: 'source', type: 'text' },
        { name: 'detected_at', type: 'date' },
        {
          name: 'status',
          type: 'select',
          values: ['novo', 'em_analise', 'notificado', 'arquivado'],
          maxSelect: 1,
        },
        { name: 'related_data', type: 'json' },
        { name: 'vector', type: 'vector', dimensions: 1536, distance: 'cosine' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_market_signals_signal_type ON market_signals (signal_type)',
        'CREATE INDEX idx_market_signals_severity ON market_signals (severity)',
        'CREATE INDEX idx_market_signals_status ON market_signals (status)',
        'CREATE INDEX idx_market_signals_detected_at ON market_signals (detected_at)',
      ],
    })
    app.save(marketSignals)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('market_signals'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('competitors'))
    } catch (_) {}
  },
)
