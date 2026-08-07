import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Smartphone } from 'lucide-react'
import { TemplateRenderer } from './TemplateRenderer'
import type { EditionPage } from '@/services/magazine'

const FORMATS = [
  { id: 'a4', label: 'A4 Revista', aspect: '210 / 295', maxW: '420px' },
  { id: 'ig-post', label: 'IG Post', aspect: '1 / 1', maxW: '360px' },
  { id: 'ig-story', label: 'Story/Reels', aspect: '9 / 16', maxW: '252px' },
  { id: 'fb-post', label: 'Facebook', aspect: '1200 / 630', maxW: '480px' },
  { id: 'yt-thumb', label: 'YouTube', aspect: '16 / 9', maxW: '480px' },
  { id: 'wa-status', label: 'WhatsApp', aspect: '9 / 16', maxW: '252px' },
  { id: 'pin', label: 'Pinterest', aspect: '2 / 3', maxW: '320px' },
  { id: 'li-post', label: 'LinkedIn', aspect: '1200 / 627', maxW: '480px' },
] as const

export function SocialFormatPreview({ page }: { page: EditionPage }) {
  const [open, setOpen] = useState(false)
  const [formatId, setFormatId] = useState<string>('a4')
  const current = FORMATS.find((f) => f.id === formatId) ?? FORMATS[0]

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Smartphone className="w-4 h-4 mr-2" /> Formatos
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Pre-visualizacao por Formato</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 flex-wrap mb-3 flex-shrink-0">
            {FORMATS.map((f) => (
              <Button
                key={f.id}
                variant={formatId === f.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormatId(f.id)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <div className="flex justify-center bg-gray-100 rounded-lg p-4 overflow-auto flex-1">
            <div
              className="bg-white shadow-lg overflow-hidden"
              style={{ aspectRatio: current.aspect, width: '100%', maxWidth: current.maxW }}
            >
              <div className="w-full h-full">
                <TemplateRenderer page={page} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
