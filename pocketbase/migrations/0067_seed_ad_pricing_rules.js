migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('ad_pricing_rules')

    var defaultReach = { divisor: 10000, max_addition: 2 }
    var defaultPosition = { premium: 1.3, standard: 1.0, bottom: 0.8 }

    var seeds = [
      { format: 'banner', base_price: 1500 },
      { format: 'story', base_price: 3000 },
      { format: 'pagina_inteira', base_price: 4500 },
      { format: 'editorial_destaque', base_price: 5500 },
      { format: 'sponsored_content', base_price: 6000 },
      { format: 'capa', base_price: 8000 },
    ]

    for (var i = 0; i < seeds.length; i++) {
      var s = seeds[i]
      try {
        app.findFirstRecordByData('ad_pricing_rules', 'format', s.format)
      } catch (_) {
        var rec = new Record(col)
        rec.set('format', s.format)
        rec.set('base_price', s.base_price)
        rec.set('reach_multiplier', defaultReach)
        rec.set('position_multiplier', defaultPosition)
        rec.set('active', true)
        app.save(rec)
      }
    }
  },
  (app) => {
    try {
      app.truncateCollection(app.findCollectionByNameOrId('ad_pricing_rules'))
    } catch (_) {}
  },
)
