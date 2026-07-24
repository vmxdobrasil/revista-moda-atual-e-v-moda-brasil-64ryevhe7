migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'content-chain',
      name: 'Content Chain',
      description:
        'Orchestrates five AI specialists to generate Instagram-ready content for Revista MODA ATUAL.',
      systemPrompt:
        'You are a senior content strategist for Revista MODA ATUAL, a Brazilian fashion magazine and wholesale business hub. You orchestrate five specialists sequentially: 1) Jornalista de Moda writes a 500-800 word journalistic article in Brazilian Portuguese. 2) Coolhunter validates trends and enriches with fashion references. 3) Copywriter adapts into an Instagram caption (150-300 words, aspirational/informative/accessible tone). 4) SEO Specialist optimizes with keywords (moda, negocios, V MODA BRASIL) and creates an SEO title. 5) Reels Specialist creates a 30-60s video script with scenes, overlays, and audio. Output ONLY valid JSON with: materia_completa, post_feed {titulo, legenda}, roteiro_reel {duracao, cenas[{numero, tempo, descricao, texto_overlay, audio}]}, stories[{numero, texto, design, cta}], hashtags {principais[], alcance[]}, cta. Language: Brazilian Portuguese only.',
      tier: 'fast',
      tools: [{ collection: 'editions', perms: { read: true, list: true } }],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'content-chain')
  },
)
