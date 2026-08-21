import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Share2, Check, Copy, Printer, FileText, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Edition, EditionPage } from '@/services/magazine'
import { generatePrintableVersion, copyShareLink } from '@/services/export'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  edition: Edition | null
  pages: EditionPage[]
}

export function ExportDialog({ open, onOpenChange, edition, pages }: ExportDialogProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    const success = await copyShareLink()
    if (success) {
      setCopied(true)
      toast.success('Link copiado para a área de transferência!', {
        description: 'Compartilhe a edição com quem quiser.',
      })
      setTimeout(() => setCopied(false), 2500)
    } else {
      toast.error('Não foi possível copiar o link.')
    }
  }

  const handleDownloadPdf = async () => {
    if (!edition) return

    setIsGeneratingPdf(true)
    toast.info('Preparando PDF para download...', {
      description: 'Renderizando páginas em formato A4 para impressão.',
    })

    try {
      // Small artificial delay to ensure smooth UI transition
      await new Promise((resolve) => setTimeout(resolve, 300))
      const success = generatePrintableVersion(edition, pages)

      if (success) {
        toast.success('Versão para impressão gerada com sucesso!', {
          description: 'Use a opção "Salvar como PDF" na caixa de diálogo de impressão.',
        })
      } else {
        toast.error('Erro ao abrir janela de impressão.', {
          description: 'Verifique se o seu navegador não bloqueou a janela pop-up.',
        })
      }
    } catch (err) {
      console.error('Export PDF error:', err)
      toast.error('Ocorreu um erro ao gerar a versão imprimível.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100 p-6 shadow-2xl">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-2 text-[#ea580c]">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#ea580c]">
              Revista Moda Atual
            </span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white font-serif">
            Exportar Edição
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            {edition ? (
              <span>
                <strong className="text-slate-200">{edition.title}</strong> • {pages.length}{' '}
                página(s)
              </span>
            ) : (
              'Escolha como deseja exportar ou compartilhar esta edição.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3.5 py-4">
          {/* Option A: Download / Print PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || !edition}
            className="group relative flex items-start gap-4 p-4 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-750 hover:border-orange-500/50 transition-all text-left disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-lg bg-orange-950/60 border border-orange-500/30 flex items-center justify-center text-[#ea580c] shrink-0 group-hover:bg-[#ea580c] group-hover:text-white transition-colors shadow-inner">
              {isGeneratingPdf ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100 text-sm group-hover:text-[#ea580c] transition-colors">
                  Baixar / Imprimir PDF
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  A4
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Gera todas as páginas da edição com capa em alta fidelidade prontas para impressão
                ou salvar em PDF.
              </p>
            </div>
          </button>

          {/* Option B: Copy Share Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="group relative flex items-start gap-4 p-4 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-750 hover:border-orange-500/50 transition-all text-left cursor-pointer active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-lg bg-slate-700/60 border border-slate-600/50 flex items-center justify-center text-slate-200 shrink-0 group-hover:bg-[#ea580c] group-hover:text-white transition-colors shadow-inner">
              {copied ? (
                <Check className="w-5 h-5 text-emerald-400 group-hover:text-white" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100 text-sm group-hover:text-[#ea580c] transition-colors">
                  Link Compartilhável
                </span>
                {copied && (
                  <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Copiado!
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Copia a URL direta desta edição para compartilhar no WhatsApp, e-mail ou redes
                sociais.
              </p>
            </div>
          </button>
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between border-t border-slate-800/80 pt-4 mt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Printer className="w-3.5 h-3.5 text-orange-500" />
            <span>Formatos: PDF A4 & Link</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs h-8"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
