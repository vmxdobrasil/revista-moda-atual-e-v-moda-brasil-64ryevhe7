export interface PromptAnalysisResult {
  diagnostico: string[]
  promptOtimizado: string
  oQueMudei: string[]
}

const VAGUE_TERMS = [
  'etc.',
  '...',
  'etc',
  'good',
  'better',
  'best',
  'nice',
  'great',
  'bom',
  'melhor',
  'ótimo',
  'legal',
  'interessante',
  'relevante',
  'adequado',
  'apropriado',
  'something',
  'coisas',
  'algo',
  'whatever',
]

const FORMAT_KEYWORDS = [
  'formato',
  'format',
  'json',
  'markdown',
  'lista',
  'list',
  'tabela',
  'table',
  'bullet',
  'parágrafo',
  'paragraph',
]

const LENGTH_KEYWORDS = [
  'tamanho',
  'length',
  'máximo',
  'max',
  'mínimo',
  'min',
  'caracteres',
  'characters',
  'palavras',
  'words',
  'limite',
  'limit',
]

const TONE_KEYWORDS = [
  'tom',
  'tone',
  'persona',
  'voz',
  'voice',
  'estilo',
  'style',
  'formal',
  'informal',
  'profissional',
  'professional',
]

const OBJECTIVE_SEPARATORS = [
  ' e ',
  ' and ',
  ' além disso',
  ' also',
  ' depois ',
  ' then ',
  ' posteriormente',
  'também',
  'também ',
]

function hasAnyKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase()
  return keywords.some((kw) => lower.includes(kw))
}

function countVagueTerms(text: string): string[] {
  const lower = text.toLowerCase()
  const found: string[] = []
  for (const term of VAGUE_TERMS) {
    if (lower.includes(term)) found.push(term)
  }
  return [...new Set(found)]
}

export function analyzePrompt(original: string): PromptAnalysisResult {
  const diagnostico: string[] = []
  const oQueMudei: string[] = []
  const text = original.trim()

  const vagueFound = countVagueTerms(text)

  diagnostico.push(
    `Problema 1: ${vagueFound.length > 0 ? `Termos vagos ou ambíguos detectados (${vagueFound.map((t) => `"${t}"`).join(', ')}). Esses termos não fornecem diretrizes claras para o modelo de IA, resultando em saídas inconsistentes.` : 'O prompt não define critérios objetivos de qualidade — termos como "bom", "melhor" ou "interessante" ausentes, mas também não há métricas concretas de avaliação.'}`,
  )

  oQueMudei.push(
    vagueFound.length > 0
      ? `Substituí termos vagos (${vagueFound.map((t) => `"${t}"`).join(', ')}) por critérios objetivos e mensuráveis.`
      : 'Adicionei critérios objetivos de qualidade e métricas de avaliação explícitas.',
  )

  const hasFormat = hasAnyKeyword(text, FORMAT_KEYWORDS)
  const hasLength = hasAnyKeyword(text, LENGTH_KEYWORDS)
  const hasTone = hasAnyKeyword(text, TONE_KEYWORDS)

  const missingConstraints: string[] = []
  if (!hasFormat) missingConstraints.push('formato de saída esperado (ex: lista, JSON, parágrafos)')
  if (!hasLength)
    missingConstraints.push('limites de extensão (mínimo/máximo de caracteres ou palavras)')
  if (!hasTone) missingConstraints.push('instruções de tom, persona ou estilo de escrita')

  diagnostico.push(
    `Problema 2: Restrições ausentes — ${missingConstraints.length > 0 ? missingConstraints.join('; ') : 'o prompt não explicita restrições operacionais claras'}. Sem essas restrições, o modelo pode produzir saídas com tamanho, formato ou tom inadequados.`,
  )

  oQueMudei.push(
    missingConstraints.length > 0
      ? `Incluí restrições explícitas: ${missingConstraints.join('; ')}.`
      : 'Reforcei as restrições operacionais existentes para maior clareza.',
  )

  const objectiveCount = OBJECTIVE_SEPARATORS.reduce(
    (acc, sep) => acc + (text.toLowerCase().split(sep).length - 1),
    0,
  )

  if (objectiveCount >= 2) {
    diagnostico.push(
      `Problema 3: Múltiplos objetivos sem priorização — o prompt solicita ${objectiveCount + 1} tarefas distintas sem definir ordem de prioridade, o que pode levar o modelo a tratar todas com o mesmo peso e diluir a qualidade.`,
    )
    oQueMudei.push(
      'Estruturei os objetivos em ordem de prioridade, indicando qual é a tarefa principal e quais são secundárias.',
    )
  } else {
    diagnostico.push(
      `Problema 3: Objetivo implícito — o prompt não declara explicitamente qual é o resultado esperado, obrigando o modelo a inferir a intenção, o que aumenta o risco de desvio.`,
    )
    oQueMudei.push(
      'Defini explicitamente o objetivo principal e o resultado esperado logo no início do prompt.',
    )
  }

  const optimizedSections: string[] = []

  optimizedSections.push(`[PROMPT_ORIGINAL]`)
  optimizedSections.push(``)
  optimizedSections.push(`── INSTRUÇÕES REFINADAS ──`)
  optimizedSections.push(``)
  optimizedSections.push(`1. OBJETIVO PRINCIPAL`)
  optimizedSections.push(
    `   Defina claramente o que deve ser produzido a partir do prompt original acima.`,
  )
  optimizedSections.push(``)
  optimizedSections.push(`2. FORMATO DE SAÍDA`)
  optimizedSections.push(
    `   ${hasFormat ? '(preservado do original)' : 'Especifique: lista numerada, JSON, parágrafos estruturados, etc.'}`,
  )
  optimizedSections.push(``)
  optimizedSections.push(`3. RESTRIÇÕES`)
  optimizedSections.push(
    `   - Extensão: ${hasLength ? '(preservada do original)' : 'máximo de 500 palavras'}`,
  )
  optimizedSections.push(
    `   - Tom: ${hasTone ? '(preservado do original)' : 'profissional e objetivo'}`,
  )
  optimizedSections.push(`   - Idioma: português do Brasil`)
  optimizedSections.push(``)
  optimizedSections.push(`4. CRITÉRIOS DE QUALIDADE`)
  optimizedSections.push(`   - Evite termos vagos; use critérios mensuráveis`)
  optimizedSections.push(`   - Mantenha a variável [PROMPT_ORIGINAL] intacta`)
  optimizedSections.push(`   - Não altere o propósito original do prompt`)

  return {
    diagnostico,
    promptOtimizado: optimizedSections.join('\n'),
    oQueMudei,
  }
}
