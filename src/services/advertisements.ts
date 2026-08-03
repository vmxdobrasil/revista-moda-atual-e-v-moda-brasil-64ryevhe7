import pb from '@/lib/pocketbase/client'

export interface Advertisement {
  id: string
  image: string
  url: string
  title: string
  is_active: boolean
  created: string
  updated: string
}

export async function getActiveAds(): Promise<Advertisement[]> {
  return (await pb.collection('advertisements').getFullList({
    filter: 'is_active = true',
    sort: '-created',
  })) as unknown as Advertisement[]
}

export async function getAllAds(): Promise<Advertisement[]> {
  return (await pb.collection('advertisements').getFullList({
    sort: '-created',
  })) as unknown as Advertisement[]
}

export async function createAd(data: FormData): Promise<Advertisement> {
  return await pb.collection('advertisements').create(data)
}

export async function updateAd(id: string, data: FormData): Promise<Advertisement> {
  return await pb.collection('advertisements').update(id, data)
}

export async function deleteAd(id: string): Promise<void> {
  await pb.collection('advertisements').delete(id)
}

export async function toggleAdActive(id: string, isActive: boolean): Promise<Advertisement> {
  return (await pb.collection('advertisements').update(id, {
    is_active: isActive,
  })) as unknown as Advertisement
}

export function getAdImageUrl(record: any, filename: string): string {
  if (!filename) return ''
  return pb.files.getURL(record, filename)
}
