migrate(
  (app) => {
    var subCol = app.findCollectionByNameOrId('subscribers')
    var seqCol = app.findCollectionByNameOrId('newsletter_sequences')
    var aboutCol = app.findCollectionByNameOrId('about_content')

    var subscriberSeeds = [
      {
        name: 'Mariana Costa',
        email: 'mariana.costa@boutiqueglamour.com.br',
        segment: 'varejo',
        interests: ['tendências', 'editoriais', 'top60'],
        source: 'site',
        engagement_score: 85,
        status: 'ativo',
        opened_count: 42,
        clicked_count: 18,
      },
      {
        name: 'Patricia Mendes',
        email: 'patricia.mendes@lojacenter.com.br',
        segment: 'varejo',
        interests: ['moda praia', 'acessórios'],
        source: 'social',
        engagement_score: 67,
        status: 'ativo',
        opened_count: 28,
        clicked_count: 9,
      },
      {
        name: 'Carlos Eduardo Lima',
        email: 'carlos.lima@atacadomodal.com.br',
        segment: 'atacado',
        interests: ['atacado', 'compras em escala', 'tendências'],
        source: 'importacao',
        engagement_score: 78,
        status: 'ativo',
        opened_count: 35,
        clicked_count: 22,
      },
      {
        name: 'Fernanda Alves',
        email: 'fernanda.alves@grupomoda.com.br',
        segment: 'atacado',
        interests: ['atacado', 'V MODA BRASIL'],
        source: 'indicacao',
        engagement_score: 91,
        status: 'ativo',
        opened_count: 56,
        clicked_count: 34,
      },
      {
        name: 'Juliana Souza',
        email: 'juliana.souza@gmail.com',
        segment: 'consumidora',
        interests: ['looks', 'guias de estilo', 'tendências'],
        source: 'site',
        engagement_score: 54,
        status: 'ativo',
        opened_count: 19,
        clicked_count: 7,
      },
      {
        name: 'Roberto Silva',
        email: 'roberto.silva@hotmail.com',
        segment: 'consumidora',
        interests: ['moda masculina'],
        source: 'social',
        engagement_score: 23,
        status: 'inativo',
        opened_count: 5,
        clicked_count: 1,
      },
      {
        name: 'Camila Rocha',
        email: 'camila.rocha@revistamoda.com.br',
        segment: 'varejo',
        interests: ['editoriais', 'social media'],
        source: 'admin',
        engagement_score: 95,
        status: 'ativo',
        opened_count: 68,
        clicked_count: 41,
      },
      {
        name: 'Bruno Carvalho',
        email: 'bruno.carvalho@wholesalebr.com',
        segment: 'atacado',
        interests: ['atacado', 'marketplace'],
        source: 'site',
        engagement_score: 45,
        status: 'descadastrado',
        opened_count: 12,
        clicked_count: 3,
      },
    ]

    for (var i = 0; i < subscriberSeeds.length; i++) {
      var s = subscriberSeeds[i]
      try {
        app.findFirstRecordByData('subscribers', 'email', s.email)
      } catch (_) {
        var rec = new Record(subCol)
        rec.set('name', s.name)
        rec.set('email', s.email)
        rec.set('segment', s.segment)
        rec.set('interests', s.interests)
        rec.set('preferences', { frequency: 'semanal', topics: ['editoriais'] })
        rec.set('source', s.source)
        rec.set('engagement_score', s.engagement_score)
        rec.set('status', s.status)
        rec.set('opened_count', s.opened_count)
        rec.set('clicked_count', s.clicked_count)
        app.save(rec)
      }
    }

    var sequenceSeeds = [
      {
        name: 'Boas-vindas Varejo',
        description: 'Fluxo de nutrição para lojistas do varejo que se cadastraram no site.',
        segment: 'varejo',
        trigger: 'captura inicial',
        steps: [
          {
            day: 1,
            subject: 'Bem-vinda à Revista MODA ATUAL!',
            content_summary: 'Apresentação da revista e do V MODA BRASIL como hub de negócios.',
          },
          {
            day: 3,
            subject: 'As 5 tendências que vão dominar esta estação',
            content_summary: 'Curadoria das principais tendências com links para editoriais.',
          },
          {
            day: 7,
            subject: 'Como comprar no atacado com o V MODA BRASIL',
            content_summary: 'Guia prático para lojistas sobre o marketplace atacadista.',
          },
          {
            day: 14,
            subject: 'Top60 marcas parceiras desta edição',
            content_summary: 'Destaque das marcas do ranking e suas ofertas exclusivas.',
          },
        ],
      },
      {
        name: 'Nutrição Atacadista',
        description: 'Sequência para compradores em escala do segmento atacado.',
        segment: 'atacado',
        trigger: 'lead magnet',
        steps: [
          {
            day: 1,
            subject: 'Oportunidades de compra em escala',
            content_summary: 'Introdução às vantagens do marketplace atacadista V MODA BRASIL.',
          },
          {
            day: 4,
            subject: 'Tendências de atacado: o que comprar agora',
            content_summary: 'Análise de tendências com foco em volume e margem.',
          },
          {
            day: 10,
            subject: 'Brands parceiras com condições especiais',
            content_summary: 'Seleção de marcas do Top60 com ofertas para compradores.',
          },
        ],
      },
      {
        name: 'Jornada da Consumidora',
        description: 'Fluxo de engajamento para leitoras consumidoras finais.',
        segment: 'consumidora',
        trigger: 'captura inicial',
        steps: [
          {
            day: 1,
            subject: 'Descubra seu estilo com a MODA ATUAL',
            content_summary: 'Quiz de estilo e links para guias editoriais.',
          },
          {
            day: 5,
            subject: 'Looks da semana: inspire-se',
            content_summary: 'Galeria de looks com dicas de combinação.',
          },
          {
            day: 12,
            subject: 'Tendências que você precisa ver',
            content_summary: 'Curadoria de tendências traduzidas para o dia a dia.',
          },
        ],
      },
    ]

    for (var j = 0; j < sequenceSeeds.length; j++) {
      var sq = sequenceSeeds[j]
      try {
        app.findFirstRecordByData('newsletter_sequences', 'name', sq.name)
      } catch (_) {
        var seqRec = new Record(seqCol)
        seqRec.set('name', sq.name)
        seqRec.set('description', sq.description)
        seqRec.set('segment', sq.segment)
        seqRec.set('trigger', sq.trigger)
        seqRec.set('steps', sq.steps)
        seqRec.set('status', 'ativo')
        app.save(seqRec)
      }
    }

    var docs = [
      {
        title: 'Fluxo de captura de leitoras',
        body: 'O fluxo de captura de leitoras do Audience Nurture funciona em três etapas:\n\n1. CAPTURA: Leitoras chegam via site, social media, indicação ou importação. O campo "source" rastreia a origem.\n\n2. SEGMENTAÇÃO: Cada nova assinante é categorizada em varejo, atacado ou consumidora com base no perfil e interesses declarados.\n\n3. NUTRIÇÃO: A assinante entra automaticamente na newsletter sequence correspondente ao seu segmento, recebendo e-mails programados (dia 1, 3, 7, 14) com conteúdo editorial relevante.\n\nO engagement_score é atualizado com base em aberturas e cliques, permitindo identificar leitoras engajadas e inativas para campanhas de reativação.',
      },
      {
        title: 'Fluxo de segmentação',
        body: 'A segmentação do Audience Nurture divide a base de assinantes em três perfis:\n\nVAREJO: Lojistas e revendedoras que buscam tendências, editoriais e oportunidades de compra. Recebem conteúdo sobre novidades da moda, top60 marcas e ofertas do marketplace.\n\nATACADO: Compradores em escala que precisam de análise de tendências, condições especiais e informações sobre volume. Recebem conteúdo focado em compras em escala, brands parceiras e tendências de atacado.\n\nCONSUMIDORA: Leitoras finais interessadas em looks, guias de estilo e inspiração. Recebem conteúdo editorial traduzido para o dia a dia, galerias de looks e dicas de combinação.\n\nCada newsletter campaign pode segmentar por um ou mais perfis. As sequences de nurture são dedicadas por segmento para garantir relevância máxima.',
      },
    ]

    for (var k = 0; k < docs.length; k++) {
      var d = docs[k]
      try {
        app.findFirstRecordByData('about_content', 'title', d.title)
      } catch (_) {
        var aboutRec = new Record(aboutCol)
        aboutRec.set('title', d.title)
        aboutRec.set('body', d.body)
        app.save(aboutRec)
      }
    }
  },
  (app) => {
    try {
      app.truncateCollection(app.findCollectionByNameOrId('subscribers'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('newsletter_sequences'))
    } catch (_) {}
  },
)
