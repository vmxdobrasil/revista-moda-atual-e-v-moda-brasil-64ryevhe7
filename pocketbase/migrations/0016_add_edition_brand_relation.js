migrate(
  (app) => {
    const editionsCol = app.findCollectionByNameOrId('editions')
    const top60BrandsId = app.findCollectionByNameOrId('top60_brands').id

    if (!editionsCol.fields.getByName('brand')) {
      editionsCol.fields.add(
        new RelationField({
          name: 'brand',
          collectionId: top60BrandsId,
          maxSelect: 1,
        }),
      )
    }
    editionsCol.addIndex('idx_editions_brand', false, 'brand', '')
    app.save(editionsCol)

    const hotspotsCol = app.findCollectionByNameOrId('page_hotspots')
    const marketProductsId = app.findCollectionByNameOrId('marketplace_products').id

    if (!hotspotsCol.fields.getByName('product')) {
      hotspotsCol.fields.add(
        new RelationField({
          name: 'product',
          collectionId: marketProductsId,
          maxSelect: 1,
        }),
      )
    }
    app.save(hotspotsCol)
  },
  (app) => {
    const editionsCol = app.findCollectionByNameOrId('editions')
    const brandField = editionsCol.fields.getByName('brand')
    if (brandField) editionsCol.fields.remove(brandField)
    editionsCol.removeIndex('idx_editions_brand')
    app.save(editionsCol)

    const hotspotsCol = app.findCollectionByNameOrId('page_hotspots')
    const productField = hotspotsCol.fields.getByName('product')
    if (productField) hotspotsCol.fields.remove(productField)
    app.save(hotspotsCol)
  },
)
