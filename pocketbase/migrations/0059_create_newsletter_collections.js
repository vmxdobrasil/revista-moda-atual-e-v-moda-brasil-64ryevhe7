migrate(
  (app) => {
    var editionsId = app.findCollectionByNameOrId('editions').id

    var subscribers = new Collection({
      name: 'subscribers',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: false },
        { name: 'email', type: 'email', required: true },
        {
          name: 'segment',
          type: 'select',
          required: true,
          values: ['varejo', 'atacado', 'consumidora'],
          maxSelect: 1,
        },
        { name: 'interests', type: 'json', required: false },
        { name: 'preferences', type: 'json', required: false },
        {
          name: 'source',
          type: 'select',
          required: false,
          values: ['site', 'indicacao', 'importacao', 'social', 'admin'],
          maxSelect: 1,
        },
        { name: 'engagement_score', type: 'number', required: false },
        {
          name: 'status',
          type: 'select',
          required: false,
          values: ['ativo', 'descadastrado', 'inativo'],
          maxSelect: 1,
        },
        { name: 'opened_count', type: 'number', required: false },
        { name: 'clicked_count', type: 'number', required: false },
        { name: 'last_opened_at', type: 'date', required: false },
        { name: 'last_clicked_at', type: 'date', required: false },
        { name: 'unsubscribed_at', type: 'date', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_subscribers_email ON subscribers (email)',
        'CREATE INDEX idx_subscribers_segment ON subscribers (segment)',
        'CREATE INDEX idx_subscribers_status ON subscribers (status)',
        'CREATE INDEX idx_subscribers_engagement ON subscribers (engagement_score)',
      ],
    })
    app.save(subscribers)

    var campaigns = new Collection({
      name: 'newsletter_campaigns',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'subject', type: 'text', required: false },
        { name: 'preheader', type: 'text', required: false },
        { name: 'content', type: 'json', required: false },
        {
          name: 'edition',
          type: 'relation',
          collectionId: editionsId,
          maxSelect: 1,
        },
        { name: 'segments', type: 'json', required: false },
        { name: 'audience_size', type: 'number', required: false },
        { name: 'scheduled_at', type: 'date', required: false },
        { name: 'send_date', type: 'date', required: false },
        {
          name: 'status',
          type: 'select',
          required: false,
          values: ['rascunho', 'em_revisao', 'aprovado', 'agendado', 'enviado', 'falhou'],
          maxSelect: 1,
        },
        { name: 'opened_count', type: 'number', required: false },
        { name: 'open_rate', type: 'number', required: false },
        { name: 'click_count', type: 'number', required: false },
        { name: 'click_rate', type: 'number', required: false },
        { name: 'unsubscribe_count', type: 'number', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_newsletter_campaigns_status ON newsletter_campaigns (status)',
        'CREATE INDEX idx_newsletter_campaigns_send_date ON newsletter_campaigns (send_date)',
        'CREATE INDEX idx_newsletter_campaigns_edition ON newsletter_campaigns (edition)',
      ],
    })
    app.save(campaigns)

    var sequences = new Collection({
      name: 'newsletter_sequences',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text', required: false },
        {
          name: 'segment',
          type: 'select',
          required: false,
          values: ['varejo', 'atacado', 'consumidora', 'todos'],
          maxSelect: 1,
        },
        { name: 'trigger', type: 'text', required: false },
        { name: 'steps', type: 'json', required: false },
        {
          name: 'status',
          type: 'select',
          required: false,
          values: ['rascunho', 'ativo', 'pausado'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_newsletter_sequences_segment ON newsletter_sequences (segment)',
        'CREATE INDEX idx_newsletter_sequences_status ON newsletter_sequences (status)',
      ],
    })
    app.save(sequences)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('subscribers'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('newsletter_campaigns'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('newsletter_sequences'))
    } catch (_) {}
  },
)
