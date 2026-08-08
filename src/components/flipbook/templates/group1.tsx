import { LookbookView } from './lookbook-view'
import { IndiceView } from './indice-view'
import { TrendReportView } from './trend-report-view'
import type { TemplateFormat } from './format-context'

export function renderGroup1(template: string, d: any, format: TemplateFormat = 'a4') {
  if (template === 'lookbook') return <LookbookView data={d} format={format} />
  if (template === 'indice') return <IndiceView data={d} format={format} />
  if (template === 'trend_report') return <TrendReportView data={d} format={format} />
  return null
}
