migrate(
  (app) => {
    const editions = app.findCollectionByNameOrId('editions')
    const pages = app.findCollectionByNameOrId('edition_pages')
    const hotspots = app.findCollectionByNameOrId('page_hotspots')

    try {
      app.findFirstRecordByData('editions', 'title', 'Edição 1: Outono Inverno')
      return
    } catch (_) {}

    const edition = new Record(editions)
    edition.set('title', 'Edição 1: Outono Inverno')
    edition.set(
      'description',
      'As principais tendências da moda atacadista para a estação mais fria do ano. Especial agasalhos e alfaiataria premium.',
    )
    edition.set(
      'cover_url',
      'https://img.usecurling.com/p/800/1124?q=fashion%20magazine%20cover&color=orange',
    )
    app.save(edition)

    const p0 = new Record(pages)
    p0.set('edition', edition.id)
    p0.set('page_number', 0)
    p0.set(
      'image_url',
      'https://img.usecurling.com/p/800/1124?q=fashion%20magazine%20cover&color=orange',
    )
    p0.set('toc_title', 'Capa')
    app.save(p0)

    const p1 = new Record(pages)
    p1.set('edition', edition.id)
    p1.set('page_number', 1)
    p1.set('image_url', 'https://img.usecurling.com/p/800/1124?q=fashion%20editorial&color=orange')
    p1.set('toc_title', 'Editorial')
    app.save(p1)

    const p2 = new Record(pages)
    p2.set('edition', edition.id)
    p2.set('page_number', 2)
    p2.set('image_url', 'https://img.usecurling.com/p/800/1124?q=fashion%20model&color=black')
    app.save(p2)

    const p3 = new Record(pages)
    p3.set('edition', edition.id)
    p3.set('page_number', 3)
    p3.set('image_url', 'https://img.usecurling.com/p/800/1124?q=fashion%20accessories')
    p3.set('toc_title', 'Acessórios')
    app.save(p3)

    const p4 = new Record(pages)
    p4.set('edition', edition.id)
    p4.set('page_number', 4)
    p4.set('image_url', 'https://img.usecurling.com/p/800/1124?q=runway%20fashion')
    app.save(p4)

    const p5 = new Record(pages)
    p5.set('edition', edition.id)
    p5.set('page_number', 5)
    p5.set('image_url', 'https://img.usecurling.com/p/800/1124?q=shoes')
    p5.set('toc_title', 'Calçados')
    app.save(p5)

    const p6 = new Record(pages)
    p6.set('edition', edition.id)
    p6.set('page_number', 6)
    p6.set('image_url', 'https://img.usecurling.com/p/800/1124?q=jeans%20fashion')
    p6.set('toc_title', 'Denim')
    app.save(p6)

    const h1 = new Record(hotspots)
    h1.set('page', p2.id)
    h1.set('x', 45)
    h1.set('y', 60)
    h1.set('title', 'Vestido Midi Alfaiataria')
    h1.set(
      'description',
      'Vestido em alfaiataria premium com cinto ajustável e fenda lateral. Perfeito para eventos corporativos e sociais.',
    )
    h1.set('price', 'R$ 189,90')
    h1.set('link', 'https://goskip.app')
    app.save(h1)

    const h2 = new Record(hotspots)
    h2.set('page', p3.id)
    h2.set('x', 70)
    h2.set('y', 40)
    h2.set('title', 'Bolsa Couro Croco')
    h2.set('description', 'Bolsa estruturada em couro legítimo com textura croco.')
    h2.set('price', 'R$ 349,00')
    h2.set('link', 'https://goskip.app')
    app.save(h2)
  },
  (app) => {
    const editions = app.findCollectionByNameOrId('editions')
    try {
      const records = app.findRecordsByFilter(
        'editions',
        "title = 'Edição 1: Outono Inverno'",
        '',
        1,
        0,
      )
      if (records.length > 0) app.delete(records[0])
    } catch (_) {}
  },
)
