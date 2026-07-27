export interface ModuleMapping {
  number: number
  label: string
  path: string
}

export const MODULES: ModuleMapping[] = [
  { number: 1, label: 'Edições', path: '/admin/editions' },
  { number: 2, label: 'Social Analytics / Diagnóstico', path: '/admin/social-analytics' },
  { number: 3, label: 'Content Workflow', path: '/admin/content-workflow' },
  { number: 4, label: 'Social Posts', path: '/admin/social-posts' },
  { number: 5, label: 'TOP 60 Marcas', path: '/admin/top60' },
  { number: 6, label: 'AI Persona (Fashion Trend Advisor)', path: '/admin/ai-persona/chat' },
]

export function getModuleByNumber(num: number): ModuleMapping | undefined {
  return MODULES.find((m) => m.number === num)
}
