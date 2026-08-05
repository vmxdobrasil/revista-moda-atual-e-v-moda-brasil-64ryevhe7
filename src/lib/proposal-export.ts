import {
  type AdProposal,
  FORMAT_LABELS,
  PROPOSAL_STATUS_LABELS,
  formatCurrency,
} from '@/services/ad-proposals'

function parseProposalData(data: any): any {
  if (!data) return {}
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch {
      return {}
    }
  }
  return data
}

export function generateProposalHTML(proposal: AdProposal): string {
  const pd = parseProposalData(proposal.proposal_data)
  const formatLabel = proposal.format ? FORMAT_LABELS[proposal.format] || proposal.format : '-'
  const statusLabel = proposal.status
    ? PROPOSAL_STATUS_LABELS[proposal.status] || proposal.status
    : '-'

  let contractBlock = ''
  if (proposal.contract_number) {
    contractBlock = `
      <div class="contract-block">
        <h2>Contrato</h2>
        <div class="contract-grid">
          <div><span class="label">Número:</span> ${proposal.contract_number}</div>
          <div><span class="label">Data formal:</span> ${proposal.contract_date_formal || '-'}</div>
          <div><span class="label">Assinado em:</span> ${proposal.contract_signed_at || '-'}</div>
        </div>
        ${
          proposal.contract_terms
            ? `<div class="contract-terms">
          <h3>Termos do Contrato</h3>
          ${
            proposal.contract_terms.parties
              ? `<p><strong>Partes:</strong> ${proposal.contract_terms.parties.advertiser || ''} e ${proposal.contract_terms.parties.publisher || ''}</p>`
              : ''
          }
          ${
            proposal.contract_terms.commercial
              ? `<p><strong>Valor acordado:</strong> ${formatCurrency(proposal.contract_terms.commercial.agreed_price || 0)}</p>`
              : ''
          }
          ${
            proposal.contract_terms.validity
              ? `<p><strong>Vigência:</strong> ${proposal.contract_terms.validity}</p>`
              : ''
          }
          ${
            proposal.contract_terms.clauses && proposal.contract_terms.clauses.length > 0
              ? `<div class="clauses"><strong>Cláusulas:</strong><ol>${proposal.contract_terms.clauses
                  .map((c: string) => `<li>${c}</li>`)
                  .join('')}</ol></div>`
              : ''
          }
        </div>`
            : ''
        }
      </div>`
  }

  let audiencesBlock = ''
  if (pd.suggested_audiences && pd.suggested_audiences.length > 0) {
    audiencesBlock = `
      <div class="section">
        <h2>Públicos Sugeridos</h2>
        <table>
          <thead><tr><th>Segmento</th><th>Tamanho</th><th>Engajamento</th><th>Interesses</th></tr></thead>
          <tbody>
            ${pd.suggested_audiences
              .map(
                (a: any) =>
                  `<tr><td>${a.segment}</td><td>${a.audience_size}</td><td>${a.engagement_level || '-'}</td><td>${(a.top_interests || []).map((i: any) => i.interest).join(', ')}</td></tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>`
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Proposta - ${proposal.advertiser}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #333; background: #f9fafb; padding: 20px; }
  .doc { max-width: 700px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .header { background: #f97316; color: #fff; padding: 28px 32px; text-align: center; }
  .header h1 { font-size: 28px; margin-bottom: 4px; }
  .header p { opacity: 0.9; font-size: 14px; }
  .content { padding: 28px 32px; }
  h2 { color: #f97316; font-size: 18px; margin-bottom: 12px; margin-top: 20px; }
  h2:first-child { margin-top: 0; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .grid div { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
  .label { font-weight: 600; color: #6b7280; display: block; font-size: 12px; text-transform: uppercase; }
  .value { font-size: 15px; }
  .contract-block { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; margin: 16px 0; }
  .contract-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .contract-terms { margin-top: 12px; }
  .contract-terms h3 { color: #ea580c; font-size: 14px; margin-bottom: 8px; }
  .contract-terms p { margin-bottom: 6px; font-size: 14px; }
  .clauses { margin-top: 8px; }
  .clauses ol { padding-left: 20px; font-size: 14px; }
  .clauses li { margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  th { text-align: left; background: #f3f4f6; padding: 8px 12px; font-size: 13px; }
  td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
  .cta { background: #fff7ed; border-left: 3px solid #f97316; padding: 12px 16px; border-radius: 4px; margin: 12px 0; font-style: italic; }
  .footer { text-align: center; padding: 16px; font-size: 12px; color: #9ca3af; }
  .section { margin-bottom: 16px; }
  @media print { body { background: #fff; padding: 0; } .doc { box-shadow: none; } }
</style>
</head>
<body>
<div class="doc">
  <div class="header">
    <h1>Revista MODA ATUAL</h1>
    <p>Proposta Comercial</p>
  </div>
  <div class="content">
    <h2>Informações da Proposta</h2>
    <div class="grid">
      <div><span class="label">Anunciante</span><span class="value">${proposal.advertiser}</span></div>
      <div><span class="label">Campanha</span><span class="value">${proposal.campaign || '-'}</span></div>
      <div><span class="label">Edição</span><span class="value">${proposal.expand?.edition?.title || '-'}</span></div>
      <div><span class="label">Formato</span><span class="value">${formatLabel}</span></div>
      <div><span class="label">Posição</span><span class="value">${proposal.position || '-'}</span></div>
      <div><span class="label">Alcance</span><span class="value">${proposal.audience_reach?.toLocaleString('pt-BR') || '-'} impactos</span></div>
      <div><span class="label">Preço sugerido</span><span class="value">${formatCurrency(proposal.suggested_price || 0)}</span></div>
      <div><span class="label">Match score</span><span class="value">${proposal.match_score || 0}/100</span></div>
      <div><span class="label">Status</span><span class="value">${statusLabel}</span></div>
      <div><span class="label">Data de entrega</span><span class="value">${proposal.delivery_date || '-'}</span></div>
    </div>
    ${contractBlock}
    ${
      pd.intro || pd.value_proposition
        ? `<div class="section">
      <h2>Detalhes da Proposta</h2>
      ${pd.intro ? `<p style="margin-bottom:8px"><strong>Introdução:</strong> ${pd.intro}</p>` : ''}
      ${pd.value_proposition ? `<p style="margin-bottom:8px"><strong>Proposta de valor:</strong> ${pd.value_proposition}</p>` : ''}
      ${pd.matched_theme ? `<p style="margin-bottom:8px"><strong>Tema:</strong> ${pd.matched_theme}</p>` : ''}
      ${pd.format_description ? `<p style="margin-bottom:8px"><strong>Formato:</strong> ${pd.format_description}</p>` : ''}
      ${pd.reach_summary ? `<p style="margin-bottom:8px"><strong>Alcance:</strong> ${pd.reach_summary}</p>` : ''}
      ${pd.pricing_summary ? `<p style="margin-bottom:8px"><strong>Preço:</strong> ${pd.pricing_summary}</p>` : ''}
      ${pd.cta ? `<div class="cta">${pd.cta}</div>` : ''}
    </div>`
        : ''
    }
    ${audiencesBlock}
  </div>
  <div class="footer">
    © ${new Date().getFullYear()} Revista MODA ATUAL. Todos os direitos reservados.
  </div>
</div>
</body>
</html>`
}

export function exportProposalHTML(proposal: AdProposal): void {
  const html = generateProposalHTML(proposal)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (win) {
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
