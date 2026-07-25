migrate(
  (app) => {
    const catCol = new Collection({
      name: 'top60_categories',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'order', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_top60_categories_slug ON top60_categories (slug)'],
    })
    app.save(catCol)
    const catId = app.findCollectionByNameOrId('top60_categories').id

    const brandCol = new Collection({
      name: 'top60_brands',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'category', type: 'relation', required: true, collectionId: catId, maxSelect: 1 },
        { name: 'position', type: 'number', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'logo_file',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'website', type: 'url' },
        { name: 'social_handle', type: 'text' },
        { name: 'score', type: 'number' },
        { name: 'previous_position', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_top60_brands_cat_pos ON top60_brands (category, position)',
      ],
    })
    app.save(brandCol)

    const catData = [
      ['Moda Festa', 'moda-festa', 1],
      ['Jeanswear', 'jeanswear', 2],
      ['Alfaiataria', 'alfaiataria', 3],
      ['Casual Chic', 'casual-chic', 4],
      ['Fitness', 'fitness', 5],
      ['Lingerie', 'lingerie', 6],
      ['Praia', 'praia', 7],
      ['Acessórios', 'acessorios', 8],
      ['Calçados', 'calcados', 9],
      ['Tricô', 'trico', 10],
      ['Infantil', 'infantil', 11],
      ['Plus Size', 'plus-size', 12],
    ]
    const catMap = {}
    for (const [name, slug, order] of catData) {
      try {
        app.findFirstRecordByData('top60_categories', 'slug', slug)
      } catch (_) {
        const col = app.findCollectionByNameOrId('top60_categories')
        const r = new Record(col)
        r.set('name', name)
        r.set('slug', slug)
        r.set('order', order)
        app.save(r)
      }
      catMap[slug] = app.findFirstRecordByData('top60_categories', 'slug', slug).id
    }

    const b = [
      ['Lumina Festas', 'moda-festa', 1, 'Vestidos de festa premium', 98.5, 2],
      ['Aurora Dress', 'moda-festa', 2, 'Alta costura feminina', 96.2, 1],
      ['Bella Notte', 'moda-festa', 3, 'Festas e eventos especiais', 94.0, 3],
      ['Divina Moda', 'moda-festa', 4, 'Vestidos de gala', 92.1, null],
      ['Estrela Dourada', 'moda-festa', 5, 'Brilho e sofisticação', 90.5, 6],
      ['Glamour PU', 'moda-festa', 6, 'Moda festa plus size', 88.0, 5],
      ['Denim Soul', 'jeanswear', 1, 'Jeans premium brasileiro', 97.3, 1],
      ['Jeans BR', 'jeanswear', 2, 'Calças e jaquetas denim', 95.0, 3],
      ['Trama Jeans', 'jeanswear', 3, 'Design contemporâneo', 93.5, 2],
      ['Urbano Denim', 'jeanswear', 4, 'Streetwear denim', 91.0, 4],
      ['Força Jeans', 'jeanswear', 5, 'Resistência e estilo', 89.2, null],
      ['Expresso Jeans', 'jeanswear', 6, 'Moda jovem denim', 87.5, 5],
      ['Vértice', 'alfaiataria', 1, 'Alfaiataria executiva', 96.8, 1],
      ['Linho & Co', 'alfaiataria', 2, 'Peças em linho premium', 94.5, 2],
      ['Moda Social', 'alfaiataria', 3, 'Trajes sociais femininos', 92.0, 4],
      ['Elegância BR', 'alfaiataria', 4, 'Camisas e ternos', 90.0, 3],
      ['Social Prime', 'alfaiataria', 5, 'Costura artesanal', 88.5, 5],
      ['Aura Confecções', 'casual-chic', 1, 'Casual elegante feminino', 95.0, 1],
      ['Dia a Dia', 'casual-chic', 2, 'Roupas para o dia a dia', 93.2, 2],
      ['Conforto & Estilo', 'casual-chic', 3, 'Moda confortável', 91.0, 3],
      ['Casual BR', 'casual-chic', 4, 'Estilo brasileiro casual', 89.5, null],
      ['Leveza', 'casual-chic', 5, 'Tecidos leves e fluidos', 87.8, 4],
      ['Move Fit', 'fitness', 1, 'Roupas fitness premium', 94.5, 2],
      ['Active BR', 'fitness', 2, 'Moda esportiva nacional', 92.8, 1],
      ['Energia Fitness', 'fitness', 3, 'Performance e estilo', 90.5, 3],
      ['Flex Activ', 'fitness', 4, 'Flexibilidade total', 88.0, 5],
      ['Corpo em Movimento', 'fitness', 5, 'Atividade física com conforto', 86.5, 4],
      ['Essência', 'lingerie', 1, 'Lingerie premium', 93.5, 1],
      ['Delicatta', 'lingerie', 2, 'Renda e delicadeza', 91.8, 2],
      ['Pura Lingerie', 'lingerie', 3, 'Conforto íntimo', 89.0, 4],
      ['Sensualle', 'lingerie', 4, 'Sensualidade e elegância', 87.5, 3],
      ['Íntima Brasil', 'lingerie', 5, 'Moda íntima brasileira', 85.0, 5],
      ['Solaris', 'praia', 1, 'Moda praia premium', 92.0, 1],
      ['Maré Alta', 'praia', 2, 'Biquínis e maiôs', 90.5, 2],
      ['Costa Brasilis', 'praia', 3, 'Beachwear brasileiro', 88.0, 3],
      ['Praia & Sol', 'praia', 4, 'Resort wear', 86.5, null],
      ['Ondas', 'praia', 5, 'Estilo surf chic', 84.0, 4],
      ['Kroma', 'acessorios', 1, 'Acessórios premium', 91.5, 1],
      ['Adornos BR', 'acessorios', 2, 'Bolsas e cintos', 89.8, 2],
      ['Acessoria', 'acessorios', 3, 'Acessórios femininos', 87.0, 3],
      ['Detalhe & Cia', 'acessorios', 4, 'Bijuterias finas', 85.5, 5],
      ['Prime Acessórios', 'acessorios', 5, 'Acessórios executivos', 83.0, 4],
      ['Passos', 'calcados', 1, 'Calçados premium', 90.5, 1],
      ['Estrada Real', 'calcados', 2, 'Sapatos em couro', 88.8, 3],
      ['Calçar BR', 'calcados', 3, 'Calçados femininos', 86.5, 2],
      ['Passarela', 'calcados', 4, 'Sapatos de festa', 84.0, 4],
      ['Solas & Couros', 'calcados', 5, 'Artesanal em couro', 82.5, 5],
      ['Trama', 'trico', 1, 'Tricôs e crochês premium', 89.5, 1],
      ['Fios & Magia', 'trico', 2, 'Tricô artesanal', 87.0, 2],
      ['Lã & Arte', 'trico', 3, 'Peças em lã', 85.0, 3],
      ['Tricô Brasil', 'trico', 4, 'Moda inverno nacional', 83.5, null],
      ['Tear', 'trico', 5, 'Tecelagem manual', 81.0, 4],
      ['Pequeno Mundo', 'infantil', 1, 'Moda infantil premium', 88.0, 1],
      ['Kids BR', 'infantil', 2, 'Roupas infantis nacionais', 86.5, 2],
      ['Criança Moda', 'infantil', 3, 'Estilo e conforto infantil', 84.0, 3],
      ['Anjo Guarda', 'infantil', 4, 'Moda bebê e kids', 82.5, 5],
      ['Brincar', 'infantil', 5, 'Roupas para brincar', 80.0, 4],
      ['Formas Reais', 'plus-size', 1, 'Moda plus size premium', 87.5, 1],
      ['Curvas BR', 'plus-size', 2, 'Estilo para todas as curvas', 85.8, 2],
      ['Geração Plus', 'plus-size', 3, 'Moda jovem plus size', 83.0, 4],
      ['Tamanho Real', 'plus-size', 4, 'Elegância em todos os tamanhos', 81.5, 3],
      ['Mais de Você', 'plus-size', 5, 'Confiança e estilo', 79.0, 5],
    ]

    for (const [name, catSlug, pos, desc, score, prevPos] of b) {
      try {
        app.findFirstRecordByData('top60_brands', 'name', name)
        continue
      } catch (_) {}
      const col = app.findCollectionByNameOrId('top60_brands')
      const r = new Record(col)
      r.set('name', name)
      r.set('category', catMap[catSlug])
      r.set('position', pos)
      r.set('description', desc)
      r.set('score', score)
      if (prevPos !== null) r.set('previous_position', prevPos)
      app.save(r)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('top60_brands'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('top60_categories'))
    } catch (_) {}
  },
)
