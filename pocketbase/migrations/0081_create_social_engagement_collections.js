migrate(
  (app) => {
    var engagementLog = new Collection({
      name: 'engagement_log',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'ig_user_id', type: 'text' },
        { name: 'ig_username', type: 'text' },
        {
          name: 'type',
          type: 'select',
          values: ['comment', 'dm'],
          maxSelect: 1,
        },
        {
          name: 'intent',
          type: 'select',
          values: [
            'elogio',
            'pergunta_conteudo',
            'pergunta_produto',
            'critica',
            'spam',
            'parceria',
            'consultoria',
            'reclamacao',
          ],
          maxSelect: 1,
        },
        { name: 'message_text', type: 'text' },
        { name: 'response_text', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['respondido', 'pendente', 'encaminhado_humano', 'ignorado'],
          maxSelect: 1,
        },
        { name: 'media_id', type: 'text' },
        { name: 'comment_id', type: 'text' },
        { name: 'conversation_id', type: 'text' },
        { name: 'forwarded_to', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_engagement_log_ig_user ON engagement_log (ig_user_id)',
        'CREATE INDEX idx_engagement_log_type ON engagement_log (type)',
        'CREATE INDEX idx_engagement_log_status ON engagement_log (status)',
        'CREATE INDEX idx_engagement_log_intent ON engagement_log (intent)',
      ],
    })
    app.save(engagementLog)

    var dmLeads = new Collection({
      name: 'dm_leads',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'ig_user_id', type: 'text' },
        { name: 'ig_username', type: 'text' },
        { name: 'name', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'whatsapp', type: 'text' },
        { name: 'city', type: 'text' },
        {
          name: 'intent',
          type: 'select',
          values: ['produto', 'anuncio', 'consultoria', 'parceria'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: ['novo', 'contatado', 'convertido', 'arquivado'],
          maxSelect: 1,
        },
        { name: 'notes', type: 'text' },
        { name: 'conversation_id', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_dm_leads_ig_user ON dm_leads (ig_user_id)',
        'CREATE INDEX idx_dm_leads_status ON dm_leads (status)',
        'CREATE INDEX idx_dm_leads_intent ON dm_leads (intent)',
      ],
    })
    app.save(dmLeads)

    var igConversations = new Collection({
      name: 'ig_conversations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'ig_user_id', type: 'text' },
        { name: 'ig_username', type: 'text' },
        { name: 'conversation_id', type: 'text' },
        { name: 'message_count', type: 'number', min: 0 },
        { name: 'last_message_at', type: 'date' },
        { name: 'context', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_ig_conversations_ig_user ON ig_conversations (ig_user_id)',
        'CREATE INDEX idx_ig_conversations_last_message ON ig_conversations (last_message_at)',
      ],
    })
    app.save(igConversations)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('engagement_log'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('dm_leads'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('ig_conversations'))
    } catch (_) {}
  },
)
