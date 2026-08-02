import type { AuditReport } from '@/services/audit'

function fmtDate(v: string | null): string {
  if (!v) return 'indisponível'
  try {
    return new Date(v).toLocaleString('pt-BR')
  } catch {
    return 'indisponível'
  }
}

export function exportAuditToCSV(report: AuditReport): void {
  const lines: string[] = []

  lines.push('=== COLEÇÕES ===')
  lines.push('Nome,Registros,Último Registro,Status,Prioridade')
  report.collections.forEach((c) => {
    lines.push(`"${c.name}",${c.count},"${fmtDate(c.lastRecord)}","${c.status}","${c.priority}"`)
  })

  lines.push('')
  lines.push('=== HOOKS ===')
  lines.push('Nome,Tipo,Status,Última Execução,Dependências,Prioridade')
  report.hooks.forEach((h) => {
    lines.push(
      `"${h.name}","${h.type}","${h.status}","${fmtDate(h.lastExecution)}","${h.deps}","${h.priority}"`,
    )
  })

  lines.push('')
  lines.push('=== AGENTES ===')
  lines.push('Nome,Slug,Status,Última Execução,Prioridade')
  report.agents.forEach((a) => {
    lines.push(
      `"${a.name}","${a.slug}","${a.status}","${fmtDate(a.lastExecution)}","${a.priority}"`,
    )
  })

  lines.push('')
  lines.push('=== FILA DE ENTREGA ===')
  lines.push(`Total,${report.deliveryQueue.total}`)
  lines.push(`Pendentes,${report.deliveryQueue.pending}`)
  lines.push(`Saúde,${report.deliveryQueue.healthStatus}`)
  lines.push(`Tempo Médio de Processamento,${report.deliveryQueue.avgProcessingTime}`)
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

export function exportAuditToTXT(report: AuditReport): void {
  const lines: string[] = []

  lines.push('RELATÓRIO DE AUDITORIA DO SISTEMA')
  lines.push(`Gerado em: ${new Date(report.generatedAt).toLocaleString('pt-BR')}`)
  lines.push('='.repeat(60))
  lines.push('')

  lines.push('COLEÇÕES')
  lines.push('-'.repeat(40))
  report.collections.forEach((c) => {
    lines.push(
      `  ${c.name}: ${c.count} registros | Status: ${c.status} | Prioridade: ${c.priority}`,
    )
    lines.push(`    Último registro: ${fmtDate(c.lastRecord)}`)
  })
  lines.push('')

  lines.push('HOOKS')
  lines.push('-'.repeat(40))
  report.hooks.forEach((h) => {
    lines.push(`  ${h.name} (${h.type})`)
    lines.push(`    Status: ${h.status} | Prioridade: ${h.priority}`)
    lines.push(`    Dependências: ${h.deps}`)
    lines.push(`    Última execução: ${fmtDate(h.lastExecution)}`)
  })
  lines.push('')

  lines.push('AGENTES')
  lines.push('-'.repeat(40))
  report.agents.forEach((a) => {
    lines.push(`  ${a.name} (${a.slug})`)
    lines.push(`    ${a.description}`)
    lines.push(`    Status: ${a.status} | Prioridade: ${a.priority}`)
    lines.push(`    Última execução: ${fmtDate(a.lastExecution)}`)
  })
  lines.push('')

  lines.push('FILA DE ENTREGA')
  lines.push('-'.repeat(40))
  lines.push(`  Total: ${report.deliveryQueue.total}`)
  lines.push(`  Pendentes: ${report.deliveryQueue.pending}`)
  lines.push(`  Saúde: ${report.deliveryQueue.healthStatus}`)
  lines.push(`  Tempo Médio de Processamento: ${report.deliveryQueue.avgProcessingTime}`)
  Object.entries(report.deliveryQueue.byStatus).forEach(([k, v]) => {
    lines.push(`    ${k}: ${v}`)
  })
  lines.push('')

  lines.push('DIVERGÊNCIAS')
  lines.push('-'.repeat(40))
  lines.push(
    `  Hooks: ${report.hooksDivergence.documented} documentados → ${report.hooksDivergence.found} encontrados`,
  )
  lines.push(
    `  Prompts: ${report.promptsDivergence.documented} documentados → ${report.promptsDivergence.found} encontrados`,
  )
  lines.push(
    `  Módulos Admin: ${report.adminModulesDivergence.documented} documentados → ${report.adminModulesDivergence.found} encontrados`,
  )

  const txt = '\uFEFF' + lines.join('\n')
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `auditoria_${new Date().toISOString().slice(0, 10)}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportAuditToPDF(report: AuditReport): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório de Auditoria</title>
<style>
body{font-family:Arial,sans-serif;padding:24px;color:#1a1a1a}
h1{font-size:20px;margin-bottom:8px}
h2{font-size:16px;margin-top:20px;margin-bottom:8px;border-bottom:1px solid #e0e0e0;padding-bottom:4px}
table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:11px}
th,td{border:1px solid #e0e0e0;padding:4px 6px;text-align:left}
th{background:#f5f5f5;font-weight:600}
.meta{font-size:12px;color:#666;margin-bottom:16px}
@media print{body{padding:0}@page{margin:1cm}}
</style></head><body>
<h1>Relatório de Auditoria do Sistema</h1>
<p class="meta">Gerado em ${new Date(report.generatedAt).toLocaleString('pt-BR')}</p>
<h2>Coleções (${report.collections.length})</h2>
<table><tr><th>Nome</th><th>Registros</th><th>Último Registro</th><th>Status</th><th>Prioridade</th></tr>
${report.collections.map((c) => `<tr><td>${esc(c.name)}</td><td>${c.count}</td><td>${fmtDate(c.lastRecord)}</td><td>${c.status}</td><td>${c.priority}</td></tr>`).join('')}
</table>
<h2>Hooks (${report.hooks.length})</h2>
<table><tr><th>Nome</th><th>Tipo</th><th>Status</th><th>Última Execução</th><th>Dependências</th><th>Prioridade</th></tr>
${report.hooks.map((h) => `<tr><td>${esc(h.name)}</td><td>${h.type}</td><td>${h.status}</td><td>${fmtDate(h.lastExecution)}</td><td>${esc(h.deps)}</td><td>${h.priority}</td></tr>`).join('')}
</table>
<h2>Agentes (${report.agents.length})</h2>
<table><tr><th>Nome</th><th>Slug</th><th>Status</th><th>Última Execução</th><th>Prioridade</th></tr>
${report.agents.map((a) => `<tr><td>${esc(a.name)}</td><td>${a.slug}</td><td>${a.status}</td><td>${fmtDate(a.lastExecution)}</td><td>${a.priority}</td></tr>`).join('')}
</table>
<h2>Fila de Entrega</h2>
<p>Total: ${report.deliveryQueue.total} | Pendentes: ${report.deliveryQueue.pending} | Saúde: ${report.deliveryQueue.healthStatus} | Tempo Médio: ${report.deliveryQueue.avgProcessingTime}</p>
<table><tr><th>Status</th><th>Quantidade</th></tr>
${Object.entries(report.deliveryQueue.byStatus)
  .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
  .join('')}
</table>
<h2>Divergências</h2>
<p>Hooks: ${report.hooksDivergence.documented} documentados → ${report.hooksDivergence.found} encontrados</p>
<p>Prompts: ${report.promptsDivergence.documented} documentados → ${report.promptsDivergence.found} encontrados</p>
<p>Módulos Admin: ${report.adminModulesDivergence.documented} documentados → ${report.adminModulesDivergence.found} encontrados</p>
<button onclick="window.print()" style="position:fixed;bottom:24px;right:24px;padding:12px 24px;background:#ea580c;color:#fff;border:none;border-radius:8px;cursor:pointer">Imprimir / Salvar PDF</button>
<script>setTimeout(function(){window.print();},500)</script>
</body></html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
