export interface EditionPreviewData {
  title: string
  description?: string
  cover_url?: string
}

export interface ProductCallout {
  name: string
  price: string | number
  link: string
  vendor?: string
}

interface TemplateSection {
  title: string
  summary: string
  link?: string
  products?: ProductCallout[]
}

interface TemplateCampaign {
  title: string
  subject?: string
  content?: {
    header?: { title: string; description?: string }
    intro?: string
    sections: TemplateSection[]
    cta?: string
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function fmtPrice(price: string | number): string {
  if (typeof price === 'string') return price
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
}

function buildProductsHtml(products: ProductCallout[]): string {
  if (!products.length) return ''
  const w = Math.floor(100 / products.length)
  const cells = products
    .map(
      (p) =>
        `<td width="${w}%" valign="top" style="padding:6px;">` +
        `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:14px 10px;text-align:center;">` +
        (p.vendor
          ? `<p style="margin:0 0 4px;font-size:10px;color:#9ca3af;text-transform:uppercase;font-family:Arial,sans-serif;">${esc(p.vendor)}</p>`
          : '') +
        `<p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#1f2937;font-family:Arial,sans-serif;">${esc(p.name)}</p>` +
        `<p style="margin:0 0 10px;font-size:18px;font-weight:700;color:#f97316;font-family:Arial,sans-serif;">${fmtPrice(p.price)}</p>` +
        `<a href="${esc(p.link || '#')}" style="display:inline-block;padding:7px 18px;background:#f97316;color:#fff;text-decoration:none;border-radius:6px;font-size:12px;font-weight:600;font-family:Arial,sans-serif;">Ver produto</a>` +
        `</div></td>`,
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;"><tr>${cells}</tr></table>`
}

function buildSectionsHtml(sections: TemplateSection[]): string {
  return sections
    .map(
      (s) =>
        `<tr><td style="padding:0 24px 20px;">` +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:3px solid #f97316;">` +
        `<tr><td style="padding:16px 20px;">` +
        `<h3 style="margin:0 0 8px;font-size:18px;color:#1f2937;font-family:Arial,sans-serif;">${esc(s.title || '')}</h3>` +
        `<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#4b5563;font-family:Arial,sans-serif;">${esc(s.summary || '')}</p>` +
        (s.link
          ? `<a href="${esc(s.link)}" style="font-size:13px;color:#f97316;text-decoration:none;font-family:Arial,sans-serif;">Ver mais →</a>`
          : '') +
        buildProductsHtml(s.products || []) +
        `</td></tr></table></td></tr>`,
    )
    .join('')
}

export function buildNewsletterHtml(
  campaign: TemplateCampaign,
  edition?: EditionPreviewData | null,
  extraProducts?: ProductCallout[],
): string {
  const c = campaign.content
  const title = edition?.title || c?.header?.title || campaign.title
  const desc = edition?.description || c?.header?.description || ''
  const cover = edition?.cover_url || ''

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>${esc(campaign.subject || campaign.title)}</title>
<style>body{margin:0;padding:0;background:#f3f4f6;-webkit-text-size-adjust:100%;}table{border-collapse:collapse;}img{border:0;height:auto;line-height:100%;display:block;-ms-interpolation-mode:bicubic;}a{text-decoration:none;}.wrap{max-width:600px;width:100%!important;}@media only screen and (max-width:600px){.wrap{width:100%!important;}.pd{padding:0 16px 16px!important;}}</style>
</head><body>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:20px 0;"><tr><td align="center">
<table role="presentation" class="wrap" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
${cover ? `<tr><td style="padding:0;"><img src="${esc(cover)}" alt="${esc(title)}" style="width:100%;max-width:600px;height:auto;"/></td></tr>` : ''}
<tr><td style="padding:28px 24px;text-align:center;${cover ? '' : 'background:linear-gradient(135deg,#fff7ed,#ffedd5);'}">
<h1 style="margin:0 0 8px;font-size:26px;color:#1f2937;font-family:Arial,sans-serif;">${esc(title)}</h1>
${desc ? `<p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;font-family:Arial,sans-serif;">${esc(desc)}</p>` : ''}
</td></tr>
${c?.intro ? `<tr><td class="pd" style="padding:0 24px 20px;"><p style="margin:0;font-size:15px;line-height:1.7;color:#374151;font-family:Arial,sans-serif;">${esc(c.intro)}</p></td></tr>` : ''}
${buildSectionsHtml(c?.sections || [])}
${extraProducts && extraProducts.length ? `<tr><td class="pd" style="padding:0 24px 20px;"><h3 style="margin:0 0 12px;font-size:16px;color:#1f2937;font-family:Arial,sans-serif;">Produtos Curados</h3>${buildProductsHtml(extraProducts)}</td></tr>` : ''}
${c?.cta ? `<tr><td style="padding:8px 24px 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;border-radius:8px;"><tr><td align="center" style="padding:20px;"><p style="margin:0 0 12px;font-size:16px;color:#1f2937;font-family:Arial,sans-serif;">${esc(c.cta)}</p><a href="#" style="display:inline-block;padding:12px 32px;background:#f97316;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:700;font-family:Arial,sans-serif;">Acessar Revista</a></td></tr></table></td></tr>` : ''}
<tr><td style="padding:20px 24px;border-top:1px solid #e5e7eb;background:#f9fafb;"><p style="margin:0 0 6px;font-size:12px;color:#9ca3af;text-align:center;font-family:Arial,sans-serif;">Revista MODA ATUAL — Newsletter Editorial</p><p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;font-family:Arial,sans-serif;">Você recebeu este email porque está inscrito em nossa newsletter.<br/><a href="#" style="color:#9ca3af;text-decoration:underline;">Cancelar inscrição</a></p></td></tr>
</table></td></tr></table>
</body></html>`
}
