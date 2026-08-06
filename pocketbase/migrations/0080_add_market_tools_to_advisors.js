/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.putTools(app, 'fashion-trend-advisor', [
      { collection: 'competitors', perms: { list: true, read: true }, actAs: 'admin' },
      { collection: 'market_signals', perms: { list: true, read: true }, actAs: 'admin' },
    ])
    $ai.agents.putTools(app, 'trend-researcher', [
      { collection: 'competitors', perms: { list: true, read: true }, actAs: 'admin' },
      { collection: 'market_signals', perms: { list: true, read: true }, actAs: 'admin' },
    ])
  },
  (app) => {
    $ai.agents.deleteTools(app, 'fashion-trend-advisor', ['competitors', 'market_signals'])
    $ai.agents.deleteTools(app, 'trend-researcher', ['competitors', 'market_signals'])
  },
)
