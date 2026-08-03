import type { AuditReport } from '@/services/audit'

function fmtDate(v: string | null): string {
  if (!v) return 'indisponível'
  try {
    return new Date(v).toLocaleString('pt-BR')
  } catch {
    return 'indisponível'
  }
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

interface ExecutiveSummary {
  totalHooks: number
  activeHooks: number
  errorHooks: number
  totalAgents: number
  activeAgents: number
  totalRecords: number
  collectionsNeedingAttention: number
  dqErrors: number
  dqPending: number
  dqPublished: number
  totalExecutions: number
  successExecutions: number
  errorExecutions: number
  successRate: string
  overallStatus: string
  statusColor: string
  findings: string[]
  hasData: boolean
}

function computeExecutiveSummary(report: AuditReport): ExecutiveSummary {
  const totalHooks = report.hooks.length
  const activeHooks = report.hooks.filter((h) => h.status === 'active').length
  const errorHooks = report.hooks.filter((h) => h.status === 'error').length
  const totalAgents = report.agents.length
  const activeAgents = report.agents.filter((a) => a.status === 'active').length
  const totalRecords = report.collections.reduce((sum, c) => sum + c.count, 0)
  const collectionsNeedingAttention = report.collections.filter((c) => c.status !== 'OK').length
  const dqErrors = report.deliveryQueue.errors.length
  const dqPending = report.deliveryQueue.pending
  const dqPublished = report.deliveryQueue.byStatus['publicado'] || 0
  const totalExecutions =
    report.hookExecutionsByDay?.reduce((sum, d) => sum + d.success + d.error, 0) || 0
  const successExecutions = report.hookExecutionsByDay?.reduce((sum, d) => sum + d.success, 0) || 0
  const errorExecutions = report.hookExecutionsByDay?.reduce((sum, d) => sum + d.error, 0) || 0
  const successRate =
    totalExecutions > 0 ? ((successExecutions / totalExecutions) * 100).toFixed(1) : '0.0'

  let overallStatus = 'Saudável'
  let statusColor = '#16a34a'
  if (errorHooks > 0 || dqErrors > 0) {
    overallStatus = 'Atenção Necessária'
    statusColor = '#ea580c'
  }
  if (errorHooks > 3 || dqErrors > 5) {
    overallStatus = 'Crítico'
    statusColor = '#dc2626'
  }

  const findings: string[] = []
  if (errorHooks > 0) findings.push(`${errorHooks} hook(s) com erro`)
  if (collectionsNeedingAttention > 0)
    findings.push(`${collectionsNeedingAttention} coleção(ões) precisando de atenção`)
  if (dqErrors > 0) findings.push(`${dqErrors} item(ns) com erro na fila de entrega`)
  if (dqPending > 0) findings.push(`${dqPending} item(ns) pendentes na fila de entrega`)
  if (findings.length === 0) findings.push('Nenhum problema detectado')

  const hasData = totalHooks > 0 || totalRecords > 0 || totalExecutions > 0

  return {
    totalHooks,
    activeHooks,
    errorHooks,
    totalAgents,
    activeAgents,
    totalRecords,
    collectionsNeedingAttention,
    dqErrors,
    dqPending,
    dqPublished,
    totalExecutions,
    successExecutions,
    errorExecutions,
    successRate,
    overallStatus,
    statusColor,
    findings,
    hasData,
  }
}

export function exportAuditToCSV(report: AuditReport): void {
  const lines: string[] = []

  lines.push('Relatório de Auditoria — Revista MODA ATUAL')
  lines.push(`Gerado em: ${new Date(report.generatedAt).toLocaleString('pt-BR')}`)
  lines.push('')
  lines.push('=== COLEÇÕES ===')
  lines.push('Nome,Registros,Último Registro,Status,Prioridade')
  report.collections.forEach((c) => {
    lines.push(`"${c.name}",${c.count},"${fmtDate(c.lastRecord)}","${c.status}","${c.priority}"`)
  })

  lines.push('')
  lines.push('=== HOOKS ===')
  lines.push('Nome,Tipo,Status,Última Execução,Dependências,Prioridade,Mensagem de Erro')
  report.hooks.forEach((h) => {
    lines.push(
      `"${h.name}","${h.type}","${h.status}","${fmtDate(h.lastExecution)}","${h.deps}","${h.priority}","${h.error_message || ''}"`,
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
  lines.push(`Publicados,${report.deliveryQueue.byStatus['publicado'] || 0}`)
  lines.push(`Erros,${report.deliveryQueue.errors.length}`)
  lines.push(`Saúde,${report.deliveryQueue.healthStatus}`)
  lines.push(`Tempo Médio de Processamento,${report.deliveryQueue.avgProcessingTime}`)
  Object.entries(report.deliveryQueue.byStatus).forEach(([k, v]) => {
    lines.push(`${k},${v}`)
  })
  if (report.deliveryQueue.errors.length > 0) {
    lines.push('')
    lines.push('--- ITENS COM ERRO ---')
    lines.push('ID,Tema,Erro,Criado,Prioridade')
    report.deliveryQueue.errors.forEach((err) => {
      lines.push(
        `"${err.id}","${err.theme}","${err.error_note}","${fmtDate(err.created)}","${err.priority}"`,
      )
    })
  }

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
  const s = computeExecutiveSummary(report)
  const lines: string[] = []

  lines.push('RELATÓRIO DE AUDITORIA DO SISTEMA')
  lines.push(`Gerado em: ${new Date(report.generatedAt).toLocaleString('pt-BR')}`)
  lines.push('='.repeat(60))
  lines.push('')

  lines.push('RESUMO EXECUTIVO')
  lines.push('-'.repeat(40))
  if (!s.hasData) {
    lines.push('  Nenhum dado disponível para o período.')
  } else {
    lines.push(`  Status Geral: ${s.overallStatus}`)
    lines.push(`  Total de Operações: ${s.totalHooks + s.totalAgents}`)
    lines.push(`  Execuções (7 dias): ${s.totalExecutions}`)
    lines.push(`  Taxa de Sucesso: ${s.successRate}%`)
    lines.push(`  Hooks Ativos: ${s.activeHooks}/${s.totalHooks}`)
    lines.push(`  Agentes Ativos: ${s.activeAgents}/${s.totalAgents}`)
    lines.push(`  Registros Totais: ${s.totalRecords}`)
    lines.push(`  Fila Publicada: ${s.dqPublished}`)
    lines.push('')
    lines.push('  Principais Achados:')
    s.findings.forEach((f) => {
      lines.push(`    - ${f}`)
    })
  }
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
    if (h.error_message) {
      lines.push(`    Erro: ${h.error_message}`)
    }
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
  lines.push(`  Publicados: ${report.deliveryQueue.byStatus['publicado'] || 0}`)
  lines.push(`  Erros: ${report.deliveryQueue.errors.length}`)
  lines.push(`  Saúde: ${report.deliveryQueue.healthStatus}`)
  lines.push(`  Tempo Médio de Processamento: ${report.deliveryQueue.avgProcessingTime}`)
  Object.entries(report.deliveryQueue.byStatus).forEach(([k, v]) => {
    lines.push(`    ${k}: ${v}`)
  })
  if (report.deliveryQueue.errors.length > 0) {
    lines.push('')
    lines.push('  ITENS COM ERRO:')
    report.deliveryQueue.errors.forEach((err) => {
      lines.push(`    - ${err.theme}: ${err.error_note}`)
    })
  }
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

function buildExecutiveSummaryHTML(report: AuditReport): string {
  const s = computeExecutiveSummary(report)

  if (!s.hasData) {
    return `<div class="summary-box">
<h2>Resumo Executivo</h2>
<p class="summary-empty">Nenhum dado disponível para o período auditado.</p>
</div>`
  }

  return `<div class="summary-box">
<h2>Resumo Executivo</h2>
<div class="summary-grid">
<div class="summary-item"><span class="summary-label">Status Geral</span><span class="summary-value" style="color:${s.statusColor}">${s.overallStatus}</span></div>
<div class="summary-item"><span class="summary-label">Total de Operações</span><span class="summary-value">${s.totalHooks + s.totalAgents}</span></div>
<div class="summary-item"><span class="summary-label">Execuções (7 dias)</span><span class="summary-value">${s.totalExecutions}</span></div>
<div class="summary-item"><span class="summary-label">Taxa de Sucesso</span><span class="summary-value" style="color:${s.successRate === '100.0' ? '#16a34a' : '#ea580c'}">${s.successRate}%</span></div>
<div class="summary-item"><span class="summary-label">Hooks Ativos</span><span class="summary-value">${s.activeHooks}/${s.totalHooks}</span></div>
<div class="summary-item"><span class="summary-label">Agentes Ativos</span><span class="summary-value">${s.activeAgents}/${s.totalAgents}</span></div>
<div class="summary-item"><span class="summary-label">Registros Totais</span><span class="summary-value">${s.totalRecords}</span></div>
<div class="summary-item"><span class="summary-label">Fila Publicada</span><span class="summary-value">${s.dqPublished}</span></div>
</div>
<div class="summary-findings">
<span class="summary-label">Principais Achados:</span>
<ul>${s.findings.map((f) => `<li>${escHtml(f)}</li>`).join('')}</ul>
</div>
</div>`
}

export function exportAuditToPDF(report: AuditReport): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

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
.summary-box{border:2px solid #ea580c;border-radius:8px;padding:16px;margin-bottom:20px;background:#fff7ed}
.summary-box h2{border-bottom:none;color:#ea580c;margin-top:0}
.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px}
.summary-item{display:flex;flex-direction:column}
.summary-label{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:0.5px}
.summary-value{font-size:18px;font-weight:700;margin-top:2px}
.summary-findings{border-top:1px solid #e0e0e0;padding-top:8px}
.summary-findings ul{margin:4px 0 0 16px;padding:0}
.summary-findings li{font-size:12px;margin-bottom:2px}
.summary-empty{color:#999;font-style:italic}
@media print{body{padding:0}@page{margin:1cm}}
</style></head><body>
<h1>Relatório de Auditoria — Revista MODA ATUAL</h1>
<p class="meta">Gerado em ${new Date(report.generatedAt).toLocaleString('pt-BR')}</p>
${buildExecutiveSummaryHTML(report)}
<h2>Coleções (${report.collections.length})</h2>
<table><tr><th>Nome</th><th>Registros</th><th>Último Registro</th><th>Status</th><th>Prioridade</th></tr>
${report.collections.map((c) => `<tr><td>${escHtml(c.name)}</td><td>${c.count}</td><td>${fmtDate(c.lastRecord)}</td><td>${c.status}</td><td>${c.priority}</td></tr>`).join('')}
</table>
<h2 style="page-break-before: always;">Hooks (${report.hooks.length})</h2>
<table><tr><th>Nome</th><th>Tipo</th><th>Status</th><th>Última Execução</th><th>Dependências</th><th>Prioridade</th><th>Erro</th></tr>
${report.hooks.map((h) => `<tr><td>${escHtml(h.name)}</td><td>${h.type}</td><td>${h.status}</td><td>${fmtDate(h.lastExecution)}</td><td>${escHtml(h.deps)}</td><td>${h.priority}</td><td>${escHtml(h.error_message || '—')}</td></tr>`).join('')}
</table>
<h2 style="page-break-before: always;">Agentes (${report.agents.length})</h2>
<table><tr><th>Nome</th><th>Slug</th><th>Status</th><th>Última Execução</th><th>Prioridade</th></tr>
${report.agents.map((a) => `<tr><td>${escHtml(a.name)}</td><td>${a.slug}</td><td>${a.status}</td><td>${fmtDate(a.lastExecution)}</td><td>${a.priority}</td></tr>`).join('')}
</table>
<h2 style="page-break-before: always;">Fila de Entrega</h2>
<p>Total: ${report.deliveryQueue.total} | Pendentes: ${report.deliveryQueue.pending} | Publicados: ${report.deliveryQueue.byStatus['publicado'] || 0} | Erros: ${report.deliveryQueue.errors.length} | Saúde: ${report.deliveryQueue.healthStatus} | Tempo Médio: ${report.deliveryQueue.avgProcessingTime}</p>
<table><tr><th>Status</th><th>Quantidade</th></tr>
${Object.entries(report.deliveryQueue.byStatus)
  .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
  .join('')}
</table>
${
  report.deliveryQueue.errors.length > 0
    ? `<h3>Itens com Erro (${report.deliveryQueue.errors.length})</h3>
<table><tr><th>Tema</th><th>Erro</th><th>Criado</th></tr>
${report.deliveryQueue.errors
  .map(
    (err) =>
      `<tr><td>${escHtml(err.theme)}</td><td>${escHtml(err.error_note)}</td><td>${fmtDate(err.created)}</td></tr>`,
  )
  .join('')}
</table>`
    : ''
}
<h2 style="page-break-before: always;">Divergências</h2>
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
