migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('edition_pages')

    col.fields.removeByName('template')

    col.fields.add(
      new SelectField({
        name: 'template',
        maxSelect: 1,
        values: [
          'default',
          'editorial',
          'marketing',
          'holofote',
          'entrevista',
          'lookbook',
          'indice',
          'trend_report',
          'anuncio_patrocinado',
          'top60_marcas',
          'perfil_marca',
          'parceiro_anunciante',
          'galeria_produtos',
          'materia_cta',
          'comparativo_ab',
          'story_social',
          'newsletter_preview',
          'capa_edicao',
          'fashion_editorial',
          'coluna_holofote_evoluida',
          'coluna_marketing_moda',
        ],
      }),
    )

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('edition_pages')

    col.fields.removeByName('template')

    col.fields.add(
      new SelectField({
        name: 'template',
        maxSelect: 1,
        values: ['default', 'editorial', 'marketing', 'holofote', 'entrevista'],
      }),
    )

    app.save(col)
  },
)
