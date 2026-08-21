migrate(
  (app) => {
    try {
      const feCol = app.findCollectionByNameOrId('fashion_events')
      const count = app.countRecords('fashion_events')
      if (count === 0) {
        const eventsData = [
          {
            title: 'São Paulo Fashion Week — Tendências Primavera/Verão',
            description:
              'A cobertura completa dos principais desfiles e bastidores da semana de moda mais prestigiada da América Latina. Destaque para coleções de alfaiataria contemporânea e tecidos sustentáveis.',
            date: '2025-04-15',
            location: 'Pavilhão das Culturas Brasileiras, Parque Ibirapuera - SP',
            category: 'Desfile',
            is_spotlight: true,
            status: 'publicado',
            display_order: 1,
            gallery_data: [
              {
                title: 'Desfile de Abertura — Alfaiataria Fluida',
                description: 'Tons terrosos e cortes desestruturados em linho puro.',
                imageUrl: 'https://img.usecurling.com/p/800/1000?q=runway%20fashion%20show',
              },
              {
                title: 'Backstage & Beleza Natural',
                description:
                  'Texturas iluminadas e maquiagem minimalista assinada pelos maiores maquiadores do país.',
                imageUrl: 'https://img.usecurling.com/p/800/1000?q=fashion%20model%20backstage',
              },
              {
                title: 'Primeira Fila & Celebridades',
                description: 'Personalidades e compradores internacionais acompanhando o desfile.',
                imageUrl: 'https://img.usecurling.com/p/800/1000?q=fashion%20front%20row',
              },
              {
                title: 'Detalhes e Acessórios Artesanais',
                description: 'Bolsas estruturadas e calçados em couro ecológico.',
                imageUrl: 'https://img.usecurling.com/p/800/1000?q=luxury%20fashion%20accessories',
              },
            ],
          },
          {
            title: 'Gala Moda Brasil 2025 — Tapete Vermelho',
            description:
              'Noite de celebração da alta-costura brasileira reunindo estilistas icônicos e novos talentos em noite beneficente memorável.',
            date: '2025-03-20',
            location: 'Copacabana Palace, Rio de Janeiro - RJ',
            category: 'Tapete Vermelho',
            is_spotlight: false,
            status: 'publicado',
            display_order: 2,
            gallery_data: [
              {
                title: 'Looks Exclusivos de Gala',
                description: 'Vestidos com bordados feitos à mão por artesãs mineiras.',
                imageUrl: 'https://img.usecurling.com/p/800/1000?q=red%20carpet%20gala%20dress',
              },
            ],
          },
          {
            title: 'Festa de Lançamento — Coleção Resort & Alto Verão',
            description:
              'Encontro exclusivo no terraço do Hotel Fasano para lançamento de marcas atacadistas parceiras da Revista Moda Atual.',
            date: '2025-02-10',
            location: 'Hotel Fasano, São Paulo - SP',
            category: 'Festa',
            is_spotlight: false,
            status: 'publicado',
            display_order: 3,
            gallery_data: [],
          },
        ]

        for (const ev of eventsData) {
          const rec = new Record(feCol)
          rec.set('title', ev.title)
          rec.set('description', ev.description)
          rec.set('date', ev.date)
          rec.set('location', ev.location)
          rec.set('category', ev.category)
          rec.set('is_spotlight', ev.is_spotlight)
          rec.set('status', ev.status)
          rec.set('display_order', ev.display_order)
          rec.set('gallery_data', ev.gallery_data)
          app.save(rec)
        }
      }
    } catch (err) {
      console.log('Seed fashion events failed:', err)
    }

    try {
      const leadsCol = app.findCollectionByNameOrId('leads')
      const count = app.countRecords('leads')
      if (count === 0) {
        const sampleLeads = [
          {
            nome: 'Camila Vasconcelos',
            email: 'camila.boutique@exemplo.com.br',
            telefone: '(11) 98765-4321',
            empresa: 'Boutique Bella Moda',
            segmento: 'varejo',
            origem: 'landing_page',
            data_captacao: '2025-02-18T10:30:00Z',
            type: 'subscribe',
            notes: 'Interesse em catálogo atacadista de moda feminina.',
          },
          {
            nome: 'Rodrigo Mendonça Alencar',
            email: 'comercial@texbrasilconf.com.br',
            telefone: '(47) 99123-8877',
            empresa: 'TexBrasil Confecções',
            segmento: 'confeccao',
            origem: 'events',
            data_captacao: '2025-02-20T14:15:00Z',
            type: 'advertise',
            notes: 'Quer anunciar na próxima edição de Primavera.',
          },
        ]

        for (const ld of sampleLeads) {
          const rec = new Record(leadsCol)
          rec.set('nome', ld.nome)
          rec.set('email', ld.email)
          rec.set('telefone', ld.telefone)
          rec.set('empresa', ld.empresa)
          rec.set('segmento', ld.segmento)
          rec.set('origem', ld.origem)
          rec.set('data_captacao', ld.data_captacao)
          rec.set('type', ld.type)
          rec.set('notes', ld.notes)
          app.save(rec)
        }
      }
    } catch (err) {
      console.log('Seed sample leads failed:', err)
    }
  },
  (app) => {
    // optional cleanup
  },
)
