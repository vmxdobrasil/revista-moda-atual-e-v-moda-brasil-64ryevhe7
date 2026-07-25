import pb from '@/lib/pocketbase/client'

export async function fetchAdvancedContext(task: string): Promise<string> {
  const context: Record<string, unknown> = { task }
  const errors: string[] = []

  const editionMatch = task.match(/edi[çc][ãa]o\s*#?\s*(\d+)/i)
  if (editionMatch) {
    const num = parseInt(editionMatch[1], 10)
    if (num >= 1) {
      try {
        const result = await pb.collection('editions').getList(1, num, {
          sort: 'created',
          expand: 'brand',
        })
        if (result.items.length < num) {
          errors.push(`Edição #${num} não encontrada`)
        } else {
          const edition = result.items[num - 1] as any
          const pages = await pb.collection('edition_pages').getFullList({
            filter: `edition = "${edition.id}"`,
            sort: 'page_number',
          })
          const pageIds = (pages as any[]).map((p) => p.id)
          let hotspots: any[] = []
          if (pageIds.length > 0) {
            const filter = pageIds.map((id) => `page = "${id}"`).join(' || ')
            hotspots = await pb.collection('page_hotspots').getFullList({ filter })
          }
          context.edition = {
            title: edition.title,
            description: edition.description,
            brand: edition.expand?.brand?.name || null,
            pages: (pages as any[]).map((p) => ({
              page_number: p.page_number,
              toc_title: p.toc_title,
              template: p.template,
            })),
            hotspots: hotspots.map((h) => ({
              title: h.title,
              description: h.description,
              price: h.price,
            })),
          }
        }
      } catch {
        errors.push(`Erro ao buscar edição #${num}`)
      }
    }
  }

  const brandMatch = task.match(/marca\s+(.+?)(?:$|[,.])/i)
  if (brandMatch) {
    const brandName = brandMatch[1].trim()
    try {
      const brands = await pb.collection('top60_brands').getFullList({
        filter: `name ~ "${brandName}"`,
        expand: 'category',
      })
      if (brands.length === 0) {
        errors.push(`Marca '${brandName}' não encontrada`)
      } else {
        context.brand = (brands as any[]).map((b) => ({
          name: b.name,
          position: b.position,
          score: b.score,
          category: b.expand?.category?.name,
        }))
      }
    } catch {
      errors.push(`Erro ao buscar marca '${brandName}'`)
    }
  }

  try {
    const posts = await pb.collection('social_posts').getList(1, 10, { sort: '-post_date' })
    context.recentSocialPosts = posts.items.map((p: any) => ({
      hook: p.hook,
      format: p.format,
      views: p.views,
      likes: p.likes,
      engagement_rate: p.engagement_rate,
    }))
  } catch {
    /* non-critical */
  }

  try {
    const brands = await pb.collection('top60_brands').getList(1, 10, {
      sort: 'position',
      expand: 'category',
    })
    context.top60Ranking = brands.items.map((b: any) => ({
      name: b.name,
      position: b.position,
      score: b.score,
      category: b.expand?.category?.name,
    }))
  } catch {
    /* non-critical */
  }

  if (errors.length > 0) {
    throw new Error('Contexto não encontrado para o módulo especificado')
  }

  return `${task}\n\nContexto:\n${JSON.stringify(context, null, 2)}`
}
