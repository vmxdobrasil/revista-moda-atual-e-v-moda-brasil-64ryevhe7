const TAG_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-red-100 text-red-700 border-red-200',
  'bg-yellow-100 text-yellow-700 border-yellow-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
]

export function validateTag(tag: string): string | null {
  const trimmed = tag.trim()
  if (trimmed.length < 2) return 'Tag deve ter pelo menos 2 caracteres'
  if (trimmed.length > 30) return 'Tag deve ter no máximo 30 caracteres'
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed))
    return 'Tag deve conter apenas letras, números, hífens e underscores'
  return null
}

export function extractTags(options: unknown): string[] {
  if (!options) return []
  if (Array.isArray(options)) return []
  if (typeof options === 'object') {
    const obj = options as Record<string, unknown>
    if (Array.isArray(obj.tags)) {
      return obj.tags.filter((t): t is string => typeof t === 'string')
    }
  }
  return []
}

export function extractSimpleOptions(options: unknown): string[] {
  if (Array.isArray(options)) return options.filter((o): o is string => typeof o === 'string')
  if (options && typeof options === 'object' && !Array.isArray(options)) {
    const obj = options as Record<string, unknown>
    if (Array.isArray(obj.options)) {
      return obj.options.filter((o): o is string => typeof o === 'string')
    }
  }
  return []
}

export function isComplexOptions(options: unknown): boolean {
  return (
    options != null &&
    typeof options === 'object' &&
    !Array.isArray(options) &&
    !Array.isArray((options as Record<string, unknown>).options)
  )
}

export function getTagColor(tag: string): string {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = ((hash << 5) - hash + tag.charCodeAt(i)) | 0
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

export function collectAllTags(texts: Array<{ options: unknown }>): string[] {
  const tagSet = new Set<string>()
  for (const text of texts) {
    for (const tag of extractTags(text.options)) {
      tagSet.add(tag)
    }
  }
  return Array.from(tagSet).sort()
}

export interface DisplayContent {
  content: string
  type: string
  typeLabel: string
}

export function extractDisplayContent(options: unknown): DisplayContent {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return { content: '', type: 'texto', typeLabel: 'Texto' }
  }
  const obj = options as Record<string, unknown>
  if (obj.type === 'meta-prompt') {
    const blocks = Array.isArray(obj.blocks) ? (obj.blocks as Array<{ content?: string }>) : []
    const content = blocks.map((b) => b.content || '').join('\n\n') || (obj.content as string) || ''
    return { content, type: 'meta-prompt', typeLabel: 'Meta-Prompt' }
  }
  if (obj.type === 'materia_completa' && obj.content && typeof obj.content === 'object') {
    const c = obj.content as Record<string, unknown>
    return { content: (c.corpo as string) || '', type: 'materia_completa', typeLabel: 'Matéria' }
  }
  if (obj.type === 'materia-jornalistica' && typeof obj.content === 'string') {
    return { content: obj.content, type: 'materia-jornalistica', typeLabel: 'Matéria' }
  }
  if (obj.type === 'legenda-atacadista' && typeof obj.caption === 'string') {
    return { content: obj.caption, type: 'legenda-atacadista', typeLabel: 'Atacado' }
  }
  if (obj.type === 'tendencia-relatorio' && obj.report && typeof obj.report === 'object') {
    const r = obj.report as Record<string, unknown>
    return {
      content: (r.descricao as string) || '',
      type: 'tendencia-relatorio',
      typeLabel: 'Tendência',
    }
  }
  if (obj.type === 'reels-script' && typeof obj.legenda === 'string') {
    return { content: obj.legenda, type: 'reels-script', typeLabel: 'Reels' }
  }
  if (obj.type === 'plano-semanal' && typeof obj.plan === 'string') {
    return { content: obj.plan, type: 'plano-semanal', typeLabel: 'Plano Semanal' }
  }
  if (typeof obj.description === 'string') {
    return { content: obj.description, type: 'descricao', typeLabel: 'Descrição YouTube' }
  }
  if (typeof obj.content === 'string') {
    return { content: obj.content, type: 'texto', typeLabel: 'Texto' }
  }
  if (typeof obj.caption === 'string') {
    return { content: obj.caption, type: 'texto', typeLabel: 'Texto' }
  }
  return { content: JSON.stringify(obj), type: 'texto', typeLabel: 'Texto' }
}
