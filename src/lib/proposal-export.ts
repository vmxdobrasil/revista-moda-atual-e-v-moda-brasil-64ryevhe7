import type { AdProposal } from '@/services/ad-proposals'
import { FORMAT_LABELS, PROPOSAL_STATUS_LABELS } from '@/services/ad-proposals'

const SEGMENT_LABELS: Record<string, string> = {
  varejo: 'Varejo',
  atacado: 'Atacado',
  consumidora: 'Consumidora',
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function exportProposalHTML(proposal: AdProposal): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const data = proposal.proposal_data || {}
  const audiences: any[] = data.suggested_audiences || []
  const fmtDate = (d: string) => {
    if (!d) return '—'
    const date = new Date(d)
    return isNaN(date.getTime()) ? d : date.toLocaleDateString('pt-BR')
  }

  const audienceCards = audiences
    .map((a) => {
      const interests = (a.top_interests || [])
        .map((t: any) => `<span class="tag">${escapeHtml(t.interest || '')}</span>`)
        .join('')
      return `<div class="audience-card">
        <div class="audience-header">
          <span class="audience-segment">${escapeHtml(SEGMENT_LABELS[a.segment] || a.segment)}</span>
          <span class="audience-level level-${a.engagement_level}">Engajamento ${escapeHtml(a.engagement_level || '')}</span>
        </div>
        <div class="audience-stats">
          <span>Tamanho estimado: <strong>${a.audience_size || 0}</strong></span>
          <span>Score médio: <strong>${a.avg_engagement_score || 0}</strong></span>
        </div>
        ${interests ? `<div class="audience-interests">${interests}</div>` : ''}
      </div>`
    })
    .join('')

  const proposalFields = [
    { label: 'Introdução', value: data.intro },
    { label: 'Proposta de Valor', value: data.value_proposition },
    { label: 'Tema Editorial', value: data.matched_theme },
    { label: 'Descrição do Formato', value: data.format_description },
    { label: 'Resumo de Alcance', value: data.reach_summary },
    { label: 'Resumo de Preço', value: data.pricing_summary },
    { label: 'Chamada para Ação', value: data.cta },
  ]
    .filter((f) => f.value)
    .map(
      (f) =>
        `<div class="prop-field"><h3>${escapeHtml(f.label)}</h3><p>${escapeHtml(String(f.value))}</p></div>`,
    )
    .join('')

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Proposta - ${escapeHtml(proposal.advertiser)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;padding:32px;max-width:800px;margin:0 auto}
.header{text-align:center;border-bottom:3px solid #f97316;padding-bottom:16px;margin-bottom:24px}
.header h1{font-size:24px;color:#1a1a1a;letter-spacing:2px}
.header p{font-size:12px;color:#999;margin-top:4px}
.meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;margin-bottom:24px}
.meta-item{font-size:13px;padding:6px 0;border-bottom:1px solid #f0f0f0}
.meta-item .label{color:#999;margin-right:4px}
.meta-item .value{font-weight:600}
.prop-field{margin-bottom:16px}
.prop-field h3{font-size:13px;color:#f97316;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.prop-field p{font-size:14px;line-height:1.6;color:#333}
.audience-section{margin-top:24px}
.audience-section h2{font-size:16px;margin-bottom:12px;color:#1a1a1a}
.audience-card{border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:8px}
.audience-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.audience-segment{font-weight:600;font-size:14px}
.audience-level{font-size:11px;padding:2px 8px;border-radius:12px}
.level-alta{background:#d1fae5;color:#065f46}
.level-media{background:#fef3c7;color:#92400e}
.level-baixa{background:#fee2e2;color:#991b1b}
.audience-stats{font-size:12px;color:#666;display:flex;gap:16px}
.audience-interests{margin-top:6px}
.tag{display:inline-block;background:#f3f4f6;border-radius:4px;padding:2px 8px;font-size:11px;margin-right:4px;margin-bottom:2px;color:#555}
.print-btn{position:fixed;bottom:24px;right:24px;padding:12px 24px;background:#f97316;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px}
@media print{body{padding:0;max-width:none}.no-print{display:none}@page{margin:1.5cm}}
</style></head><body>
<div class="header">
  <h1>MODA ATUAL</h1>
  <p>Proposta Comercial</p>
</div>
<div class="meta-grid">
  <div class="meta-item"><span class="label">Anunciante:</span><span class="value">${escapeHtml(proposal.advertiser)}</span></div>
  <div class="meta-item"><span class="label">Campanha:</span><span class="value">${escapeHtml(proposal.campaign || '—')}</span></div>
  <div class="meta-item"><span class="label">Edição:</span><span class="value">${escapeHtml(proposal.expand?.edition?.title || '—')}</span></div>
  <div class="meta-item"><span class="label">Formato:</span><span class="value">${escapeHtml(FORMAT_LABELS[proposal.format] || proposal.format)}</span></div>
  <div class="meta-item"><span class="label">Posição:</span><span class="value">${escapeHtml(proposal.position || '—')}</span></div>
  <div class="meta-item"><span class="label">Alcance:</span><span class="value">${(proposal.audience_reach || 0).toLocaleString('pt-BR')} impactos</span></div>
  <div class="meta-item"><span class="label">Preço Sugerido:</span><span class="value">R$ ${(proposal.suggested_price || 0).toLocaleString('pt-BR')}</span></div>
  <div class="meta-item"><span class="label">Match Score:</span><span class="value">${proposal.match_score || 0}/100</span></div>
  <div class="meta-item"><span class="label">Status:</span><span class="value">${escapeHtml(PROPOSAL_STATUS_LABELS[proposal.status] || proposal.status)}</span></div>
  <div class="meta-item"><span class="label">Contrato:</span><span class="value">${fmtDate(proposal.contract_date)}</span></div>
  <div class="meta-item"><span class="label">Entrega:</span><span class="value">${fmtDate(proposal.delivery_date)}</span></div>
</div>
${proposalFields}
${audiences.length > 0 ? `<div class="audience-section"><h2>Públicos Sugeridos</h2>${audienceCards}</div>` : ''}
<button class="print-btn no-print" onclick="window.print()">Imprimir / Salvar como PDF</button>
<script>window.onload=function(){setTimeout(function(){window.print();},500);}</script>
</body></html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
