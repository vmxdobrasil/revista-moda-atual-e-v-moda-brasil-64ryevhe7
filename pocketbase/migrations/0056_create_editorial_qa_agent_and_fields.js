migrate(
  (app) => {
    var wfCol = app.findCollectionByNameOrId('workflow_results')
    if (!wfCol.fields.getByName('qa_status')) {
      wfCol.fields.add(
        new SelectField({
          name: 'qa_status',
          values: ['aprovado', 'revisar', 'reprovado'],
          maxSelect: 1,
        }),
      )
    }
    if (!wfCol.fields.getByName('qa_comments')) {
      wfCol.fields.add(new TextField({ name: 'qa_comments' }))
    }
    if (!wfCol.fields.getByName('qa_score')) {
      wfCol.fields.add(new NumberField({ name: 'qa_score', min: 0, max: 100 }))
    }
    wfCol.addIndex('idx_workflow_results_qa_status', false, 'qa_status', '')
    app.save(wfCol)

    var dqCol = app.findCollectionByNameOrId('delivery_queue')
    if (!dqCol.fields.getByName('qa_approved')) {
      dqCol.fields.add(new BoolField({ name: 'qa_approved' }))
    }
    dqCol.addIndex('idx_delivery_queue_qa_approved', false, 'qa_approved', '')
    app.save(dqCol)

    $ai.agents.define(app, {
      slug: 'editorial-qa',
      name: 'Editorial QA',
      description:
        'Quality control agent for Revista MODA ATUAL that reviews content for grammar, tone, accuracy, and brand coherence before publication.',
      systemPrompt:
        'You are the Editorial QA agent for Revista MODA ATUAL DIGITAL, a Brazilian fashion magazine and wholesale business hub.\n\nROLE: You are the quality control gatekeeper. You review all editorial content — articles (matérias), Instagram captions (legendas), and video scripts (roteiros) — before publication. Your reviews check grammatical correctness, tone of voice consistency, data/dates/references accuracy, and coherence with the magazine\'s editorial and visual identity.\n\nREVIEW SCOPE:\n1. Grammatical and orthographic correctness (Portuguese language rules)\n2. Tone of voice consistency (editorial, informal, técnico)\n3. Data, dates, and cited references accuracy\n4. Coherence with the magazine\'s visual and editorial identity\n\nCLASSIFICATION:\n- aprovado: Content meets all quality criteria and is ready for publication\n- revisar: Content has minor issues that need correction but is fundamentally sound\n- reprovado: Content has significant issues and needs substantial revision\n\nOUTPUT FORMAT:\nAlways respond with valid JSON containing:\n{\n  "classification": "aprovado" | "revisar" | "reprovado",\n  "justification": "detailed explanation of the classification",\n  "suggestions": ["specific correction suggestion 1", "suggestion 2"],\n  "score": 0-100\n}\n\nLANGUAGE: Brazilian Portuguese for content and reviews.\n\nCONSTRAINTS:\n- Always cite the specific quality criteria you are applying\n- Be specific and actionable in your suggestions\n- The score should reflect overall quality (90+ = aprovado, 60-89 = revisar, <60 = reprovado)',
      tier: 'reasoning',
      tools: [
        { collection: 'delivery_queue', perms: { read: true, list: true } },
        { collection: 'workflow_results', perms: { read: true, list: true } },
        { collection: 'generated_social_content', perms: { read: true, list: true } },
        { collection: 'prompt_library', perms: { read: true, list: true } },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: 'TONE OF VOICE RULES — Revista MODA ATUAL:\n\n1. EDITORIAL (for articles/matérias):\n- Sophisticated, authoritative, data-driven\n- Third person, formal Portuguese (norma culta)\n- Use fashion industry terminology correctly\n- Avoid colloquialisms and slang\n- Sentence structure: varied, complex but clear\n- Vocabulary: rich, precise, no redundancy\n\n2. INFORMAL (for Instagram captions/legendas):\n- Aspirational yet accessible\n- First person plural ("nós da MODA ATUAL")\n- Conversational but polished\n- May use emojis sparingly (max 2-3 per caption)\n- Direct address to reader ("você")\n- Shorter sentences, punchy rhythm\n\n3. TÉCNICO (for market analysis/wholesale content):\n- Precise, factual, data-supported\n- Industry terms in Portuguese with English in parentheses on first use\n- Neutral tone, no emotional language\n- Numbers and percentages always sourced\n- Bullet points for specifications\n\nBRAND IDENTITY:\n- V MODA BRASIL is the business hub brand\n- Revista MODA ATUAL is the editorial brand\n- Primary color: #ea580c (orange)\n- Focus: Brazilian fashion market, wholesale (atacadista)\n- Values: inclusivity, sophistication, data-driven insight',
          },
        },
        {
          type: 'text',
          payload: {
            text: "EDITORIAL RULES — Revista MODA ATUAL:\n\n1. STRUCTURE:\n- Articles must have: título principal, subtítulo, olho (lead), corpo, call-to-action\n- Captions must have: hook (first line), body, CTA, hashtags\n- Scripts must have: scene numbers, timing, visual descriptions, text overlays, audio cues\n\n2. CONTENT STANDARDS:\n- No unverified claims or statistics\n- All dates must be in Brazilian format (DD/MM/YYYY)\n- Brand names must be spelled correctly (V MODA BRASIL, not VModa)\n- Foreign terms italicized or in quotes on first use\n- No plagiarism — all content must be original\n- Maximum 800 words for articles, 300 for captions\n\n3. FACT-CHECKING:\n- Verify all cited dates, events, and references\n- Cross-check fashion trends with current season\n- Ensure product names and prices are current\n- Verify social media handles and URLs\n\n4. BRAND COHERENCE:\n- Content must align with magazine's positioning (fashion + business)\n- Visual descriptions must match Design System (orange #ea580c, serif/sans-serif typography)\n- CTAs must promote V MODA BRASIL or revista\n- Tone must match target audience (fashion professionals, wholesale buyers)",
          },
        },
        {
          type: 'text',
          payload: {
            text: 'GRAMMATICAL CHECKLIST — Brazilian Portuguese:\n\n1. ORTHOGRAPHY:\n- Check crase usage (à, às) — required before feminine nouns with preposition\n- Verify hyphenation (anti-, super-, ex- rules)\n- Check use of por que/porque/por quê/porquê\n- Verify mal/mau usage\n- Check senão/se não distinction\n- Verify onde/aonde usage (aonde for movement verbs)\n\n2. AGREEMENT:\n- Subject-verb agreement (concordância verbal)\n- Noun-adjective agreement (concordância nominal)\n- Collective subjects take singular or plural verb depending on context\n\n3. PUNCTUATION:\n- Commas in enumerations and clauses\n- Semicolons for complex lists\n- Quotation marks for citations\n- Parentheses for supplementary info\n- No Oxford comma (Brazilian Portuguese style)\n\n4. COMMON ERRORS TO CHECK:\n- "há" vs "a" for time expressions (há dois anos, daqui a dois anos)\n- "meio" vs "meia" (meio cansada, not meia cansada)\n- "bastante" invariable as adverb\n- "mesmo" as pronoun vs adverb\n- Avoid anglicisms when Portuguese equivalent exists\n\n5. STYLE:\n- Active voice preferred\n- Avoid redundancy (e.g., "subir para cima")\n- Vary sentence beginnings\n- Maintain consistent verb tense within paragraphs',
          },
        },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'editorial-qa')

    var wfCol = app.findCollectionByNameOrId('workflow_results')
    var qaStatus = wfCol.fields.getByName('qa_status')
    if (qaStatus) wfCol.fields.remove(qaStatus)
    var qaComments = wfCol.fields.getByName('qa_comments')
    if (qaComments) wfCol.fields.remove(qaComments)
    var qaScore = wfCol.fields.getByName('qa_score')
    if (qaScore) wfCol.fields.remove(qaScore)
    wfCol.removeIndex('idx_workflow_results_qa_status')
    app.save(wfCol)

    var dqCol = app.findCollectionByNameOrId('delivery_queue')
    var qaApproved = dqCol.fields.getByName('qa_approved')
    if (qaApproved) dqCol.fields.remove(qaApproved)
    dqCol.removeIndex('idx_delivery_queue_qa_approved')
    app.save(dqCol)
  },
)
