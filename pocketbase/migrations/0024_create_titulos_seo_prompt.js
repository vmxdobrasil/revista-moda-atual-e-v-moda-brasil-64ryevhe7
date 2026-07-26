migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('prompt_library')

    var titulosSeoPromptContent =
      '═══ PERSONA ═══\nJornalista especializado em SEO e moda.\n\n═══ CONTEXTO ═══\nProduzindo uma matéria para o site revistamodaatual.com.br sobre [TEMA].\n\n═══ TAREFA ═══\nCrie 5 opções de título para a matéria, cada uma com no máximo 60 caracteres.\n\n═══ FORMATO DA RESPOSTA ═══\nLista com 5 títulos numerados.\n\n═══ RESTRIÇÕES ═══\n- Títulos devem conter palavra-chave principal\n- Um título deve ser no formato "pergunta"\n- Um título deve conter número (ex: "5 tendências...")\n\n═══ VARIÁVEIS ═══\n[TEMA] = assunto principal da matéria'

    try {
      app.findFirstRecordByData('prompt_library', 'slug', 'titulos-seo')
    } catch (_) {
      var r = new Record(col)
      r.set('name', 'Títulos SEO')
      r.set('description', 'Gera 5 opções de título para matéria com SEO')
      r.set('prompt_content', titulosSeoPromptContent)
      r.set('slug', 'titulos-seo')
      r.set('category', 'super')
      app.save(r)
    }

    var legendaPromptContent =
      '═══ PERSONA ═══\nVocê é o editor de conteúdo da Revista MODA ATUAL DIGITAL, uma revista especializada em moda, negócios e tendências do Polo de Moda de Goiás. Tom profissional, acolhedor e informativo.\n\n═══ CONTEXTO ═══\nA revista publica um post no Instagram sobre [TEMA]. O público são mulheres empreendedoras da moda, lojistas e revendedoras.\n\n═══ TAREFA ═══\nCrie uma legenda para Instagram de 120 a 180 caracteres que apresente o tema de forma atraente.\n\n═══ FORMATO DA RESPOSTA ═══\nApenas a legenda, sem hashtags. Texto corrido.\n\n═══ RESTRIÇÕES ═══\n- Não use clichês como "arrase", "poderosa", "transforme seu look"\n- Não comece com "Você sabia?"\n- Tom informativo, não de venda\n\n═══ VARIÁVEIS ═══\n[TEMA] = assunto do post'

    try {
      var legendaRecord = app.findFirstRecordByData('prompt_library', 'slug', 'legenda-instagram')
      legendaRecord.set('prompt_content', legendaPromptContent)
      app.save(legendaRecord)
    } catch (_) {}
  },
  (app) => {
    try {
      var r = app.findFirstRecordByData('prompt_library', 'slug', 'titulos-seo')
      app.delete(r)
    } catch (_) {}
  },
)
