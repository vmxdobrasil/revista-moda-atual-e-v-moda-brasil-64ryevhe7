import pb from '@/lib/pocketbase/client'

export interface AboutContent {
  id: string
  title: string
  body: string
  created: string
  updated: string
}

export async function getAboutContent(): Promise<AboutContent> {
  const records = await pb.collection('about_content').getFullList({
    sort: 'created',
  })
  if (records.length === 0) {
    return {
      id: '',
      title: 'Nossa História',
      body: 'Conteúdo em breve.',
      created: '',
      updated: '',
    }
  }
  return records[0] as unknown as AboutContent
}

export async function updateAboutContent(
  id: string,
  data: { title: string; body: string },
): Promise<AboutContent> {
  return (await pb.collection('about_content').update(id, data)) as unknown as AboutContent
}
