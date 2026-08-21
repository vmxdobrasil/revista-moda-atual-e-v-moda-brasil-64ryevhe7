import pb from '@/lib/pocketbase/client'

export interface FashionEvent {
  id: string
  title: string
  description?: string
  date: string
  location?: string
  image?: string
  category?: 'Desfile' | 'Festa' | 'Tapete Vermelho' | 'Outros'
  gallery_data?: Array<{
    title: string
    description?: string
    imageUrl?: string
  }>
  is_spotlight?: boolean
  display_order?: number
  status?: 'rascunho' | 'publicado' | 'arquivado'
  created?: string
  updated?: string
}

export const getEvents = async (): Promise<FashionEvent[]> => {
  try {
    return await pb.collection('fashion_events').getFullList<FashionEvent>({
      sort: '-date',
    })
  } catch (err) {
    console.error('Error fetching fashion events:', err)
    return []
  }
}

export const getEventById = async (id: string): Promise<FashionEvent> => {
  return pb.collection('fashion_events').getOne<FashionEvent>(id)
}

export const createEvent = async (
  data: Partial<FashionEvent> | FormData,
): Promise<FashionEvent> => {
  return pb.collection('fashion_events').create<FashionEvent>(data)
}

export const updateEvent = async (
  id: string,
  data: Partial<FashionEvent> | FormData,
): Promise<FashionEvent> => {
  return pb.collection('fashion_events').update<FashionEvent>(id, data)
}

export const deleteEvent = async (id: string): Promise<boolean> => {
  return pb.collection('fashion_events').delete(id)
}
