migrate(
  (app) => {
    const collection = new Collection({
      name: 'social_posts',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'hook', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'format',
          type: 'select',
          required: true,
          values: ['Reel', 'Carousel', 'Photo'],
          maxSelect: 1,
        },
        { name: 'post_date', type: 'date', required: true },
        { name: 'views', type: 'number', required: true, min: 0 },
        { name: 'likes', type: 'number', required: true, min: 0 },
        { name: 'comments', type: 'number', required: true, min: 0 },
        { name: 'shares', type: 'number', required: true, min: 0 },
        { name: 'saves', type: 'number', required: true, min: 0 },
        { name: 'remixes', type: 'number', min: 0 },
        { name: 'new_followers', type: 'number', min: 0 },
        { name: 'is_top_performer', type: 'bool' },
        { name: 'engagement_rate', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_social_posts_post_date ON social_posts (post_date)',
        'CREATE INDEX idx_social_posts_views ON social_posts (views)',
        'CREATE INDEX idx_social_posts_likes ON social_posts (likes)',
        'CREATE INDEX idx_social_posts_format ON social_posts (format)',
        'CREATE INDEX idx_social_posts_engagement ON social_posts (engagement_rate)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('social_posts')
    app.delete(collection)
  },
)
