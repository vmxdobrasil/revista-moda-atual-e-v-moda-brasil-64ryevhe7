import type { AuditReport } from '@/services/audit'

export function exportAuditToCSV(report: AuditReport): void {
  const lines: string[] = []

  lines.push('=== COLEÇÕES ===')
  lines.push('Nome,Registros,Último Registro,Status,Prioridade')
  report.collections.forEach((c) => {
    lines.push(`"${c.name}",${c.count},"${c.lastRecord || '—'}","${c.status}","${c.priority}"`)
  })

  lines.push('')
  lines.push('=== HOOKS ===')
  lines.push('Nome,Tipo,Status,Última Execução,Dependências,Prioridade')
  report.hooks.forEach((h) => {
    lines.push(
      `"${h.name}","${h.type}","${h.status}","${h.lastExecution || 'unavailable'}","${h.deps}","${h.priority}"`,
    )
  })

  lines.push('')
  lines.push('=== AGENTES ===')
  lines.push('Nome,Slug,Status,Última Execução,Prioridade')
  report.agents.forEach((a) => {
    lines.push(
      `"${a.name}","${a.slug}","${a.status}","${a.lastExecution || 'unavailable'}","${a.priority}"`,
    )
  })

  lines.push('')
  lines.push('=== FILA DE ENTREGA ===')
  lines.push(`Total,${report.deliveryQueue.total}`)
  lines.push(`Pendentes,${report.deliveryQueue.pending}`)
  lines.push(`Saúde,${report.deliveryQueue.healthStatus}`)
  Object.entries(report.deliveryQueue.byStatus).forEach(([k, v]) => {
    lines.push(`${k},${v}`)
  })

  lines.push('')
  lines.push('=== DIVERGÊNCIAS ===')
  lines.push(
    `Hooks,${report.hooksDivergence.documented} documentados,${report.hooksDivergence.found} encontrados`,
  )
  lines.push(
    `Prompts,${report.promptsDivergence.documented} documentados,${report.promptsDivergence.found} encontrados`,
  )
  lines.push(
    `Módulos Admin,${report.adminModulesDivergence.documented} documentados,${report.adminModulesDivergence.found} encontrados`,
  )

  lines.push('')
  lines.push('=== CORREÇÃO ARQUITETO ===')
  lines.push(`Status,${report.arquitetoFix.status}`)
  lines.push(`Bug,"${report.arquitetoFix.bug}"`)
  lines.push(`Correção,"${report.arquitetoFix.fix}"`)
  report.arquitetoFix.parameterCorrections.forEach((c) => {
    lines.push(`Correção,${c.hook},${c.field} → ${c.correctedTo},${c.reason}`)
  })

  const csv = '\uFEFF' + lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `auditoria_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
