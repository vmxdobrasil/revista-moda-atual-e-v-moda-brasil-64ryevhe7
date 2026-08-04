import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileText, Loader2 } from 'lucide-react'
import { logExport } from '@/services/cover-actions'
import type { CoverData } from '@/services/cover-versions'

interface CoverExportButtonsProps {
  coverData: CoverData | null
  editionId: string
  variants?: CoverData[]
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Falha ao carregar imagem'))
    img.src = url
  })
}

async function exportPNG(coverData: CoverData): Promise<void> {
  const canvas = document.createElement('canvas')
  canvas.width = 1920
  canvas.height = 1080
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas não suportado')

  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, 1920, 1080)

  try {
    const img = await loadImage(coverData.imageUrl)
    const scale = Math.max(1920 / img.width, 1080 / img.height)
    const w = img.width * scale
    const h = img.height * scale
    ctx.drawImage(img, (1920 - w) / 2, (1080 - h) / 2, w, h)
  } catch {
    /* intentionally ignored */
  }

  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(0, 800, 1920, 280)

  ctx.font = 'bold 64px sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.fillText(coverData.title || 'Capa', 960, 920)

  if (coverData.subtitle) {
    ctx.font = '32px sans-serif'
    ctx.fillStyle = '#cccccc'
    ctx.fillText(coverData.subtitle, 960, 980)
  }

  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'))
  if (!blob) throw new Error('Falha ao gerar PNG')
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cover-${Date.now()}.png`
  link.click()
  URL.revokeObjectURL(url)
}

function exportPDF(covers: CoverData[]): void {
  const win = window.open('', '_blank')
  if (!win) return

  const cards = covers
    .map(
      (c, i) => `
    <div class="cover-page"${i > 0 ? ' style="page-break-before:always"' : ''}>
      <img src="${c.imageUrl}" alt="${c.altText || c.title}" />
      <div class="overlay">
        <h1>${c.title}</h1>
        ${c.subtitle ? `<p>${c.subtitle}</p>` : ''}
      </div>
    </div>`,
    )
    .join('')

  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Cover Export</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}
    body{font-family:sans-serif}
    .cover-page{width:100vw;height:100vh;position:relative;overflow:hidden}
    .cover-page img{width:100%;height:100%;object-fit:cover}
    .overlay{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.8));padding:60px 40px;color:#fff}
    h1{font-size:48px;margin-bottom:8px}p{font-size:24px;opacity:0.8}
    @page{margin:0}</style></head><body>${cards}
    <script>window.onload=function(){setTimeout(function(){window.print()},500)}</script></body></html>`)
  win.document.close()
}

export function CoverExportButtons({ coverData, editionId, variants }: CoverExportButtonsProps) {
  const [exporting, setExporting] = useState<'png' | 'pdf' | null>(null)

  const handlePNG = async () => {
    if (!coverData) return
    setExporting('png')
    try {
      await exportPNG(coverData)
      await logExport(editionId, 'png', 'success')
    } catch (err) {
      await logExport(editionId, 'png', 'error', err instanceof Error ? err.message : 'erro')
    } finally {
      setExporting(null)
    }
  }

  const handlePDF = async () => {
    if (!coverData) return
    setExporting('pdf')
    try {
      const allCovers = variants && variants.length > 0 ? variants : [coverData]
      exportPDF(allCovers)
      await logExport(editionId, 'pdf', 'success')
    } catch (err) {
      await logExport(editionId, 'pdf', 'error', err instanceof Error ? err.message : 'erro')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handlePNG}
        disabled={!coverData || !!exporting}
        variant="outline"
        className="gap-2"
      >
        {exporting === 'png' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Exportar PNG
      </Button>
      <Button
        onClick={handlePDF}
        disabled={!coverData || !!exporting}
        variant="outline"
        className="gap-2"
      >
        {exporting === 'pdf' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        Exportar PDF
      </Button>
    </div>
  )
}
