import pb from '@/lib/pocketbase/client'

export interface Top60Category {
  id: string
  name: string
  slug: string
  order: number
  created: string
  updated: string
}

export interface Top60Brand {
  id: string
  name: string
  category: string
  position: number
  description: string
  logo_file: string
  website: string
  social_handle: string
  score: number
  previous_position: number | null
  created: string
  updated: string
  expand?: { category: Top60Category }
}

export async function getCategories(): Promise<Top60Category[]> {
  return await pb.collection('top60_categories').getFullList({ sort: 'order' })
}

export async function getBrands(categoryId?: string): Promise<Top60Brand[]> {
  const opts: any = { sort: 'position', expand: 'category' }
  if (categoryId) opts.filter = `category = "${categoryId}"`
  const result = await pb.collection('top60_brands').getFullList(opts)
  return result as unknown as Top60Brand[]
}

export async function createBrand(data: Record<string, any>): Promise<Top60Brand> {
  return await pb.collection('top60_brands').create(data)
}

export async function updateBrand(id: string, data: Record<string, any>): Promise<Top60Brand> {
  return await pb.collection('top60_brands').update(id, data)
}

export async function deleteBrand(id: string): Promise<void> {
  await pb.collection('top60_brands').delete(id)
}

export async function createCategory(data: {
  name: string
  slug: string
  order: number
}): Promise<Top60Category> {
  return await pb.collection('top60_categories').create(data)
}

export async function updateCategory(
  id: string,
  data: Partial<{ name: string; slug: string; order: number }>,
): Promise<Top60Category> {
  return await pb.collection('top60_categories').update(id, data)
}

export async function deleteCategory(id: string): Promise<void> {
  await pb.collection('top60_categories').delete(id)
}

export function getLogoUrl(record: any, filename: string): string {
  if (!filename) return ''
  return pb.files.getUrl(record, filename) as string
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
