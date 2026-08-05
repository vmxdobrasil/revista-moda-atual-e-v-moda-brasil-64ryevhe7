migrate(
  (app) => {
    $ai.agents.putTools(app, 'fashion-trend-advisor', [
      { collection: 'competitors', perms: { read: true, list: true } },
      { collection: 'market_signals', perms: { read: true, list: true } },
    ])
  },
  (app) => {
    $ai.agents.deleteTools(app, 'fashion-trend-advisor', ['competitors', 'market_signals'])
  },
)
