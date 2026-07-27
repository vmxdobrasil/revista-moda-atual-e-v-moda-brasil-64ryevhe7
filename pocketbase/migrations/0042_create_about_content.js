migrate(
  (app) => {
    const col = new Collection({
      name: 'about_content',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(col)

    var record
    try {
      record = app.findFirstRecordByData('about_content', 'title', 'Nossa História')
    } catch (_) {
      record = new Record(col)
    }
    record.set('title', 'Nossa História')
    record.set(
      'body',
      'A Revista MODA ATUAL DIGITAL nasceu da paixão pela moda e do desejo de conectar o Polo de Moda de Goiás ao resto do Brasil. Fundada por visionários que acreditam no poder transformador da moda, a revista se consolidou como uma plataforma de referência para mulheres empreendedoras, lojistas e revendedoras.\n\nNossa missão é informar, inspirar e fortalecer o ecossistema da moda brasileira, destacando tendências, histórias de sucesso e oportunidades de negócio. Acreditamos que a moda vai muito além de roupas — ela é expressão, cultura e economia.\n\nO V MODA BRASIL é o braço de negócios da nossa marca, um hub que conecta marcas, fornecedores e consumidores do mercado atacadista brasileiro. Através de parcerias estratégicas, eventos e conteúdo editorial de qualidade, promovemos o crescimento sustentável do setor.\n\nNossa equipe editorial é formada por especialistas em jornalismo de moda, coolhunting e marketing digital, que trabalham em conjunto para entregar conteúdo relevante e de alta qualidade. Estamos comprometidos com a inovação, a criatividade e a valorização da produção local.\n\nJunte-se a nós nessa jornada de moda, negócios e transformação.',
    )
    app.save(record)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('about_content'))
    } catch (_) {}
  },
)
