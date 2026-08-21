import { Edition, EditionPage, getFileUrl } from '@/services/magazine'

/**
 * Escapes special HTML characters to prevent XSS / broken rendering
 */
function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Copies the current URL (or custom link) to clipboard.
 * Returns true on success, false on failure.
 */
export async function copyShareLink(customUrl?: string): Promise<boolean> {
  const urlToCopy = customUrl || (typeof window !== 'undefined' ? window.location.href : '')
  if (!urlToCopy) return false

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(urlToCopy)
      return true
    }
  } catch {
    // fallback below
  }

  try {
    const textArea = document.createElement('textarea')
    textArea.value = urlToCopy
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    const successful = document.execCommand('copy')
    textArea.remove()
    return successful
  } catch (err) {
    console.error('Failed to copy share link:', err)
    return false
  }
}

/**
 * Renders textual / structured content for template pages in printable format
 */
function renderTemplateContent(page: EditionPage): string {
  const t = page.template || 'default'
  const d = page.template_data || {}

  const title = d.title || d.person_name || d.interviewee || ''
  const subtitle = d.subtitle || d.person_title || d.interviewer_name || ''
  const content = d.content || d.bio || d.intro || ''

  let html = ''

  if (title) {
    html += `<h2 class="print-page-title">${escapeHtml(title)}</h2>`
  }
  if (subtitle) {
    html += `<p class="print-page-subtitle">${escapeHtml(subtitle)}</p>`
  }
  if (content) {
    const paragraphs = String(content)
      .split('\n')
      .filter((p) => p.trim().length > 0)
    html += `<div class="print-page-body">`
    paragraphs.forEach((p, idx) => {
      html += `<p class="print-paragraph">${escapeHtml(p)}</p>`
    })
    html += `</div>`
  }

  if (d.qa && Array.isArray(d.qa)) {
    html += `<div class="print-qa-list">`
    d.qa.forEach((item: { q: string; a: string }, idx: number) => {
      html += `
        <div class="print-qa-item">
          <p class="print-qa-q"><strong>Q${idx + 1}: ${escapeHtml(item.q)}</strong></p>
          <p class="print-qa-a">${escapeHtml(item.a)}</p>
        </div>`
    })
    html += `</div>`
  }

  if (d.author) {
    html += `<div class="print-page-author">Por <strong>${escapeHtml(d.author)}</strong></div>`
  }

  return html
}

/**
 * Builds the complete standalone printable HTML document for the edition
 */
