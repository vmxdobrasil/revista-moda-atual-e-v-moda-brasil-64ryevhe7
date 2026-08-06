import type { SimulationRow } from '@/services/social-engagement-config'

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportTestReportToCSV(rows: SimulationRow[], filename: string): void {
  const headers = ['Tipo', 'Usuario', 'Mensagem', 'Intencao', 'Resposta', 'Status', 'Encaminhado']
  const csvRows = rows.map((r) =>
    [
      r.type === 'comment' ? 'Comentario' : 'DM',
      r.ig_username,
      r.message_text,
      r.intent,
      r.response_text,
      r.status,
      r.forwarded_to || '-',
    ]
      .map(escapeCSV)
      .join(','),
  )
  const csv = '\uFEFF' + headers.join(',') + '\n' + csvRows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportTestReportToPDF(rows: SimulationRow[], filename: string): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const tableRows = rows
    .map(
      (r, i) => `<tr>
<td>${i + 1}</td>
<td>${r.type === 'comment' ? 'Comentario' : 'DM'}</td>
<td>@${escHtml(r.ig_username)}</td>
<td>${escHtml(r.message_text)}</td>
<td><span class="badge">${escHtml(r.intent)}</span></td>
<td>${escHtml(r.response_text || '-')}</td>
<td><span class="badge-${r.status}">${escHtml(r.status)}</span></td>
<td>${escHtml(r.forwarded_to || '-')}</td>
</tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>${escHtml(filename)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;padding:24px;color:#1a1a1a}
h1{font-size:20px;margin-bottom:8px;color:#ea580c}
.meta{font-size:12px;color:#666;margin-bottom:16px}
table{width:100%;border-collapse:collapse;font-size:11px}
th{background:#f5f5f5;padding:6px 8px;text-align:left;border:1px solid #e0e0e0;font-weight:600}
td{padding:6px 8px;border:1px solid #e0e0e0;vertical-align:top}
.badge{display:inline-block;padding:2px 6px;border-radius:4px;background:#e0e0e0;font-size:10px}
.badge-respondido{background:#dcfce7;color:#166534}
.badge-pendente{background:#fef9c3;color:#854d0e}
.badge-encaminhado_humano{background:#fed7aa;color:#9a3412}
.badge-ignorado{background:#f3f4f6;color:#6b7280}
@media print{body{padding:0}@page{margin:1cm;size:landscape}}
</style></head><body>
<h1>Relatorio de Teste — Social Engagement</h1>
<p class="meta">${rows.length} interacoes simuladas — Gerado em ${new Date().toLocaleString('pt-BR')}</p>
<table><thead><tr><th>#</th><th>Tipo</th><th>Usuario</th><th>Mensagem</th><th>Intencao</th><th>Resposta</th><th>Status</th><th>Encaminhado</th></tr></thead>
<tbody>${tableRows}</tbody></table>
<button onclick="window.print()" style="position:fixed;bottom:24px;right:24px;padding:12px 24px;background:#ea580c;color:#fff;border:none;border-radius:8px;cursor:pointer">Imprimir / Salvar PDF</button>
<script>setTimeout(function(){window.print();},500)</script>
</body></html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
