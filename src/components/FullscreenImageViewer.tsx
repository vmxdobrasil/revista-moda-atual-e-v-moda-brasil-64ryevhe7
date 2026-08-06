import { Dialog, DialogContent } from '@/components/ui/dialog'
import { BrandLogo } from '@/components/BrandLogo'

interface FullscreenImageViewerProps {
  src: string | null
  alt: string
  open: boolean
  onClose: () => void
}

export function FullscreenImageViewer({ src, alt, open, onClose }: FullscreenImageViewerProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/95 overflow-hidden [&>button]:z-20 [&>button]:text-white [&>button]:hover:bg-white/10">
        {src && (
          <div className="relative flex items-center justify-center w-full h-[90vh]">
            <img src={src} alt={alt} className="max-w-full max-h-full object-contain" />
            <div className="absolute bottom-6 right-6 w-28 md:w-36 pointer-events-none">
              <BrandLogo variant="white" watermark />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
