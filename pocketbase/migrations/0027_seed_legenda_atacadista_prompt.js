migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('prompt_library')
    var slug = 'legenda-atacadista'

    try {
      app.findFirstRecordByData('prompt_library', 'slug', slug)
    } catch (_) {
      var r = new Record(col)
      r.set('name', 'Legenda Atacadista')
      r.set(
        'description',
        'Gera legenda para Instagram de marcas atacadistas do Polo de Moda de Goiás, com CTA e link para V MODA BRASIL.',
      )
      r.set(
        'prompt_content',
        '═══ PERSONA ═══\nRedatora publicitária especializada em moda atacadista.\n\n═══ CONTEXTO ═══\nA revista está divulgando a marca [NOME DA MARCA], fabricante de [PRODUTO] do Polo de Moda de Goiás.\n\n═══ TAREFA ═══\nCrie legenda para Instagram (até 200 caracteres) apresentando a marca e convidando para ver o catálogo.\n\n═══ FORMATO DA RESPOSTA ═══\n- Legenda principal\n- 3 hashtags sugeridas\n\n═══ RESTRIÇÕES ═══\n- Incluir "VEJA O CATÁLOGO" como CTA\n- Link para o perfil da marca no V MODA BRASIL\n- Tom editorial, não de venda agressiva\n\n═══ VARIÁVEIS ═══\n[NOME DA MARCA], [PRODUTO]',
      )
      r.set('slug', slug)
      r.set('category', 'super')
      app.save(r)
    }
  },
  (app) => {
    try {
      var r = app.findFirstRecordByData('prompt_library', 'slug', 'legenda-atacadista')
      app.delete(r)
    } catch (_) {}
  },
)
