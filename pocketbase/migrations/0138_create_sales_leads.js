migrate(
  (app) => {
    if (!app.hasTable('sales_leads')) {
      const salesLeads = new Collection({
        name: 'sales_leads',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'marca', type: 'text', required: true },
          { name: 'categoria', type: 'text' },
          { name: 'porte', type: 'text' },
          { name: 'regiao', type: 'text' },
          { name: 'contato_nome', type: 'text' },
          { name: 'contato_email', type: 'text' },
          { name: 'contato_whatsapp', type: 'text' },
          {
            name: 'prioridade',
            type: 'select',
            values: ['baixa', 'media', 'alta', 'maxima'],
            maxSelect: 1,
          },
          {
            name: 'status',
            type: 'select',
            values: ['novo', 'abordado', 'em_negociacao', 'fechado', 'perdido'],
            maxSelect: 1,
          },
          { name: 'etapa_atual', type: 'text' },
          { name: 'canal', type: 'text' },
          { name: 'historico_contatos', type: 'json' },
          { name: 'data_ultimo_contato', type: 'date' },
          { name: 'data_proximo_followup', type: 'date' },
          { name: 'id_top60', type: 'text' },
          { name: 'id_marketplace', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_sales_leads_marca ON sales_leads (marca)',
          'CREATE INDEX idx_sales_leads_status ON sales_leads (status)',
          'CREATE INDEX idx_sales_leads_prioridade ON sales_leads (prioridade)',
          'CREATE INDEX idx_sales_leads_id_top60 ON sales_leads (id_top60)',
          'CREATE INDEX idx_sales_leads_id_marketplace ON sales_leads (id_marketplace)',
        ],
      })
      app.save(salesLeads)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('sales_leads')
      app.delete(col)
    } catch (_) {}
  },
)
