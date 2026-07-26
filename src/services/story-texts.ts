import pb from '@/lib/pocketbase/client'

export interface StoryText {
  id: string
  subject: string
  options: string[]
  scheduled_date: string | null
  created: string
  updated: string
}

export interface StoryTextInput {
  subject: string
  options: string[]
  scheduled_date?: string | null
}

const COLLECTION = 'story_texts'

export async function getAllStoryTexts(sort = '-created'): Promise<StoryText[]> {
  const result = await pb.collection(COLLECTION).getFullList({ sort })
  return result as unknown as StoryText[]
}

export async function createStoryText(data: StoryTextInput): Promise<StoryText> {
  return (await pb.collection(COLLECTION).create(data)) as unknown as StoryText
}

export async function updateStoryText(
  id: string,
  data: Partial<StoryTextInput>,
): Promise<StoryText> {
  return (await pb.collection(COLLECTION).update(id, data)) as unknown as StoryText
}

export async function deleteStoryText(id: string): Promise<void> {
  await pb.collection(COLLECTION).delete(id)
}

export function getScheduledStatus(
  scheduledDate: string | null,
): 'none' | 'today' | 'past' | 'future' {
  if (!scheduledDate) return 'none'
  const now = new Date()
  const scheduled = new Date(scheduledDate)
  if (isNaN(scheduled.getTime())) return 'none'
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const schedDay = new Date(scheduled.getFullYear(), scheduled.getMonth(), scheduled.getDate())
  if (schedDay.getTime() === today.getTime()) return 'today'
  if (schedDay < today) return 'past'
  return 'future'
}

export function toDateInputValue(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}
