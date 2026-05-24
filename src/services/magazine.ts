import pb from '@/lib/pocketbase/client'

export interface Edition {
  id: string
  title: string
  cover_url: string
  description: string
}

export interface EditionPage {
  id: string
  edition: string
  page_number: number
  image_url: string
  toc_title: string
}

export interface Hotspot {
  id: string
  page: string
  x: number
  y: number
  title: string
  description: string
  price: string
  link: string
}

export const getEditions = () =>
  pb.collection('editions').getFullList<Edition>({ sort: '-created' })

export const getLatestEdition = async () => {
  const result = await pb.collection('editions').getList<Edition>(1, 1, { sort: '-created' })
  return result.items.length > 0 ? result.items[0] : null
}

export const getEdition = (id: string) => pb.collection('editions').getOne<Edition>(id)

export const getEditionPages = (editionId: string) =>
  pb.collection('edition_pages').getFullList<EditionPage>({
    filter: `edition = "${editionId}"`,
    sort: 'page_number',
  })

export const getHotspots = (editionId: string) =>
  pb.collection('page_hotspots').getFullList<Hotspot>({
    filter: `page.edition = "${editionId}"`,
  })
