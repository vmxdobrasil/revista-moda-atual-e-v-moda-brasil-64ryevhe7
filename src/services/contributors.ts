import pb from '@/lib/pocketbase/client'

export interface Contributor {
  id: string
  collectionId: string
  collectionName: string
  name: string
  slug: string
  photo?: string
  bio?: string
  role?: string
  social_instagram?: string
  social_twitter?: string
  social_linkedin?: string
  featured?: boolean
  created: string
  updated: string
}

export interface ContributorArticle {
  id: string
  title: string
  type: 'edition' | 'story' | 'post'
  description?: string
  date?: string
  link: string
  imageUrl?: string
  tag?: string
}

const COLLECTION = 'contributors'

/**
 * Obtém a lista completa de colaboradores
 */
export async function getContributors(sort = '-featured,-created'): Promise<Contributor[]> {
  try {
    const list = await pb.collection(COLLECTION).getFullList<Contributor>({
      sort,
    })
    return list
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error)
    return []
  }
}

/**
 * Obtém colaboradores em destaque
 */
export async function getFeaturedContributors(): Promise<Contributor[]> {
  try {
    const list = await pb.collection(COLLECTION).getFullList<Contributor>({
      filter: 'featured = true',
      sort: '-created',
    })
    return list
  } catch (error) {
    console.error('Erro ao buscar colaboradores em destaque:', error)
    return []
  }
}

/**
 * Obtém um colaborador pelo seu slug
 */
export async function getContributorBySlug(slug: string): Promise<Contributor | null> {
  try {
    const record = await pb.collection(COLLECTION).getFirstListItem<Contributor>(`slug = "${slug}"`)
    return record
  } catch (error) {
    console.error(`Erro ao buscar colaborador por slug (${slug}):`, error)
    return null
  }
}

/**
 * Obtém a URL da foto do colaborador ou um avatar fallback do CDN oficial
 */
export function getContributorPhotoUrl(contributor: Contributor, size: number = 400): string {
  if (contributor.photo) {
    try {
      const url = pb.files.getURL(contributor, contributor.photo)
      if (url) return url
    } catch {
      // fallback
    }
  }

  // Gera avatar consistente com base no nome/slug
  const cleanName = encodeURIComponent(contributor.name || 'fashion journalist')
  return `https://img.usecurling.com/p/${size}/${size}?q=portrait%20${cleanName}`
}

/**
 * Busca artigos / matérias / edições relacionadas a um colaborador
 * Como a relação pode ser por menção no texto, autor ou conteúdos gerais da revista,
 * agrega as edições e matérias editoriais mais recentes.
 */
export async function getContributorArticles(
  contributor: Contributor,
  limit: number = 6,
): Promise<ContributorArticle[]> {
  const articles: ContributorArticle[] = []

  try {
    // 1. Tenta buscar em story_texts se houver menção ou matérias
    const storyTexts = await pb.collection('story_texts').getList(1, limit, {
      sort: '-created',
    })

    for (const item of storyTexts.items) {
      const isMatch =
        item.subject?.toLowerCase().includes(contributor.name.toLowerCase()) ||
        contributor.role?.toLowerCase().includes('editor')

      articles.push({
        id: item.id,
        title: item.subject || 'Editorial Exclusivo',
        type: 'story',
        description:
          typeof item.options === 'string'
            ? item.options.slice(0, 140) + '…'
            : 'Artigo analítico com foco em tendências de atacado e posicionamento de marca.',
        date: item.scheduled_date || item.created,
        link: `/texto/${item.id}`,
        imageUrl: `https://img.usecurling.com/p/600/400?q=fashion%20editorial%20textile`,
        tag: 'Editorial',
      })
    }

    // 2. Tenta buscar edições recentes da revista
    const editions = await pb.collection('editions').getList(1, limit, {
      sort: '-created',
    })

    for (const ed of editions.items) {
      const coverUrl = ed.cover_file
        ? pb.files.getURL(ed, ed.cover_file)
        : ed.cover_url || 'https://img.usecurling.com/p/600/800?q=fashion%20magazine%20cover'

      articles.push({
        id: ed.id,
        title: ed.title,
        type: 'edition',
        description: ed.description || 'Edição especial com curadoria completa e matérias de capa.',
        date: ed.created,
        link: `/edition/${ed.id}`,
        imageUrl: coverUrl,
        tag: 'Edição Digital',
      })
    }
  } catch (error) {
    console.warn('Erro ao carregar artigos do colaborador:', error)
  }

  return articles.slice(0, limit)
}
