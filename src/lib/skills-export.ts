import type {
  Skill,
  SkillFlowStep,
  SkillRule,
  SkillResponsibility,
  RelatedAgent,
} from '@/services/skills'
import { SKILL_CATEGORIES } from '@/services/skills'

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function exportSkillToPDF(skill: Skill): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const cat = SKILL_CATEGORIES.find((c) => c.value === skill.category)
  const steps = Array.isArray(skill.flow) ? (skill.flow as SkillFlowStep[]) : []
  const rules = Array.isArray(skill.rules) ? (skill.rules as SkillRule[]) : []
  const responsibilities = Array.isArray(skill.responsibilities)
    ? (skill.responsibilities as SkillResponsibility[])
    : []
  const agents = Array.isArray(skill.related_agents) ? (skill.related_agents as RelatedAgent[]) : []

  const stepsHtml =
    steps.length > 0
      ? `<h2>Fluxo Operacional</h2><div class="steps">${steps
          .map(
            (s, i) => `
      <div class="step">
        <div class="step-num">${i + 1}</div>
        <div class="step-body">
          <div class="step-title">${escHtml(s.step)} <span class="badge">${escHtml(s.responsible)}</span></div>
          <div class="step-desc">${escHtml(s.description)}</div>
        </div>
      </div>`,
          )
          .join('')}</div>`
      : ''

  const rulesHtml =
    rules.length > 0
      ? `<h2>Regras Operacionais</h2><ul class="rules">${rules
          .map(
            (r) => `
      <li><strong>${escHtml(r.rule)}:</strong> ${escHtml(r.detail)}</li>`,
          )
          .join('')}</ul>`
      : ''

  const respHtml =
    responsibilities.length > 0
      ? `<h2>Responsabilidades</h2><div class="resp-grid">${responsibilities
          .map(
            (r) => `
      <div class="resp-card">
        <div class="resp-role">${escHtml(r.role)}</div>
        <ul>${r.responsibilities.map((item) => `<li>${escHtml(item)}</li>`).join('')}</ul>
      </div>`,
          )
          .join('')}</div>`
      : ''

  const bodyHtml = skill.body
    ? `<h2>Documentação Completa</h2><pre class="body-text">${escHtml(skill.body)}</pre>`
    : ''

  const agentsHtml =
    agents.length > 0
      ? `<h2>Integração com Agentes</h2><div class="agents">${agents
          .map(
            (a) => `
      <div class="agent-card">
        <code>${escHtml(a.agent)}</code>
        <p>${escHtml(a.how)}</p>
      </div>`,
          )
          .join('')}</div>`
      : ''

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>${escHtml(skill.title)} — Playbook</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;color:#1a1a1a;padding:32px;line-height:1.6}
h1{font-size:24px;color:#ea580c;margin-bottom:4px}
h2{font-size:18px;color:#ea580c;margin-top:24px;margin-bottom:12px;border-bottom:2px solid #fed7aa;padding-bottom:4px}
.meta{font-size:12px;color:#666;margin-bottom:8px}
.summary{font-size:14px;color:#444;margin-bottom:16px;padding:12px;background:#fff7ed;border-radius:8px}
.badges{display:flex;gap:8px;margin-bottom:16px}
.badge{background:#f3f4f6;padding:2px 10px;border-radius:12px;font-size:12px;color:#374151}
.steps{display:flex;flex-direction:column;gap:12px}
.step{display:flex;gap:12px;align-items:flex-start}
.step-num{flex-shrink:0;width:28px;height:28px;border-radius:50%;background:#fff7ed;color:#ea580c;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px}
.step-title{font-weight:600;font-size:14px;margin-bottom:2px}
.step-desc{font-size:13px;color:#555}
ul.rules{list-style:none;padding:0}
ul.rules li{padding:6px 0;border-bottom:1px solid #f3f4f6;font-size:13px}
.resp-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.resp-card{background:#f9fafb;border-radius:8px;padding:12px}
.resp-role{font-weight:600;font-size:13px;margin-bottom:6px;color:#374151}
.resp-card ul{padding-left:16px;font-size:12px;color:#555}
.resp-card li{margin-bottom:2px}
.body-text{font-size:13px;white-space:pre-wrap;font-family:inherit;background:#f9fafb;padding:16px;border-radius:8px;line-height:1.5}
.agents{display:flex;flex-direction:column;gap:8px}
.agent-card{background:#ecfeff;border-radius:8px;padding:12px}
.agent-card code{font-size:12px;color:#0e7490;font-weight:600}
.agent-card p{font-size:13px;color:#444;margin-top:4px}
@media print{body{padding:0}@page{margin:1.5cm}}
</style></head><body>
<h1>${escHtml(skill.title)}</h1>
<div class="badges">
  <span class="badge">${escHtml(cat?.label || skill.category)}</span>
  <span class="badge">${skill.status === 'publicado' ? 'Publicado' : 'Rascunho'}</span>
</div>
<p class="summary">${escHtml(skill.summary || '')}</p>
${stepsHtml}
${rulesHtml}
${respHtml}
${bodyHtml}
${agentsHtml}
<p class="meta" style="margin-top:24px">Gerado em ${new Date().toLocaleString('pt-BR')} • Revista MODA ATUAL</p>
<button onclick="window.print()" style="position:fixed;bottom:24px;right:24px;padding:12px 24px;background:#ea580c;color:#fff;border:none;border-radius:8px;cursor:pointer">Imprimir / Salvar PDF</button>
<script>setTimeout(function(){window.print();},500)</script>
</body></html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
