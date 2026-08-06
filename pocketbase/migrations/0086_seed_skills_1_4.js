migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('skills')

    var skills = [
      {
        title: 'Produção Editorial Completa',
        slug: 'producao-editorial-completa',
        category: 'producao_editorial',
        summary:
          'Fluxo ponta-a-ponta de produção editorial: pauta, pesquisa, redação, visual, revisão, aprovação e publicação.',
        flow: [
          {
            step: 'Pauta',
            description:
              'Definição do tema, ângulo editorial e formato (matéria, legenda, story, reel). Baseado em análise de engajamento e tendências.',
            responsible: 'Editor / Content Analyzer',
          },
          {
            step: 'Pesquisa',
            description:
              'Coleta de tendências, dados de mercado e referências visuais para enriquecer o conteúdo.',
            responsible: 'Trend Researcher',
          },
          {
            step: 'Redação',
            description:
              'Produção do texto no tom de voz da Revista MODA ATUAL, respeitando formato e padrões editoriais.',
            responsible: 'Copywriter',
          },
          {
            step: 'Visual',
            description:
              'Conceito visual, seleção de template, proposição de layout e direção de arte para capa se aplicável.',
            responsible: 'Visual Designer / Art Director',
          },
          {
            step: 'Revisão',
            description:
              'Verificação gramatical, factual, de tom de voz, consistência visual e presença de CTA.',
            responsible: 'Editorial QA',
          },
          {
            step: 'Aprovação',
            description:
              'Validação final pelo editor-chefe. Conteúdo só é publicado após aprovação explícita.',
            responsible: 'Editor-Chefe',
          },
          {
            step: 'Publicação',
            description:
              'Disponibilização na edição digital, agendamento nos canais sociais e registro no workflow_results.',
            responsible: 'Social Publisher',
          },
        ],
        rules: [
          {
            rule: 'Tom de voz',
            detail:
              'Todo conteúdo deve seguir o tom de voz da Revista MODA ATUAL: sofisticado, acessível e inspirador.',
          },
          {
            rule: 'Aprovação obrigatória',
            detail: 'Nenhum conteúdo é publicado sem aprovação do Editorial QA e do editor-chefe.',
          },
          {
            rule: 'Acessibilidade',
            detail: 'Imagens devem ter alt-text definido. Vídeos devem ter legendas.',
          },
          {
            rule: 'CTA',
            detail:
              'Todo conteúdo comercial deve incluir CTA claro (whatsapp, link de produto ou hotspot).',
          },
          {
            rule: 'Formato',
            detail:
              'Respeitar o template da edição. Matérias: mínimo 800 palavras. Legendas: máximo 2.200 caracteres.',
          },
          {
            rule: 'Consistência visual',
            detail: 'Paleta de cores e tipografia devem seguir o Design System da revista.',
          },
        ],
        responsibilities: [
          {
            role: 'Content Analyzer',
            responsibilities: [
              'Identificar temas de alto engajamento',
              'Analisar performance histórica de posts',
              'Sugerir pautas baseadas em dados',
            ],
          },
          {
            role: 'Trend Researcher',
            responsibilities: [
              'Validar tendências com dados',
              'Enriquecer briefings com inteligência de mercado',
              'Identificar ângulos inéditos',
            ],
          },
          {
            role: 'Copywriter',
            responsibilities: [
              'Produzir texto no tom da marca',
              'Adaptar formato conforme canal',
              'Garantir clareza e fluidez',
            ],
          },
          {
            role: 'Visual Designer',
            responsibilities: [
              'Propor conceitos visuais coerentes',
              'Selecionar templates apropriados',
              'Sugerir posicionamento de hotspots',
            ],
          },
          {
            role: 'Art Director',
            responsibilities: [
              'Aprovar capas e layouts',
              'Validar consistência visual',
              'Direcionar variações de capa',
            ],
          },
          {
            role: 'Editorial QA',
            responsibilities: [
              'Revisar gramática e ortografia',
              'Verificar precisão factual',
              'Validar tom de voz e formatação',
              'Confirmar presença de CTA',
            ],
          },
          {
            role: 'Social Publisher',
            responsibilities: [
              'Agendar publicação nos canais',
              'Definir horário ótimo por plataforma',
              'Registrar resultado no workflow_results',
            ],
          },
        ],
        related_agents: [
          {
            agent: 'content_workflow_orchestrator',
            how: 'Orquestra os 5 agentes especialistas (Content Analyzer, Trend Researcher, Copywriter, Visual Designer, Social Publisher) em sequência automatizada.',
          },
          {
            agent: 'generate_materia',
            how: 'Gera matérias jornalísticas completas a partir de um tema, integrando pesquisa e redação.',
          },
          {
            agent: 'editorial_qa_review',
            how: 'Executa a revisão de qualidade editorial verificando gramática, tom, precisão e coerência.',
          },
          {
            agent: 'cover_art_chat',
            how: 'Direção de arte interativa para capas e layouts editoriais.',
          },
          {
            agent: 'generate_caption',
            how: 'Gera legendas otimizadas para Instagram e outros canais.',
          },
          { agent: 'generate_reel', how: 'Gera roteiros e conceitos para Reels.' },
          {
            agent: 'Coleções: editions, edition_pages, workflow_results',
            how: 'Armazena edições, páginas e resultados de workflow para rastreabilidade completa.',
          },
        ],
        body: 'CHECKLIST DE QUALIDADE ANTES DA PUBLICAÇÃO\n\n1. GRAMÁTICA E ORTOGRAFIA\n- [ ] Texto revisado por Editorial QA\n- [ ] Sem erros de concordância ou digitação\n- [ ] Pontuação correta\n\n2. PRECISÃO FACTUAL\n- [ ] Dados e estatísticas verificados\n- [ ] Fontes citadas quando aplicável\n- [ ] Nomes de marcas escritos corretamente\n\n3. CONSISTÊNCIA VISUAL\n- [ ] Imagens seguem a paleta da revista\n- [ ] Tipografia respeita o Design System\n- [ ] Resolução mínima de 1080px para imagens\n- [ ] Alt-text definido em todas as imagens\n\n4. TOM DE VOZ DA MARCA\n- [ ] Linguagem sofisticada mas acessível\n- [ ] Voz ativa predominante\n- [ ] Sem jargão técnico excessivo\n- [ ] Alinhado com o público-alvo (varejistas e consumidoras)\n\n5. CTA (CALL TO ACTION)\n- [ ] CTA presente em conteúdo comercial\n- [ ] Link/hotspot funcionando\n- [ ] CTA claro e acionável\n\n6. FORMATAÇÃO\n- [ ] Respeita o template da edição\n- [ ] Espaçamento e hierarquia visuais corretos\n- [ ] Metadata SEO preenchida (se aplicável)\n\nPADRÕES POR FORMATO\n- Matéria: 800-2000 palavras, subtítulos, imagem de capa\n- Legenda Instagram: até 2200 caracteres, hook nos primeiros 125\n- Story: texto curto, fundo visual impactante\n- Reel: roteiro de 15-60s, hook nos primeiros 3 segundos\n- Editorial: texto jornalístico, citações, contexto de mercado',
        status: 'publicado',
      },
      {
        title: 'SEO On-Page',
        slug: 'seo-on-page',
        category: 'seo',
        summary:
          'Checklist de otimização SEO aplicado a todo conteúdo publicado: títulos, meta, headings, keywords e links internos.',
        flow: [
          {
            step: 'Pesquisa de Keywords',
            description:
              'Identificar palavra-chave principal e secundárias com base em volume de busca e dificuldade.',
            responsible: 'SEO Specialist',
          },
          {
            step: 'Otimização de Título',
            description:
              'Título com keyword principal nos primeiros 60 caracteres, irresistível para CTR.',
            responsible: 'SEO Specialist',
          },
          {
            step: 'Meta Description',
            description: 'Descrição de 150-160 caracteres com keyword e CTA implícito.',
            responsible: 'SEO Specialist',
          },
          {
            step: 'Estrutura de Headings',
            description: 'H1 único, H2 para seções, H3 para subseções. Keyword principal no H1.',
            responsible: 'Copywriter',
          },
          {
            step: 'Links Internos',
            description: 'Mínimo 2-3 links internos para edições/conteúdos relevantes.',
            responsible: 'Copywriter',
          },
          {
            step: 'Tracking',
            description: 'Registrar métricas em seo_metrics para acompanhamento de posicionamento.',
            responsible: 'SEO Specialist',
          },
        ],
        rules: [
          {
            rule: 'Keyword principal',
            detail: 'Uma keyword principal por conteúdo. Densidade entre 1% e 2.5%.',
          },
          {
            rule: 'Título SEO',
            detail:
              'Máximo 60 caracteres. Keyword nos primeiros 30. Incluir modificadores (guia, completo, 2025).',
          },
          {
            rule: 'Meta description',
            detail: '150-160 caracteres. Deve incluir keyword e gerar curiosidade/urgência.',
          },
          {
            rule: 'Headings',
            detail: 'Apenas um H1 por página. H2s devem incluir variações da keyword e LSI terms.',
          },
          {
            rule: 'Links internos',
            detail: 'Mínimo 2 links internos. Anchor text descritivo, não genérico.',
          },
          {
            rule: 'Imagens',
            detail:
              'Alt-text com keyword quando natural. Nome do arquivo descritivo. Compressão otimizada.',
          },
          { rule: 'URL/Slug', detail: 'Slug curto, com keyword principal, sem stop words.' },
        ],
        responsibilities: [
          {
            role: 'SEO Specialist',
            responsibilities: [
              'Pesquisar e definir keywords',
              'Otimizar títulos e meta descriptions',
              'Monitorar posicionamento',
              'Produzir relatórios mensais',
            ],
          },
          {
            role: 'Copywriter',
            responsibilities: [
              'Aplicar keyword naturalmente no texto',
              'Estruturar headings corretamente',
              'Incluir links internos relevantes',
            ],
          },
        ],
        related_agents: [
          {
            agent: 'seo_optimize',
            how: 'Hook que recebe conteúdo e retorna título SEO, meta description, sugestões de keywords e melhorias on-page.',
          },
          {
            agent: 'palavras_chave',
            how: 'Gera sugestões de keywords com base em volume de busca, dificuldade e relevância editorial.',
          },
          {
            agent: 'Coleção: seo_metrics',
            how: 'Armazena keyword, position, search_volume, difficulty, clicks, impressions e ctr para tracking contínuo.',
          },
          {
            agent: 'Campos SEO em editions',
            how: 'seo_title, seo_description, keywords, canonical_url, og_image_url — preenchidos em cada edição.',
          },
          {
            agent: 'Campos SEO em edition_pages',
            how: 'seo_title, seo_description, keywords, canonical_url, slug — preenchidos em cada página.',
          },
        ],
        body: 'CHECKLIST SEO ON-PAGE (APLICAR A TODO CONTEÚDO PUBLICADO)\n\n1. KEYWORD\n- [ ] Keyword principal definida (volume > 100, dificuldade < 50)\n- [ ] 3-5 keywords secundárias/LSI identificadas\n- [ ] Densidade entre 1% e 2.5%\n\n2. TÍTULO (TITLE TAG)\n- [ ] Máximo 60 caracteres\n- [ ] Keyword principal nos primeiros 30 caracteres\n- [ ] Inclui modificador (guia, completo, melhor, 2025)\n- [ ] Gera curiosidade/urgência\n\n3. META DESCRIPTION\n- [ ] 150-160 caracteres\n- [ ] Inclui keyword principal\n- [ ] CTA implícito (descubra, confira, veja)\n- [ ] Não duplica o título\n\n4. HEADINGS\n- [ ] Apenas 1 H1 (com keyword principal)\n- [ ] 3-5 H2s (com variações/LSI)\n- [ ] H3s para detalhamento\n- [ ] Hierarquia sequencial (sem pular níveis)\n\n5. LINKS INTERNOS\n- [ ] Mínimo 2 links internos\n- [ ] Anchor text descritivo (não "clique aqui")\n- [ ] Links para conteúdo relacionado relevante\n\n6. IMAGENS\n- [ ] Alt-text em todas as imagens\n- [ ] Nome do arquivo descritivo (keyword.jpg)\n- [ ] Imagem comprimida (< 200KB)\n\n7. URL/SLUG\n- [ ] Curto e descritivo\n- [ ] Contém keyword principal\n- [ ] Sem stop words (de, a, o, em)\n\nPADRÕES DE DENSIDADE POR TIPO EDITORIAL\n- Matéria: 1.5% a 2.5% (texto longo)\n- Legenda: 1% a 1.5% (texto curto)\n- Página de edição: foco em keyword de marca\n- Página de produto: keyword transacional',
        status: 'publicado',
      },
      {
        title: 'Distribuição Multicanal',
        slug: 'distribuicao-multicanal',
        category: 'distribuicao',
        summary:
          'Regras de agendamento, horários ótimos e fluxo de aprovação para distribuição em Instagram, Facebook, YouTube e WhatsApp.',
        flow: [
          {
            step: 'Conteúdo Pronto',
            description: 'Conteúdo aprovado pelo Editorial QA e pronto para distribuição.',
            responsible: 'Editorial QA',
          },
          {
            step: 'Seleção de Canal',
            description:
              'Definir canais e formatos adequados (Reel, Carousel, Photo, Story) por plataforma.',
            responsible: 'Social Publisher',
          },
          {
            step: 'Agendamento',
            description:
              'Definir data/hora de publicação baseado em horários ótimos por audiência.',
            responsible: 'Social Publisher',
          },
          {
            step: 'Aprovação',
            description: 'Editor aprova o agendamento antes da publicação efetiva.',
            responsible: 'Editor',
          },
          {
            step: 'Publicação',
            description: 'Publicação automática ou manual nos canais selecionados.',
            responsible: 'Social Publisher',
          },
          {
            step: 'Monitoramento',
            description:
              'Acompanhar métricas (views, likes, comments, engagement_rate) pós-publicação.',
            responsible: 'Social Publisher',
          },
        ],
        rules: [
          {
            rule: 'Aprovação prévia',
            detail:
              'Nenhum item é agendado sem aprovação do editor. Status deve passar por: pending → scheduled → published.',
          },
          {
            rule: 'Horário ótimo Instagram',
            detail: 'Varejo: 11h-13h e 19h-21h (seg-sex). Consumidora: 12h-14h e 20h-22h.',
          },
          {
            rule: 'Horário ótimo YouTube',
            detail: 'Quinta ou sexta, 14h-16h. Conteúdo longo (> 5min) performa melhor.',
          },
          {
            rule: 'Horário ótimo WhatsApp',
            detail: 'Manhã (8h-10h) para ofertas. Tarde (15h-17h) para conteúdo editorial.',
          },
          {
            rule: 'Frequência',
            detail:
              'Instagram: 1 post/dia (máx 2). Stories: 3-5/dia. YouTube: 1-2/semana. WhatsApp: 1/dia (máx).',
          },
          {
            rule: 'Cross-posting',
            detail:
              'Conteúdo deve ser adaptado por canal, não simplesmente replicado. Proporções e formatos diferem.',
          },
          {
            rule: 'Status tracking',
            detail:
              'Todo post deve ter status, scheduled_at e published_at preenchidos para rastreabilidade.',
          },
        ],
        responsibilities: [
          {
            role: 'Social Publisher',
            responsibilities: [
              'Selecionar canais e formatos',
              'Definir horários ótimos',
              'Agendar publicações',
              'Monitorar métricas pós-publicação',
            ],
          },
          {
            role: 'Editor',
            responsibilities: [
              'Aprovar agendamentos',
              'Validar adaptação por canal',
              'Priorizar conteúdo sazonal',
            ],
          },
        ],
        related_agents: [
          {
            agent: 'social_publish_agendar',
            how: 'Hook que agenda posts definindo scheduled_at e alterando status para "scheduled".',
          },
          {
            agent: 'social_publish_publicar',
            how: 'Hook que executa a publicação efetiva, preenchendo published_at e alterando status para "published".',
          },
          {
            agent: 'social_analytics_recommendations',
            how: 'Gera recomendações de horários e formatos baseadas em performance histórica.',
          },
          {
            agent: 'social_posts_compute',
            how: 'Recalcula engagement_rate e is_top_performer para posts publicados.',
          },
          {
            agent: 'Coleção: social_posts',
            how: 'Armazena hook, format, platform, status, scheduled_at, published_at, views, likes, comments, shares, saves e engagement_rate.',
          },
        ],
        body: 'GUIA DE DISTRIBUIÇÃO MULTICANAL\n\nHORÁRIOS ÓTIMOS POR CANAL E SEGMENTO\n\nInstagram:\n- Varejo (B2B): Seg-Sex 11h-13h, 19h-21h\n- Consumidora (B2C): Seg-Sex 12h-14h, 20h-22h\n- Finais de semana: Sábado 10h-12h\n\nYouTube:\n- Melhores dias: Quinta e Sexta\n- Horário: 14h-16h\n- Conteúdo longo (> 5min) tem melhor retenção\n\nWhatsApp:\n- Ofertas: 8h-10h (manhã)\n- Conteúdo editorial: 15h-17h (tarde)\n- Evitar: finais de semana (baixo engajamento)\n\nFacebook:\n- Seg-Qua: 13h-15h\n- Conteúdo visual (Carousel) performa melhor\n\nFLUXO DE APROVAÇÃO\n1. Social Publisher cria o post (status: pending)\n2. Define scheduled_at e platform\n3. Editor revisa e aprova (status: scheduled)\n4. Hook social_publish_publicar executa na data (status: published)\n5. social_posts_compute recalcula métricas\n\nADAPTAÇÃO POR CANAL\n- Instagram Reel: 9:16, 15-60s, hook em 3s\n- Instagram Carousel: 1080x1080, 5-10 slides\n- Instagram Photo: 4:5 ou 1:1, legenda até 2200 chars\n- YouTube: 16:9, min. 1080p, descrição rica\n- WhatsApp: imagem + texto curto, link direto',
        status: 'publicado',
      },
      {
        title: 'Nutrição de Audiência',
        slug: 'nutricao-de-audiencia',
        category: 'nutricao',
        summary:
          'Segmentação, criação de newsletter, fluxo de envio e critérios de retenção e reengajamento por segmento.',
        flow: [
          {
            step: 'Segmentação',
            description:
              'Filtrar assinantes por segmento (varejo, atacado, consumidora), interesses e score de engajamento.',
            responsible: 'Audience Nurture Agent',
          },
          {
            step: 'Criação de Conteúdo',
            description:
              'Gerar newsletter via IA baseada em edições recentes, produtos e interesses do segmento.',
            responsible: 'Audience Nurture Agent',
          },
          {
            step: 'Revisão',
            description: 'Revisar subject, preheader e conteúdo antes do agendamento.',
            responsible: 'Editor',
          },
          {
            step: 'Agendamento',
            description: 'Definir data de envio e segmentos alvo. Status passa para "agendado".',
            responsible: 'Editor',
          },
          {
            step: 'Envio',
            description:
              'Disparo da newsletter para os assinantes segmentados. Status passa para "enviado".',
            responsible: 'Sistema',
          },
          {
            step: 'Métricas',
            description:
              'Acompanhar open_rate, click_rate e unsubscribe_count. Atualizar scores dos assinantes.',
            responsible: 'Audience Nurture Agent',
          },
        ],
        rules: [
          {
            rule: 'Segmentação obrigatória',
            detail:
              'Toda newsletter deve ter pelo menos um segmento definido. Nunca enviar para a base inteira sem segmentação.',
          },
          {
            rule: 'Subject line',
            detail: 'Máximo 60 caracteres. Personalizar por segmento quando possível.',
          },
          {
            rule: 'Preheader',
            detail: 'Máximo 100 caracteres. Complementar o subject, não repetir.',
          },
          {
            rule: 'Frequência',
            detail:
              'Varejo: 1x/semana. Consumidora: 2x/mês. Atacado: 1x/mês. Não exceder para evitar unsubscribes.',
          },
          {
            rule: 'Reengajamento',
            detail:
              'Assinantes com opened_count = 0 nos últimos 30 dias recebem sequência de reengajamento.',
          },
          {
            rule: 'Descadastro',
            detail:
              'Todo e-mail deve incluir link de descadastro. Status do assinante muda para "descadastrado".',
          },
          {
            rule: 'Score de engajamento',
            detail:
              'Score (0-100) recalculado a cada envio baseado em aberturas, cliques e recência.',
          },
        ],
        responsibilities: [
          {
            role: 'Audience Nurture Agent',
            responsibilities: [
              'Segmentar audiência',
              'Gerar conteúdo de newsletter',
              'Calcular scores de engajamento',
              'Recomendar edições para newsletter',
            ],
          },
          {
            role: 'Editor',
            responsibilities: [
              'Revisar conteúdo gerado',
              'Aprovar envio',
              'Definir frequência e segmentos',
            ],
          },
        ],
        related_agents: [
          {
            agent: 'newsletter_generate',
            how: 'Hook que gera conteúdo editorial de newsletter via IA, baseado em edição específica ou semana atual.',
          },
          {
            agent: 'segmentar',
            how: 'Hook que filtra assinantes por segmento, interesses, comportamento e enriquece scores com dados sociais.',
          },
          {
            agent: 'Coleção: subscribers',
            how: 'Armazena name, email, segment, interests, engagement_score, opened_count, clicked_count, status e last_opened_at.',
          },
          {
            agent: 'Coleção: newsletter_campaigns',
            how: 'Armazena title, subject, preheader, content, segments, audience_size, status, open_rate, click_rate e unsubscribe_count.',
          },
          {
            agent: 'Coleção: newsletter_sequences',
            how: 'Armazena sequências de nutrição automatizadas com trigger, steps e status.',
          },
        ],
        body: 'GUIA DE NUTRIÇÃO DE AUDIÊNCIA\n\nSEGMENTAÇÃO POR PÚBLICO\n\nVarejo (B2B):\n- Conteúdo: tendências de atacado, coleções, dados de mercado\n- Frequência: 1x/semana\n- Horário: terça 10h\n- Tom: profissional, dados-driven\n\nConsumidora (B2C):\n- Conteúdo: looks, dicas de moda, inspiração\n- Frequência: 2x/mês\n- Horário: quinta 19h\n- Tom: inspiracional, acessível\n\nAtacado:\n- Conteúdo: oportunidades de negócio, condições especiais\n- Frequência: 1x/mês\n- Horário: quarta 14h\n- Tom: comercial, direto\n\nFLUXO DE NEWSLETTER\n1. Segmentar audiência via /segmentar\n2. Gerar conteúdo via /newsletter\n3. Criar campanha em newsletter_campaigns (status: rascunho)\n4. Revisar e aprovar (status: aprovado)\n5. Agendar (status: agendado)\n6. Enviar (status: enviado)\n7. Acompanhar open_rate e click_rate\n\nCRITÉRIOS DE RETENÇÃO\n- Score ≥ 70: Alta engajamento — manter frequência\n- Score 35-69: Média — testar conteúdo personalizado\n- Score < 35: Baixa — sequência de reengajamento\n\nSEQUÊNCIA DE REENGAJAMENTO\n- Dia 1: "Sentimos sua falta" + conteúdo top\n- Dia 7: Oferta exclusiva\n- Dia 14: Última chance + survey de preferências\n- Dia 21: Se sem abertura, marcar como "inativo"\n\nMÉTRICAS-ALVO\n- Open rate: > 25%\n- Click rate: > 3%\n- Unsubscribe rate: < 1%',
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
      'producao-editorial-completa',
      'seo-on-page',
      'distribuicao-multicanal',
      'nutricao-de-audiencia',
    ]
    for (var i = 0; i < slugs.length; i++) {
      try {
        var rec = app.findFirstRecordByData('skills', 'slug', slugs[i])
        app.delete(rec)
      } catch (_) {}
    }
  },
)
