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

export interface SkillInput {
  title: string
  slug: string
  category: string
  summary?: string
  flow?: unknown
  rules?: unknown
  responsibilities?: unknown
  related_agents?: unknown
  body?: string
  status?: string
}

export const CATEGORY_LABELS: Record<string, string> = {
  producao_editorial: 'Produção Editorial',
  seo: 'SEO',
  distribuicao: 'Distribuição',
  nutricao: 'Nutrição',
  monetizacao: 'Monetização',
  conversao: 'Conversão',
  inteligencia_competitiva: 'Inteligência Competitiva',
  atendimento_anunciante: 'Atendimento ao Anunciante',
  gestao_crise: 'Gestão de Crise',
  analise_metricas: 'Análise de Métricas',
}

export const SKILL_CATEGORIES = [
  { value: 'producao_editorial', label: 'Produção Editorial' },
  { value: 'seo', label: 'SEO' },
  { value: 'distribuicao', label: 'Distribuição' },
  { value: 'nutricao', label: 'Nutrição' },
  { value: 'monetizacao', label: 'Monetização' },
  { value: 'conversao', label: 'Conversão' },
  { value: 'inteligencia_competitiva', label: 'Inteligência Competitiva' },
  { value: 'atendimento_anunciante', label: 'Atendimento ao Anunciante' },
  { value: 'gestao_crise', label: 'Gestão de Crise' },
  { value: 'analise_metricas', label: 'Análise de Métricas' },
]

export const CATEGORY_COLORS: Record<string, string> = {
  producao_editorial: 'bg-orange-100 text-orange-700',
  seo: 'bg-blue-100 text-blue-700',
  distribuicao: 'bg-green-100 text-green-700',
  nutricao: 'bg-pink-100 text-pink-700',
  monetizacao: 'bg-amber-100 text-amber-700',
  conversao: 'bg-purple-100 text-purple-700',
  inteligencia_competitiva: 'bg-cyan-100 text-cyan-700',
  atendimento_anunciante: 'bg-indigo-100 text-indigo-700',
  gestao_crise: 'bg-red-100 text-red-700',
  analise_metricas: 'bg-teal-100 text-teal-700',
}

export const SKILL_STATUSES = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'publicado', label: 'Publicado' },
]

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

export async function createSkill(data: SkillInput): Promise<Skill> {
  return (await pb.collection('skills').create(data)) as unknown as Skill
}

export async function updateSkill(id: string, data: Partial<SkillInput>): Promise<Skill> {
  return (await pb.collection('skills').update(id, data)) as unknown as Skill
}

export async function deleteSkill(id: string): Promise<void> {
  await pb.collection('skills').delete(id)
}
