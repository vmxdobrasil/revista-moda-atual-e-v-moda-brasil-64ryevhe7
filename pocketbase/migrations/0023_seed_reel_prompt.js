migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('prompt_library')
    var slug = 'reel'

    try {
      app.findFirstRecordByData('prompt_library', 'slug', slug)
    } catch (_) {
      var r = new Record(col)
      r.set('name', 'Roteiro de Reel')
      r.set('description', 'Gera um roteiro curto para Instagram Reel com base no tema informado.')
      r.set(
        'prompt_content',
        '═══ PERSONA ═══\nRoteirista especialista em vídeo curto para Instagram Reels, com foco em moda e tendências do Polo de Moda de Goiás. Tom profissional, dinâmico e criativo.\n\n═══ CONTEXTO ═══\nA Revista MODA ATUAL DIGITAL vai produzir um Reel de 30 segundos sobre [TEMA]. O público são mulheres empreendedoras da moda, lojistas e revendedoras.\n\n═══ TAREFA ═══\nCrie 3 opções de roteiro curto para Instagram Reel, cada uma com estrutura de gancho, desenvolvimento e call-to-action.\n\n═══ FORMATO DA RESPOSTA ═══\nOpção 1: [roteiro completo]\nOpção 2: [roteiro completo]\nOpção 3: [roteiro completo]\n\n═══ RESTRIÇÕES ═══\n- Cada roteiro deve ter no máximo 60 palavras\n- Não use clichês ("arrase", "poderosa", "transforme seu look")\n- Tom informativo e inspirador, não de venda agressiva\n- Inclua indicação de cena/visual quando relevante\n\n═══ EXEMPLO (opcional) ═══\nOpção 1: [Gancho] Cores que vão dominar o verão 2026... [Desenvolvimento] Tons terrosos em alta, do bege ao terracota. [CTA] Salve este Reel para seu próximo look!\n\n═══ VARIÁVEIS ═══\n[TEMA] = tema do Reel',
      )
      r.set('slug', slug)
      r.set('category', 'super')
      app.save(r)
    }
  },
  (app) => {
    try {
      var r = app.findFirstRecordByData('prompt_library', 'slug', 'reel')
      app.delete(r)
    } catch (_) {}
  },
)
