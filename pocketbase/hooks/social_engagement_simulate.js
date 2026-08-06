routerAdd(
  'POST',
  '/backend/v1/social-engagement/simulate',
  (e) => {
    const SIM = 'sim_v1'

    const DATA = [
      {
        t: 'comment',
        u: 'moda_lover_sp',
        uid: 'sim_001',
        m: 'Adorei a edição dessa semana! Conteúdo inspirador demais ✨',
        i: 'elogio',
        mid: 'sim_media_1',
        ref: SIM + '_c1',
      },
      {
        t: 'comment',
        u: 'style_seeker',
        uid: 'sim_002',
        m: 'Qual tendência de cores vai dominar o inverno 2026?',
        i: 'pergunta_conteudo',
        mid: 'sim_media_1',
        ref: SIM + '_c2',
      },
      {
        t: 'comment',
        u: 'shopaholic_rj',
        uid: 'sim_003',
        m: 'Onde posso comprar a jaqueta que aparece na página 3?',
        i: 'pergunta_produto',
        mid: 'sim_media_2',
        ref: SIM + '_c3',
      },
      {
        t: 'comment',
        u: 'body_positive_br',
        uid: 'sim_004',
        m: 'A matéria de moda plus size poderia ser mais detalhada, achei rasa',
        i: 'critica',
        mid: 'sim_media_2',
        ref: SIM + '_c4',
      },
      {
        t: 'comment',
        u: 'seguidores_gratis',
        uid: 'sim_005',
        m: 'GANHE 1000 SEGUIDORES GRÁTIS! CLIQUE NO LINK DA BIO 🔥🔥',
        i: 'spam',
        mid: 'sim_media_1',
        ref: SIM + '_c5',
      },
      {
        t: 'comment',
        u: 'acessorios_chic',
        uid: 'sim_006',
        m: 'Tenho uma marca de acessórios e gostaria de uma parceria com a revista',
        i: 'parceria',
        mid: 'sim_media_3',
        ref: SIM + '_c6',
      },
      {
        t: 'comment',
        u: 'consultora_moda',
        uid: 'sim_007',
        m: 'Vocês fazem consultoria de imagem para empresas do setor moda?',
        i: 'consultoria',
        mid: 'sim_media_3',
        ref: SIM + '_c7',
      },
      {
        t: 'comment',
        u: 'cliente_insatisfeita',
        uid: 'sim_008',
        m: 'Comprei pelo link da revista e o produto veio com defeito, como proceder?',
        i: 'reclamacao',
        mid: 'sim_media_2',
        ref: SIM + '_c8',
      },
      {
        t: 'comment',
        u: 'fashion_addict',
        uid: 'sim_009',
        m: 'Que conteúdo incrível! A revista está cada vez melhor 👏',
        i: 'elogio',
        mid: 'sim_media_1',
        ref: SIM + '_c9',
      },
      {
        t: 'comment',
        u: 'aguardando_edicao',
        uid: 'sim_010',
        m: 'Quando sai a próxima edição? Não vejo a hora!',
        i: 'pergunta_conteudo',
        mid: 'sim_media_3',
        ref: SIM + '_c10',
      },
      {
        t: 'dm',
        u: 'loja_flor_atacado',
        uid: 'sim_011',
        m: 'Oi! Vi o post sobre o vestido floral. Tem como eu comprar no atacado?',
        i: 'pergunta_produto',
        ci: 'produto',
        ref: SIM + '_d1',
      },
      {
        t: 'dm',
        u: 'influencer_moda',
        uid: 'sim_012',
        m: 'Olá, sou influencer de moda e adoraria fechar uma parceria com vocês',
        i: 'parceria',
        ci: 'parceria',
        ref: SIM + '_d2',
      },
      {
        t: 'dm',
        u: 'loja_tendencias',
        uid: 'sim_013',
        m: 'Tenho uma loja de roupas e preciso de consultoria para redes sociais. Vocês atendem?',
        i: 'consultoria',
        ci: 'consultoria',
        ref: SIM + '_d3',
      },
      {
        t: 'dm',
        u: 'marca_calcados_fem',
        uid: 'sim_014',
        m: 'Gostaria de anunciar minha marca de calçados femininos na revista. Como funciona?',
        i: 'parceria',
        ci: 'anuncio',
        ref: SIM + '_d4',
      },
      {
        t: 'dm',
        u: 'leitora_fiel',
        uid: 'sim_015',
        m: 'Meninas, amo demais o trabalho de vocês! Me inspiro muito na revista 💕',
        i: 'elogio',
        ref: SIM + '_d5',
      },
      {
        t: 'dm',
        u: 'moda_news_br',
        uid: 'sim_016',
        m: 'Vocês vão cobrir o São Paulo Fashion Week esse ano?',
        i: 'pergunta_conteudo',
        ref: SIM + '_d6',
      },
      {
        t: 'dm',
        u: 'atacadista_fashion',
        uid: 'sim_017',
        m: 'Qual o preço do conjunto que saiu na última edição? Tem tabela de preços atacado?',
        i: 'pergunta_produto',
        ci: 'produto',
        ref: SIM + '_d7',
      },
      {
        t: 'dm',
        u: 'promo_relogios',
        uid: 'sim_018',
        m: 'PROMOÇÃO RELÂMPAGO! PERFUMES ORIGINAIS 50% OFF - link na bio',
        i: 'spam',
        ref: SIM + '_d8',
      },
      {
        t: 'dm',
        u: 'compradora_frustrada',
        uid: 'sim_019',
        m: 'O link de compra que estava na matéria não funciona, já tentei várias vezes',
        i: 'reclamacao',
        ref: SIM + '_d9',
      },
      {
        t: 'dm',
        u: 'critica_construtiva',
        uid: 'sim_020',
        m: 'O tempo de resposta de vocês no DM está demorado, melhorou?',
        i: 'critica',
        ref: SIM + '_d10',
      },
    ]

    const STATUS_MAP = {
      elogio: { s: 'respondido', f: '' },
      pergunta_conteudo: { s: 'respondido', f: '' },
      pergunta_produto: { s: 'respondido', f: '' },
      critica: { s: 'encaminhado_humano', f: 'equipe_editorial' },
      spam: { s: 'ignorado', f: '' },
      parceria: { s: 'respondido', f: '' },
      consultoria: { s: 'encaminhado_humano', f: 'equipe_comercial' },
      reclamacao: { s: 'encaminhado_humano', f: 'equipe_atendimento' },
    }

    const engCol = $app.findCollectionByNameOrId('engagement_log')
    const leadsCol = $app.findCollectionByNameOrId('dm_leads')
    const convCol = $app.findCollectionByNameOrId('ig_conversations')

    const results = []
    const newItems = []

    for (const d of DATA) {
      const refField = d.t === 'comment' ? 'comment_id' : 'conversation_id'
      let exists = false
      try {
        const rec = $app.findFirstRecordByData('engagement_log', refField, d.ref)
        results.push({
          type: d.t,
          ig_username: d.u,
          message_text: d.m,
          intent: rec.getString('intent'),
          response_text: rec.getString('response_text'),
          status: rec.getString('status'),
          forwarded_to: rec.getString('forwarded_to'),
          media_id: rec.getString('media_id'),
          comment_id: rec.getString('comment_id'),
          conversation_id: rec.getString('conversation_id'),
          lead_created: false,
        })
        exists = true
      } catch (_) {}
      if (!exists) newItems.push(d)
    }

    let aiResults = []
    let avgTime = 3.5

    if (newItems.length > 0) {
      const t0 = Date.now()
      const lines = newItems
        .map((d, i) => i + 1 + '. [' + d.t + '] @' + d.u + ': "' + d.m + '"')
        .join('\n')
      let reply
      try {
        reply = $ai.chat({
          model: 'fast',
          messages: [
            {
              role: 'system',
              content:
                'You are the social engagement AI for Revista MODA ATUAL (@revistamodaatual). Classify intent and write a brief friendly response in Brazilian Portuguese for each interaction. Intents: elogio, pergunta_conteudo, pergunta_produto, critica, spam, parceria, consultoria, reclamacao. Return ONLY a JSON array: [{"intent":"...","response":"..."}]. Keep responses under 200 chars.',
            },
            { role: 'user', content: 'Interactions:\n' + lines },
          ],
        })
        const content = reply.choices[0].message.content
        try {
          aiResults = JSON.parse(content)
        } catch (_) {
          const m = content.match(/\[[\s\S]*\]/)
          if (m) {
            try {
              aiResults = JSON.parse(m[0])
            } catch (_) {}
          }
        }
      } catch (_) {}
      if (!Array.isArray(aiResults) || aiResults.length < newItems.length) {
        aiResults = newItems.map((d) => ({
          intent: d.i,
          response: 'Obrigada pelo contato! Nossa equipe vai analisar e responder em breve. 💕',
        }))
      }
      avgTime = Math.round((Date.now() - t0) / newItems.length / 100) / 10
    }

    let leadsCreated = 0

    for (let i = 0; i < newItems.length; i++) {
      const d = newItems[i]
      const ai = aiResults[i] || { intent: d.i, response: 'Obrigada pelo contato!' }
      const intent = ai.intent || d.i
      const cfg = STATUS_MAP[intent] || { s: 'respondido', f: '' }

      const rec = new Record(engCol)
      rec.set('ig_user_id', d.uid)
      rec.set('ig_username', d.u)
      rec.set('type', d.t)
      rec.set('intent', intent)
      rec.set('message_text', d.m)
      rec.set('response_text', ai.response || '')
      rec.set('status', cfg.s)
      rec.set('forwarded_to', cfg.f)
      if (d.mid) rec.set('media_id', d.mid)
      if (d.t === 'comment') {
        rec.set('comment_id', d.ref)
      } else {
        rec.set('conversation_id', d.ref)
      }
      $app.save(rec)

      let leadCreated = false
      if (d.t === 'dm' && d.ci) {
        try {
          $app.findFirstRecordByData('dm_leads', 'conversation_id', d.ref)
        } catch (_) {
          const lead = new Record(leadsCol)
          lead.set('ig_user_id', d.uid)
          lead.set('ig_username', d.u)
          lead.set('name', d.u)
          lead.set('intent', d.ci)
          lead.set('status', 'novo')
          lead.set('conversation_id', d.ref)
          lead.set('notes', d.m)
          $app.save(lead)
          leadsCreated++
          leadCreated = true
        }
      }

      if (d.t === 'dm') {
        try {
          $app.findFirstRecordByData('ig_conversations', 'conversation_id', d.ref)
        } catch (_) {
          const conv = new Record(convCol)
          conv.set('ig_user_id', d.uid)
          conv.set('ig_username', d.u)
          conv.set('conversation_id', d.ref)
          conv.set('message_count', 1)
          conv.set('last_message_at', new Date().toISOString())
          $app.save(conv)
        }
      }

      results.push({
        type: d.t,
        ig_username: d.u,
        message_text: d.m,
        intent,
        response_text: ai.response || '',
        status: cfg.s,
        forwarded_to: cfg.f,
        media_id: d.mid || '',
        comment_id: d.t === 'comment' ? d.ref : '',
        conversation_id: d.t === 'dm' ? d.ref : '',
        lead_created: leadCreated,
      })
    }

    let existingLeads = 0
    try {
      const existingLeadRecords = $app.findRecordsByFilter(
        'dm_leads',
        'conversation_id ~ {:p}',
        '-created',
        100,
        0,
        SIM,
      )
      existingLeads = existingLeadRecords.length
    } catch (_) {}

    const intentDist = {}
    for (const r of results) {
      intentDist[r.intent] = (intentDist[r.intent] || 0) + 1
    }
    const responded = results.filter((r) => r.status === 'respondido').length
    const forwarded = results.filter((r) => r.status === 'encaminhado_humano').length

    return e.json(200, {
      results,
      stats: {
        total: results.length,
        comments: results.filter((r) => r.type === 'comment').length,
        dms: results.filter((r) => r.type === 'dm').length,
        leads: existingLeads + leadsCreated,
        responded,
        forwarded,
        response_rate: results.length > 0 ? Math.round((responded / results.length) * 100) : 0,
        avg_response_time: avgTime,
        intent_distribution: intentDist,
      },
    })
  },
  $apis.requireAuth(),
)
