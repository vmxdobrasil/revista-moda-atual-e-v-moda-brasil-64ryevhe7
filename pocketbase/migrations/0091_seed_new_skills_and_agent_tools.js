/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('skills')

    var allCategories = [
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

    var catField = col.fields.getByName('category')
    var needsUpdate = false
    if (catField) {
      var existingValues = catField.values || []
      for (var ci = 0; ci < allCategories.length; ci++) {
        if (existingValues.indexOf(allCategories[ci]) === -1) {
          needsUpdate = true
          break
        }
      }
    } else {
      needsUpdate = true
    }
    if (needsUpdate) {
      col.fields.add(
        new SelectField({
          name: 'category',
          required: true,
          values: allCategories,
          maxSelect: 1,
        }),
      )
      app.save(col)
    }

    var skills = [
      {
        title: 'Atendimento ao Anunciante',
        slug: 'atendimento-ao-anunciante',
        category: 'atendimento_anunciante',
        summary:
          'Fluxo completo de atendimento comercial: captação de leads via DM, qualificação, proposta, negociação, contrato e pós-venda para anunciantes da Revista MODA ATUAL.',
        flow: [
          {
            step: 'Captação do Lead',
            description:
              'Identificar anunciantes potenciais via DMs, comentários e formulários. Registrar em dm_leads com intenção comercial.',
            responsible: 'Social Engagement Agent',
          },
          {
            step: 'Qualificação',
            description:
              'Classificar intenção (produto, anuncio, consultoria, parceria) e priorizar por potencial comercial.',
            responsible: 'Social Engagement Agent',
          },
          {
            step: 'Primeiro Contato',
            description:
              'Responder em até 24h com informações relevantes sobre formatos publicitários e condições.',
            responsible: 'Social Engagement Agent',
          },
          {
            step: 'Apresentação',
            description:
              'Compartilhar proposta comercial com formato, preço sugerido, match_score e alcance de audiência.',
            responsible: 'Sistema (proposta + email_proposal)',
          },
          {
            step: 'Negociação',
            description:
              'Discutir condições, formatos, prazos e investimento. Ajustar proposta conforme feedback do anunciante.',
            responsible: 'Comercial',
          },
          {
            step: 'Fechamento',
            description:
              'Gerar contrato com número, termos e datas. Anunciante aprova via portal com access_token.',
            responsible: 'Sistema (generate_contract + contract_approve)',
          },
          {
            step: 'Pós-Venda',
            description:
              'Acompanhar entrega, gerar relatório de performance e manter relacionamento para renovações.',
            responsible: 'Comercial',
          },
        ],
        rules: [
          {
            rule: 'Tempo de resposta',
            detail:
              'Novos leads devem ser respondidos em até 24h. DMs comerciais têm prioridade alta.',
          },
          {
            rule: 'Registro obrigatório',
            detail:
              'Toda interação comercial deve ser registrada em engagement_log ou dm_leads para rastreabilidade.',
          },
          {
            rule: 'Classificação de intenção',
            detail:
              'Toda DM deve ter intenção classificada via classificar_interacao antes da resposta.',
          },
          {
            rule: 'Match score',
            detail: 'Propostas com match_score < 50 requerem revisão manual antes do envio.',
          },
          {
            rule: 'Contrato obrigatório',
            detail:
              'Nenhuma campanha é produzida sem contrato assinado. Status deve estar em "contrato".',
          },
          {
            rule: 'Portal do anunciante',
            detail: 'Anunciantes recebem access_token para acompanhar status e aprovar contratos.',
          },
          {
            rule: 'Tom de voz',
            detail: 'Manter tom profissional e comercial, alinhado com a marca Revista MODA ATUAL.',
          },
        ],
        responsibilities: [
          {
            role: 'Social Engagement Agent',
            responsibilities: [
              'Captar leads via DM e comentários',
              'Classificar intenção comercial',
              'Responder primeiro contato em até 24h',
              'Encaminhar oportunidades para comercial',
            ],
          },
          {
            role: 'Comercial',
            responsibilities: [
              'Negociar condições e formatos',
              'Fechar contratos',
              'Gerenciar relacionamento pós-venda',
              'Gerar relatórios de performance',
            ],
          },
          {
            role: 'Sistema',
            responsibilities: [
              'Gerar propostas com match_score',
              'Enviar propostas por e-mail',
              'Gerar contratos com termos',
              'Processar aprovação via portal',
            ],
          },
          {
            role: 'Art Director',
            responsibilities: ['Aprovar entregáveis criativos', 'Validar consistência visual'],
          },
        ],
        related_agents: [
          {
            agent: 'social_engagement_agent_stream',
            how: 'Streaming do agente de atendimento para responder DMs e comentários em tempo real.',
          },
          {
            agent: 'capturar_lead',
            how: 'Hook que captura leads de DMs e registra em dm_leads com intent e status.',
          },
          {
            agent: 'classificar_interacao',
            how: 'Hook que classifica intenção de comentários e DMs (elogio, pergunta_produto, parceria, etc).',
          },
          {
            agent: 'responder_dm',
            how: 'Hook que responde DMs de forma automatizada e humanizada.',
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
            how: 'Hook que gera contrato com número, termos e datas após aceite da proposta.',
          },
          {
            agent: 'contract_approve',
            how: 'Hook que processa a aprovação de contrato pelo anunciante via access_token.',
          },
          {
            agent: 'Coleção: dm_leads',
            how: 'Armazena leads de DM com ig_username, name, email, whatsapp, intent, status e notes.',
          },
          {
            agent: 'Coleção: ad_proposals',
            how: 'Armazena propostas com advertiser, format, suggested_price, match_score, status e access_token.',
          },
        ],
        body: 'GUIA DE ATENDIMENTO AO ANUNCIANTE\n\nFLUXO DE ATENDIMENTO\n\n1. CAPTAÇÃO\n- Monitorar DMs e comentários via Social Engagement Agent\n- Identificar intenções comerciais (produto, anuncio, consultoria, parceria)\n- Registrar lead em dm_leads com ig_username, name, email, whatsapp\n- Status inicial: "novo"\n\n2. QUALIFICAÇÃO\n- Classificar intenção via classificar_interacao\n- Priorizar por potencial comercial:\n  - "anuncio": alta prioridade\n  - "parceria": média prioridade\n  - "consultoria": média prioridade\n  - "produto": encaminhar para marketplace\n- Atualizar status para "contatado" após primeiro contato\n\n3. PRIMEIRO CONTATO\n- Responder em até 24h\n- Apresentar a revista e os formatos disponíveis\n- Solicitar informações: marca, produto, público, orçamento\n- Manter tom profissional e acolhedor\n\n4. APRESENTAÇÃO\n- Gerar proposta via hook proposta\n- Incluir: formato, posição, preço sugerido, match_score\n- Enviar via e-mail (email_proposal) com link do portal\n- Match score < 50: revisão manual obrigatória\n\n5. NEGOCIAÇÃO\n- Discutir formato, posição, prazo e investimento\n- Ajustar proposta conforme feedback\n- Considerar formatos combinados (capa + banner, sponsored + story)\n- Aplicar descontos estratégicos para contratos recorrentes\n\n6. FECHAMENTO\n- Gerar contrato via generate_contract\n- Enviar via portal do anunciante (/public/anunciante)\n- Anunciante aprova via access_token\n- Status: "contrato" → "entregue"\n\n7. PÓS-VENDA\n- Acompanhar delivery_date via deadline_alerts\n- Gerar relatório de performance (impressões, cliques, conversões)\n- Enviar relatório ao anunciante\n- Manter relacionamento para renovações\n\nFORMATOS DISPONÍVEIS\n- Capa: R$ 5.000+ — máxima visibilidade\n- Página inteira: R$ 3.000+ — impacto visual\n- Editorial destaque: R$ 4.000+ — conteúdo integrado\n- Sponsored content: R$ 2.500+ — matéria patrocinada\n- Banner: R$ 800+ — retângulo lateral\n- Story: R$ 1.200+ — formato vertical\n\nCRITÉRIOS DE SUCESSO\n- Taxa de resposta < 24h: 100%\n- Taxa de conversão lead → contrato: > 15%\n- Satisfação do anunciante: > 4.5/5\n- Taxa de renovação: > 40%',
        status: 'publicado',
      },
      {
        title: 'Gestão de Crise',
        slug: 'gestao-de-crise',
        category: 'gestao_crise',
        summary:
          'Protocolo de detecção, avaliação, resposta e monitoramento de crises de imagem e reputação, com fluxo de comunicação interna e externa, relatório pós-crise e lições aprendidas.',
        flow: [
          {
            step: 'Detecção',
            description:
              'Identificar sinais de crise via market_signals, engagement_log e monitoramento social. Detectar menções negativas, spikes de reclamações ou alertas de concorrentes.',
            responsible: 'Market Watch Agent',
          },
          {
            step: 'Avaliação de Severidade',
            description:
              'Classificar como info, atencao ou critico. Definir nível de resposta e equipe necessária.',
            responsible: 'Market Watch Agent / Editor',
          },
          {
            step: 'Resposta Imediata',
            description:
              'Para crises críticas, reconhecer publicamente em até 2h. Nunca ignorar ou deletar comentários negativos.',
            responsible: 'Editor',
          },
          {
            step: 'Comunicação Interna',
            description:
              'Notificar equipe, atribuir responsabilidades, definir porta-voz e alinhar mensagem.',
            responsible: 'Editor-Chefe',
          },
          {
            step: 'Plano de Ação',
            description:
              'Definir estratégia de resposta: esclarecimento, desculpa formal, contranarrativa ou silêncio estratégico.',
            responsible: 'Editor / Editorial QA',
          },
          {
            step: 'Execução',
            description:
              'Implementar resposta nos canais afetados com tom adequado. Todas as respostas aprovadas pelo editor.',
            responsible: 'Social Publisher / Social Engagement',
          },
          {
            step: 'Monitoramento',
            description:
              'Acompanhar sentimento, engajamento e cobertura a cada 2h durante crise ativa. Ajustar estratégia conforme necessário.',
            responsible: 'Market Watch Agent',
          },
          {
            step: 'Pós-Crise',
            description:
              'Documentar lições aprendidas, atualizar playbook e produzir relatório formal em até 72h.',
            responsible: 'Editor',
          },
        ],
        rules: [
          {
            rule: 'Notificação crítica',
            detail:
              'Sinais com severity="critico" devem ser notificados à equipe em até 24h via on_market_signal_critical.',
          },
          {
            rule: 'Não deletar',
            detail:
              'Nunca deletar comentários negativos — responder de forma construtiva ou escalar para humano.',
          },
          {
            rule: 'Aprovação obrigatória',
            detail:
              'Resposta de crise deve ser aprovada pelo editor e revisada pelo Editorial QA antes de publicar.',
          },
          {
            rule: 'Logging',
            detail:
              'Toda comunicação e ação de gestão de crise registrada em audit_logs para rastreabilidade.',
          },
          {
            rule: 'Monitoramento intensivo',
            detail: 'Sentimento monitorado a cada 2h durante crise ativa. Escalar se agravar.',
          },
          {
            rule: 'Relatório pós-crise',
            detail:
              'Documento formal com timeline, impacto e lições aprendidas em até 72h após resolução.',
          },
          {
            rule: 'Tom de voz',
            detail:
              'Manter tom profissional e empático mesmo em respostas defensativas. Sempre reconhecer a preocupação.',
          },
        ],
        responsibilities: [
          {
            role: 'Market Watch Agent',
            responsibilities: [
              'Detectar sinais de crise',
              'Monitorar sentimento e cobertura',
              'Rastrear menções da marca',
              'Gerar alertas de severidade',
            ],
          },
          {
            role: 'Editorial QA',
            responsibilities: [
              'Revisar respostas de crise',
              'Validar tom e precisão factual',
              'Garantir consistência de mensagem',
            ],
          },
          {
            role: 'Social Engagement',
            responsibilities: [
              'Responder comentários e DMs durante crise',
              'Monitorar reações em tempo real',
              'Escalar interações sensíveis para humano',
            ],
          },
          {
            role: 'Editor',
            responsibilities: [
              'Aprovar estratégia de resposta',
              'Coordenar equipe durante crise',
              'Decidir nível de resposta pública',
            ],
          },
          {
            role: 'Editor-Chefe',
            responsibilities: [
              'Aprovação final para declarações públicas',
              'Definir porta-voz oficial',
            ],
          },
        ],
        related_agents: [
          {
            agent: 'market_watch_agent_stream',
            how: 'Streaming do agente de inteligência para detecção de crises e monitoramento em tempo real.',
          },
          {
            agent: 'on_market_signal_critical',
            how: 'Hook que dispara notificação automática para sinais com severity="critico".',
          },
          {
            agent: 'editorial_qa_review',
            how: 'Hook que revisa conteúdo de resposta de crise verificando gramática, tom e precisão.',
          },
          {
            agent: 'social_engagement_agent_stream',
            how: 'Streaming do agente de atendimento para responder comentários e DMs durante crise.',
          },
          {
            agent: 'classificar_interacao',
            how: 'Hook que classifica intenção de comentários durante crise (crítica, reclamação, spam).',
          },
          {
            agent: 'responder_comentario',
            how: 'Hook que responde comentários de forma automatizada, encaminhando sensíveis para humano.',
          },
          {
            agent: 'Coleção: market_signals',
            how: 'Armazena sinais com signal_type, severity, status, detected_at para rastreamento de crise.',
          },
          {
            agent: 'Coleção: engagement_log',
            how: 'Armazena interações com type, intent, status para monitoramento de sentimento.',
          },
          {
            agent: 'Coleção: audit_logs',
            how: 'Registra todas as ações de gestão de crise para auditoria pós-evento.',
          },
        ],
        body: 'GUIA DE GESTÃO DE CRISE\n\nNÍVEIS DE SEVERIDADE\n\nINFO:\n- Monitorar e registrar\n- Sem ação imediata necessária\n- Ex: Menção neutra da marca em contexto negativo\n\nATENÇÃO:\n- Avaliar impacto potencial\n- Preparar resposta preventiva\n- Notificar editor\n- Ex: Aumento de comentários negativos em post recente\n\nCRÍTICO:\n- Ação imediata necessária (reconhecimento em até 2h)\n- Notificar equipe completa em até 24h\n- Ativar protocolo de crise completo\n- Ex: Acusação pública de plágio, escândalo envolvendo marca parceira\n\nPROTOCOLO DE RESPOSTA POR NÍVEL\n\nINFO:\n1. Registrar em market_signals (status: novo)\n2. Monitorar evolução\n3. Arquivar se não escalar (status: arquivado)\n\nATENÇÃO:\n1. Registrar em market_signals (status: em_analise)\n2. Notificar editor\n3. Preparar rascunho de resposta\n4. Monitorar a cada 4h\n5. Escalar para crítico se agravar\n\nCRÍTICO:\n1. Registrar em market_signals (status: em_analise)\n2. Notificar equipe completa (on_market_signal_critical)\n3. Reunião de emergência — definir porta-voz\n4. Reconhecer publicamente em até 2h (sem admitir culpa prematuramente)\n5. Preparar resposta oficial — aprovada por editor-chefe\n6. Publicar resposta nos canais afetados\n7. Monitorar sentimento a cada 2h\n8. Relatório formal em 72h\n\nDIRETRIZES DE COMUNICAÇÃO\n\n- Sempre responder — nunca ignorar\n- Nunca deletar comentários negativos\n- Reconhecer a preocupação antes de responder\n- Usar linguagem clara e direta\n- Evitar jargão corporativo\n- Não admitir culpa sem consulta jurídica\n- Manter consistência entre canais\n- Documentar todas as ações em audit_logs\n\nMONITORAMENTO DURANTE CRISE\n\n- Sentimento de comentários e DMs\n- Volume de menções da marca\n- Engajamento em posts relacionados\n- Cobertura por concorrentes\n- Sinais de mercado relacionados\n\nRELATÓRIO PÓS-CRISE (72h)\n\n1. LINHA DO TEMPO\n- Detecção → Resolução\n- Ações tomadas em cada etapa\n\n2. IMPACTO\n- Sentimento antes vs depois\n- Variação de seguidores\n- Cobertura mediática\n\n3. LIÇÕES APRENDIDAS\n- O que funcionou\n- O que falhou\n- Melhorias necessárias\n\n4. ATUALIZAÇÕES\n- Atualizar playbook de crise\n- Treinar equipe com novo cenário\n- Ajustar alertas automatizados',
        status: 'publicado',
      },
      {
        title: 'Análise de Métricas',
        slug: 'analise-de-metricas',
        category: 'analise_metricas',
        summary:
          'Fluxo de coleta, consolidação, análise e relatório de métricas de performance editorial, social, SEO e conversão, com benchmarking e recomendações data-driven.',
        flow: [
          {
            step: 'Coleta de Dados',
            description:
              'Reunir dados de social_posts, seo_metrics, conversion_metrics, editions e engagement_log para o período analisado.',
            responsible: 'Content Analyzer',
          },
          {
            step: 'Consolidação',
            description:
              'Agregar dados por período, plataforma, formato e tipo de conteúdo. Calcular métricas derivadas.',
            responsible: 'Content Analyzer',
          },
          {
            step: 'Análise de Performance',
            description:
              'Identificar top/bottom performers, tendências de engajamento, padrões de formato e horário.',
            responsible: 'Content Analyzer / Fashion Trend Advisor',
          },
          {
            step: 'Benchmarking',
            description:
              'Comparar performance da revista com concorrentes do mesmo segmento e com dados históricos próprios.',
            responsible: 'Market Watch Agent',
          },
          {
            step: 'Geração de Insights',
            description:
              'Produzir recomendações acionáveis baseadas em dados: pautas, formatos, horários, CTAs.',
            responsible: 'Fashion Trend Advisor',
          },
          {
            step: 'Relatório',
            description:
              'Produzir relatório mensal com gráficos, rankings, comparativos e recomendações priorizadas.',
            responsible: 'Content Analyzer',
          },
          {
            step: 'Distribuição',
            description:
              'Compartilhar relatório com equipe editorial e comercial para informar decisões estratégicas.',
            responsible: 'Editor',
          },
        ],
        rules: [
          {
            rule: 'Relatório mensal',
            detail: 'Gerado até o dia 5 do mês seguinte. Cobertura completa do período anterior.',
          },
          {
            rule: 'Taxa de engajamento',
            detail:
              'Engagement Rate = (likes + comments + shares + saves) / views × 100. Meta: > 3%.',
          },
          {
            rule: 'Taxa de conversão',
            detail: 'Conversion Rate = orders / clicks × 100. Meta: > 2%. Overall: > 0.5%.',
          },
          {
            rule: 'Top performers',
            detail:
              'Definidos como top 20% por engagement_rate. Usar para informar pautas futuras.',
          },
          {
            rule: 'SEO metrics',
            detail: 'Tracking semanal de posicionamento. Relatório mensal completo com variação.',
          },
          {
            rule: 'Comparação',
            detail:
              'Sempre incluir comparação com período anterior e com concorrentes quando disponível.',
          },
          {
            rule: 'Recomendações',
            detail:
              'Baseadas em dados quantitativos, não subjetivas. Incluir métrica de suporte para cada recomendação.',
          },
        ],
        responsibilities: [
          {
            role: 'Content Analyzer',
            responsibilities: [
              'Analisar performance de social_posts',
              'Identificar padrões de engajamento',
              'Calcular métricas derivadas',
              'Produzir relatório mensal',
            ],
          },
          {
            role: 'Fashion Trend Advisor',
            responsibilities: [
              'Correlacionar tendências com performance',
              'Gerar insights acionáveis',
              'Recomendar pautas baseadas em dados',
            ],
          },
          {
            role: 'SEO Specialist',
            responsibilities: [
              'Rastrear posicionamento de keywords',
              'Produzir relatório SEO mensal',
              'Identificar oportunidades de conteúdo',
            ],
          },
          {
            role: 'Conversion Agent',
            responsibilities: [
              'Analisar funil de conversão',
              'Comparar variantes A/B de CTA',
              'Identificar gargalos',
            ],
          },
          {
            role: 'Market Watch Agent',
            responsibilities: [
              'Benchmark contra concorrentes',
              'Comparar engagement_rate e growth',
              'Identificar gaps competitivos',
            ],
          },
        ],
        related_agents: [
          {
            agent: 'social_analytics_recommendations',
            how: 'Hook que gera recomendações de horários e formatos baseadas em performance histórica.',
          },
          {
            agent: 'social_posts_compute',
            how: 'Hook que recalcula engagement_rate e is_top_performer para posts publicados.',
          },
          {
            agent: 'seo_optimize',
            how: 'Hook que otimiza conteúdo para SEO e sugere keywords.',
          },
          {
            agent: 'funil',
            how: 'Hook que analisa o funil completo: impressões → cliques → pedidos → conversion_rate.',
          },
          {
            agent: 'market_benchmarks',
            how: 'Hook que compara métricas da revista com concorrentes (engagement_rate, followers, post_frequency).',
          },
          {
            agent: 'market_watch_per_platform',
            how: 'Hook que agrega métricas de concorrentes por plataforma para benchmarking.',
          },
          {
            agent: 'Coleção: social_posts',
            how: 'Armazena views, likes, comments, shares, saves, engagement_rate, is_top_performer por post.',
          },
          {
            agent: 'Coleção: seo_metrics',
            how: 'Armazena keyword, position, search_volume, difficulty, clicks, impressions, ctr por keyword.',
          },
          {
            agent: 'Coleção: conversion_metrics',
            how: 'Armazena impressions, clicks, orders, conversion_rate, cta_variant, link_origin por conteúdo.',
          },
        ],
        body: 'GUIA DE ANÁLISE DE MÉTRICAS\n\nMÉTRICAS-CHAVE\n\nENGAJAMENTO SOCIAL\n- Engagement Rate = (likes + comments + shares + saves) / views × 100\n- Meta: > 3% (Instagram), > 2% (Facebook)\n- Top performers: Top 20% por engagement_rate\n\nCONVERSÃO\n- CTR (Click-Through Rate) = clicks / impressions × 100\n- Conversion Rate = orders / clicks × 100\n- Overall Conversion = orders / impressions × 100\n- Metas: CTR > 3%, Conversion > 2%, Overall > 0.5%\n\nSEO\n- Position: Posição no Google (menor = melhor)\n- Search Volume: Volume de buscas mensais\n- CTR: Click-through rate no Google\n- Metas: Top 10 para keywords principais, CTR > 3%\n\nAUDIÊNCIA\n- Crescimento de seguidores\n- Alcance por post\n- Demografia da audiência\n- Horários de maior atividade\n\nRELATÓRIO MENSAL (ATÉ DIA 5)\n\n1. SUMÁRIO EXECUTIVO\n- Principais destaques do mês\n- Variação vs mês anterior\n- Recomendações prioritárias\n\n2. PERFORMANCE SOCIAL\n- Top 5 posts por engagement_rate\n- Bottom 5 posts\n- Engajamento médio por formato (Reel, Carousel, Photo)\n- Engajamento por plataforma\n- Crescimento de seguidores\n\n3. FUNIL DE CONVERSÃO\n- Impressões → Cliques → Pedidos\n- Conversion rate por conteúdo\n- Performance por CTA variant\n- Performance por link_origin\n\n4. SEO\n- Keywords rastreadas\n- Variação de posicionamento\n- Cliques e impressões\n- Top páginas\n\n5. BENCHMARKING\n- Revista vs top 5 concorrentes\n- Engagement rate comparativo\n- Crescimento de seguidores\n- Frequência de posts\n\n6. RECOMENDAÇÕES\n- Pautas sugeridas baseadas em performance\n- Formatos a priorizar\n- Horários ótimos por plataforma\n- CTAs a testar\n- Keywords a focar\n\nCRITÉRIOS DE DECISÃO\n\n- Engagement rate < 1%: revisar formato e hook\n- Conversion rate < 0.5%: otimizar CTA ou reposicionar hotspot\n- SEO position > 20: revisar conteúdo on-page\n- Unsubscribe rate > 1%: reduzir frequência ou segmentar melhor\n- Follower growth < 1%/mês: revisar estratégia de conteúdo\n\nPERIODICIDADE\n- Social posts: análise semanal + relatório mensal\n- SEO metrics: tracking semanal + relatório mensal\n- Conversion: análise quinzenal + relatório mensal\n- Benchmarking: relatório mensal\n- Relatório consolidado: até dia 5 do mês seguinte',
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

    $ai.agents.putTools(app, 'social-engagement', [
      { collection: 'skills', perms: { read: true, list: true } },
      { collection: 'skills_tasks', perms: { read: true, list: true, create: true, update: true } },
    ])
    $ai.agents.putTools(app, 'market-watch', [
      { collection: 'skills', perms: { read: true, list: true } },
      { collection: 'skills_tasks', perms: { read: true, list: true, create: true, update: true } },
    ])
    $ai.agents.putTools(app, 'content-analyzer', [
      { collection: 'skills', perms: { read: true, list: true } },
      { collection: 'skills_tasks', perms: { read: true, list: true, create: true, update: true } },
    ])
    $ai.agents.putTools(app, 'fashion-trend-advisor', [
      { collection: 'skills', perms: { read: true, list: true } },
    ])
    $ai.agents.putTools(app, 'audience-nurture', [
      { collection: 'skills', perms: { read: true, list: true } },
      { collection: 'skills_tasks', perms: { read: true, list: true, create: true, update: true } },
    ])
  },
  (app) => {
    var slugs = ['atendimento-ao-anunciante', 'gestao-de-crise', 'analise-de-metricas']
    for (var i = 0; i < slugs.length; i++) {
      try {
        var rec = app.findFirstRecordByData('skills', 'slug', slugs[i])
        app.delete(rec)
      } catch (_) {}
    }
    $ai.agents.deleteTools(app, 'social-engagement', ['skills', 'skills_tasks'])
    $ai.agents.deleteTools(app, 'market-watch', ['skills', 'skills_tasks'])
    $ai.agents.deleteTools(app, 'content-analyzer', ['skills', 'skills_tasks'])
    $ai.agents.deleteTools(app, 'fashion-trend-advisor', ['skills'])
    $ai.agents.deleteTools(app, 'audience-nurture', ['skills', 'skills_tasks'])
  },
)
