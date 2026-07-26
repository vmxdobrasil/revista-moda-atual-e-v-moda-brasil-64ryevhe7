import type { StoryText } from '@/services/story-texts'

export interface ExportRecord {
  subject: string
  type: string
  content: string
  created: string
  scheduled_date: string
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function getExportType(options: unknown): string {
  if (!options || typeof options !== 'object' || Array.isArray(options)) return 'Texto'
  const obj = options as Record<string, unknown>
  if (obj.type === 'meta-prompt') return 'Meta-Prompt'
  if (obj.type === 'materia_completa' || obj.type === 'materia-jornalistica') return 'Matéria'
  if (obj.type === 'legenda-atacadista') return 'Atacado'
  if (obj.type === 'tendencia-relatorio') return 'Relatório de Tendência'
  if (obj.type === 'reels-script') return 'Reels'
  if (obj.type === 'plano-semanal') return 'Plano Semanal'
  if (typeof obj.description === 'string') return 'Descrição YouTube'
  return 'Texto'
}

function getExportContent(options: unknown): string {
  if (Array.isArray(options)) return (options as string[]).join('; ')
  if (!options || typeof options !== 'object') return ''
  const obj = options as Record<string, unknown>
  if (typeof obj.content === 'string') return obj.content
  if (typeof obj.caption === 'string') return obj.caption
  if (typeof obj.description === 'string') return obj.description
  if (typeof obj.plan === 'string') return obj.plan
  if (obj.report && typeof obj.report === 'object') {
    const report = obj.report as Record<string, unknown>
    return typeof report.descricao === 'string' ? report.descricao : JSON.stringify(report)
  }
  if (Array.isArray(obj.blocks)) {
    return (obj.blocks as Array<{ content?: string }>).map((b) => b.content || '').join('\n\n')
  }
  return JSON.stringify(obj)
}

export function mapStoryTextsToExportRecords(records: StoryText[]): ExportRecord[] {
  return records.map((r) => ({
    subject: r.subject || '',
    type: getExportType(r.options),
    content: getExportContent(r.options).slice(0, 200),
    created: r.created || '',
    scheduled_date: r.scheduled_date || '',
  }))
}

export function generateFilename(prefix: string, extension: string): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  return `${prefix}_${dateStr}_${timeStr}.${extension}`
}

export function exportToCSV(records: ExportRecord[], filename: string): void {
  const headers = ['subject', 'type', 'content', 'created', 'scheduled_date']
  const rows = records.map((r) =>
    [r.subject, r.type, r.content, r.created, r.scheduled_date].map(escapeCSV).join(','),
  )
  const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n')
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

export function exportToPDF(records: ExportRecord[], filename: string): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const fmtDate = (d: string) => {
    if (!d) return '—'
    const date = new Date(d)
    if (isNaN(date.getTime())) return d
    return (
      date.toLocaleDateString('pt-BR') +
      ' ' +
      date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    )
  }

  const cards = records
    .map((r, i) => {
      const pageBreak = i > 0 ? ' style="page-break-before: always;"' : ''
      return `<div class="text-card"${pageBreak}>
        <div class="text-subject">${i + 1}. ${escapeHtml(r.subject)}</div>
        <div class="text-type"><span class="opt-label">Tipo:</span> ${escapeHtml(r.type)}</div>
        <div class="text-content">${escapeHtml(r.content)}</div>
        <div class="text-footer">
          <span>Criado: ${fmtDate(r.created)}</span>
          <span>Agendado: ${r.scheduled_date ? fmtDate(r.scheduled_date) : '—'}</span>
        </div>
      </div>`
    })
    .join('')

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${filename}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;padding:24px}
h1{font-size:20px;margin-bottom:8px}
.meta{font-size:12px;color:#666;margin-bottom:24px}
.text-card{border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-bottom:12px;page-break-inside:avoid}
.text-subject{font-size:15px;font-weight:600;margin-bottom:8px}
.text-options{display:flex;flex-direction:column;gap:4px;margin-bottom:8px}
.text-option{font-size:13px;line-height:1.5;color:#444}
.text-type{font-size:13px;margin-bottom:8px}
.text-content{font-size:13px;line-height:1.5;color:#444;white-space:pre-wrap;margin-bottom:8px}
.opt-label{font-weight:600;color:#666;margin-right:4px}
.text-footer{display:flex;justify-content:space-between;font-size:11px;color:#999;border-top:1px solid #f0f0f0;padding-top:8px;margin-top:8px}
.print-btn{position:fixed;bottom:24px;right:24px;padding:12px 24px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px}
@media print{body{padding:0}.no-print{display:none}@page{margin:1cm}}
</style></head><body>
<h1>Textos Exportados</h1>
<p class="meta">${records.length} registro(s) • Gerado em ${new Date().toLocaleString('pt-BR')}</p>
${cards}
<button class="print-btn no-print" onclick="window.print()">Imprimir / Salvar PDF</button>
<script>document.title='${filename}';window.onload=function(){setTimeout(function(){window.print();},500);}</script>
</body></html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
