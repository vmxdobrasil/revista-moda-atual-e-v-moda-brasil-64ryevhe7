migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('social_posts')

    if (!col.fields.getByName('scheduled_at')) {
      col.fields.add(new DateField({ name: 'scheduled_at' }))
    }
    if (!col.fields.getByName('published_at')) {
      col.fields.add(new DateField({ name: 'published_at' }))
    }
    if (!col.fields.getByName('platform')) {
      col.fields.add(
        new SelectField({
          name: 'platform',
          values: ['instagram', 'facebook', 'youtube', 'whatsapp'],
          maxSelect: 1,
        }),
      )
    }
    if (!col.fields.getByName('status')) {
      col.fields.add(
        new SelectField({
          name: 'status',
          values: ['pending', 'scheduled', 'published', 'failed'],
          maxSelect: 1,
        }),
      )
    }

    col.addIndex('idx_social_posts_scheduled_at', false, 'scheduled_at', '')
    col.addIndex('idx_social_posts_status', false, 'status', '')
    col.addIndex('idx_social_posts_platform', false, 'platform', '')
    app.save(col)

    $ai.agents.define(app, {
      slug: 'social-publisher',
      name: 'Social Publisher',
      description:
        'AI agent that recommends optimal posting times and schedules content across social media channels.',
      systemPrompt: [
        'You are the Social Publisher agent for Revista MODA ATUAL DIGITAL, a Brazilian fashion magazine.',
        '',
        'ROLE: You recommend optimal posting times and help schedule content across social media channels (Instagram, Facebook, YouTube, WhatsApp).',
        '',
        'RESPONSIBILITIES:',
        '- Recommend best posting times based on platform, content type, and audience behavior',
        '- Consider Brazilian timezone (BRT/BRST, UTC-3)',
        '- Factor in content format (Reel, Carousel, Photo, Story)',
        '- Provide rationale for each recommendation',
        '',
        'BEST PRACTICES BY PLATFORM:',
        '- Instagram: Best times 11h-13h and 19h-21h on weekdays; Reels perform best 12h-14h',
        '- Facebook: Best times 9h-11h and 14h-16h on weekdays',
        '- YouTube: Best times 14h-16h on weekdays, 10h-12h on weekends',
        '- WhatsApp: Best times 8h-10h and 18h-20h on weekdays',
        '',
        'LANGUAGE: Brazilian Portuguese for content, English for technical terms.',
        '',
        'FORMAT: When asked for time recommendations, return ONLY valid JSON:',
        '{"time": "YYYY-MM-DD HH:MM", "rationale": "breve explicacao em portugues"}',
      ].join('\n'),
      tier: 'fast',
      tools: [
        {
          collection: 'social_posts',
          perms: { read: true, list: true, create: true, update: true },
        },
        { collection: 'generated_social_content', perms: { read: true, list: true } },
        { collection: 'delivery_queue', perms: { read: true, list: true } },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: [
              'BEST POSTING TIMES — Brazilian audience (UTC-3):',
              'Instagram: Mon-Fri 11h-13h, 19h-21h; Reels 12h-14h; Stories 8h-10h, 18h-20h',
              'Facebook: Mon-Fri 9h-11h, 14h-16h; Sun 12h-14h',
              'YouTube: Thu-Sun 14h-16h; Sat 10h-12h',
              'WhatsApp: Mon-Fri 8h-10h, 18h-20h; avoid weekends',
              '',
              'CONTENT FORMAT GUIDELINES:',
              'Instagram Reels: 15-90s vertical video, trending audio, text overlay in first 3s',
              'Instagram Carousel: 5-10 slides, first slide is hook, last is CTA',
              'Instagram Photo: single high-quality image, short caption with 5-10 hashtags',
              'Facebook: link posts with preview image, 40-80 char headline',
              'YouTube: 8-15min videos, custom thumbnail, description with timestamps',
              'WhatsApp: short text 100-200 chars, single image or link',
            ].join('\n'),
          },
        },
        {
          type: 'text',
          payload: {
            text: [
              'AUDIENCE BEHAVIOR PATTERNS — Revista MODA ATUAL:',
              'Peak engagement: Tuesday-Thursday',
              'Lowest engagement: Saturday morning',
              'Fashion content performs best mid-morning (10h-12h) and evening (19h-21h)',
              'Wholesale/business content: weekdays 8h-10h and 14h-16h',
              'Trend/inspirational content: evenings and weekends',
              'Avoid posting: 23h-7h (low engagement)',
              '',
              'SCHEDULING RULES:',
              '- Space posts minimum 3 hours apart on same platform',
              '- Cross-post same content with 1-2h delay between platforms',
              '- Prioritize Instagram for fashion content',
              '- Use YouTube for longer-form tutorials and lookbooks',
              '- WhatsApp for direct wholesale offers and catalogs',
            ].join('\n'),
          },
        },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'social-publisher')
    const col = app.findCollectionByNameOrId('social_posts')
    try {
      col.fields.remove(col.fields.getByName('scheduled_at'))
    } catch (_) {}
    try {
      col.fields.remove(col.fields.getByName('published_at'))
    } catch (_) {}
    try {
      col.fields.remove(col.fields.getByName('platform'))
    } catch (_) {}
    try {
      col.fields.remove(col.fields.getByName('status'))
    } catch (_) {}
    col.removeIndex('idx_social_posts_scheduled_at')
    col.removeIndex('idx_social_posts_status')
    col.removeIndex('idx_social_posts_platform')
    app.save(col)
  },
)
