export interface ChecklistItem {
  key: string
  title: string
}

export interface Stage {
  key: string
  title: string
  description?: string
  items: ChecklistItem[]
}

export function parseSkillFlow(flow: unknown): Stage[] {
  if (!flow) return []
  let parsed: unknown = flow
  if (typeof flow === 'string') {
    try {
      parsed = JSON.parse(flow)
    } catch {
      return []
    }
  }

  if (Array.isArray(parsed)) {
    return parsed.map((stage: Record<string, unknown>, i: number) => {
      const key = (stage.key || stage.id || stage.slug || `stage_${i}`) as string
      const title = (stage.title || stage.name || stage.step || `Etapa ${i + 1}`) as string
      const description = (stage.description || stage.detail || '') as string
      const rawItems = (stage.checklist ||
        stage.tasks ||
        stage.items ||
        stage.checklist_items ||
        []) as unknown[]
      const items: ChecklistItem[] = rawItems.map((item: unknown, j: number) => {
        if (typeof item === 'string') return { key: `${key}_${j}`, title: item }
        const obj = item as Record<string, unknown>
        return {
          key: (obj.key || obj.id || obj.slug || `${key}_${j}`) as string,
          title: (obj.text || obj.title || obj.task || obj.label || String(item)) as string,
        }
      })
      return { key, title, description, items }
    })
  }

  if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>
    const stages = obj.stages || obj.steps || obj.flow || obj.phases
    if (Array.isArray(stages)) return parseSkillFlow(stages)
    return Object.entries(obj).map(([key, value]) => {
      const items: ChecklistItem[] = Array.isArray(value)
        ? value.map((item: unknown, j: number) => ({
            key: `${key}_${j}`,
            title:
              typeof item === 'string'
                ? item
                : (item as Record<string, unknown>).text ||
                  (item as Record<string, unknown>).title ||
                  String(item),
          }))
        : [{ key: `${key}_0`, title: String(value) }]
      return { key, title: key.replace(/_/g, ' '), description: '', items }
    })
  }

  return []
}
