import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { getAllTasks, type SkillTask } from '@/services/skills-tasks'
import type { Skill } from '@/services/skills'
import { CATEGORY_LABELS } from '@/services/skills'
import { parseSkillFlow } from '@/lib/skills-utils'
import { useRealtime } from '@/hooks/use-realtime'

export function AdherenceReport({ skills }: { skills: Skill[] }) {
  const [tasks, setTasks] = useState<SkillTask[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setTasks(await getAllTasks())
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('skills_tasks', () => load())

  const stats = skills.map((skill) => {
    const stages = parseSkillFlow(skill.flow)
    const totalItems = stages.reduce((sum, s) => sum + s.items.length, 0)
    const skillTasks = tasks.filter((t) => t.skill === skill.id)
    const completed = skillTasks.filter((t) => t.status === 'completed').length
    const inProgress = skillTasks.filter((t) => t.status === 'in_progress').length
    const lastCompleted = skillTasks
      .filter((t) => t.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0]
    const pct = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0
    return { skill, totalItems, completed, inProgress, pct, lastCompleted }
  })

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground animate-pulse">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Total de Skills</p>
            <p className="text-2xl font-bold text-gray-800">{skills.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Tarefas Concluídas</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.reduce((s, st) => s + st.completed, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Em Andamento</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.reduce((s, st) => s + st.inProgress, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Adesão Média</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.length > 0
                ? Math.round(stats.reduce((s, st) => s + st.pct, 0) / stats.length)
                : 0}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map(({ skill, totalItems, completed, inProgress, pct, lastCompleted }) => (
          <Card key={skill.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{skill.title}</p>
                  <p className="text-xs text-gray-500">
                    {CATEGORY_LABELS[skill.category] || skill.category}
                  </p>
                </div>
                <Badge variant={pct === 100 ? 'default' : 'secondary'}>{pct}%</Badge>
              </div>
              <Progress value={pct} className="h-2 mb-3" />
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>
                  {completed}/{totalItems} concluídas
                </span>
                {inProgress > 0 && <span>{inProgress} em andamento</span>}
                {lastCompleted?.completed_at && (
                  <span>
                    Última: {new Date(lastCompleted.completed_at).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
