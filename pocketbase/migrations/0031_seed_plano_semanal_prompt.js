migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('prompt_library')
    var slug = 'plano-semanal'

    try {
      app.findFirstRecordByData('prompt_library', 'slug', slug)
    } catch (_) {
      var r = new Record(col)
      r.set('name', 'Plano de Conteúdo Semanal')
      r.set(
        'description',
        'Gera um plano de conteúdo semanal integrado para Instagram, YouTube e TikTok com datas e temas definidos',
      )
      r.set('slug', slug)
      r.set('category', 'super')
      r.set(
        'prompt_content',
        '═══ PERSONA ═══\nVocê é uma estrategista de conteúdo digital especializada em moda e negócios, com profundo conhecimento do Polo de Moda de Goiás e do mercado fashion brasileiro. Domina planejamento multiplataforma (Instagram, YouTube, TikTok) com foco em engajamento, conversão e construção de marca.\n\n═══ CONTEXTO ═══\nA Revista MODA ATUAL DIGITAL precisa planejar a semana de [DATA_INÍCIO] a [DATA_FIM]. Temas em pauta: [TEMA1], [TEMA2], [TEMA3]. O público é composto por mulheres empreendedoras da moda, lojistas, revendedoras e profissionais do setor.\n\n═══ TAREFA ═══\nCrie um plano de conteúdo semanal integrado para Instagram, YouTube e TikTok, cobrindo todos os dias de segunda-feira a domingo, com o balanceamento correto de tipos de conteúdo, CTAs e canais de distribuição.\n\n═══ FORMATO DA RESPOSTA ═══\nUse EXATAMENTE os marcadores abaixo, cada um em uma linha própria, seguido do conteúdo:\n\nSEGUNDA-FEIRA:\n- Feed Instagram: [sim/não] — [tipo: informativo/educativo/entretenimento/venda] — [descrição do post]\n- Stories (quantidade): [número de 2 a 5] — [breve descrição de cada story]\n- Reels: [sim/não] — [descrição do roteiro]\n- YouTube: [sim/não] — [título do vídeo]\n- TikTok: [sim/não] — [descrição]\n- CTA: [call to action do dia, ex: "VEJA O CATÁLOGO" ou outro]\n\nTERÇA-FEIRA:\n[mesma estrutura]\n\nQUARTA-FEIRA:\n[mesma estrutura]\n\nQUINTA-FEIRA:\n[mesma estrutura]\n\nSEXTA-FEIRA:\n[mesma estrutura]\n\nSÁBADO:\n[mesma estrutura]\n\nDOMINGO:\n[mesma estrutura]\n\nRESUMO SEMANAL:\n- Total de posts no feed: [número]\n- Total de stories: [número]\n- Total de Reels: [número]\n- Posts com link V MODA BRASIL: [número]\n- Posts de venda/publicidade: [número]\n- Posts informativos: [número]\n- Posts educativos: [número]\n- Posts de entretenimento: [número]\n- Distribuição por plataforma: Instagram [n], YouTube [n], TikTok [n]\n\n═══ RESTRIÇÕES ═══\n- Máximo de 3 posts no feed por dia\n- Mínimo de 2 stories por dia\n- Pelo menos 1 Reels durante a semana\n- Pelo menos 3 posts devem conter o CTA "VEJA O CATÁLOGO"\n- O conteúdo deve ser distribuído entre os tipos: informativo, educativo, entretenimento e venda\n- Não usar clichês como "arrase", "poderosa", "transforme seu look"\n- Tom profissional, acolhedor e informativo\n- Incluir o link para o V MODA BRASIL quando o post for de venda\n- Cada dia deve ter pelo menos um tipo de conteúdo diferente\n\n═══ VARIÁVEIS ═══\n[DATA_INÍCIO] = data de início da semana (ex: 01/07/2026)\n[DATA_FIM] = data de fim da semana (ex: 07/07/2026)\n[TEMA1] = primeiro tema da semana\n[TEMA2] = segundo tema da semana\n[TEMA3] = terceiro tema da semana',
      )
      app.save(r)
    }
  },
  (app) => {
    try {
      var r = app.findFirstRecordByData('prompt_library', 'slug', 'plano-semanal')
      app.delete(r)
    } catch (_) {}
  },
)
