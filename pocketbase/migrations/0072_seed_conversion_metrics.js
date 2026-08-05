migrate(
  (app) => {
    try {
      var existing = app.findRecordsByFilter('conversion_metrics', '', '', 1, 0)
      if (existing.length > 0) return
    } catch (_) {
      return
    }

    var col = app.findCollectionByNameOrId('conversion_metrics')

    var records = [
      ['c1', 'Tendências Inverno 2026', 'materia', '2026-07', 5200, 780, 42, 'A', 'revista'],
      ['c2', 'Tendências Inverno 2026', 'materia', '2026-07', 4800, 920, 58, 'B', 'hotspot'],
      ['c3', 'Top 10 Jeanswear', 'materia', '2026-07', 6100, 610, 28, 'A', 'revista'],
      ['c4', 'Lookbook Verão', 'banner', '2026-06', 3200, 480, 19, 'B', 'hotspot'],
      ['c5', 'Guia de Estilo Plus Size', 'materia', '2026-06', 2100, 380, 31, 'C', 'whatsapp'],
      ['c6', 'Legenda: Arrase no Inverno', 'legenda', '2026-07', 4500, 540, 22, 'A', 'revista'],
      ['c7', 'Story: Coleção Cápsula', 'story', '2026-06', 3800, 680, 45, 'B', 'whatsapp'],
      ['c8', 'Banner: Mega Liquidação', 'banner', '2026-07', 7800, 390, 12, 'A', 'revista'],
      ['c9', 'Hotspot: Bolsa Couro', 'hotspot', '2026-07', 2900, 580, 38, 'B', 'hotspot'],
      ['c10', 'Materia: Alfaiataria 2026', 'materia', '2026-05', 5500, 715, 36, 'A', 'revista'],
      ['c11', 'Legenda: Tendência Postal', 'legenda', '2026-06', 1800, 320, 24, 'C', 'whatsapp'],
      ['c12', 'Story: Backstage Editorial', 'story', '2026-05', 4100, 450, 18, 'A', 'hotspot'],
      ['c13', 'Banner: Frete Grátis', 'banner', '2026-06', 6200, 870, 41, 'B', 'revista'],
      ['c14', 'Hotspot: Calça Jeans', 'hotspot', '2026-07', 2400, 430, 29, 'C', 'whatsapp'],
      [
        'c15',
        'Materia: Acessórios que Transformam',
        'materia',
        '2026-05',
        3700,
        520,
        27,
        'B',
        'hotspot',
      ],
    ]

    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      var rec = new Record(col)
      rec.set('content_id', r[0])
      rec.set('content_title', r[1])
      rec.set('content_type', r[2])
      rec.set('period', r[3])
      rec.set('impressions', r[4])
      rec.set('clicks', r[5])
      rec.set('orders', r[6])
      var cr = r[4] > 0 ? Math.round((r[6] / r[4]) * 10000) / 100 : 0
      rec.set('conversion_rate', cr)
      rec.set('cta_variant', r[7])
      rec.set('link_origin', r[8])
      app.save(rec)
    }
  },
  (app) => {
    try {
      app.truncateCollection(app.findCollectionByNameOrId('conversion_metrics'))
    } catch (_) {}
  },
)
