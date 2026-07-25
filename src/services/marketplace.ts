import pb from '@/lib/pocketbase/client'

export interface MarketplaceProduct {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image_file: string
  category: string
  vendor: string
  featured: boolean
  link: string
  created: string
  updated: string
}

export interface MarketplaceOrder {
  id: string
  product: string
  customer_name: string
  customer_email: string
  quantity: number
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  created: string
  updated: string
  expand?: { product: MarketplaceProduct }
}

export async function getProducts(
  page = 1,
  perPage = 12,
  filter?: string,
): Promise<{ items: MarketplaceProduct[]; totalItems: number; totalPages: number; page: number }> {
  const result = await pb
    .collection('marketplace_products')
    .getList<MarketplaceProduct>(page, perPage, {
      sort: '-created',
      filter: filter || '',
    })
  return {
    items: result.items as unknown as MarketplaceProduct[],
    totalItems: result.totalItems,
    totalPages: result.totalPages,
    page: result.page,
  }
}

export async function getAllProducts(): Promise<MarketplaceProduct[]> {
  return (await pb
    .collection('marketplace_products')
    .getFullList({ sort: '-created' })) as unknown as MarketplaceProduct[]
}

export async function createProduct(data: Record<string, any>): Promise<MarketplaceProduct> {
  return await pb.collection('marketplace_products').create(data)
}

export async function updateProduct(
  id: string,
  data: Record<string, any>,
): Promise<MarketplaceProduct> {
  return await pb.collection('marketplace_products').update(id, data)
}

export async function deleteProduct(id: string): Promise<void> {
  await pb.collection('marketplace_products').delete(id)
}

export async function getOrders(statusFilter?: string): Promise<MarketplaceOrder[]> {
  const opts: any = { sort: '-created', expand: 'product' }
  if (statusFilter) opts.filter = `status = "${statusFilter}"`
  return (await pb
    .collection('marketplace_orders')
    .getFullList(opts)) as unknown as MarketplaceOrder[]
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  await pb.collection('marketplace_orders').update(id, { status })
}

export function getImageUrl(record: any, filename: string): string {
  if (!filename) return ''
  return pb.files.getUrl(record, filename) as string
}

export function formatPrice(price: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(price)
}
