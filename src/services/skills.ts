import pb from '@/lib/pocketbase/client'

export interface SkillFlowStep {
  step: string
  description: string
  responsible: string
}

export interface SkillRule {
  rule: string
  detail: string
}

export interface SkillResponsibility {
  role: string
  responsibilities: string[]
}

export interface RelatedAgent {
  agent: string
  how: string
}

export interface Skill {
  id: string
  title: string
  slug: string
  category: string
  summary: string
  flow: SkillFlowStep[]
  rules: SkillRule[]
  responsibilities: SkillResponsibility[]
  related_agents: RelatedAgent[]
  body: string
  status: string
  created: string
  updated: string
}

export const SKILL_CATEGORIES = [
  { value: 'producao_editorial', label: 'Produção Editorial' },
  { value: 'seo', label: 'SEO' },
  { value: 'distribuicao', label: 'Distribuição' },
  { value: 'nutricao', label: 'Nutrição de Audiência' },
  { value: 'monetizacao', label: 'Monetização' },
  { value: 'conversao', label: 'Conversão' },
  { value: 'inteligencia_competitiva', label: 'Inteligência Competitiva' },
] as const

export const SKILL_STATUSES = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'publicado', label: 'Publicado' },
] as const

export const CATEGORY_COLORS: Record<string, string> = {
  producao_editorial: 'bg-orange-100 text-orange-700',
  seo: 'bg-blue-100 text-blue-700',
  distribuicao: 'bg-purple-100 text-purple-700',
  nutricao: 'bg-green-100 text-green-700',
  monetizacao: 'bg-yellow-100 text-yellow-700',
  conversao: 'bg-red-100 text-red-700',
  inteligencia_competitiva: 'bg-cyan-100 text-cyan-700',
}

export const getSkills = async (): Promise<Skill[]> =>
  pb.collection('skills').getFullList({ sort: 'category,title' })

export const getSkill = async (id: string): Promise<Skill> => pb.collection('skills').getOne(id)

export const createSkill = async (data: Partial<Skill>): Promise<Skill> =>
  pb.collection('skills').create(data)

export const updateSkill = async (id: string, data: Partial<Skill>): Promise<Skill> =>
  pb.collection('skills').update(id, data)

export const deleteSkill = async (id: string): Promise<void> => {
  await pb.collection('skills').delete(id)
}
