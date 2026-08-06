import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, Loader2, FileDown, Cpu } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { getTasksBySkill, upsertTask, type SkillTask } from '@/services/skills-tasks'
import type { Skill } from '@/services/skills'
import { parseSkillFlow } from '@/lib/skills-utils'
import { exportSkillToPDF } from '@/lib/skills-pdf-export'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const AGENT_MAP: Record<string, { agent: string; hook: string; collections: string[] }> = {
  producao_editorial: {
    agent: 'content-chain, editorial-qa',
    hook: 'content_workflow_orchestrator, editorial_qa_review',
    collections: ['workflow_results', 'edition_pages'],
  },
  seo: {
    agent: 'seo-specialist',
    hook: 'seo_optimize',
    collections: ['seo_metrics', 'edition_pages'],
  },
  distribuicao: {
    agent: 'social-publisher',
    hook: 'social_publish_publicar, social_publish_agendar',
    collections: ['social_posts'],
  },
  nutricao: {
    agent: 'audience-nurture',
    hook: 'newsletter_generate',
    collections: ['newsletter_campaigns', 'subscribers'],
  },
  monetizacao: {
    agent: 'cover-editorial-art-director',
    hook: 'generate_contract, email_proposal',
    collections: ['ad_proposals', 'ad_pricing_rules'],
  },
  conversao: {
    agent: 'conversion',
    hook: 'funil, cta',
    collections: ['marketplace_orders', 'conversion_metrics'],
  },
  inteligencia_competitiva: {
    agent: 'market-watch',
    hook: 'alertas, concorrentes',
    collections: ['market_signals', 'competitors'],
  },
}

export function InteractivePlaybook({ skill }: { skill: Skill }) {
  const [tasks, setTasks] = useState<SkillTask[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const load = useCallback(async () => {
    try {
      setTasks(await getTasksBySkill(skill.id))
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [skill.id])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])
  useRealtime('skills_tasks', () => load())

  const stages = parseSkillFlow(skill.flow)
  const totalItems = stages.reduce((s, st) => s + st.items.length, 0)
  const completedCount = tasks.filter((t) => t.status === 'completed').length
  const pct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

  const getTaskStatus = (taskKey: string): string =>
    tasks.find((t) => t.task_key === taskKey)?.status || 'pending'

  const handleToggle = async (taskKey: string, title: string) => {
    const current = getTaskStatus(taskKey)
    const next = current === 'completed' ? 'pending' : 'completed'
    setUpdating(taskKey)
    setFieldErrors({})
    try {
      await upsertTask({
        skill: skill.id,
        task_key: taskKey,
        title,
        status: next as 'completed' | 'pending',
      })
      toast.success(next === 'completed' ? 'Tarefa concluída!' : 'Tarefa reaberta')
    } catch (err) {
      const fe = extractFieldErrors(err)
      setFieldErrors(fe)
      toast.success(next === 'completed' ? 'Tarefa concluída!' : 'Tarefa reaberta')
    } finally {
      setUpdating(null)
    }
  }

  const agentInfo = AGENT_MAP[skill.category] || { agent: '—', hook: '—', collections: [] }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{skill.title}</CardTitle>
              {skill.summary && <p className="text-sm text-gray-500 mt-1">{skill.summary}</p>}
            </div>
            <Button variant="outline" size="sm" onClick={() => exportSkillToPDF(skill)}>
              <FileDown className="w-4 h-4 mr-1" /> Exportar PDF
            </Button>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">
                Progresso: {completedCount}/{totalItems}
              </span>
              <span className="text-xs font-semibold text-orange-600">{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {stages.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-gray-500">
            Nenhum fluxo de execução definido para este Skill.
          </CardContent>
        </Card>
      )}

      {stages.map((stage, si) => {
        const stageCompleted = stage.items.filter(
          (item) => getTaskStatus(item.key) === 'completed',
        ).length
        return (
          <Card key={stage.key}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-sm font-bold">
                  {si + 1}
                </span>
                <CardTitle className="text-base">{stage.title}</CardTitle>
                <Badge variant="secondary" className="ml-auto">
                  {stageCompleted}/{stage.items.length}
                </Badge>
              </div>
              {stage.description && (
                <p className="text-xs text-gray-500 mt-1">{stage.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-1">
              {stage.items.map((item) => {
                const status = getTaskStatus(item.key)
                const isUpdating = updating === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => handleToggle(item.key, item.title)}
                    disabled={isUpdating}
                    className={cn(
                      'flex items-center gap-2 w-full text-left p-2 rounded-lg transition-colors',
                      status === 'completed' ? 'bg-green-50' : 'hover:bg-gray-50',
                      isUpdating && 'opacity-50',
                    )}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300" />
                    )}
                    <span
                      className={cn(
                        'text-sm',
                        status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700',
                      )}
                    >
                      {item.title}
                    </span>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        )
      })}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-orange-500" /> Integração com Agentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 w-24 shrink-0">Agentes:</span>
            <span className="text-gray-800">{agentInfo.agent}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 w-24 shrink-0">Hooks:</span>
            <span className="text-gray-800">{agentInfo.hook}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-500 w-24 shrink-0 pt-0.5">Coleções:</span>
            <div className="flex flex-wrap gap-1">
              {agentInfo.collections.map((c) => (
                <Badge key={c} variant="outline" className="text-xs">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.keys(fieldErrors).length > 0 && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {Object.values(fieldErrors).map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}
    </div>
  )
}
