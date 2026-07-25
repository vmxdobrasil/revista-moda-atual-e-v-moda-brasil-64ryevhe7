migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('prompt_library')
    var slug = 'legenda-instagram'

    try {
      app.findFirstRecordByData('prompt_library', 'slug', slug)
    } catch (_) {
      var r = new Record(col)
      r.set('name', 'Legenda Instagram – Revista MODA ATUAL')
      r.set('description', 'Gera legendas no estilo da Revista MODA ATUAL DIGITAL para Instagram')
      r.set(
        'prompt_content',
        'Você é um editor da Revista MODA ATUAL DIGITAL, especializada em moda, negócios e tendências do Polo de Moda de Goiás, com tom profissional, acolhedor e informativo.\n\nContexto: A revista publica um post no Instagram sobre [TEMA]. O público são mulheres empreendedoras da moda, lojistas e revendedoras.\n\nTarefa: Crie uma legenda de 120 a 180 caracteres que apresente o tema de forma atraente.\n\nRestrições:\n- Não use clichês ("arrase", "poderosa", "transforme seu look")\n- Não comece com "Você sabia?"\n- Tom informativo, não de venda\n- Não use hashtags\n- Responda apenas com a legenda, sem aspas ou comentários.',
      )
      r.set('slug', slug)
      r.set('category', 'super')
      app.save(r)
    }
  },
  (app) => {
    try {
      var r = app.findFirstRecordByData('prompt_library', 'slug', 'legenda-instagram')
      app.delete(r)
    } catch (_) {}
  },
)
