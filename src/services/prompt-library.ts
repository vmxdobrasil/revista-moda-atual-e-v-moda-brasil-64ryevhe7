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

export async function generateMetaPrompt(objective: string): Promise<PromptLibraryItem> {
  return (await pb.send('/backend/v1/agents/meta-prompt', {
    method: 'POST',
    body: JSON.stringify({ objective }),
    headers: { 'Content-Type': 'application/json' },
  })) as Promise<PromptLibraryItem>
}
