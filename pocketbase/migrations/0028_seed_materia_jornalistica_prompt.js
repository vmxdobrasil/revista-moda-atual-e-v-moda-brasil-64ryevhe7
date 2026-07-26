migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('prompt_library')
    var slug = 'materia-jornalistica'

    try {
      app.findFirstRecordByData('prompt_library', 'slug', slug)
    } catch (_) {
      var r = new Record(col)
      r.set('name', 'Matéria Jornalística')
      r.set(
        'description',
        'Gera uma matéria jornalística completa e otimizada para SEO para o site da Revista MODA ATUAL DIGITAL.',
      )
      r.set('slug', slug)
      r.set('category', 'super')
      r.set(
        'prompt_content',
        '═══ PERSONA ═══\nVocê é um repórter de moda, coolhunter, especialista em SEO e revisor, com profundo conhecimento do Polo de Moda de Goiás e do mercado fashion brasileiro.\n\n═══ CONTEXTO ═══\nA Revista MODA ATUAL DIGITAL vai publicar uma matéria sobre [TEMA] no site revistamodaatual.com.br. O público é composto por mulheres empreendedoras da moda, lojistas, revendedoras e profissionais do setor.\n\n═══ TAREFA ═══\nEscreva uma matéria jornalística completa, estruturada e otimizada para SEO, com no máximo 800 palavras no corpo.\n\n═══ FORMATO DA RESPOSTA ═══\nUse EXATAMENTE os marcadores abaixo, cada um em uma linha própria, seguido do conteúdo:\n\nTÍTULO PRINCIPAL: [título SEO, máximo 60 caracteres]\nSUBTÍTULO: [subtítulo descritivo, máximo 100 caracteres]\nOLHO: [frase de impacto ou jogo de palavras, 1-2 linhas]\nCORPO DA MATÉRIA:\n[introdução de 2-3 parágrafos]\n[intertítulo 1]\n[desenvolvimento]\n[intertítulo 2]\n[desenvolvimento]\n[intertítulo 3]\n[desenvolvimento]\n[citação no formato: "Texto da citação" — NOME (cargo), cidade/estado]\n[intertítulo 4 - opcional]\n[desenvolvimento]\nCALL TO ACTION (2 opções):\n1. [primeira opção de CTA]\n2. [segunda opção de CTA]\nTAGS DE SEO (5 a 8 tags):\n[tag1, tag2, tag3, tag4, tag5, ...]\nSUGESTÃO DE REDES SOCIAIS:\nTexto Instagram: [legenda para Instagram]\nSugestão de arte: [descrição da imagem/arte sugerida]\n\n═══ RESTRIÇÕES ═══\n- Tom jornalístico, profissional e informativo\n- Citar fontes e especialistas quando relevante\n- Usar formato "[MARCA] ([cidade/estado])" ao mencionar empresas\n- Máximo 800 palavras no corpo da matéria\n- Incluir pelo menos um dado ou estatística relevante\n- Otimizar título para SEO com palavra-chave principal\n- Não usar clichês como "arrase", "poderosa", "transforme seu look"\n\n═══ EXEMPLO ═══\nTÍTULO PRINCIPAL: Tendências de Moda Verão 2026: Cores que vão dominar a estação\nSUBTÍTULO: Especialistas apontam tons terrosos e vibrantes como apostas do Polo de Moda de Goiás\nOLHO: O verão 2026 chega com paleta que mistura terra e fogo\nCORPO DA MATÉRIA:\nO verão 2026 promete...\n[intertítulo 1]\n...\nCALL TO ACTION (2 opções):\n1. Leia a matéria completa no site da Revista MODA ATUAL\n2. Compartilhe com quem ama moda\nTAGS DE SEO (5 a 8 tags):\nmoda verão 2026, tendências, polo de moda goiás, cores, fashion\nSUGESTÃO DE REDES SOCIAIS:\nTexto Instagram: O verão 2026 chegou com tudo! 🔥 Descubra as cores que vão dominar a estação\nSugestão de arte: Foto de modelo vestindo look com paleta terrosa\n\n═══ VARIÁVEIS ═══\n[TEMA] = assunto da matéria',
      )
      app.save(r)
    }
  },
  (app) => {
    try {
      var r = app.findFirstRecordByData('prompt_library', 'slug', 'materia-jornalistica')
      app.delete(r)
    } catch (_) {}
  },
)
