import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  SKILL_CATEGORIES,
  CATEGORY_COLORS,
  type Skill,
  type SkillFlowStep,
  type SkillRule,
  type SkillResponsibility,
  type RelatedAgent,
} from '@/services/skills'
import {
  ArrowLeft,
  Pencil,
  Bot,
  ListChecks,
  Users,
  GitBranch,
  FileText,
  Trash2,
  FileDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { exportSkillToPDF } from '@/lib/skills-pdf-export'
import { toast } from 'sonner'

export function SkillDetailView({
  skill,
  onBack,
  onEdit,
  onDelete,
}: {
  skill: Skill
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const cat = SKILL_CATEGORIES.find((c) => c.value === skill.category)
  const steps = Array.isArray(skill.flow) ? (skill.flow as SkillFlowStep[]) : []
  const rules = Array.isArray(skill.rules) ? (skill.rules as SkillRule[]) : []
  const responsibilities = Array.isArray(skill.responsibilities)
    ? (skill.responsibilities as SkillResponsibility[])
    : []
  const agents = Array.isArray(skill.related_agents) ? (skill.related_agents as RelatedAgent[]) : []

  const handleExport = () => {
    exportSkillToPDF(skill)
    toast.success('Exportando PDF...')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-gray-600">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={onDelete}
            className="gap-2 text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <FileDown className="w-4 h-4" /> PDF
          </Button>
          <Button onClick={onEdit} className="gap-2">
            <Pencil className="w-4 h-4" /> Editar
          </Button>
        </div>
      </div>

      <Card className="border-none bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{skill.title}</h1>
          <p className="text-sm text-gray-500">{skill.summary}</p>
        </CardContent>
      </Card>

      {steps.length > 0 && (
        <Card className="border-none bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-800">Fluxo Operacional</h2>
            </div>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">{step.step}</span>
                      <Badge variant="outline" className="text-xs">
                        {step.responsible}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {rules.length > 0 && (
        <Card className="border-none bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-gray-800">Regras Operacionais</h2>
            </div>
            <div className="space-y-2">
              {rules.map((r, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <div>
                    <span className="font-semibold text-gray-700 text-sm">{r.rule}:</span>{' '}
                    <span className="text-sm text-gray-500">{r.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {responsibilities.length > 0 && (
        <Card className="border-none bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-bold text-gray-800">Responsabilidades</h2>
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
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-bold text-gray-800">Documentação Completa</h2>
            </div>
            <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {skill.body}
            </div>
          </CardContent>
        </Card>
      )}

      {agents.length > 0 && (
        <Card className="border-none bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-cyan-500" />
              <h2 className="text-lg font-bold text-gray-800">Integração com Agentes</h2>
            </div>
            <div className="space-y-2">
              {agents.map((a, i) => (
                <div key={i} className="flex gap-2 items-start bg-cyan-50 rounded-lg p-3">
                  <Bot className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <code className="text-xs font-mono text-cyan-700 font-semibold">{a.agent}</code>
                    <p className="text-sm text-gray-600 mt-0.5">{a.how}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
