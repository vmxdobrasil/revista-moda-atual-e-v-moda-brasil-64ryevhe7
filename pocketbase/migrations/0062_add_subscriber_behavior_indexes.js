migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('subscribers')
    col.addIndex('idx_subscribers_opened_count', false, 'opened_count', '')
    col.addIndex('idx_subscribers_clicked_count', false, 'clicked_count', '')
    col.addIndex('idx_subscribers_last_opened_at', false, 'last_opened_at', '')
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('subscribers')
    col.removeIndex('idx_subscribers_opened_count')
    col.removeIndex('idx_subscribers_clicked_count')
    col.removeIndex('idx_subscribers_last_opened_at')
    app.save(col)
  },
)
