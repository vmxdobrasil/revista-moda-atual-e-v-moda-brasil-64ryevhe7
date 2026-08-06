/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.putTools(app, 'editorial-qa', [
      { collection: 'skills', perms: { read: true, list: true } },
      { collection: 'skills_tasks', perms: { read: true, list: true, create: true, update: true } },
    ])
    $ai.agents.putTools(app, 'social-publisher', [
      { collection: 'skills', perms: { read: true, list: true } },
      { collection: 'skills_tasks', perms: { read: true, list: true, create: true, update: true } },
    ])
    $ai.agents.putTools(app, 'content-chain', [
      { collection: 'skills', perms: { read: true, list: true } },
    ])
    $ai.agents.putTools(app, 'conversion', [
      { collection: 'skills', perms: { read: true, list: true } },
    ])
  },
  (app) => {
    $ai.agents.deleteTools(app, 'editorial-qa', ['skills', 'skills_tasks'])
    $ai.agents.deleteTools(app, 'social-publisher', ['skills', 'skills_tasks'])
    $ai.agents.deleteTools(app, 'content-chain', ['skills'])
    $ai.agents.deleteTools(app, 'conversion', ['skills'])
  },
)
