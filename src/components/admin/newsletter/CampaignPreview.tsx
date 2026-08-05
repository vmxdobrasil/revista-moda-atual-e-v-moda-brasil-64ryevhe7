import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Download, FileSpreadsheet, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  getCampaignPreviewData,
  exportCampaignHtml,
  exportCampaignCsv,
  type NewsletterCampaign,
} from '@/services/newsletter'
import { buildNewsletterHtml } from '@/lib/newsletter-template'

interface CampaignPreviewProps {
  campaign: NewsletterCampaign
  onClose: () => void
}

export function CampaignPreview({ campaign, onClose }: CampaignPreviewProps) {
  const [loading, setLoading] = useState(true)
  const [html, setHtml] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getCampaignPreviewData(campaign)
      .then(({ edition, products }) => {
        if (cancelled) return
        setHtml(buildNewsletterHtml(campaign, edition, products))
      })
      .catch(() => {
        if (!cancelled) setHtml(buildNewsletterHtml(campaign))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [campaign])

  const handleExportHtml = async () => {
    try {
      const htmlContent = await exportCampaignHtml(campaign)
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${campaign.title || 'newsletter'}.html`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Erro ao exportar HTML.')
    }
  }

  const handleExportCsv = () => {
    const csv = exportCampaignCsv(campaign)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${campaign.title || 'newsletter'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="rounded-xl border-none bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Preview: {campaign.title}</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExportHtml}>
            <Download className="w-4 h-4 mr-1" /> HTML
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportCsv}>
            <FileSpreadsheet className="w-4 h-4 mr-1" /> CSV
          </Button>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <iframe
            srcDoc={html}
            title="Newsletter Preview"
            className="w-full rounded-lg border border-gray-200"
            style={{ minHeight: '600px' }}
            sandbox="allow-same-origin"
          />
        )}
      </CardContent>
    </Card>
  )
}
