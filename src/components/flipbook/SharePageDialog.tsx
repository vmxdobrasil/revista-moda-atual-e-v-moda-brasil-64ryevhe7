import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Share2, Check, Copy, MessageCircle, Send, Globe, QrCode } from 'lucide-react'
import { toast } from 'sonner'

interface SharePageDialogProps {
  editionTitle: string
  pageNumber: number // 1-based display number or page title
  pageIndex: number // 0-based
  totalPages: number
  pageUrl: string
  triggerVariant?: 'header' | 'floating' | 'menu'
  className?: string
}

export function SharePageDialog({
  editionTitle,
  pageNumber,
  pageIndex,
  totalPages,
  pageUrl,
  triggerVariant = 'header',
  className = '',
}: SharePageDialogProps) {
  const [copied, setCopied] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  const copyToClipboard = useCallback(() => {
    const fallbackCopy = () => {
      try {
        const ta = document.createElement('textarea')
        ta.value = pageUrl
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        setCopied(true)
        toast.success('Link da página copiado para a área de transferência!', {
          description: `Página ${pageNumber === 1 && pageIndex === 0 ? 'Capa' : pageNumber} • ${editionTitle}`,
        })
        setTimeout(() => setCopied(false), 2500)
      } catch {
        toast.error('Não foi possível copiar o link')
      }
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(pageUrl)
        .then(() => {
          setCopied(true)
          toast.success('Link da página copiado!', {
            description: `Página ${pageNumber === 1 && pageIndex === 0 ? 'Capa' : pageNumber} de ${totalPages}`,
          })
          setTimeout(() => setCopied(false), 2500)
        })
        .catch(fallbackCopy)
    } else {
      fallbackCopy()
    }
  }, [pageUrl, pageNumber, pageIndex, totalPages, editionTitle])

  const pageLabel = pageIndex === 0 ? 'Capa' : `Página ${pageNumber}`
  const shareText = `${editionTitle} — Veja a ${pageLabel}:`
  const encUrl = encodeURIComponent(pageUrl)
  const encText = encodeURIComponent(shareText)

  const openNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${editionTitle} (${pageLabel})`,
          text: shareText,
          url: pageUrl,
        })
        toast.success('Página compartilhada!')
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          copyToClipboard()
        }
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {triggerVariant === 'floating' ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700 backdrop-blur shadow-lg active:scale-95 transition-all text-xs h-8 px-2.5 rounded-full"
              title="Compartilhar esta página"
            >
              <Share2 className="w-3.5 h-3.5 text-[#ea580c]" />
              <span className="font-medium">Compartilhar página</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className={`gap-1.5 bg-slate-850 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 active:scale-95 transition-all text-xs h-8 sm:h-9 ${className}`}
              title="Compartilhar link direto para esta página"
            >
              <Share2 className="w-3.5 h-3.5 text-[#ea580c]" />
              <span className="hidden md:inline">Compartilhar Página</span>
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 bg-slate-900 border-slate-800 text-slate-200 p-2 shadow-2xl z-50"
        >
          <div className="px-2 py-1.5 mb-1">
            <div className="text-xs font-semibold text-slate-100 uppercase tracking-wider text-orange-500">
              Compartilhar Página
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              {pageLabel} de {totalPages} • {editionTitle}
            </div>
          </div>

          <DropdownMenuItem
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-2.5 py-2 cursor-pointer rounded text-xs text-slate-200 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Copy className="w-4 h-4 text-[#ea580c] shrink-0" />
            )}
            <div className="flex flex-col">
              <span className="font-medium">{copied ? 'Link Copiado!' : 'Copiar Link Direto'}</span>
              <span className="text-[10px] text-slate-400">Abre exatamente nesta página</span>
            </div>
          </DropdownMenuItem>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <DropdownMenuItem
              onClick={openNativeShare}
              className="flex items-center gap-2 px-2.5 py-2 cursor-pointer rounded text-xs text-slate-200 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white"
            >
              <Share2 className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Mais opções (Nativo)...</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-slate-800 my-1" />

          {/* Social direct links */}
          <DropdownMenuItem asChild>
            <a
              href={`https://wa.me/?text=${encText}%20${encUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer rounded text-xs text-slate-200 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white w-full"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <a
              href={`https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer rounded text-xs text-slate-200 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white w-full"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>X (Twitter)</span>
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer rounded text-xs text-slate-200 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white w-full"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Facebook</span>
            </a>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-slate-800 my-1" />

          <DropdownMenuItem
            onClick={() => setQrOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer rounded text-xs text-slate-300 hover:bg-slate-800 hover:text-white focus:bg-slate-800"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-400" />
            <span>Ver QR Code da Página</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* QR Code Dialog for Page */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-100 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#ea580c]" />
              QR Code da {pageLabel}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Aponte a câmera do celular para abrir diretamente nesta página ({editionTitle}).
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg my-2 shadow-inner">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encUrl}&color=0f172a&bgcolor=ffffff`}
              alt={`QR Code para ${pageLabel}`}
              className="w-48 h-48 rounded"
              loading="lazy"
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Input
              readOnly
              value={pageUrl}
              className="bg-slate-950 border-slate-800 text-slate-300 text-xs font-mono h-9"
            />
            <Button
              size="sm"
              onClick={copyToClipboard}
              className="bg-[#ea580c] hover:bg-[#c2410c] text-white shrink-0 h-9 px-3"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
