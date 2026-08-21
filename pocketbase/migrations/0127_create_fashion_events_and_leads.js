migrate(
  (app) => {
    // 1. fashion_events collection
    if (!app.hasTable('fashion_events')) {
      const fashionEvents = new Collection({
        name: 'fashion_events',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'date', type: 'text', required: true },
          { name: 'location', type: 'text' },
          {
            name: 'category',
            type: 'select',
            values: ['Desfile', 'Festa', 'Tapete Vermelho', 'Outros'],
            maxSelect: 1,
          },
          {
            name: 'image',
            type: 'file',
            maxSelect: 1,
            maxSize: 10485760,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          },
          { name: 'gallery_data', type: 'json' },
          { name: 'is_spotlight', type: 'bool' },
          { name: 'display_order', type: 'number' },
          {
            name: 'status',
            type: 'select',
            values: ['rascunho', 'publicado', 'arquivado'],
            maxSelect: 1,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_fashion_events_date ON fashion_events (date DESC)',
          'CREATE INDEX idx_fashion_events_category ON fashion_events (category)',
          'CREATE INDEX idx_fashion_events_spotlight ON fashion_events (is_spotlight)',
        ],
      })
      app.save(fashionEvents)
    }

    // 2. leads collection
    if (!app.hasTable('leads')) {
      const leads = new Collection({
        name: 'leads',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: '', // Public can create/capture leads
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'nome', type: 'text', required: true },
          { name: 'email', type: 'email', required: true },
          { name: 'telefone', type: 'text' },
          { name: 'empresa', type: 'text' },
          {
            name: 'segmento',
            type: 'select',
            values: ['atacado', 'varejo', 'confeccao', 'estilista', 'outro'],
            maxSelect: 1,
          },
          { name: 'origem', type: 'text' }, // e.g., 'landing_page', 'footer', 'events', 'bio'
          { name: 'data_captacao', type: 'date' },
          {
            name: 'type',
            type: 'select',
            values: ['advertise', 'subscribe', 'contact', 'other'],
            maxSelect: 1,
          },
          { name: 'notes', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_leads_email ON leads (email)',
          'CREATE INDEX idx_leads_segmento ON leads (segmento)',
          'CREATE INDEX idx_leads_created ON leads (created DESC)',
        ],
      })
      app.save(leads)
    }
  },
  (app) => {
    try {
      const fe = app.findCollectionByNameOrId('fashion_events')
      app.delete(fe)
    } catch (_) {}
    try {
      const ld = app.findCollectionByNameOrId('leads')
      app.delete(ld)
    } catch (_) {}
  },
)
