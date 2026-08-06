import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SKILL_CATEGORIES, CATEGORY_COLORS, type Skill } from '@/services/skills'
import { FileText, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SkillCard({ skill, onClick }: { skill: Skill; onClick: () => void }) {
  const cat = SKILL_CATEGORIES.find((c) => c.value === skill.category)
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-none bg-white"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-500" />
            </div>
            <Badge
              variant="secondary"
              className={cn(
                'text-xs',
                CATEGORY_COLORS[skill.category] || 'bg-gray-100 text-gray-600',
              )}
            >
              {cat?.label || skill.category}
            </Badge>
          </div>
          <Badge
            variant={skill.status === 'publicado' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {skill.status === 'publicado' ? 'Publicado' : 'Rascunho'}
          </Badge>
        </div>
        <h3 className="font-bold text-gray-800 text-base mb-1">{skill.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{skill.summary || 'Sem descrição'}</p>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <span>{skill.flow?.length || 0} etapas</span>
          <span>•</span>
          <span>{skill.related_agents?.length || 0} agentes</span>
          <ArrowRight className="w-3 h-3 ml-auto" />
        </div>
      </CardContent>
    </Card>
  )
}
