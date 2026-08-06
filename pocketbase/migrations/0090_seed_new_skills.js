migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('skills')
    var categoryField = col.fields.getByName('category')
    if (categoryField) {
      categoryField.values = [
        'producao_editorial',
        'seo',
        'distribuicao',
        'nutricao',
        'monetizacao',
        'conversao',
        'inteligencia_competitiva',
        'atendimento_anunciante',
        'gestao_crise',
        'analise_metricas',
      ]
    }
    app.save(col)

    var skills = [
      {
        title: 'Atendimento ao Anunciante',
        slug: 'atendimento-ao-anunciante',
        category: 'atendimento_anunciante',
        summary:
          'Fluxo de suporte e relacionamento com anunciantes: onboarding, acompanhamento de campanha, resolução de problemas e renovação.',
        flow: [
          {
            step: 'Onboarding',
            description:
              'Boas-vindas ao anunciante, apresentação da plataforma, formatos disponíveis e definição de objetivos da campanha.',
            responsible: 'Comercial',
          },
          {
            step: 'Briefing',
            description:
              'Coleta de briefings: público-alvo, mensagem, assets visuais, prazo e expectativa de ROI.',
            responsible: 'Comercial / Anunciante',
          },
          {
            step: 'Proposta e Contrato',
            description:
              'Geração de proposta com match score, precificação automática e envio de contrato via portal do anunciante.',
            responsible: 'Sistema (proposta + generate_contract)',
          },
          {
            step: 'Produção',
            description:
              'Produção do conteúdo publicitário com briefing validado, aprovação do Art Director e identificação como patrocinado.',
            responsible: 'Editorial / Art Director',
          },
          {
            step: 'Acompanhamento',
            description:
              'Monitoramento da campanha em tempo real: impressões, cliques, conversões. Atualização semanal para o anunciante.',
            responsible: 'Comercial',
          },
          {
            step: 'Relatório Final',
            description:
              'Envio do relatório de performance com métricas, comparativo de benchmarks e recomendações para próxima campanha.',
            responsible: 'Comercial',
          },
          {
            step: 'Renovação',
            description:
              'Apresentação de resultados e proposta de renovação ou upsell com base na performance da campanha anterior.',
            responsible: 'Comercial',
          },
        ],
        rules: [
          {
            rule: 'SLA de resposta',
            detail: 'Anunciantes devem receber resposta em até 4h úteis. Campanhas ativas: 2h.',
          },
          {
            rule: 'Portal do anunciante',
            detail:
              'Todo anunciante recebe access_token para acompanhar status e aprovar contratos em /public/anunciante.',
          },
          {
            rule: 'Relatórios automáticos',
            detail:
              'Relatório semanal enviado automaticamente enquanto a campanha estiver ativa (status: em_entrega).',
          },
          {
            rule: 'Tom de comunicação',
            detail:
              'Profissional, proativo e data-driven. Sempre apresentar números e recomendações acionáveis.',
          },
          {
            rule: 'Escalonamento',
            detail:
              'Problemas não resolvidos em 48h devem ser escalados para a gerência comercial.',
          },
          {
            rule: 'Pós-venda',
            detail:
              'Contato de pós-venda em até 7 dias após o fim da campanha com relatório e proposta de renovação.',
          },
        ],
        responsibilities: [
          {
            role: 'Comercial',
            responsibilities: [
              'Onboarding do anunciante',
              'Coleta de briefings',
              'Acompanhamento de campanha',
              'Envio de relatórios',
              'Gestão de renovações',
            ],
          },
          {
            role: 'Editorial',
            responsibilities: [
              'Produção do conteúdo publicitário',
              'Garantir padrões visuais',
              'Identificar como patrocinado',
            ],
          },
          {
            role: 'Art Director',
            responsibilities: ['Aprovar banners e capas', 'Validar consistência visual'],
          },
          {
            role: 'Sistema',
            responsibilities: [
              'Gerar propostas automáticas',
              'Enviar contratos',
              'Disparar relatórios semanais',
              'Monitorar prazos (deadline_alerts)',
            ],
          },
        ],
        related_agents: [
          {
            agent: 'proposta',
            how: 'Hook que gera proposta comercial com match_score e suggested_price.',
          },
          {
            agent: 'email_proposal',
            how: 'Hook que envia a proposta por e-mail ao anunciante.',
          },
          {
            agent: 'generate_contract',
            how: 'Hook que gera contrato após aceite da proposta.',
          },
          {
            agent: 'contract_approve',
            how: 'Hook que processa a aprovação de contrato pelo anunciante via portal.',
          },
          {
            agent: 'deadline_alerts',
            how: 'Hook que monitora delivery_date e gera alertas para prazos próximos.',
          },
          {
            agent: 'public_advertiser',
            how: 'Hook do portal público onde o anunciante acompanha status e aprova contratos.',
          },
          {
            agent: 'Coleção: ad_proposals',
            how: 'Armazena advertiser, campaign, format, suggested_price, match_score, status, contract_number e access_token.',
          },
          {
            agent: 'Coleção: advertisements',
            how: 'Armazena anúncios ativos com advertiser, campaign, price, status e delivery.',
          },
        ],
        body: 'GUIA DE ATENDIMENTO AO ANUNCIANTE\n\nFLUXO DE RELACIONAMENTO\n\n1. ONBOARDING\n- Apresentar formatos: capa, página inteira, banner, sponsored content, story\n- Explicar métricas: impressões, cliques, conversões\n- Definir KPIs da campanha com o anunciante\n- Criar acesso ao portal (/public/anunciante)\n\n2. BRIEFING\n- Público-alvo (segmento, idade, região)\n- Mensagem principal da campanha\n- Assets: logo, imagens, cores da marca\n- Prazo de entrega esperado\n- Budget e formato preferido\n\n3. PROPOSTA E CONTRATO\n- Sistema gera proposta com match_score\n- Preço calculado via ad_pricing_rules\n- Envio automático por e-mail\n- Anunciante aprova via portal\n- Contrato gerado com número e termos\n\n4. PRODUÇÃO\n- Briefing validado pelo comercial\n- Produção pelo time editorial\n- Aprovação do Art Director\n- Identificação clara como "Conteúdo Patrocinado"\n\n5. ACOMPANHAMENTO\n- Monitoramento diário de impressões e cliques\n- Atualização semanal enviada ao anunciante\n- Alertas de prazo via deadline_alerts\n- Ajustes de campanha se necessário\n\n6. RELATÓRIO FINAL\n- Métricas completas: impressões, cliques, CTR, conversões\n- Comparativo com benchmarks do setor\n- ROI estimado\n- Recomendações para próxima campanha\n\n7. RENOVAÇÃO\n- Contato em até 7 dias pós-campanha\n- Apresentação de resultados\n- Proposta de renovação ou upsell\n- Desconto de fidelidade quando aplicável\n\nSLA DE RESPOSTA\n- Anunciantes ativos: 2h úteis\n- Anunciantes em prospecção: 4h úteis\n- Problemas técnicos: 1h útil\n- Escalonamento gerencial: 48h sem resolução\n\nTOM DE COMUNICAÇÃO\n- Profissional e cordial\n- Sempre data-driven (apresentar números)\n- Proativo (sugestões antes de pedido)\n- Linguagem clara, sem jargão técnico',
        status: 'publicado',
      },
      {
        title: 'Gestão de Crise',
        slug: 'gestao-de-crise',
        category: 'gestao_crise',
        summary:
          'Fluxo de monitoramento de sinais críticos, acionamento da equipe, respostas recomendadas e comunicação oficial em situações de crise.',
        flow: [
          {
            step: 'Detecção',
            description:
              'Identificação de sinais críticos via Market Watch: alerta_concorrente com severity=critico, menções negativas, ou comportamento anômalo de métricas.',
            responsible: 'Market Watch Agent',
          },
          {
            step: 'Triagem',
            description:
              'Avaliação da severidade e impacto. Classificar como: contenção (resposta rápida), comunicação (nota oficial) ou escalonamento (decisão executiva).',
            responsible: 'Editor / Direção',
          },
          {
            step: 'Acionamento',
            description:
              'Notificação imediata da equipe via alertas. Definição de responsável e prazo de resposta.',
            responsible: 'Sistema (alertas)',
          },
          {
            step: 'Resposta',
            description:
              'Execução da resposta: reply a comentários/DMs, publicação de esclarecimento, ou contato direto com a parte envolvida.',
            responsible: 'Social Engagement / Editorial',
          },
          {
            step: 'Comunicação Oficial',
            description:
              'Se necessário, publicar nota oficial nos canais da revista com posicionamento claro e transparente.',
            responsible: 'Direção / Editorial',
          },
          {
            step: 'Monitoramento Pós-Crise',
            description:
              'Acompanhamento de menções, engajamento e sentimento nas 48h seguintes. Arquivar sinal quando estabilizado.',
            responsible: 'Market Watch Agent',
          },
          {
            step: 'Post-Mortem',
            description:
              'Documentação do incidente, lições aprendidas e ajustes nos playbooks para prevenir recorrência.',
            responsible: 'Direção',
          },
        ],
        rules: [
          {
            rule: 'Severidade crítica',
            detail:
              'Sinais com severity="critico" devem ser notificados em até 1h. Resposta iniciada em até 4h.',
          },
          {
            rule: 'Canal de crise',
            detail:
              'Toda comunicação de crise passa pela direção antes de ser publicada. Nenhum membro publica por conta própria.',
          },
          {
            rule: 'Transparência',
            detail:
              'Comunicação oficial deve ser honesta, transparente e empática. Nunca deletar comentários legítimos.',
          },
          {
            rule: 'Social Engagement',
            detail:
              'Interações durante crise devem ser encaminhadas para humano (status: encaminhado_humano). O agente não responde automaticamente.',
          },
          {
            rule: 'Documentação',
            detail:
              'Todo incidente de crise deve ser documentado em market_signals com status atualizado (novo → em_analise → notificado → arquivado).',
          },
          {
            rule: 'Tempo de monitoramento',
            detail:
              'Monitorar por no mínimo 48h após a resposta. Arquivar apenas quando sentimento estabilizar.',
          },
        ],
        responsibilities: [
          {
            role: 'Market Watch Agent',
            responsibilities: [
              'Detectar sinais críticos',
              'Monitorar menções de marca',
              'Acompanhar sentimento pós-crise',
              'Gerar relatório de incidente',
            ],
          },
          {
            role: 'Direção',
            responsibilities: [
              'Aprovar comunicação oficial',
              'Decidir escalonamento',
              'Liderar post-mortem',
              'Aprovar ajustes de playbook',
            ],
          },
          {
            role: 'Editorial',
            responsibilities: [
              'Redigir nota oficial',
              'Adaptar tom conforme gravidade',
              'Garantir precisão factual',
            ],
          },
          {
            role: 'Social Engagement',
            responsibilities: [
              'Encaminhar interações para humano',
              'Monitorar DMs e comentários',
              'Reportar volume e sentimento',
            ],
          },
        ],
        related_agents: [
          {
            agent: 'market_watch_agent_stream',
            how: 'Streaming do agente de inteligência para detecção e análise de sinais críticos em tempo real.',
          },
          {
            agent: 'on_market_signal_critical',
            how: 'Hook que dispara alerta automático quando um market_signal com severity=critico é criado.',
          },
          {
            agent: 'on_engagement_forwarded',
            how: 'Hook que cria alerta quando o Social Engagement Agent encaminha interação para humano.',
          },
          {
            agent: 'alertas',
            how: 'Hook que envia notificações à equipe sobre sinais críticos e interações encaminhadas.',
          },
          {
            agent: 'market_signals_search',
            how: 'Busca semântica em market_signals para encontrar incidentes similares e respostas anteriores.',
          },
          {
            agent: 'Coleção: market_signals',
            how: 'Armazena signal_type, severity, status e related_data para rastreamento completo do incidente.',
          },
          {
            agent: 'Coleção: notifications',
            how: 'Armazena alertas visíveis no admin com contexto e link direto.',
          },
        ],
        body: 'GUIA DE GESTÃO DE CRISE\n\nNÍVEIS DE SEVERIDADE\n\nNível 1 — Contenção (severity: atencao):\n- Resposta em até 8h\n- Reply direto ou DM\n- Monitorar por 24h\n- Ex: Comentário negativo isolado, dúvida de produto\n\nNível 2 — Comunicação (severity: critico):\n- Resposta em até 4h\n- Nota ou esclarecimento público\n- Monitorar por 48h\n- Ex: Reclamação viralizada, erro factual no conteúdo\n\nNível 3 — Escalonamento (severity: critico + impacto de marca):\n- Resposta em até 1h\n- Decisão executiva obrigatória\n- Nota oficial + ação corretiva\n- Monitorar por 72h\n- Ex: Crise de PR, problema legal, ataque coordenado\n\nFLUXO DE RESPOSTA\n\n1. DETECÇÃO\n- Market Watch Agent detecta sinal crítico\n- Hook on_market_signal_critical cria alerta\n- Notificação aparece no admin\n\n2. TRIAGEM\n- Editor/Direção avalia gravidade\n- Define nível (1, 2 ou 3)\n- Designa responsável\n\n3. RESPOSTA\nNível 1: Reply/DM via Social Engagement\nNível 2: Esclarecimento + reply coordenado\nNível 3: Nota oficial + ação corretiva\n\n4. MONITORAMENTO\n- Acompanhar menções nas 48h seguintes\n- Verificar sentimento (positivo/negativo/neutro)\n- Ajustar resposta se necessário\n\n5. ARQUIVAMENTO\n- Arquivar sinal quando sentimento estabilizar\n- Documentar timeline completa\n\nPOST-MORTEM\n- Causa raiz do incidente\n- Tempo de detecção e resposta\n- Eficácia da resposta\n- Ajustes necessários nos playbooks\n- Treinamento adicional da equipe\n\nPRINCÍPIOS DE COMUNICAÇÃO\n- Transparência acima de tudo\n- Empatia com a audiência\n- Reconhecer erros quando houver\n- Nunca deletar comentários legítimos\n- Responder no canal onde a crise ocorreu\n- Manter consistência entre canais',
        status: 'publicado',
      },
      {
        title: 'Análise de Métricas',
        slug: 'analise-de-metricas',
        category: 'analise_metricas',
        summary:
          'Critérios de leitura de dados de tráfego, engajamento e conversão, frequência de análise e formato dos relatórios de performance.',
        flow: [
          {
            step: 'Coleta de Dados',
            description:
              'Agregação de dados de social_posts, seo_metrics, conversion_metrics, edition_pages e delivery_queue para o período analisado.',
            responsible: 'Sistema / Dashboard',
          },
          {
            step: 'Análise de Engajamento',
            description:
              'Avaliar views, likes, comments, shares, saves, engagement_rate e is_top_performer dos social_posts no período.',
            responsible: 'Analista / Social Analytics',
          },
          {
            step: 'Análise de SEO',
            description:
              'Verificar position, clicks, impressions e ctr das keywords rastreadas em seo_metrics. Identificar ganhos e perdas.',
            responsible: 'SEO Specialist',
          },
          {
            step: 'Análise de Conversão',
            description:
              'Calcular funil: impressões → cliques → pedidos → conversion_rate. Avaliar performance por CTA e link_origin.',
            responsible: 'Conversion Agent / Analista',
          },
          {
            step: 'Análise de Audiência',
            description:
              'Avaliar crescimento de assinantes, open_rate e click_rate de newsletters, e engagement_score por segmento.',
            responsible: 'Audience Nurture Agent',
          },
          {
            step: 'Benchmarking',
            description:
              'Comparar métricas da revista com concorrentes (engagement_rate, followers, post_frequency) via market_benchmarks.',
            responsible: 'Market Watch Agent',
          },
          {
            step: 'Relatório',
            description:
              'Consolidar análises em relatório mensal com insights, recomendações e plano de ação para o próximo período.',
            responsible: 'Analista / Direção',
          },
        ],
        rules: [
          {
            rule: 'Frequência de análise',
            detail:
              'Dashboard diário (automático). Relatório semanal de engajamento. Relatório mensal completo (todas as métricas).',
          },
          {
            rule: 'KPIs principais',
            detail:
              'Engajamento: engagement_rate, saves, shares. SEO: position, ctr. Conversão: conversion_rate, orders. Audiência: open_rate, subscribers ativos.',
          },
          {
            rule: 'Top performers',
            detail:
              'Posts com is_top_performer=true devem ser analisados para identificar padrões replicáveis.',
          },
          {
            rule: 'Underperformers',
            detail:
              'Posts com engagement_rate abaixo da média do mês devem ser revisados para identificar causas.',
          },
          {
            rule: 'Comparativo temporal',
            detail:
              'Sempre comparar com o período anterior (mês vs mês, semana vs semana) para identificar tendências.',
          },
          {
            rule: 'Ação sobre dados',
            detail:
              'Todo relatório deve incluir pelo menos 3 recomendações acionáveis baseadas nos dados analisados.',
          },
        ],
        responsibilities: [
          {
            role: 'Analista',
            responsibilities: [
              'Coletar e agregar dados',
              'Identificar padrões e anomalias',
              'Produzir relatórios',
              'Recomendar ações',
            ],
          },
          {
            role: 'SEO Specialist',
            responsibilities: [
              'Analisar posicionamento de keywords',
              'Identificar oportunidades de conteúdo',
              'Monitorar CTR e impressões',
            ],
          },
          {
            role: 'Conversion Agent',
            responsibilities: [
              'Analisar funil de conversão',
              'Comparar variantes A/B',
              'Sugerir otimizações de CTA',
            ],
          },
          {
            role: 'Market Watch Agent',
            responsibilities: [
              'Comparar com concorrentes',
              'Identificar tendências de mercado',
              'Sugerir pautas baseadas em dados',
            ],
          },
        ],
        related_agents: [
          {
            agent: 'social_posts_compute',
            how: 'Hook que recalcula engagement_rate e is_top_performer para posts publicados.',
          },
          {
            agent: 'social_analytics_recommendations',
            how: 'Gera recomendações de horários e formatos baseadas em performance histórica.',
          },
          {
            agent: 'funil',
            how: 'Hook que analisa o funil completo: impressões → cliques → pedidos → conversion_rate.',
          },
          {
            agent: 'market_benchmarks',
            how: 'Compara métricas da revista com concorrentes do mesmo segmento.',
          },
          {
            agent: 'fashion_advisor_chat',
            how: 'Agente de análise de moda social que fornece insights de tendências baseados em social_posts.',
          },
          {
            agent: 'Coleção: social_posts',
            how: 'Armazena views, likes, comments, shares, saves, engagement_rate e is_top_performer.',
          },
          {
            agent: 'Coleção: seo_metrics',
            how: 'Armazena keyword, position, search_volume, clicks, impressions e ctr.',
          },
          {
            agent: 'Coleção: conversion_metrics',
            how: 'Armazena impressions, clicks, orders, conversion_rate, cta_variant e link_origin.',
          },
          {
            agent: 'Coleção: newsletter_campaigns',
            how: 'Armazena open_rate, click_rate, audience_size e unsubscribe_count.',
          },
        ],
        body: 'GUIA DE ANÁLISE DE MÉTRICAS\n\nFREQUÊNCIA DE ANÁLISE\n\nDiário (automático via dashboard):\n- Views, likes, comments dos posts do dia\n- Posição SEO das keywords principais\n- Pedidos e conversion_rate do dia\n- Alertas de underperformance\n\nSemanal:\n- Engagement_rate médio vs. semana anterior\n- Top 3 e bottom 3 posts da semana\n- Crescimento de seguidores\n- Status da fila de entrega\n\nMensal (relatório completo):\n- Engajamento por formato (Reel, Carousel, Photo)\n- Engajamento por plataforma\n- SEO: keywords que subiram e caíram\n- Conversão: funil completo por origem\n- Newsletter: open_rate e click_rate\n- Comparativo com concorrentes\n- 3+ recomendações acionáveis\n\nKPIs E BENCHMARKS\n\nEngajamento:\n- Engagement rate meta: > 5%\n- Saves rate meta: > 2%\n- Top performer: engagement_rate > 2x média\n\nSEO:\n- Position: top 10 para keywords principais\n- CTR: > 3% para top 3 posições\n- Crescimento de impressões mensal: > 10%\n\nConversão:\n- CTR (clique/impressão): > 3%\n- Conversion (pedido/clique): > 2%\n- Overall (pedido/impressão): > 0.5%\n\nAudiência:\n- Open rate newsletter: > 25%\n- Click rate newsletter: > 3%\n- Crescimento de assinantes: > 5% mês\n\nFORMATO DO RELATÓRIO MENSAL\n\n1. SUMÁRIO EXECUTIVO (1 página)\n- Principais destaques do mês\n- 3 recomendações prioritárias\n- Status geral (verde/amarelo/vermelho)\n\n2. ENGAJAMENTO SOCIAL\n- Tabela: posts ordenados por engagement_rate\n- Gráfico: evolução semanal\n- Análise: top performers vs underperformers\n- Insights: formato, horário, tema\n\n3. SEO\n- Tabela: keywords com position, clicks, ctr\n- Ganhos: keywords que subiram\n- Perdas: keywords que caíram\n- Oportunidades: keywords próximas do top 10\n\n4. CONVERSÃO\n- Funil: impressões → cliques → pedidos\n- Por origem: revista, hotspot, whatsapp\n- Por CTA: variantes A/B\n- Produtos mais vendidos\n\n5. AUDIÊNCIA\n- Crescimento de assinantes por segmento\n- Open rate e click rate das campanhas\n- Score de engajamento médio\n\n6. BENCHMARK COMPETITIVO\n- Engagement rate vs. top 5 concorrentes\n- Crescimento de seguidores\n- Diferenciais identificados\n\n7. PLANO DE AÇÃO\n- 3+ recomendações acionáveis\n- Responsáveis e prazos\n- Métricas a monitorar no próximo mês',
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
    var slugs = ['atendimento-ao-anunciante', 'gestao-de-crise', 'analise-de-metricas']
    for (var i = 0; i < slugs.length; i++) {
      try {
        var rec = app.findFirstRecordByData('skills', 'slug', slugs[i])
        app.delete(rec)
      } catch (_) {}
    }

    var col = app.findCollectionByNameOrId('skills')
    var categoryField = col.fields.getByName('category')
    if (categoryField) {
      col.fields.remove(col.fields.getByName('category'))
    }
    col.fields.add(
      new SelectField({
        name: 'category',
        required: true,
        values: [
          'producao_editorial',
          'seo',
          'distribuicao',
          'nutricao',
          'monetizacao',
          'conversao',
          'inteligencia_competitiva',
        ],
        maxSelect: 1,
      }),
    )
    app.save(col)
  },
)
