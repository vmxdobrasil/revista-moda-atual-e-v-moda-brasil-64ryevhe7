import pb from '@/lib/pocketbase/client'

export interface Skill {
  id: string
  title: string
  slug: string
  category: string
  summary: string
  flow: unknown
  rules: unknown
  responsibilities: unknown
  related_agents: unknown
  body: string
  status: string
  created: string
  updated: string
}

export const CATEGORY_LABELS: Record<string, string> = {
  producao_editorial: 'Produção Editorial',
  seo: 'SEO',
  distribuicao: 'Distribuição',
  nutricao: 'Nutrição',
  monetizacao: 'Monetização',
  conversao: 'Conversão',
  inteligencia_competitiva: 'Inteligência Competitiva',
}

export async function getSkills(): Promise<Skill[]> {
  return (await pb
    .collection('skills')
    .getFullList({ sort: 'category,title' })) as unknown as Skill[]
}

export async function getSkill(id: string): Promise<Skill> {
  return (await pb.collection('skills').getOne(id)) as unknown as Skill
}

export async function getSkillBySlug(slug: string): Promise<Skill> {
  return (await pb.collection('skills').getFirstListItem(`slug = "${slug}"`)) as unknown as Skill
}