export function buildPrintableHtml(edition: Edition, pages: EditionPage[]): string {
  const coverImage = edition.cover_file
    ? getFileUrl(edition, edition.cover_file)
    : edition.cover_url || ''

  const safeTitle = escapeHtml(edition.title || 'Revista Moda Atual')
  const safeDesc = escapeHtml(edition.description || '')
  const safeBrand = escapeHtml(edition.expand?.brand?.name || '')
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // Build page elements
  const pagesHtml = pages
    .map((page, index) => {
      const pageNum = page.page_number || index + 1
      const pageImage = page.image_file ? getFileUrl(page, page.image_file) : page.image_url || ''
      const hasImage = Boolean(pageImage && pageImage.trim() !== '')
      const tocTitle = escapeHtml(page.toc_title || `Página ${pageNum}`)
      const templateHtml = renderTemplateContent(page)

      return `
      <section class="print-sheet page-sheet" data-page="${pageNum}">
        <header class="print-page-header">
          <span class="print-header-brand">REVISTA MODA ATUAL</span>
          <span class="print-header-edition">${safeTitle}</span>
          <span class="print-header-num">Pág. ${pageNum}</span>
        </header>

        <div class="print-sheet-content">
          ${
            hasImage
              ? `
              <div class="print-image-container">
                <img src="${escapeHtml(pageImage)}" alt="Página ${pageNum}" class="print-page-img" />
              </div>
              ${templateHtml ? `<div class="print-template-overlay">${templateHtml}</div>` : ''}
              `
              : `
              <div class="print-text-container">
                <div class="print-toc-tag">${tocTitle}</div>
                ${templateHtml || `<div class="print-empty-page"><p>Página ${pageNum}</p></div>`}
              </div>
              `
          }
        </div>

        <footer class="print-page-footer">
          <span>Moda Atual • Edição Digital</span>
          <span>Página ${pageNum} de ${pages.length}</span>
        </footer>
      </section>
      `
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Revista Moda Atual - ${safeTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    @page {
      size: A4 portrait;
      margin: 0;
    }

    body {
      background-color: #f1f5f9;
      color: #0f172a;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
      line-height: 1.5;
    }

    .no-print-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #0f172a;
      color: #fff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-size: 14px;
    }

    .no-print-bar .title {
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .no-print-bar .badge {
      background: #ea580c;
      color: #fff;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .no-print-bar .actions {
      display: flex;
      gap: 10px;
    }

    .btn-print {
      background: #ea580c;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }

    .btn-print:hover {
      background: #c2410c;
    }

    .btn-close {
      background: #334155;
      color: #e2e8f0;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      font-size: 13px;
      cursor: pointer;
    }

    .btn-close:hover {
      background: #475569;
    }

    .print-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 0;
      gap: 24px;
    }

    .print-sheet {
      width: 210mm;
      min-height: 297mm;
      height: 297mm;
      background: #ffffff;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
    }

    /* COVER PAGE */
    .cover-sheet {
      background: #ffffff;
      position: relative;
    }

    .cover-content {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 32mm 24mm 24mm 24mm;
      z-index: 2;
    }

    .cover-bg-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }

    .cover-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.2) 40%, rgba(15, 23, 42, 0.85) 100%);
      z-index: 1;
    }

    .cover-header {
      text-align: center;
      color: #ffffff;
    }

    .cover-logo-eyebrow {
      font-size: 11pt;
      font-weight: 700;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: #ea580c;
      margin-bottom: 6px;
    }

    .cover-logo-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 38pt;
      font-weight: 900;
      letter-spacing: 0.02em;
      line-height: 1;
      text-transform: uppercase;
      color: #ffffff;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }

    .cover-logo-subtitle {
      font-size: 9pt;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 8px;
    }

    .cover-footer {
      color: #ffffff;
    }

    .cover-edition-tag {
      display: inline-block;
      background: #ea580c;
      color: #ffffff;
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      padding: 4px 12px;
      margin-bottom: 12px;
    }

    .cover-main-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26pt;
      font-weight: 700;
      line-height: 1.15;
      margin-bottom: 10px;
      color: #ffffff;
      text-shadow: 0 2px 8px rgba(0,0,0,0.6);
    }

    .cover-main-desc {
      font-size: 11pt;
      line-height: 1.4;
      color: rgba(255, 255, 255, 0.9);
      max-width: 80%;
      text-shadow: 0 1px 4px rgba(0,0,0,0.6);
    }

    .cover-meta {
      margin-top: 18px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.75);
    }

    /* INNER PAGES */
    .page-sheet {
      padding: 14mm 16mm 14mm 16mm;
      justify-content: space-between;
    }

    .print-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4mm;
      margin-bottom: 6mm;
    }

    .print-header-brand {
      color: #ea580c;
      font-weight: 700;
    }

    .print-page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.5pt;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 4mm;
      margin-top: 6mm;
    }

    .print-sheet-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    .print-image-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .print-page-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
    }

    .print-text-container {
      padding: 6mm;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .print-toc-tag {
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #ea580c;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #ea580c;
      display: inline-block;
      align-self: flex-start;
    }

    .print-page-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24pt;
      font-weight: 700;
      line-height: 1.2;
      color: #0f172a;
      margin-bottom: 8px;
    }

    .print-page-subtitle {
      font-size: 11pt;
      font-style: italic;
      color: #64748b;
      margin-bottom: 18px;
    }

    .print-page-body {
      flex: 1;
      font-size: 10pt;
      line-height: 1.65;
      color: #334155;
      text-align: justify;
    }

    .print-paragraph {
      margin-bottom: 12px;
    }

    .print-qa-list {
      margin-top: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .print-qa-item {
      padding-left: 10px;
      border-left: 3px solid #ea580c;
    }

    .print-qa-q {
      font-size: 9.5pt;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .print-qa-a {
      font-size: 9pt;
      color: #475569;
      line-height: 1.5;
    }

    .print-page-author {
      margin-top: 16px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 9pt;
      color: #64748b;
      text-align: right;
    }

    .print-empty-page {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #94a3b8;
      font-size: 14pt;
    }

    /* PRINT SPECIFIC MEDIA QUERY */
    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
      }

      .no-print-bar {
        display: none !important;
      }

      .print-container {
        padding: 0 !important;
        gap: 0 !important;
      }

      .print-sheet {
        width: 100% !important;
        height: 100vh !important;
        min-height: 100vh !important;
        box-shadow: none !important;
        page-break-after: always !important;
        break-after: page !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      @page {
        size: A4 portrait;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <div class="title">
      <span class="badge">Revista Moda Atual</span>
      <span>${safeTitle} • Visualização de Impressão (A4)</span>
    </div>
    <div class="actions">
      <button class="btn-print" onclick="window.print()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Imprimir / Salvar PDF
      </button>
      <button class="btn-close" onclick="window.close()">Fechar</button>
    </div>
  </div>

  <div class="print-container">
    <!-- CAPA DA REVISTA -->
    <section class="print-sheet cover-sheet">
      ${
        coverImage
          ? `<img src="${escapeHtml(coverImage)}" alt="Capa" class="cover-bg-image" />
             <div class="cover-overlay"></div>`
          : ''
      }
      <div class="cover-content" style="${coverImage ? '' : 'background: #0f172a;'}">
        <header class="cover-header">
          <div class="cover-logo-eyebrow">Edição Oficial</div>
          <h1 class="cover-logo-title">Moda Atual</h1>
          <p class="cover-logo-subtitle">A revista de moda e tendências</p>
        </header>

        <footer class="cover-footer">
          <div class="cover-edition-tag">Edição Especial</div>
          <h2 class="cover-main-title">${safeTitle}</h2>
          ${safeDesc ? `<p class="cover-main-desc">${safeDesc}</p>` : ''}
          <div class="cover-meta">
            <span>${safeBrand ? `Parceiro: ${safeBrand}` : 'Revista Digital'}</span>
            <span>${pages.length} páginas</span>
            <span>${currentDate}</span>
          </div>
        </footer>
      </div>
    </section>

    <!-- PÁGINAS DA REVISTA -->
    ${pagesHtml}
  </div>

  <script>
    window.addEventListener('load', function() {
      // Small timeout to allow images/fonts to settle before invoking print
      setTimeout(function() {
        window.print();
      }, 700);
    });
  </script>
</body>
</html>`
}

/**
 * Opens a new window with the complete printable magazine edition and triggers window.print()
 */
export function generatePrintableVersion(edition: Edition, pages: EditionPage[]): boolean {
  try {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      console.warn('Pop-up was blocked or window could not be opened.')
      return false
    }

    const html = buildPrintableHtml(edition, pages)
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    return true
  } catch (err) {
    console.error('Error generating printable version:', err)
    return false
  }
}
