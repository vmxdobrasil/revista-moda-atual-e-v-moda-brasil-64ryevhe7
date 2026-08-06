import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { SKILL_CATEGORIES, CATEGORY_COLORS, type Skill } from '@/services/skills'
import { getAllTasks, type SkillTask } from '@/services/skills-tasks'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

interface SkillStats {
  total: number
  completed: number
  pending: number
  inProgress: number
  completionRate: number
  lastUpdated: string | null
}

export function AdherenceReport({ skills }: { skills: Skill[] }) {
  const [tasks, setTasks] = useState<SkillTask[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await getAllTasks()
      setTasks(data)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    )
  }

  const getSkillStats = (skillId: string): SkillStats => {
    const skillTasks = tasks.filter((t) => t.skill === skillId)
    const total = skillTasks.length
    const completed = skillTasks.filter((t) => t.status === 'completed').length
    const pending = skillTasks.filter((t) => t.status === 'pending').length
    const inProgress = skillTasks.filter((t) => t.status === 'in_progress').length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const sorted = [...skillTasks].sort((a, b) => (b.updated || '').localeCompare(a.updated || ''))
    const lastUpdated = sorted.length > 0 ? sorted[0].updated : null
    return { total, completed, pending, inProgress, completionRate, lastUpdated }
  }

  const allStats = skills.map((s) => ({ skill: s, stats: getSkillStats(s.id) }))
  const totalTasks = allStats.reduce((sum, s) => sum + s.stats.total, 0)
  const totalCompleted = allStats.reduce((sum, s) => sum + s.stats.completed, 0)
  const overallRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0

  const fmtDate = (d: string | null) => {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return '—'
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-none bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{overallRate}%</p>
              <p className="text-xs text-gray-500">Adesão Geral</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalCompleted}</p>
              <p className="text-xs text-gray-500">Tarefas Concluídas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalTasks}</p>
              <p className="text-xs text-gray-500">Total de Tarefas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none bg-white shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-base font-bold text-gray-800 mb-4">Adesão por Skill</h3>
          <div className="space-y-3">
            {allStats.map(({ skill, stats }) => {
              const cat = SKILL_CATEGORIES.find((c) => c.value === skill.category)
              return (
                <div key={skill.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs flex-shrink-0',
                          CATEGORY_COLORS[skill.category] || 'bg-gray-100 text-gray-600',
                        )}
                      >
                        {cat?.label || skill.category}
                      </Badge>
                      <span className="font-semibold text-sm text-gray-800 truncate">
                        {skill.title}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-700 flex-shrink-0">
                      {stats.completionRate}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={cn(
                        'h-full transition-all duration-300',
                        stats.completionRate === 100
                          ? 'bg-green-500'
                          : stats.completionRate >= 50
                            ? 'bg-orange-500'
                            : 'bg-red-400',
                      )}
                      style={{ width: `${stats.completionRate}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      {stats.completed} concluídas
                    </span>
                    {stats.pending > 0 && (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-orange-400" />
                        {stats.pending} pendentes
                      </span>
                    )}
                    <span>Última: {fmtDate(stats.lastUpdated)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
