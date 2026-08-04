import pb from '@/lib/pocketbase/client'

export interface VisualTemplate {
  id: string
  name: string
  slug: string
  template: string
  description: string
  palette: Record<string, string>
  typography: Record<string, string>
  composition: Record<string, unknown>
  thumbnail: string
  created: string
  updated: string
}

export async function getVisualTemplates(): Promise<VisualTemplate[]> {
  return await pb.collection('visual_templates').getFullList({ sort: 'template' })
}

export async function getVisualTemplateBySlug(slug: string): Promise<VisualTemplate> {
  return await pb.collection('visual_templates').getFirstListItem(`slug = "${slug}"`)
}
