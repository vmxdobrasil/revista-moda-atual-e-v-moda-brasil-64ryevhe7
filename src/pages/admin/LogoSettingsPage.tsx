import { useState, useEffect, useRef } from 'react'
import {
  getSiteSettings,
  uploadLogo,
  removeLogo,
  type SiteSettings,
} from '@/services/logo-settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useLogo } from '@/hooks/use-logo'
import { BrandLogo } from '@/components/BrandLogo'
import { Upload, Trash2, Loader2 } from 'lucide-react'

export default function LogoSettingsPage() {
  const { toast } = useToast()
  const { logoUrl, refresh } = useLogo()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getSiteSettings()
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadLogo(file)
      await refresh()
      toast({ title: 'Logo atualizado!', description: 'O novo logo foi aplicado em todo o site.' })
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err?.message || 'Falha ao enviar logo.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemove = async () => {
    setUploading(true)
    try {
      await removeLogo()
      await refresh()
      toast({ title: 'Logo removido', description: 'O logo padrão gerado foi restaurado.' })
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err?.message || 'Falha ao remover logo.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Configurações de Logo</h2>
        <p className="text-gray-500 mt-1">Gerencie o logo exibido em todo o site.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preview do Logo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Variante branca (vazado) — sobre imagens e vídeos
            </p>
            <div className="flex items-center justify-center p-8 bg-gray-900 rounded-lg">
              <div className="w-64">
                <BrandLogo variant="white" />
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Variante header — fundo laranja</p>
            <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg">
              <div className="w-64">
                <BrandLogo variant="header" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/jpeg"
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-orange-500 hover:bg-orange-600 gap-2"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Enviar Novo Logo
            </Button>
            {logoUrl && (
              <Button
                onClick={handleRemove}
                variant="outline"
                disabled={uploading}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remover (usar gerado)
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Formatos aceitos: PNG, SVG ou JPEG. O logo substitui a versão gerada em todo o site
            (header, footer, revista, capas e visualizador fullscreen).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
