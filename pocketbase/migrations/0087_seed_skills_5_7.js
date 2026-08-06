migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('skills')

    var skills = [
      {
        title: 'Monetização e Branded Content',
        slug: 'monetizacao-e-branded-content',
        category: 'monetizacao',
        summary:
          'Fluxo completo de monetização: prospecção, proposta, contrato, produção, entrega e relatório de campanhas publicitárias.',
        flow: [
          {
            step: 'Prospecção',
            description:
              'Identificar anunciantes potenciais com base em match editorial, alcance de audiência e categoria de produto.',
            responsible: 'Comercial / Ad Revenue',
          },
          {
            step: 'Proposta',
            description:
              'Gerar proposta com formato, posição, preço sugerido e match score. Enviar via e-mail ao anunciante.',
            responsible: 'Sistema (proposta + email_proposal)',
          },
          {
            step: 'Contrato',
            description:
              'Após aceite, gerar contrato com número, termos, datas e assinatura. Anunciante aprova via portal.',
            responsible: 'Sistema (generate_contract)',
          },
          {
            step: 'Produção',
            description:
              'Produzir o conteúdo publicitário (banner, capa, sponsored content, story) seguindo padrões da revista.',
            responsible: 'Editorial / Art Director',
          },
          {
            step: 'Entrega',
            description:
              'Disponibilizar o anúncio na edição/canal. Status passa para "entregue". Rastrear delivery_date.',
            responsible: 'Editorial',
          },
          {
            step: 'Relatório',
            description:
              'Gerar relatório de performance (impressões, cliques, conversões) e enviar ao anunciante.',
            responsible: 'Comercial / Ad Revenue',
          },
        ],
        rules: [
          {
            rule: 'Preço por formato',
            detail:
              'Capa: R$ 5.000+. Página inteira: R$ 3.000+. Banner: R$ 800+. Sponsored content: R$ 2.500+. Story: R$ 1.200+.',
          },
          {
            rule: 'Multiplicador de alcance',
            detail:
              'Preço final = base_price × reach_multiplier × position_multiplier. Consultar ad_pricing_rules.',
          },
          {
            rule: 'Match score',
            detail:
              'Propostas com match_score < 50 devem ser revisadas manualmente antes do envio.',
          },
          {
            rule: 'Contrato obrigatório',
            detail:
              'Nenhuma campanha é produzida sem contrato assinado. Status deve estar em "contrato" antes da produção.',
          },
          {
            rule: 'Prazo de entrega',
            detail:
              'Delivery_date deve ser definida no contrato. Atrasos geram alertas automáticos.',
          },
          {
            rule: 'Separação editorial',
            detail:
              'Conteúdo patrocinado deve ser claramente identificado. Não misturar com editorial independente.',
          },
          {
            rule: 'Portal do anunciante',
            detail:
              'Anunciantes recebem access_token para acompanhar status e aprovar contratos via /public/anunciante.',
          },
        ],
        responsibilities: [
          {
            role: 'Comercial',
            responsibilities: [
              'Prospecar anunciantes',
              'Negociar condições',
              'Acompanhar entrega',
              'Gerar relatórios',
            ],
          },
          {
            role: 'Sistema (Ad Revenue)',
            responsibilities: [
              'Calcular preços automaticamente',
              'Gerar propostas',
              'Enviar e-mails',
              'Gerar contratos',
            ],
          },
          {
            role: 'Editorial',
            responsibilities: [
              'Produzir conteúdo publicitário',
              'Garantir padrões visuais',
              'Identificar como patrocinado',
            ],
          },
          {
            role: 'Art Director',
            responsibilities: ['Aprovar banners e capas', 'Validar consistência visual'],
          },
        ],
        related_agents: [
          {
            agent: 'precificar',
            how: 'Hook que calcula preço sugerido baseado em formato, alcance e posição usando ad_pricing_rules.',
          },
          {
            agent: 'proposta',
            how: 'Hook que gera proposta comercial com match_score, suggested_price e proposal_data.',
          },
          {
            agent: 'email_proposal',
            how: 'Hook que envia a proposta por e-mail ao anunciante com link do portal.',
          },
          {
            agent: 'generate_contract',
            how: 'Hook que gera contrato com número, termos, datas após aceite da proposta.',
          },
          {
            agent: 'contract_approve',
            how: 'Hook que processa a aprovação de contrato pelo anunciante via access_token.',
          },
          {
            agent: 'deadline_alerts',
            how: 'Hook que monitora delivery_date e gera alertas para prazos próximos.',
          },
          {
            agent: 'Coleção: ad_proposals',
            how: 'Armazena advertiser, campaign, format, suggested_price, match_score, status, contract_number, contract_terms, advertiser_email e access_token.',
          },
          {
            agent: 'Coleção: ad_pricing_rules',
            how: 'Armazena format, base_price, reach_multiplier, position_multiplier e active.',
          },
          {
            agent: 'Coleção: advertisements',
            how: 'Armazena anúncios ativos com image, url, title, advertiser, campaign, price, status e delivery.',
          },
        ],
        body: 'GUIA DE MONETIZAÇÃO E BRANDED CONTENT\n\nFLUXO DE PROSPECÇÃO → RELATÓRIO\n\n1. PROSPECÇÃO\n- Identificar anunciantes por categoria (moda, beleza, lifestyle)\n- Calcular match_score (alinhamento editorial × audiência)\n- Match ≥ 70: prospecção automática\n- Match 50-69: revisão manual\n- Match < 50: não prospecar\n\n2. PROPOSTA\nFormatos disponíveis:\n- Capa (cover): R$ 5.000+ — maior visibilidade\n- Página inteira: R$ 3.000+ — impacto visual\n- Editorial destaque: R$ 4.000+ — conteúdo integrado\n- Sponsored content: R$ 2.500+ — matéria patrocinada\n- Banner: R$ 800+ — retângulo lateral\n- Story: R$ 1.200+ — formato vertical\n\nCálculo: preço = base_price × reach_multiplier × position_multiplier\n\n3. CONTRATO\n- Número automático gerado pelo sistema\n- Termos: formato, posição, prazo, investimento\n- Anunciante aprova via portal (/public/anunciante)\n- Access_token único por proposta\n\n4. PRODUÇÃO\n- Briefing com o anunciante\n- Produção pelo time editorial\n- Aprovação do Art Director\n- Identificação clara como "Conteúdo Patrocinado"\n\n5. ENTREGA\n- Disponibilização na edição/canal\n- Status: "entregue"\n- Delivery_date registrada\n- Alertas automáticos para prazos\n\n6. RELATÓRIO\n- Impressões, cliques, conversões\n- Comparativo com benchmarks\n- Envio ao anunciante\n- Status: "concluido"\n\nCRITÉRIOS DE MATCH ANUNCIANTE × EDITORIAL\n- Categoria de produto alinhada com conteúdo editorial\n- Audiência do anunciante sobreposta com assinantes\n- Histórico de engajamento da marca\n- Potencial de conversão no marketplace V MODA BRASIL',
        status: 'publicado',
      },
      {
        title: 'Conversão Revista → V MODA BRASIL',
        slug: 'conversao-revista-v-moda-brasil',
        category: 'conversao',
        summary:
          'Regras de CTA, posicionamento de hotspots, fluxo de atribuição de conversão e otimização do funil Revista → Marketplace.',
        flow: [
          {
            step: 'Design de CTA',
            description:
              'Definir CTA por tipo de conteúdo (matéria, legenda, story, banner, hotspot) com variante A/B.',
            responsible: 'Conversion Agent',
          },
          {
            step: 'Posicionamento de Hotspot',
            description:
              'Posicionar hotspots em pontos estratégicos das páginas da edição (x, y) com produto vinculado.',
            responsible: 'Editorial / Visual Designer',
          },
          {
            step: 'Tracking de Cliques',
            description:
              'Registrar cliques em hotspots e banners. Incrementar click_count e rastrear link_origin.',
            responsible: 'Sistema (hotspot_click_track)',
          },
          {
            step: 'Atribuição de Pedido',
            description:
              'Quando um pedido é criado, atribuir origem (revista, hotspot, whatsapp) e content_id/cta_variant.',
            responsible: 'Sistema (on_order_create_aggregate)',
          },
          {
            step: 'Análise de Funil',
            description:
              'Calcular conversion_rate por conteúdo, CTA e origem. Identificar gargalos.',
            responsible: 'Conversion Agent',
          },
          {
            step: 'Otimização',
            description:
              'Sugerir melhorias: troca de CTA, reposicionamento de hotspot, ajuste de preço.',
            responsible: 'Conversion Agent',
          },
        ],
        rules: [
          {
            rule: 'CTA por tipo',
            detail:
              'Matéria: CTA de produto no final. Legenda: link na bio ou hotspot. Story: swipe up. Banner: clique direto. Hotspot: produto vinculado.',
          },
          {
            rule: 'Posicionamento de hotspot',
            detail:
              'Hotspots em área visível sem cobrir elemento central. Mínimo 1 por página de produto. Coordenadas x,y em porcentagem.',
          },
          {
            rule: 'Variantes A/B',
            detail:
              'Testar no mínimo 2 variantes de CTA por conteúdo. cta_variant deve ser registrado em todos os cliques e pedidos.',
          },
          {
            rule: 'Link origin',
            detail:
              'Todo clique/pedido deve ter link_origin definido: revista, hotspot ou whatsapp.',
          },
          {
            rule: 'Atribuição completa',
            detail:
              'Pedidos devem ter content_id (página/post) e cta_variant preenchidos para atribuição correta.',
          },
          {
            rule: 'Conversion rate mínimo',
            detail: 'Conteúdos com conversion_rate < 0.5% devem ser otimizados ou substituídos.',
          },
          {
            rule: 'Produtos em destaque',
            detail: 'Produtos featured=true recebem prioridade em hotspots e banners.',
          },
        ],
        responsibilities: [
          {
            role: 'Conversion Agent',
            responsibilities: [
              'Sugerir CTAs otimizados',
              'Analisar funil de conversão',
              'Comparar variantes A/B',
              'Recomendar melhorias baseadas em dados',
            ],
          },
          {
            role: 'Editorial',
            responsibilities: [
              'Inserir CTAs conforme regras',
              'Posicionar hotspots estrategicamente',
              'Vincular produtos aos hotspots',
            ],
          },
          {
            role: 'Sistema',
            responsibilities: [
              'Rastrear cliques (hotspot_click_track)',
              'Atribuir pedidos (on_order_create_aggregate)',
              'Calcular conversion_metrics',
            ],
          },
        ],
        related_agents: [
          {
            agent: 'hotspot_click_track',
            how: 'Hook que registra clique em hotspot, incrementa click_count e rastreia link_origin e cta_variant.',
          },
          {
            agent: 'on_order_create_aggregate',
            how: 'Hook que dispara na criação de pedido, atribuindo origin, content_id e cta_variant e agregando em conversion_metrics.',
          },
          {
            agent: 'cta',
            how: 'Hook que gera sugestões de CTA otimizadas por tipo de conteúdo e público.',
          },
          {
            agent: 'funil',
            how: 'Hook que analisa o funil completo: impressões → cliques → pedidos → conversion_rate.',
          },
          {
            agent: 'conversion_agent_stream',
            how: 'Streaming do agente de conversão para análise em tempo real e recomendações.',
          },
          {
            agent: 'Coleção: page_hotspots',
            how: 'Armazena page, x, y, title, price, link, product, click_count, link_origin, conversion_rate e cta_variant.',
          },
          {
            agent: 'Coleção: conversion_metrics',
            how: 'Armazena content_id, content_type, impressions, clicks, orders, conversion_rate, cta_variant e link_origin.',
          },
          {
            agent: 'Coleção: marketplace_orders',
            how: 'Armazena product, customer, quantity, total, status, origin, content_id e cta_variant.',
          },
        ],
        body: 'GUIA DE CONVERSÃO REVISTA → V MODA BRASIL\n\nREGRAS DE CTA POR TIPO DE CONTEÚDO\n\nMatéria:\n- CTA no final do texto: "Compre agora" ou "Ver na V MODA BRASIL"\n- Link direto para produto ou categoria\n- Hotspot em imagem de produto se aplicável\n- cta_variant: "materia_link_final" ou "materia_hotspot"\n\nLegenda Instagram:\n- Link na bio direcionado\n- "Link na bio" ou "Clique no marcador"\n- cta_variant: "legenda_link_bio" ou "legenda_hotspot"\n\nStory:\n- Swipe up para produto\n- Sticker de link direto\n- cta_variant: "story_swipe_up" ou "story_sticker"\n\nBanner:\n- Clique direto no banner\n- URL de destino rastreada\n- cta_variant: "banner_direto"\n\nHotspot:\n- Produto vinculado do marketplace\n- Preço visível no popup\n- Botão "Comprar" direto\n- cta_variant: "hotspot_produto"\n\nPOSICIONAMENTO DE HOTSPOTS\n- Área visível (não cobrir elemento central da imagem)\n- Coordenadas x,y em porcentagem (0-100)\n- Mínimo 1 hotspot por página de produto\n- Máximo 5 hotspots por página (evitar poluição)\n- Hotspots em produtos featured têm prioridade\n\nFLUXO DE ATRIBUIÇÃO\n1. Usuário clica em hotspot/banner\n2. hotspot_click_track registra: click_count++, link_origin, cta_variant\n3. Usuário acessa produto no marketplace\n4. Usuário faz pedido\n5. on_order_create_aggregate atribui: origin, content_id, cta_variant\n6. conversion_metrics atualizado: orders++, conversion_rate recalculado\n\nANÁLISE DE FUNIL\nImpressões → Cliques → Pedidos → Conversion Rate\n- CTR (clique/impressão): meta > 3%\n- Conversion (pedido/clique): meta > 2%\n- Conversion overall (pedido/impressão): meta > 0.5%\n\nCRITÉRIOS DE OTIMIZAÇÃO\n- Conversion rate < 0.5%: otimizar CTA ou reposicionar hotspot\n- CTR < 1%: revisar visibilidade do CTA\n- Testar nova variante A/B se performance estagnada por 7 dias',
        status: 'publicado',
      },
      {
        title: 'Inteligência Competitiva',
        slug: 'inteligencia-competitiva',
        category: 'inteligencia_competitiva',
        summary:
          'Monitoramento de concorrentes, detecção de sinais de mercado, fluxo de alertas e formato de relatório mensal de inteligência.',
        flow: [
          {
            step: 'Identificação de Concorrentes',
            description:
              'Mapear concorrentes por categoria e plataforma (Instagram, TikTok, YouTube, site).',
            responsible: 'Market Watch Agent',
          },
          {
            step: 'Monitoramento',
            description:
              'Acompanhar followers, engagement_rate, post_frequency e content_themes dos concorrentes.',
            responsible: 'Market Watch Agent',
          },
          {
            step: 'Detecção de Sinais',
            description:
              'Identificar sinais: tendências, alertas de concorrente, menções de marca, comportamento do consumidor.',
            responsible: 'Market Watch Agent',
          },
          {
            step: 'Análise',
            description:
              'Avaliar severidade (info, atencao, critico) e status (novo, em_analise, notificado, arquivado).',
            responsible: 'Market Watch Agent / Editor',
          },
          {
            step: 'Notificação',
            description: 'Notificar equipe sobre sinais críticos. Arquivar sinais irrelevantes.',
            responsible: 'Editor',
          },
          {
            step: 'Relatório Mensal',
            description:
              'Consolidar inteligência em relatório mensal com benchmarks, tendências e recomendações.',
            responsible: 'Market Watch Agent',
          },
        ],
        rules: [
          {
            rule: 'Cadastro de concorrentes',
            detail:
              'Todo concorrente deve ter: name, platform, social_handle, category, followers, engagement_rate e content_themes.',
          },
          {
            rule: 'Severidade',
            detail:
              'info: monitorar. atencao: avaliar impacto. critico: notificar equipe imediatamente.',
          },
          {
            rule: 'Frequência de checagem',
            detail:
              'Concorrentes top: verificação semanal. Concorrentes menores: quinzenal. last_checked_at deve ser atualizado.',
          },
          {
            rule: 'Sinais críticos',
            detail:
              'Sinais com severity="critico" devem ser notificados em até 24h. Status passa para "notificado".',
          },
          {
            rule: 'Embedding de sinais',
            detail:
              'Todo market_signal tem um embedding vetorial para busca semântica via market_signals_search.',
          },
          {
            rule: 'Benchmarks',
            detail:
              'Comparar engagement_rate e post_frequency da Revista MODA ATUAL com concorrentes do mesmo segmento.',
          },
        ],
        responsibilities: [
          {
            role: 'Market Watch Agent',
            responsibilities: [
              'Monitorar concorrentes',
              'Detectar sinais de mercado',
              'Analisar severidade',
              'Gerar relatórios mensais',
              'Buscar sinais por semântica',
            ],
          },
          {
            role: 'Editor',
            responsibilities: [
              'Avaliar sinais críticos',
              'Decidir ações baseadas em inteligência',
              'Priorizar tendências para pauta',
            ],
          },
        ],
        related_agents: [
          {
            agent: 'concorrentes',
            how: 'Hook que lista e analisa concorrentes por plataforma e categoria.',
          },
          {
            agent: 'market_watch_agent_stream',
            how: 'Streaming do agente de inteligência competitiva para análise em tempo real.',
          },
          {
            agent: 'market_watch_agent_chats',
            how: 'Lista conversas anteriores com o agente Market Watch.',
          },
          {
            agent: 'market_signals_search',
            how: 'Hook que executa busca semântica (vector search) em market_signals usando embeddings.',
          },
          {
            agent: 'market_benchmarks',
            how: 'Hook que compara métricas da revista com concorrentes (engagement_rate, followers, post_frequency).',
          },
          {
            agent: 'market_watch_per_platform',
            how: 'Hook que agrega métricas de concorrentes por plataforma.',
          },
          {
            agent: 'market_watch_embed_create / market_watch_embed_update',
            how: 'Hooks que geram embeddings vetoriais para market_signals na criação/atualização.',
          },
          {
            agent: 'Coleção: competitors',
            how: 'Armazena name, platform, social_handle, category, followers, engagement_rate, post_frequency, content_themes, last_checked_at.',
          },
          {
            agent: 'Coleção: market_signals',
            how: 'Armazena signal_type, title, description, competitor, severity, source, detected_at, status, related_data e embedding (1536-dim).',
          },
        ],
        body: 'GUIA DE INTELIGÊNCIA COMPETITIVA\n\nCRITÉRIOS DE MONITORAMENTO DE CONCORRENTES\n\nIdentificação:\n- Concorrentes diretos: revistas de moda digital brasileiras\n- Concorrentes indiretos: influenciadores de moda com > 100k seguidores\n- Por plataforma: Instagram, TikTok, YouTube, site próprio\n\nMétricas monitoradas:\n- Followers: crescimento mensal\n- Engagement rate: (likes + comments + shares) / followers\n- Post frequency: posts por semana\n- Content themes: temas recorrentes (tendências, looks, bastidores)\n- Last checked_at: data da última verificação\n\nTIPOS DE SINAIS DE MERCADO\n\n1. Tendência (signal_type: "tendencia")\n- Novo tema ou formato ganhando tração\n- Severidade: info ou atencao\n- Ex: "Cropped com calça de alfaiataria viralizando no TikTok"\n\n2. Alerta de Concorrente (signal_type: "alerta_concorrente")\n- Concorrente lançando produto/campanha relevante\n- Severidade: atencao ou critico\n- Ex: "Concorrente X lançou marketplace integrado"\n\n3. Menção de Marca (signal_type: "mencao_marca")\n- Revista MODA ATUAL mencionada por terceiros\n- Severidade: info\n- Ex: "Influenciador Y citou a revista em story"\n\n4. Comportamento do Consumidor (signal_type: "comportamento_consumidor")\n- Mudança no comportamento da audiência\n- Severidade: atencao\n- Ex: "Busca por moda sustentável aumentou 40% no Google Trends"\n\nFLUXO DE ALERTA\n1. Sinal detectado (status: novo)\n2. Market Watch Agent analisa (status: em_analise)\n3. Severidade avaliada:\n   - info: arquivar após registro\n   - atencao: notificar editor (status: notificado)\n   - critico: notificar em 24h, agir imediatamente\n4. Após ação: arquivar (status: arquivado)\n\nFORMATO DE RELATÓRIO MENSAL\n1. SUMÁRIO EXECUTIVO\n- Principais movimentos do mês\n- Sinais críticos detectados\n- Recomendações estratégicas\n\n2. BENCHMARKS\n- Engagement rate: Revista vs. top 5 concorrentes\n- Crescimento de seguidores\n- Frequência de posts\n- Plataformas com melhor performance\n\n3. TENDÊNCIAS IDENTIFICADAS\n- Top 5 tendências do mês\n- Origem (TikTok, Instagram, runway)\n- Potencial de aplicação editorial\n\n4. ALERTAS DE CONCORRENTES\n- Lançamentos e campanhas\n- Mudanças estratégicas\n- Oportunidades de diferenciação\n\n5. RECOMENDAÇÕES\n- Pautas sugeridas baseadas em tendências\n- Formatos a testar\n- Gaps competitivos a explorar',
        status: 'publicado',
      },
    ]

    for (var i = 0; i < skills.length; i++) {
      var s = skills[i]
      try {
        app.findFirstRecordByData('skills', 'slug', s.slug)
      } catch (_) {
        var record = new Record(col)
        record.set('title', s.title)
        record.set('slug', s.slug)
        record.set('category', s.category)
        record.set('summary', s.summary)
        record.set('flow', s.flow)
        record.set('rules', s.rules)
        record.set('responsibilities', s.responsibilities)
        record.set('related_agents', s.related_agents)
        record.set('body', s.body)
        record.set('status', s.status)
        app.save(record)
      }
    }
  },
  (app) => {
    var slugs = [
      'monetizacao-e-branded-content',
      'conversao-revista-v-moda-brasil',
      'inteligencia-competitiva',
    ]
    for (var i = 0; i < slugs.length; i++) {
      try {
        var rec = app.findFirstRecordByData('skills', 'slug', slugs[i])
        app.delete(rec)
      } catch (_) {}
    }
  },
)
