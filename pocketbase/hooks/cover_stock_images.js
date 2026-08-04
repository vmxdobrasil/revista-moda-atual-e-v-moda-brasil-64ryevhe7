routerAdd(
  'GET',
  '/backend/v1/cover/stock-images',
  (e) => {
    const query = e.requestInfo().query?.query || 'fashion magazine cover'
    const source = e.requestInfo().query?.source || 'unsplash'

    const sourceLabels = {
      unsplash: 'Unsplash',
      pexels: 'Pexels',
      freepik: 'Freepik',
    }

    const images = []
    for (let i = 0; i < 8; i++) {
      const seedQuery = source + ' ' + query + ' ' + (i + 1)
      images.push({
        url: 'https://img.usecurling.com/p/800/1067?q=' + encodeURIComponent(seedQuery) + '&dpr=2',
        source: source,
        sourceLabel: sourceLabels[source] || source,
        width: 800,
        height: 1067,
        alt: query + ' - ' + (sourceLabels[source] || source) + ' ' + (i + 1),
      })
    }

    return e.json(200, { images: images, source: source, query: query })
  },
  $apis.requireAuth(),
)
