migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('market_signals')
    col.addIndex('idx_market_signals_competitor', false, 'competitor', '')
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('market_signals')
    col.removeIndex('idx_market_signals_competitor')
    app.save(col)
  },
)
