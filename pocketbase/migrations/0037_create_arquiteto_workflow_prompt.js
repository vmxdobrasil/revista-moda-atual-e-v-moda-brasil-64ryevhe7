migrate(
  (app) => {
    var slug = 'arquiteto-workflow'

    try {
      app.findFirstRecordByData('prompt_library', 'slug', slug)
    } catch (_) {
      var col = app.findCollectionByNameOrId('prompt_library')
      var r = new Record(col)
      r.set('name', 'Arquiteto de Workflow')
      r.set(
        'description',
        'Prompt para projetar workflows de IA com múltiplas etapas encadeadas para a Revista MODA ATUAL DIGITAL',
      )
      r.set('slug', slug)
      r.set('category', 'super')
      r.set(
        'prompt_content',
        '═══ PERSONA ═══\nArquiteto de sistemas de IA especializado em automação de conteúdo editorial e marketing digital.\n\n═══ CONTEXTO ═══\nPreciso criar um workflow que conecte múltiplos prompts em sequência para produzir [ENTREGA FINAL] para a Revista MODA ATUAL DIGITAL.\n\n═══ TAREFA ═══\nProjete um workflow de N etapas, onde cada etapa usa o output da etapa anterior como input.\n\n═══ FORMATO DA RESPOSTA ═══\nWORKFLOW: [NOME DO WORKFLOW]\nENTREGA FINAL: [DESCRIÇÃO]\nETAPAS:\n1. [NOME ETAPA 1]\n   Prompt: [prompt ou super prompt a ser usado]\n   Input: [o que entra]\n   Output: [o que sai]\n2. [NOME ETAPA 2]\n   Prompt: [prompt ou super prompt]\n   Input: [output da etapa 1]\n   Output: [o que sai]\n...(N etapas)\nTEMPO ESTIMADO: [tempo de execução humana vs. IA]\n\n═══ RESTRIÇÕES ═══\n- Máximo de 7 etapas por workflow\n- Cada etapa deve ter exatamente 1 input e 1 output\n- Encadeamento lógico e sequencial\n\n═══ VARIÁVEIS ═══\n[ENTREGA FINAL] = o que se quer produzir\n[N] = número de etapas',
      )
      app.save(r)
    }
  },
  (app) => {
    try {
      var r = app.findFirstRecordByData('prompt_library', 'slug', 'arquiteto-workflow')
      app.delete(r)
    } catch (_) {}
  },
)
