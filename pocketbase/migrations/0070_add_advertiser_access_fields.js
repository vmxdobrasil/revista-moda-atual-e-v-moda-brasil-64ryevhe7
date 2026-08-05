migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('ad_proposals')

    if (!col.fields.getByName('advertiser_email')) {
      col.fields.add(new EmailField({ name: 'advertiser_email' }))
    }
    if (!col.fields.getByName('access_token')) {
      col.fields.add(new TextField({ name: 'access_token' }))
    }

    col.addIndex('idx_ad_proposals_access_token', false, 'access_token', '')

    app.save(col)

    var proposals = []
    try {
      proposals = app.findRecordsByFilter('ad_proposals', '', '-created', 0, 0)
    } catch (_) {}

    var sampleEmails = [
      'contato@lojadatendencia.com.br',
      'marketing@fitnessboutique.com.br',
      'comercial@beautyconcept.com.br',
      'parceria@glamfashion.com.br',
      'ads@urbanstyle.com.br',
    ]

    for (var i = 0; i < proposals.length; i++) {
      var p = proposals[i]
      if (!p.getString('advertiser_email')) {
        p.set('advertiser_email', sampleEmails[i % sampleEmails.length])
        app.saveNoValidate(p)
      }
    }
  },
  (app) => {
    var col = app.findCollectionByNameOrId('ad_proposals')
    col.removeIndex('idx_ad_proposals_access_token')
    app.save(col)
  },
)
