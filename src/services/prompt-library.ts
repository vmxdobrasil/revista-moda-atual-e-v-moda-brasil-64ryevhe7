import pb from '@/lib/pocketbase/client'

export interface PromptLibraryItem {
  id: string
  name: string
  description: string
  prompt_content: string
  slug: string
  category: 'basic' | 'advanced' | 'super'
  created: string
  updated: string
}

export async function getAllPrompts(): Promise<PromptLibraryItem[]> {
  return (await pb.collection('prompt_library').getFullList({
    sort: '-created',
  })) as unknown as PromptLibraryItem[]
}

export async function getPromptsByCategory(category: string): Promise<PromptLibraryItem[]> {
  return (await pb.collection('prompt_library').getFullList({
    filter: `category = "${category}"`,
    sort: '-created',
  })) as unknown as PromptLibraryItem[]
}

export async function getPromptBySlug(slug: string): Promise<PromptLibraryItem | null> {
  try {
    const records = await pb.collection('prompt_library').getFullList({
      filter: `slug = "${slug}"`,
    })
    return (records[0] as unknown as PromptLibraryItem) ?? null
  } catch {
    return null
  }
}

export async function updatePrompt(
  id: string,
  data: Partial<Pick<PromptLibraryItem, 'prompt_content' | 'name' | 'description'>>,
): Promise<PromptLibraryItem> {
  return (await pb.collection('prompt_library').update(id, data)) as unknown as PromptLibraryItem
}

export async function generateMetaPrompt(objective: string): Promise<PromptLibraryItem> {
  return (await pb.send('/backend/v1/agents/meta-prompt', {
    method: 'POST',
    body: JSON.stringify({ objective }),
    headers: { 'Content-Type': 'application/json' },
  })) as Promise<PromptLibraryItem>
}
