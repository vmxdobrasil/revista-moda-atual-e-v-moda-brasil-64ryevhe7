migrate(
  (app) => {
    var logCol = app.findCollectionByNameOrId('engagement_log')
    var leadsCol = app.findCollectionByNameOrId('dm_leads')
    var convCol = app.findCollectionByNameOrId('ig_conversations')

    var entries = [
      {
        ig_user_id: '178414001',
        ig_username: '@maria_style',
        type: 'comment',
        intent: 'elogio',
        message_text: 'Adorei essa editorial! Muito inspiradora 🔥',
        response_text:
          'Que fofa, Maria! 💕 Ficamos muito felizes que gostou. Continue acompanhando nossas novidades!',
        status: 'respondido',
        media_id: 'media_001',
        comment_id: 'cmt_001',
      },
      {
        ig_user_id: '178414002',
        ig_username: '@juliana_moda',
        type: 'comment',
        intent: 'pergunta_conteudo',
        message_text: 'Quais sao as cores tendencia para o inverno 2026?',
        response_text:
          'As cores terrosas estao em alta, Juli! 🍂 Tons como terracota, mostarda e olive green sao apostas certeiras nessa estacao.',
        status: 'respondido',
        media_id: 'media_002',
        comment_id: 'cmt_002',
      },
      {
        ig_user_id: '178414003',
        ig_username: '@carla_boutique',
        type: 'comment',
        intent: 'pergunta_produto',
        message_text: 'Onde compro esse vestido do post?',
        response_text:
          'Adoramos seu interesse, Carla! ✨ Esse vestido esta disponivel no marketplace V MODA BRASIL. Acesse pelo link na bio!',
        status: 'respondido',
        media_id: 'media_003',
        comment_id: 'cmt_003',
      },
      {
        ig_user_id: '178414004',
        ig_username: '@ana_clara',
        type: 'comment',
        intent: 'critica',
        message_text: 'Os precos estao muito altos ultimamente',
        response_text:
          'Agradecemos seu feedback, Ana. 💛 Vamos verificar isso com nossa equipe. Pode nos enviar mais detalhes por DM?',
        status: 'encaminhado_humano',
        media_id: 'media_004',
        comment_id: 'cmt_004',
        forwarded_to: 'atendimento_humano',
      },
      {
        ig_user_id: '178414005',
        ig_username: '@spam_bot_99',
        type: 'comment',
        intent: 'spam',
        message_text: 'GANHE 10K SEGUIDORES GRATIS CLIQUE NO LINK',
        response_text: '',
        status: 'ignorado',
        media_id: 'media_005',
        comment_id: 'cmt_005',
      },
      {
        ig_user_id: '178414006',
        ig_username: '@fernanda_ribeiro',
        type: 'comment',
        intent: 'elogio',
        message_text: 'A Revista so melhora! Parabens pelo conteudo 💖',
        response_text:
          'Muito obrigada, Fernanda! 💖 Seu carinho nos motiva a trazer cada vez mais novidades para voce!',
        status: 'respondido',
        media_id: 'media_006',
        comment_id: 'cmt_006',
      },
      {
        ig_user_id: '178414007',
        ig_username: '@loja_dona_fifi',
        type: 'comment',
        intent: 'parceria',
        message_text: 'Tenho uma loja de moda feminina, como faco para anunciar?',
        response_text:
          'Que otimo, Dona Fifi! 🌟 Temos espacos publicitarios na Revista e no marketplace V MODA BRASIL. Te encaminhamos para nossa equipe comercial!',
        status: 'encaminhado_humano',
        media_id: 'media_007',
        comment_id: 'cmt_007',
        forwarded_to: 'comercial',
      },
      {
        ig_user_id: '178414008',
        ig_username: '@patricia_consultora',
        type: 'comment',
        intent: 'consultoria',
        message_text: 'Como faco para ser consultora de moda de voces?',
        response_text:
          'Adoramos seu interesse, Patricia! 💫 Nosso programa de consultoras esta aberto para novas candidatas. Te enviamos mais informacoes por DM!',
        status: 'respondido',
        media_id: 'media_008',
        comment_id: 'cmt_008',
      },
      {
        ig_user_id: '178414009',
        ig_username: '@beatriz_silva',
        type: 'comment',
        intent: 'pergunta_produto',
        message_text: 'Tem esse look em outros tamanhos?',
        response_text:
          'Oi Betriz! 👗 Essas pecas estao disponiveis em varios tamanhos no marketplace V MODA BRASIL. Acesse pelo link na bio para conferir!',
        status: 'respondido',
        media_id: 'media_009',
        comment_id: 'cmt_009',
      },
      {
        ig_user_id: '178414010',
        ig_username: '@roberta_costa',
        type: 'comment',
        intent: 'elogio',
        message_text: 'O Top 60 esta incrivel esse mes! ⭐',
        response_text:
          'Ficamos felizes que gostou, Roberta! ⭐ O ranking e atualizado mensalmente com as melhores marcas do varejo!',
        status: 'respondido',
        media_id: 'media_010',
        comment_id: 'cmt_010',
      },
      {
        ig_user_id: '178414001',
        ig_username: '@maria_style',
        type: 'dm',
        intent: 'pergunta_produto',
        message_text: 'Oi! Vi o post do vestido e quero comprar. Como faco?',
        response_text:
          'Oi, Maria! 💕 Que otimo que se interessou! O vestido esta disponivel no marketplace V MODA BRASIL — voce pode acessar pelo link na bio do nosso perfil. La voce encontra todas as opcoes de tamanho e cor! ✨ Quer que eu te ajude com mais alguma informacao?',
        status: 'respondido',
        conversation_id: 'conv_001',
      },
      {
        ig_user_id: '178414011',
        ig_username: '@loja_dona_fifi',
        type: 'dm',
        intent: 'parceria',
        message_text:
          'Ola! Sou da Dona Fifi Modas e gostaria de anunciar na revista. Pode me ajudar?',
        response_text:
          'Ola, Dona Fifi! 🌟 Que bom ter voce por aqui! Temos diversas opcoes de publicidade na Revista MODA ATUAL e no marketplace V MODA BRASIL. Para te passar os melhores formatos e valores, posso te pedir nome completo, e-mail e WhatsApp? Assim nossa equipe comercial entra em contato! 💼',
        status: 'encaminhado_humano',
        conversation_id: 'conv_002',
        forwarded_to: 'comercial',
      },
      {
        ig_user_id: '178414012',
        ig_username: '@camila_fashion',
        type: 'dm',
        intent: 'pergunta_conteudo',
        message_text: 'Quais tendencias de moda voce recomenda para o verao 2026?',
        response_text:
          'Camila, amei sua pergunta! 🌺 Para o verao 2026, as apostas sao: 1) Estampas florais em tamanho GG, 2) Cores vibrantes como laranja e rosa choque, 3) Tecidos leves e fluidos, 4) Cropped com calca de cintura alta. Vamos trazer um editorial completo sobre isso na proxima edicao! 📖✨',
        status: 'respondido',
        conversation_id: 'conv_003',
      },
      {
        ig_user_id: '178414013',
        ig_username: '@lucia_santos',
        type: 'dm',
        intent: 'reclamacao',
        message_text: 'Comprei um produto pelo link de voces e nao chegou, ja se passaram 15 dias',
        response_text:
          'Poxa, Lucia, sinto muito por isso acontecer. 💛 Vou registrar sua reclamacao e encaminhar para nossa equipe de atendimento. Pode me confirmar seu numero de pedido ou o e-mail usado na compra? Nossa equipe vai entrar em contato em ate 24h para resolver isso. Lamento o transtorno! 🙏',
        status: 'encaminhado_humano',
        conversation_id: 'conv_004',
        forwarded_to: 'atendimento_humano',
      },
      {
        ig_user_id: '178414014',
        ig_username: '@vanessa_loja',
        type: 'dm',
        intent: 'consultoria',
        message_text:
          'Tenho uma loja de moda em Fortaleza e quero ser consultora de moda da Revista. E possivel?',
        response_text:
          'Vanessa, que iniciativa maravilhosa! 💫 Nosso programa de consultoras de moda esta aberto para mulheres em todo o Brasil. Para dar continuidade, posso te pedir: nome completo, e-mail, WhatsApp e cidade? Assim te enviamos todos os detalhes do programa! 🌟',
        status: 'respondido',
        conversation_id: 'conv_005',
      },
      {
        ig_user_id: '178414015',
        ig_username: '@thais_b',
        type: 'dm',
        intent: 'elogio',
        message_text:
          'Amei a ultima edicao da revista! O conteudo sobre tendencias de inverno ficou perfeito ❤️',
        response_text:
          'Thais, que delicia ler isso! ❤️ Ficamos tao felizes que voce aproveitou o conteudo. Ja estamos preparando a proxima edicao com mais novidades! Fica de olho! 👀✨',
        status: 'respondido',
        conversation_id: 'conv_006',
      },
      {
        ig_user_id: '178414016',
        ig_username: '@marcos_varejo',
        type: 'dm',
        intent: 'parceria',
        message_text:
          'Sou do setor de compras de uma rede varejista e quero conhecer o marketplace V MODA BRASIL',
        response_text:
          'Marcos, excelente! 🤝 O marketplace V MODA BRASIL e o hub ideal para o mercado atacadista. Para te apresentar nossas solucoes, posso pedir seu nome completo, e-mail corporativo e WhatsApp? Nossa equipe comercial vai preparar uma proposta personalizada! 💼',
        status: 'encaminhado_humano',
        conversation_id: 'conv_007',
        forwarded_to: 'comercial',
      },
      {
        ig_user_id: '178414017',
        ig_username: '@jessica_oliveira',
        type: 'dm',
        intent: 'pergunta_produto',
        message_text: 'Onde encontro a colecao completa da marca que saiu no Top 60?',
        response_text:
          'Oi, Jessica! ✨ As marcas do Top 60 estao no marketplace V MODA BRASIL — voce pode acessar pelo link na bio! La voce encontra a colecao completa de cada marca parceira. Quer que eu te indique alguma marca especifica? 🛍️',
        status: 'respondido',
        conversation_id: 'conv_008',
      },
      {
        ig_user_id: '178414018',
        ig_username: '@renata_alves',
        type: 'dm',
        intent: 'critica',
        message_text: 'Achei a navegacao da revista digital confusa na ultima atualizacao',
        response_text:
          'Renata, agradecemos muito seu feedback! 💛 Vamos encaminhar sua observacao para nossa equipe de produto para melhorar a experiencia. Enquanto isso, posso te ajudar com alguma duvida especifica de navegacao? 🙏',
        status: 'encaminhado_humano',
        conversation_id: 'conv_009',
        forwarded_to: 'produto',
      },
      {
        ig_user_id: '178414019',
        ig_username: '@amanda_souza',
        type: 'dm',
        intent: 'elogio',
        message_text: 'Voces sao a melhor revista de moda do Brasil! Conteudo sempre atualizado 🙌',
        response_text:
          'Amanda, que alegria ler isso! 🙌💕 E por causa de seguidoras como voce que continuamos evoluindo. Muito obrigada pelo carinho! Fica ligada que tem muita novidade vindo! ✨',
        status: 'respondido',
        conversation_id: 'conv_010',
      },
    ]

    for (var i = 0; i < entries.length; i++) {
      try {
        var rec = new Record(logCol)
        var e = entries[i]
        rec.set('ig_user_id', e.ig_user_id)
        rec.set('ig_username', e.ig_username)
        rec.set('type', e.type)
        rec.set('intent', e.intent)
        rec.set('message_text', e.message_text)
        rec.set('response_text', e.response_text || '')
        rec.set('status', e.status)
        if (e.media_id) rec.set('media_id', e.media_id)
        if (e.comment_id) rec.set('comment_id', e.comment_id)
        if (e.conversation_id) rec.set('conversation_id', e.conversation_id)
        if (e.forwarded_to) rec.set('forwarded_to', e.forwarded_to)
        app.save(rec)
      } catch (_) {}
    }

    var leads = [
      {
        ig_user_id: '178414011',
        ig_username: '@loja_dona_fifi',
        name: 'Dona Fifi Modas',
        whatsapp: '(85) 99999-1111',
        city: 'Fortaleza',
        intent: 'parceria',
        status: 'novo',
        notes: 'Loja de moda feminina, interesse em anuncios na revista',
        conversation_id: 'conv_002',
      },
      {
        ig_user_id: '178414016',
        ig_username: '@marcos_varejo',
        name: 'Marcos Silva',
        email: 'marcos@rededelojas.com.br',
        whatsapp: '(11) 98888-2222',
        city: 'Sao Paulo',
        intent: 'parceria',
        status: 'contatado',
        notes: 'Setor de compras de rede varejista, interesse no marketplace V MODA BRASIL',
        conversation_id: 'conv_007',
      },
      {
        ig_user_id: '178414014',
        ig_username: '@vanessa_loja',
        name: 'Vanessa Almeida',
        whatsapp: '(85) 97777-3333',
        city: 'Fortaleza',
        intent: 'consultoria',
        status: 'novo',
        notes: 'Lojista interessada no programa de consultoras de moda',
        conversation_id: 'conv_005',
      },
      {
        ig_user_id: '178414017',
        ig_username: '@jessica_oliveira',
        name: 'Jessica Oliveira',
        whatsapp: '(21) 96666-4444',
        city: 'Rio de Janeiro',
        intent: 'produto',
        status: 'convertido',
        notes: 'Comprou produtos do Top 60 pelo marketplace',
        conversation_id: 'conv_008',
      },
    ]

    for (var j = 0; j < leads.length; j++) {
      try {
        var lrec = new Record(leadsCol)
        var l = leads[j]
        lrec.set('ig_user_id', l.ig_user_id)
        lrec.set('ig_username', l.ig_username)
        lrec.set('name', l.name)
        if (l.email) lrec.set('email', l.email)
        if (l.whatsapp) lrec.set('whatsapp', l.whatsapp)
        lrec.set('city', l.city)
        lrec.set('intent', l.intent)
        lrec.set('status', l.status)
        lrec.set('notes', l.notes)
        lrec.set('conversation_id', l.conversation_id)
        app.save(lrec)
      } catch (_) {}
    }

    var convs = [
      {
        ig_user_id: '178414001',
        ig_username: '@maria_style',
        conversation_id: 'conv_001',
        message_count: 3,
        last_message_at: '2026-08-05 14:30:00.000Z',
        context: '{"topic": "compra de vestido", "intent": "pergunta_produto"}',
      },
      {
        ig_user_id: '178414012',
        ig_username: '@camila_fashion',
        conversation_id: 'conv_003',
        message_count: 2,
        last_message_at: '2026-08-04 10:15:00.000Z',
        context: '{"topic": "tendencias verao 2026", "intent": "pergunta_conteudo"}',
      },
      {
        ig_user_id: '178414014',
        ig_username: '@vanessa_loja',
        conversation_id: 'conv_005',
        message_count: 4,
        last_message_at: '2026-08-05 16:45:00.000Z',
        context: '{"topic": "programa consultoras", "intent": "consultoria"}',
      },
    ]

    for (var k = 0; k < convs.length; k++) {
      try {
        var crec = new Record(convCol)
        var c = convs[k]
        crec.set('ig_user_id', c.ig_user_id)
        crec.set('ig_username', c.ig_username)
        crec.set('conversation_id', c.conversation_id)
        crec.set('message_count', c.message_count)
        crec.set('last_message_at', c.last_message_at)
        crec.set('context', c.context)
        app.save(crec)
      } catch (_) {}
    }
  },
  (app) => {
    try {
      app.truncateCollection(app.findCollectionByNameOrId('engagement_log'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('dm_leads'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('ig_conversations'))
    } catch (_) {}
  },
)
