migrate(
  (app) => {
    const prodCol = new Collection({
      name: 'marketplace_products',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'number', required: true },
        { name: 'currency', type: 'text' },
        {
          name: 'image_file',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'category', type: 'text' },
        { name: 'vendor', type: 'text' },
        { name: 'featured', type: 'bool' },
        { name: 'link', type: 'url' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_marketplace_products_cat ON marketplace_products (category)'],
    })
    app.save(prodCol)
    const prodId = app.findCollectionByNameOrId('marketplace_products').id

    const orderCol = new Collection({
      name: 'marketplace_orders',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'product', type: 'relation', required: true, collectionId: prodId, maxSelect: 1 },
        { name: 'customer_name', type: 'text', required: true },
        { name: 'customer_email', type: 'email', required: true },
        { name: 'quantity', type: 'number', required: true, min: 1 },
        { name: 'total', type: 'number', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_marketplace_orders_status ON marketplace_orders (status)'],
    })
    app.save(orderCol)

    const products = [
      [
        'Vestido Midi Floral',
        'Vestido midi com estampa floral, tecido viscolinho',
        89.9,
        'Moda Festa',
        'Lumina Festas',
        true,
        '',
      ],
      [
        'Calça Jeans Skinny Premium',
        'Calça jeans skinny com elastano premium',
        129.9,
        'Jeanswear',
        'Denim Soul',
        false,
        '',
      ],
      [
        'Blazer Alfaiataria Feminino',
        'Blazer de alfaiataria com forração interna',
        199.9,
        'Alfaiataria',
        'Vértice',
        true,
        '',
      ],
      [
        'Camiseta Básica Algodão',
        'Camiseta 100% algodão pima, várias cores',
        39.9,
        'Casual Chic',
        'Aura Confecções',
        false,
        '',
      ],
      [
        'Legging Fitness High Waist',
        'Legging com cintura alta e compressão',
        79.9,
        'Fitness',
        'Move Fit',
        true,
        '',
      ],
      [
        'Conjunto Lingerie Renda',
        'Conjunto de lingerie em renda francesa',
        69.9,
        'Lingerie',
        'Essência',
        false,
        '',
      ],
      [
        'Biquíni Triângulo',
        'Biquíni triângulo com bojo removível',
        89.9,
        'Praia',
        'Solaris',
        false,
        '',
      ],
      [
        'Bolsa Couro Legítimo',
        'Bolsa estruturada em couro legítimo',
        249.9,
        'Acessórios',
        'Kroma',
        true,
        '',
      ],
      [
        'Sandália Salto Bloco',
        'Sandália com salto bloco confortável',
        159.9,
        'Calçados',
        'Passos',
        false,
        '',
      ],
      ['Cardigan Tricô Lã', 'Cardigan em tricô de lã merino', 119.9, 'Tricô', 'Trama', false, ''],
      [
        'Vestido Infantil Flores',
        'Vestido infantil com estampa de flores',
        49.9,
        'Infantil',
        'Pequeno Mundo',
        false,
        '',
      ],
      [
        'Vestido Plus Size Elegante',
        'Vestido plus size com caimento perfeito',
        109.9,
        'Plus Size',
        'Formas Reais',
        true,
        '',
      ],
    ]

    for (const [name, desc, price, cat, vendor, featured, link] of products) {
      try {
        app.findFirstRecordByData('marketplace_products', 'name', name)
        continue
      } catch (_) {}
      const col = app.findCollectionByNameOrId('marketplace_products')
      const r = new Record(col)
      r.set('name', name)
      r.set('description', desc)
      r.set('price', price)
      r.set('currency', 'BRL')
      r.set('category', cat)
      r.set('vendor', vendor)
      r.set('featured', featured)
      r.set('link', link || '')
      app.save(r)
    }

    const prodMap = {}
    for (const [name] of products) {
      try {
        prodMap[name] = app.findFirstRecordByData('marketplace_products', 'name', name).id
      } catch (_) {}
    }

    const orders = [
      ['Vestido Midi Floral', 'Maria Silva', 'maria.silva@email.com', 2, 179.8, 'confirmed'],
      ['Calça Jeans Skinny Premium', 'João Santos', 'joao.santos@email.com', 1, 129.9, 'pending'],
      ['Blazer Alfaiataria Feminino', 'Ana Costa', 'ana.costa@email.com', 3, 599.7, 'shipped'],
      [
        'Legging Fitness High Waist',
        'Carlos Oliveira',
        'carlos.oliveira@email.com',
        2,
        159.8,
        'delivered',
      ],
      ['Bolsa Couro Legítimo', 'Patricia Lima', 'patricia.lima@email.com', 1, 249.9, 'pending'],
      ['Cardigan Tricô Lã', 'Fernanda Souza', 'fernanda.souza@email.com', 2, 239.8, 'confirmed'],
      [
        'Vestido Plus Size Elegante',
        'Roberta Alves',
        'roberta.alves@email.com',
        1,
        109.9,
        'cancelled',
      ],
      [
        'Camiseta Básica Algodão',
        'Pedro Henrique',
        'pedro.henrique@email.com',
        5,
        199.5,
        'delivered',
      ],
    ]

    for (const [pname, cname, cemail, qty, total, status] of orders) {
      const col = app.findCollectionByNameOrId('marketplace_orders')
      const r = new Record(col)
      r.set('product', prodMap[pname])
      r.set('customer_name', cname)
      r.set('customer_email', cemail)
      r.set('quantity', qty)
      r.set('total', total)
      r.set('status', status)
      app.save(r)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('marketplace_orders'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('marketplace_products'))
    } catch (_) {}
  },
)
