import type { QaParecer, QaClassification } from '@/services/editorial-qa'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'

const CLASSIFICATION_CONFIG: Record<
  QaClassification,
  { label: string; color: string; icon: typeof CheckCircle }
> = {
  aprovado: { label: 'Aprovado', color: 'bg-green-500', icon: CheckCircle },
  revisar: { label: 'Revisar', color: 'bg-yellow-500', icon: AlertCircle },
  reprovado: { label: 'Reprovado', color: 'bg-red-500', icon: XCircle },
}

export function QaParecerDisplay({ parecer }: { parecer: QaParecer }) {
  const config = CLASSIFICATION_CONFIG[parecer.classification] || CLASSIFICATION_CONFIG.revisar
  const Icon = config.icon

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-orange-500" /> Parecer QA Editorial
          </span>
          <div className="flex items-center gap-2">
            <Badge className={config.color}>{config.label}</Badge>
            <span className="text-2xl font-bold text-gray-800">{parecer.score}/100</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Justificativa</h4>
          <p className="text-sm text-gray-600">{parecer.justification}</p>
        </div>
        {parecer.suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">Sugestões de Correção</h4>
            <ul className="space-y-1">
              {parecer.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-orange-500 font-bold shrink-0">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
