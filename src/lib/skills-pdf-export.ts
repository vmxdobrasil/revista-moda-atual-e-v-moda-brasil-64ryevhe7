import type { Skill } from '@/services/skills'
import { CATEGORY_LABELS } from '@/services/skills'

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function formatJson(value: unknown): string {
  if (!value) return '—'
  if (typeof value === 'string') {
    try {
      return formatParsed(JSON.parse(value))
    } catch {
      return escHtml(value)
    }
  }
  return formatParsed(value)
}

function formatParsed(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return '—'
    const items = value.map((item) => {
      if (typeof item === 'string') return `<li>${escHtml(item)}</li>`
      if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>
        const title = obj.title || obj.name || obj.step || ''
        const desc = obj.description || obj.detail || ''
        const checklist = obj.checklist || obj.tasks || obj.items || []
        let html = `<li><strong>${escHtml(String(title))}</strong>`
        if (desc) html += `: ${escHtml(String(desc))}`
        if (Array.isArray(checklist) && checklist.length > 0) {
          html +=
            '<ul>' +
            checklist
              .map((c) => {
                const text =
                  typeof c === 'string'
                    ? c
                    : (c as Record<string, unknown>).text ||
                      (c as Record<string, unknown>).title ||
                      JSON.stringify(c)
                return `<li>${escHtml(String(text))}</li>`
              })
              .join('') +
            '</ul>'
        }
        return html + '</li>'
      }
      return `<li>${escHtml(String(item))}</li>`
    })
    return `<ul>${items.join('')}</ul>`
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value)
    if (entries.length === 0) return '—'
    return (
      '<ul>' +
      entries
        .map(([k, v]) => {
          if (typeof v === 'string') return `<li><strong>${escHtml(k)}:</strong> ${escHtml(v)}</li>`
          if (Array.isArray(v) || typeof v === 'object')
            return `<li><strong>${escHtml(k)}:</strong> ${formatParsed(v)}</li>`
          return `<li><strong>${escHtml(k)}:</strong> ${escHtml(String(v))}</li>`
        })
        .join('') +
      '</ul>'
    )
  }
  return escHtml(String(value))
}

export function exportSkillToPDF(skill: Skill): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const categoryLabel = CATEGORY_LABELS[skill.category] || skill.category

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>${escHtml(skill.title)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;color:#1a1a1a;padding:32px;line-height:1.6}
.header{background:#ea580c;color:#fff;padding:24px 32px;border-radius:12px;margin-bottom:24px}
.header h1{font-size:24px;margin-bottom:4px}
.header .category{font-size:13px;opacity:.9;text-transform:uppercase;letter-spacing:1px}
.section{margin-bottom:20px}
.section h2{font-size:16px;color:#ea580c;border-bottom:2px solid #fed7aa;padding-bottom:6px;margin-bottom:10px}
.section p{font-size:14px;color:#333}
.section ul{margin-left:20px;font-size:14px}
.section ul ul{margin-top:4px}
.meta{font-size:12px;color:#999;margin-bottom:16px}
.body-content{white-space:pre-wrap;font-size:14px;color:#333}
@media print{body{padding:0}@page{margin:1.5cm}}
</style></head><body>
<div class="header"><div class="category">${escHtml(categoryLabel)}</div><h1>${escHtml(skill.title)}</h1></div>
<div class="meta">Exportado em ${new Date().toLocaleString('pt-BR')}</div>
${skill.summary ? `<div class="section"><h2>Resumo</h2><p>${escHtml(skill.summary)}</p></div>` : ''}
${skill.flow ? `<div class="section"><h2>Fluxo de Execução</h2>${formatJson(skill.flow)}</div>` : ''}
${skill.rules ? `<div class="section"><h2>Regras de Qualidade</h2>${formatJson(skill.rules)}</div>` : ''}
${skill.responsibilities ? `<div class="section"><h2>Responsabilidades</h2>${formatJson(skill.responsibilities)}</div>` : ''}
${skill.related_agents ? `<div class="section"><h2>Agentes Relacionados</h2>${formatJson(skill.related_agents)}</div>` : ''}
${skill.body ? `<div class="section"><h2>Conteúdo Completo</h2><div class="body-content">${escHtml(skill.body)}</div></div>` : ''}
<button onclick="window.print()" style="position:fixed;bottom:24px;right:24px;padding:12px 24px;background:#ea580c;color:#fff;border:none;border-radius:8px;cursor:pointer">Imprimir / Salvar PDF</button>
<script>setTimeout(function(){window.print();},500)</script>
</body></html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
