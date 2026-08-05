import pb from '@/lib/pocketbase/client'

export interface Edition {
  id: string
  collectionId: string
  collectionName: string
  title: string
  cover_url: string
  cover_file?: string
  description: string
  brand?: string
  view_count?: number
  created: string
  updated: string
  expand?: {
    brand?: {
      id: string
      name: string
      category: string
      position: number
      description: string
      website: string
      social_handle: string
      score: number
      previous_position: number | null
    }
  }
}

export interface EditionPage {
  id: string
  collectionId: string
  collectionName: string
  edition: string
  page_number: number
  image_url: string
  image_file?: string
  toc_title: string
  template?: string
  template_data?: any
  view_count?: number
  created: string
  updated: string
}

export interface Hotspot {
  id: string
  collectionId: string
  collectionName: string
  page: string
  x: number
  y: number
  title: string
  description: string
  price: string
  link: string
  product?: string
  click_count?: number
  link_origin?: 'revista' | 'hotspot' | 'whatsapp'
  conversion_rate?: number
  cta_variant?: string
  created: string
  updated: string
  expand?: {
    product?: {
      id: string
      collectionId: string
      collectionName: string
      name: string
      description: string
      price: number
      currency: string
      image_file: string
      category: string
      vendor: string
      featured: boolean
      link: string
    }
  }
}

export const getEditions = () =>
  pb.collection('editions').getFullList<Edition>({ sort: '-created', expand: 'brand' })

export const getLatestEdition = async () => {
  const result = await pb.collection('editions').getList<Edition>(1, 1, {
    sort: '-created',
    expand: 'brand',
  })
  return result.items.length > 0 ? result.items[0] : null
}

export const getEdition = (id: string) =>
  pb.collection('editions').getOne<Edition>(id, { expand: 'brand' })

export const getEditionPages = (editionId: string) =>
  pb.collection('edition_pages').getFullList<EditionPage>({
    filter: `edition = "${editionId}"`,
    sort: 'page_number',
  })

export const getEditionPage = (pageId: string) =>
  pb.collection('edition_pages').getOne<EditionPage>(pageId)

export const getHotspots = async (editionId: string, existingPages?: EditionPage[]) => {
  const pages = existingPages ?? (await getEditionPages(editionId))
  const pageIds = pages.map((p) => p.id)
  if (pageIds.length === 0) return []
  const filter = pageIds.map((id) => `page = "${id}"`).join(' || ')
  return pb.collection('page_hotspots').getFullList<Hotspot>({ filter, expand: 'product' })
}

export const getHotspotsByPage = (pageId: string) =>
  pb.collection('page_hotspots').getFullList<Hotspot>({
    filter: `page = "${pageId}"`,
    expand: 'product',
  })

export const createEdition = (data: FormData) => pb.collection('editions').create<Edition>(data)
export const updateEdition = (id: string, data: FormData) =>
  pb.collection('editions').update<Edition>(id, data)
export const deleteEdition = (id: string) => pb.collection('editions').delete(id)

export const createEditionPage = (data: FormData) =>
  pb.collection('edition_pages').create<EditionPage>(data)
export const updateEditionPage = (id: string, data: FormData | Partial<EditionPage>) =>
  pb.collection('edition_pages').update<EditionPage>(id, data)
export const deleteEditionPage = (id: string) => pb.collection('edition_pages').delete(id)

export const createHotspot = (data: Partial<Hotspot>) =>
  pb.collection('page_hotspots').create<Hotspot>(data)
export const updateHotspot = (id: string, data: Partial<Hotspot>) =>
  pb.collection('page_hotspots').update<Hotspot>(id, data)
export const deleteHotspot = (id: string) => pb.collection('page_hotspots').delete(id)

export const getFileUrl = (record: any, filename: string) => pb.files.getUrl(record, filename)
