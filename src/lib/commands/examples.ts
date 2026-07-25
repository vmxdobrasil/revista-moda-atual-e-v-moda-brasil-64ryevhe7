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
