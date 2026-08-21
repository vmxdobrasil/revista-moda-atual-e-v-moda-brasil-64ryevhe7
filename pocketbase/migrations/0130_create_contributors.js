migrate(
  (app) => {
    // 1. Create contributors collection
    if (!app.hasTable('contributors')) {
      const collection = new Collection({
        name: 'contributors',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'slug', type: 'text', required: true },
          {
            name: 'photo',
            type: 'file',
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          },
          { name: 'bio', type: 'text' },
          { name: 'role', type: 'text' },
          { name: 'social_instagram', type: 'text' },
          { name: 'social_twitter', type: 'text' },
          { name: 'social_linkedin', type: 'text' },
          { name: 'featured', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_contributors_slug ON contributors (slug)',
          'CREATE INDEX idx_contributors_featured ON contributors (featured)',
          'CREATE INDEX idx_contributors_created ON contributors (created DESC)',
        ],
      })
      app.save(collection)
    }

    // 2. Seed initial contributors
    try {
      const col = app.findCollectionByNameOrId('contributors')
      const count = app.countRecords('contributors')
      if (count === 0) {
        const seedContributors = [
          {
            name: 'Maria Silva',
            slug: 'maria-silva',
            role: 'Editora-Chefe',
            bio: 'Jornalista e pesquisadora com mais de 15 anos de atuação no mercado editorial de moda brasileiro. Especialista em análise de tendências de vestuário e comportamento do consumidor atacadista.',
            social_instagram: 'https://instagram.com/mariasilva.moda',
            social_twitter: 'https://twitter.com/mariasilvamoda',
            social_linkedin: 'https://linkedin.com/in/mariasilva-moda',
            featured: true,
          },
          {
            name: 'Carlos Albuquerque',
            slug: 'carlos-albuquerque',
            role: 'Diretor de Estilo & Tendências',
            bio: 'Estilista e consultor criativo formado pelo Senac e com passagens por grandes confecções de São Paulo e Minas Gerais. Responsável pela curadoria visual e relatórios de preview da estação.',
            social_instagram: 'https://instagram.com/carlosalbuquerque.style',
            social_twitter: '',
            social_linkedin: 'https://linkedin.com/in/carlosalbuquerque-style',
            featured: true,
          },
          {
            name: 'Juliana Prado',
            slug: 'juliana-prado',
            role: 'Especialista em Negócios B2B & Atacado',
            bio: 'Consultora de estratégias comerciais e expansão para o mercado confeccionista. Autora de colunas analíticas sobre precificação, logística e ecossistema atacadista no Brás e Bom Retiro.',
            social_instagram: 'https://instagram.com/julianaprado.b2b',
            social_twitter: 'https://twitter.com/jupradomoda',
            social_linkedin: 'https://linkedin.com/in/julianapradob2b',
            featured: true,
          },
          {
            name: 'Lucas Ferreira',
            slug: 'lucas-ferreira',
            role: 'Fotógrafo & Coordenador Audiovisual',
            bio: 'Especializado em editoriais de moda, passarela e cobertura de eventos internacionais como SPFW e Gala Moda Brasil. Coordenador da produção de vídeo e ensaios fotográficos exclusivos.',
            social_instagram: 'https://instagram.com/lucasferreira.photo',
            social_twitter: '',
            social_linkedin: 'https://linkedin.com/in/lucasferreira-photo',
            featured: false,
          },
          {
            name: 'Beatriz Vasconcelos',
            slug: 'beatriz-vasconcelos',
            role: 'Redatora de Moda & Sustentabilidade',
            bio: 'Apaixonada por inovação têxtil, upcycling e matérias-primas nacionais. Cobre inovações industriais ecológicas e coleções cápsula conscientes em todo o país.',
            social_instagram: 'https://instagram.com/beatrizv.sustentavel',
            social_twitter: '',
            social_linkedin: 'https://linkedin.com/in/beatriz-vasconcelos-moda',
            featured: false,
          },
        ]

        for (const item of seedContributors) {
          const rec = new Record(col)
          rec.set('name', item.name)
          rec.set('slug', item.slug)
          rec.set('role', item.role)
          rec.set('bio', item.bio)
          rec.set('social_instagram', item.social_instagram)
          rec.set('social_twitter', item.social_twitter)
          rec.set('social_linkedin', item.social_linkedin)
          rec.set('featured', item.featured)
          app.save(rec)
        }
      }
    } catch (err) {
      console.log('Seed contributors failed:', err)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('contributors')
      app.delete(col)
    } catch (_) {}
  },
)
