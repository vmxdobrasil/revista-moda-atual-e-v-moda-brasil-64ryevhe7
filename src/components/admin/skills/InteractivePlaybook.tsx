import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FileDown,
  GitBranch,
  ListChecks,
  Users,
  FileText,
  Bot,
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react'
import {
  SKILL_CATEGORIES,
  CATEGORY_COLORS,
  type Skill,
  type SkillFlowStep,
  type SkillRule,
  type SkillResponsibility,
  type RelatedAgent,
} from '@/services/skills'
import { getTasksBySkill, upsertTask, type SkillTask } from '@/services/skills-tasks'
import { exportSkillToPDF } from '@/lib/skills-export'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function InteractivePlaybook({ skill }: { skill: Skill }) {
  const [tasks, setTasks] = useState<SkillTask[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStep, setActiveStep] = useState(0)

  const cat = SKILL_CATEGORIES.find((c) => c.value === skill.category)
  const steps = Array.isArray(skill.flow) ? (skill.flow as SkillFlowStep[]) : []
  const rules = Array.isArray(skill.rules) ? (skill.rules as SkillRule[]) : []
  const responsibilities = Array.isArray(skill.responsibilities)
    ? (skill.responsibilities as SkillResponsibility[])
    : []
  const agents = Array.isArray(skill.related_agents) ? (skill.related_agents as RelatedAgent[]) : []

  const load = useCallback(async () => {
    try {
      const data = await getTasksBySkill(skill.id)
      setTasks(data)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [skill.id])

  useEffect(() => {
    setLoading(true)
    setActiveStep(0)
    load()
  }, [load])
  useRealtime('skills_tasks', () => load())

  const taskMap = new Map(tasks.map((t) => [t.task_key, t]))

  const toggleTask = async (taskKey: string, title: string) => {
    const existing = taskMap.get(taskKey)
    const newStatus = existing?.status === 'completed' ? 'pending' : 'completed'
    try {
      await upsertTask(skill.id, taskKey, title, newStatus)
    } catch {
      toast.error('Erro ao atualizar tarefa')
    }
  }

  const completedSteps = steps.filter((_, i) => {
    const task = taskMap.get(`step_${i}`)
    return task?.status === 'completed'
  }).length

  const progress = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0

  const handleExport = () => {
    exportSkillToPDF(skill)
    toast.success('Exportando PDF...')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-4 pr-2">
        <Card className="border-none bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className={cn(CATEGORY_COLORS[skill.category] || 'bg-gray-100 text-gray-600')}
                  >
                    {cat?.label || skill.category}
                  </Badge>
                  <Badge variant={skill.status === 'publicado' ? 'default' : 'secondary'}>
                    {skill.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                  </Badge>
                </div>
                <h2 className="text-xl font-bold text-gray-800">{skill.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{skill.summary}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2 flex-shrink-0"
              >
                <FileDown className="w-4 h-4" /> PDF
              </Button>
            </div>
            {steps.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progresso do Playbook</span>
                  <span>
                    {completedSteps}/{steps.length} etapas ({progress}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {steps.length > 0 && (
          <Card className="border-none bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <GitBranch className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-bold text-gray-800">Fluxo Interativo</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {steps.map((step, i) => {
                  const task = taskMap.get(`step_${i}`)
                  const isDone = task?.status === 'completed'
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveStep(i)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        activeStep === i
                          ? 'bg-orange-500 text-white'
                          : isDone
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                      )}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Circle className="w-3.5 h-3.5" />
                      )}
                      {i + 1}. {step.step}
                    </button>
                  )
                })}
              </div>
              {steps[activeStep] && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
                      {activeStep + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">{steps[activeStep].step}</h4>
                        <Badge variant="outline" className="text-xs">
                          {steps[activeStep].responsible}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{steps[activeStep].description}</p>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`step_${activeStep}`}
                          checked={taskMap.get(`step_${activeStep}`)?.status === 'completed'}
                          onCheckedChange={() =>
                            toggleTask(`step_${activeStep}`, steps[activeStep].step)
                          }
                        />
                        <label
                          htmlFor={`step_${activeStep}`}
                          className="text-sm text-gray-700 cursor-pointer select-none"
                        >
                          Marcar como concluído
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {rules.length > 0 && (
          <Card className="border-none bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold text-gray-800">Regras Operacionais</h3>
              </div>
              <div className="space-y-2">
                {rules.map((r, i) => (
                  <div key={i} className="flex gap-2 items-start text-sm">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <div>
                      <span className="font-semibold text-gray-700">{r.rule}:</span>{' '}
                      <span className="text-gray-500">{r.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {responsibilities.length > 0 && (
          <Card className="border-none bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-purple-500" />
                <h3 className="text-base font-bold text-gray-800">Responsabilidades</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {responsibilities.map((r, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="font-semibold text-gray-700 text-sm mb-1">{r.role}</p>
                    <ul className="space-y-1">
                      {r.responsibilities.map((item, j) => (
                        <li key={j} className="text-xs text-gray-500 flex gap-1">
                          <span className="text-purple-400">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {skill.body && (
          <Card className="border-none bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-green-500" />
                <h3 className="text-base font-bold text-gray-800">Documentação</h3>
              </div>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed font-sans">
                {skill.body}
              </pre>
            </CardContent>
          </Card>
        )}

        {agents.length > 0 && (
          <Card className="border-none bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-5 h-5 text-cyan-500" />
                <h3 className="text-base font-bold text-gray-800">Agentes Integrados</h3>
              </div>
              <div className="space-y-2">
                {agents.map((a, i) => (
                  <div key={i} className="flex gap-2 items-start bg-cyan-50 rounded-lg p-3">
                    <Bot className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <code className="text-xs font-mono text-cyan-700 font-semibold">
                        {a.agent}
                      </code>
                      <p className="text-sm text-gray-600 mt-0.5">{a.how}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  )
}
