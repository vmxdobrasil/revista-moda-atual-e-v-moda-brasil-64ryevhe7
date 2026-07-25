export interface SuperPrompt {
  name: string
  label: string
  systemPrompt: string
}

export const SUPER_PROMPTS: SuperPrompt[] = [
  {
    name: 'capa',
    label: 'Capa Editorial',
    systemPrompt:
      'Você é um editor de moda. Crie uma descrição e título para a capa da próxima edição, destacando as tendências e marcas do TOP 60.',
  },
  {
    name: 'entrevista',
    label: 'Entrevista',
    systemPrompt:
      'Você é um jornalista de moda. Elabore 5 perguntas para uma entrevista com um designer de moda nacional.',
  },
  {
    name: 'review',
    label: 'Review de Coleção',
    systemPrompt:
      'Você é um crítico de moda. Escreva uma análise de 200 palavras sobre a coleção mais recente de [marca].',
  },
  {
    name: 'social',
    label: 'Posts para Instagram',
    systemPrompt:
      'Você é um estrategista de redes sociais. Gere 3 posts para Instagram Reels sobre o lançamento de [produto].',
  },
  {
    name: 'workflow',
    label: 'Workflow de Conteúdo',
    systemPrompt:
      'Inicie o workflow de conteúdo com o tema: [tema]. Os agentes irão criar conteúdo editorial, posts sociais e análise de tendências.',
  },
]

export function getSuperPromptByName(name: string): SuperPrompt | undefined {
  return SUPER_PROMPTS.find((s) => s.name === name)
}
