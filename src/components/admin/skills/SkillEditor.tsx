import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  SKILL_CATEGORIES,
  SKILL_STATUSES,
  createSkill,
  updateSkill,
  type Skill,
} from '@/services/skills'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

function safeStringify(val: unknown): string {
  if (!val) return ''
  if (typeof val === 'string') return val
  try {
    return JSON.stringify(val, null, 2)
  } catch {
    return ''
  }
}

function safeParse(val: string): unknown {
  if (!val.trim()) return null
  try {
    return JSON.parse(val)
  } catch {
    return undefined
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function SkillEditor({
  skill,
  onBack,
  onSaved,
}: {
  skill?: Skill
  onBack: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(skill?.title || '')
  const [slug, setSlug] = useState(skill?.slug || '')
  const [category, setCategory] = useState(skill?.category || 'producao_editorial')
  const [summary, setSummary] = useState(skill?.summary || '')
  const [status, setStatus] = useState(skill?.status || 'rascunho')
  const [body, setBody] = useState(skill?.body || '')
  const [flow, setFlow] = useState(safeStringify(skill?.flow))
  const [rules, setRules] = useState(safeStringify(skill?.rules))
  const [responsibilities, setResponsibilities] = useState(safeStringify(skill?.responsibilities))
  const [relatedAgents, setRelatedAgents] = useState(safeStringify(skill?.related_agents))
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast.error('Título e slug são obrigatórios')
      return
    }
    const flowParsed = safeParse(flow)
    if (flowParsed === undefined) {
      toast.error('JSON inválido no campo Fluxo')
      return
    }
    const rulesParsed = safeParse(rules)
    if (rulesParsed === undefined) {
      toast.error('JSON inválido no campo Regras')
      return
    }
    const respParsed = safeParse(responsibilities)
    if (respParsed === undefined) {
      toast.error('JSON inválido no campo Responsabilidades')
      return
    }
    const agentsParsed = safeParse(relatedAgents)
    if (agentsParsed === undefined) {
      toast.error('JSON inválido no campo Agentes Relacionados')
      return
    }

    setSaving(true)
    try {
      const data = {
        title,
        slug,
        category,
        summary,
        status,
        body,
        flow: flowParsed,
        rules: rulesParsed,
        responsibilities: respParsed,
        related_agents: agentsParsed,
      }
      if (skill?.id) {
        await updateSkill(skill.id, data)
        toast.success('Skill atualizada com sucesso')
      } else {
        await createSkill(data)
        toast.success('Skill criada com sucesso')
      }
      onSaved()
    } catch (err) {
      toast.error('Erro ao salvar skill: ' + (err instanceof Error ? err.message : 'desconhecido'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-gray-600">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <Card className="border-none bg-white shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">Título *</Label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (!skill?.id) setSlug(slugify(e.target.value))
                }}
                placeholder="Ex: Produção Editorial Completa"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Slug *</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="producao-editorial-completa"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">Categoria *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Resumo</Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              placeholder="Breve descrição exibida no card"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-white shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-700">Campos Estruturados (JSON)</h3>
          <div>
            <Label className="text-sm font-semibold">Fluxo (JSON)</Label>
            <Textarea
              value={flow}
              onChange={(e) => setFlow(e.target.value)}
              rows={6}
              className="font-mono text-xs"
              placeholder='[{"step":"Pauta","description":"...","responsible":"Editor"}]'
            />
          </div>
          <div>
            <Label className="text-sm font-semibold">Regras (JSON)</Label>
            <Textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={6}
              className="font-mono text-xs"
              placeholder='[{"rule":"Tom de voz","detail":"..."}]'
            />
          </div>
          <div>
            <Label className="text-sm font-semibold">Responsabilidades (JSON)</Label>
            <Textarea
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              rows={6}
              className="font-mono text-xs"
              placeholder='[{"role":"Copywriter","responsibilities":["..."]}]'
            />
          </div>
          <div>
            <Label className="text-sm font-semibold">Agentes Relacionados (JSON)</Label>
            <Textarea
              value={relatedAgents}
              onChange={(e) => setRelatedAgents(e.target.value)}
              rows={6}
              className="font-mono text-xs"
              placeholder='[{"agent":"hook_name","how":"..."}]'
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-white shadow-sm">
        <CardContent className="p-6">
          <Label className="text-sm font-semibold">Documentação Completa (Body)</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            placeholder="Checklists, padrões, formatos, critérios..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
