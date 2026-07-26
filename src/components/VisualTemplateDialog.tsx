import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Link2, Check } from 'lucide-react'
import type { StoryText } from '@/services/story-texts'
import { VisualTemplateCard } from '@/components/VisualTemplateCard'
import { extractDisplayContent, extractTags } from '@/lib/story-text-utils'

const TYPE_GRADIENTS_CSS: Record<string, string> = {
  'meta-prompt': '#4f46e5, #7c3aed',
  materia_completa: '#2563eb, #0891b2',
  'materia-jornalistica': '#2563eb, #0891b2',
  'legenda-atacadista': '#f97316, #dc2626',
  'tendencia-relatorio': '#14b8a6, #16a34a',
  'reels-script': '#ec4899, #e11d48',
  'plano-semanal': '#a855f7, #4f46e5',
  descricao: '#ef4444, #f97316',
  texto: '#374151, #111827',
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface VisualTemplateDialogProps {
  storyText: StoryText
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VisualTemplateDialog({ storyText, open, onOpenChange }: VisualTemplateDialogProps) {
  const [copied, setCopied] = useState(false)
  const { content, type, typeLabel } = extractDisplayContent(storyText.options)
  const tags = extractTags(storyText.options)
  const gradient = TYPE_GRADIENTS_CSS[type] || TYPE_GRADIENTS_CSS.texto

  const handleDownload = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const tagsHtml = tags.map((t) => `#${t}`).join(' ')
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${escapeHtml(storyText.subject)}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f0f0}.card{width:1080px;height:1080px;background:linear-gradient(135deg,${gradient});padding:80px;display:flex;flex-direction:column;justify-content:center;font-family:'Helvetica Neue',Arial,sans-serif;position:relative;overflow:hidden}.brand{font-size:28px;color:rgba(255,255,255,0.6);margin-bottom:24px;font-weight:700;letter-spacing:2px;text-transform:uppercase}.badge{position:absolute;top:80px;right:80px;background:rgba(255,255,255,0.15);color:#fff;padding:8px 20px;border-radius:20px;font-size:18px;font-weight:600}.title{font-size:52px;color:#fff;margin-bottom:32px;font-weight:800;line-height:1.2}.content{font-size:30px;color:rgba(255,255,255,0.9);line-height:1.6;flex:1;overflow:hidden}.tags{font-size:24px;color:rgba(255,255,255,0.7);margin-top:24px}.footer{font-size:22px;color:rgba(255,255,255,0.5);margin-top:32px}@media print{body{background:none}}</style></head><body>
<div class="card"><div class="brand">V MODA BRASIL</div><div class="badge">${escapeHtml(typeLabel)}</div><h1 class="title">${escapeHtml(storyText.subject)}</h1><p class="content">${escapeHtml(content.slice(0, 500))}</p>${tagsHtml ? `<div class="tags">${escapeHtml(tagsHtml)}</div>` : ''}<div class="footer">revistaModaAtual.com</div></div>
<script>window.onload=function(){setTimeout(function(){window.print();},500);}</script></body></html>`
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/texto/${storyText.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Template Visual</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <VisualTemplateCard storyText={storyText} />
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" /> Baixar
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleShare}>
              {copied ? (
                <Check className="w-4 h-4 mr-2 text-green-600" />
              ) : (
                <Link2 className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Copiado!' : 'Copiar Link'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
