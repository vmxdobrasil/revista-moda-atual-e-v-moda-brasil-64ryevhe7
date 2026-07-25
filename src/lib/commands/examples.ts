const LEGENDA_PROMPT = [
  'Você é um editor da Revista MODA ATUAL DIGITAL, especializada em moda, negócios e tendências do Polo de Moda de Goiás, com tom profissional, acolhedor e informativo.',
  'Contexto: A revista publica um post no Instagram sobre Tendências de cores para verão 2026/27.',
  'O público são mulheres empreendedoras da moda, lojistas e revendedoras.',
  'Tarefa: Crie uma legenda de 120 a 180 caracteres que apresente o tema de forma atraente.',
  'Restrições: Não use clichês ("arrase", "poderosa", "transforme seu look").',
  'Não comece com "Você sabia?". Tom informativo, não de venda. Não use hashtags.',
  'Responda apenas com a legenda, sem aspas ou comentários.',
].join(' ')

export const BASIC_EXAMPLES: string[] = [
  LEGENDA_PROMPT,
  'Crie uma descrição para a capa da próxima edição destacando tendências do TOP 60',
  'Escreva 5 perguntas para uma entrevista com um designer de moda nacional',
  'Gere 3 ideias de posts para Instagram Reels sobre lançamento de coleção',
]

const STORIES_TEMPLATE = [
  'Você é um copywriter especialista em marcas de moda, com tom profissional, curioso e informativo.',
  'Contexto: Crie textos on-screen para Instagram Stories de 15 segundos sobre [ASSUNTO].',
  'Tarefa: Gere três opções de texto on-screen.',
  'Formato: Responda exatamente no formato:',
  'Opção 1: [texto]',
  'Opção 2: [texto]',
  'Opção 3: [texto]',
  'Restrições:',
  '- Cada opção deve ter no máximo 8 palavras',
  '- Tom de curiosidade ou informação útil',
  '- Não use clichês ("arrase", "poderosa", "transforme seu look")',
  '- Não use linguagem de venda',
  '- O texto deve ser informativo/curioso, não promocional',
  '- Responda apenas com as três opções, sem aspas ou comentários',
].join('\n')

export const STORIES_EXAMPLES: string[] = [STORIES_TEMPLATE]

export function buildStoriesPrompt(subject: string): string {
  return STORIES_TEMPLATE.replace('[ASSUNTO]', subject)
}

export const ADVANCED_EXAMPLES: string[] = [
  'Análise de tendências de moda primavera verão',
  'Estratégia de conteúdo para Instagram Reels',
  'Briefing editorial para edição de lançamento',
]

export const META_EXAMPLES: string[] = [
  'Criar prompt para análise de concorrência no marketplace',
  'Criar prompt para geração de calendário editorial',
  'Criar prompt para revisão de conteúdo editorial',
]

interface LevelBadge {
  label: string
  className: string
}

export const LEVEL_BADGES: Record<string, LevelBadge> = {
  B: { label: 'B', className: 'bg-blue-100 text-blue-700' },
  A: { label: 'A', className: 'bg-purple-100 text-purple-700' },
  S: { label: 'S', className: 'bg-orange-100 text-orange-700' },
  M: { label: 'M', className: 'bg-green-100 text-green-700' },
}
