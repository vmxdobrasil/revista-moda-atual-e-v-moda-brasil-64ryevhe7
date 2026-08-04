import type { AuditLog } from '@/services/audit-logs'

function fmtDate(v: string | null): string {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString('pt-BR')
  } catch {
    return '—'
  }
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function exportAuditLogsToCSV(logs: AuditLog[]): void {
  const headers = [
    'Data/Hora',
    'Integração',
    'Tipo',
    'Status',
    'Agente',
    'Mensagem de Erro',
    'Workflow ID',
  ]
  const rows = logs.map((l) =>
    [
      fmtDate(l.executed_at),
      l.integration_name,
      l.integration_type,
      l.status,
      l.agent_name,
      l.error_message || '',
      l.workflow_id || '',
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  )
  const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n')
  downloadBlob(csv, `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv')
}

export function exportAuditLogsToTXT(logs: AuditLog[]): void {
  const lines: string[] = []
  lines.push('RELATÓRIO DE LOGS DE AUDITORIA')
  lines.push(`Gerado em: ${new Date().toLocaleString('pt-BR')}`)
  lines.push('='.repeat(60))
  lines.push('')
  logs.forEach((l, i) => {
    lines.push(`${i + 1}. ${l.integration_name} (${l.integration_type})`)
    lines.push(`   Data/Hora: ${fmtDate(l.executed_at)}`)
    lines.push(`   Status: ${l.status}`)
    lines.push(`   Agente: ${l.agent_name}`)
    if (l.error_message) lines.push(`   Erro: ${l.error_message}`)
    if (l.workflow_id) lines.push(`   Workflow: ${l.workflow_id}`)
    lines.push('')
  })
  downloadBlob(
    '\uFEFF' + lines.join('\n'),
    `audit_logs_${new Date().toISOString().slice(0, 10)}.txt`,
    'text/plain',
  )
}

export function exportAuditLogsToPDF(logs: AuditLog[]): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const rows = logs
    .map(
      (l) =>
        `<tr><td>${fmtDate(l.executed_at)}</td><td>${escHtml(l.integration_name)}</td><td>${l.integration_type}</td><td>${l.status}</td><td>${escHtml(l.agent_name)}</td><td>${escHtml(l.error_message || '—')}</td></tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Logs de Auditoria</title>
<style>body{font-family:Arial,sans-serif;padding:24px}h1{font-size:20px}table{width:100%;border-collapse:collapse;font-size:11px;margin-top:16px}th,td{border:1px solid #ddd;padding:4px 6px;text-align:left}th{background:#f5f5f5}.meta{color:#666;font-size:12px}@media print{@page{margin:1cm}}</style>
</head><body><h1>Logs de Auditoria — Revista MODA ATUAL</h1>
<p class="meta">${logs.length} registro(s) • Gerado em ${new Date().toLocaleString('pt-BR')}</p>
<table><tr><th>Data/Hora</th><th>Integração</th><th>Tipo</th><th>Status</th><th>Agente</th><th>Erro</th></tr>${rows}</table>
<button onclick="window.print()" style="position:fixed;bottom:24px;right:24px;padding:12px 24px;background:#ea580c;color:#fff;border:none;border-radius:8px;cursor:pointer">Imprimir</button>
<script>setTimeout(function(){window.print();},500)</script>
</body></html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}

function downloadBlob(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type: `${type};charset=utf-8;` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
