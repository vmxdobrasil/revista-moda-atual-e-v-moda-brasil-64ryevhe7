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
