import { useState, useEffect, useRef } from 'react'
import { getSiteSettings, uploadLogo, removeLogo } from '@/services/logo-settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useLogo } from '@/hooks/use-logo'
import { BrandLogo } from '@/components/BrandLogo'
import {
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Image,
  Layout,
  Smartphone,
  Layers,
} from 'lucide-react'

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
      toast({
        title: 'Logo atualizado!',
        description: 'O novo logo personalizado foi aplicado no ecossistema.',
      })
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
      toast({
        title: 'Logo restaurado',
        description: 'A logomarca oficial "Revista MODA ATUAL Digital" foi restaurada.',
      })
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Identidade Visual & Logomarcas Oficiais Social Media
        </h2>
        <p className="text-gray-500 mt-1">
          Gerencie a matriz visual "Revista MODA ATUAL Digital" otimizada para os 8+ formatos de
          redes sociais (Stories, Reels, Feed, Facebook, LinkedIn, YouTube) e leitores digitais.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-600" />
              <span>Matriz de Branding Social & Editorial</span>
            </span>
            {!logoUrl && (
              <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-800 font-semibold px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Transparência & Vetorização Ativas
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Ativos em altíssima resolução com letras brancas vazadas sobre retângulo laranja
            (#ea580c), sem bordas ou fundos externos indesejados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Variant 1: Social Landscape */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-orange-600" />
                <p className="text-sm font-semibold text-gray-900">
                  1. Variante Horizontal / Landscape (16:9 - Facebook, LinkedIn, YouTube)
                </p>
              </div>
              <span className="text-[0.6875rem] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                social_landscape (16:9)
              </span>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 border border-gray-100 rounded-lg">
              <div className="h-14">
                <BrandLogo
                  variant="social_landscape"
                  className="h-full"
                  alt="Logomarca Oficial Revista Moda Atual Digital"
                />
              </div>
            </div>
          </div>

          {/* Variant 2: Social Square / Feed */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-600" />
                <p className="text-sm font-semibold text-gray-900">
                  2. Variante Quadrada / Compacta (1:1 - Instagram Post, Pinterest, Carrosséis)
                </p>
              </div>
              <span className="text-[0.6875rem] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                social_square (1:1)
              </span>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 border border-gray-100 rounded-lg">
              <div className="h-16">
                <BrandLogo
                  variant="social_square"
                  className="h-full"
                  alt="Logomarca Oficial Revista Moda Atual Digital"
                />
              </div>
            </div>
          </div>

          {/* Variant 3: Social Vertical / Portrait */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-orange-600" />
                <p className="text-sm font-semibold text-gray-900">
                  3. Variante Vertical / Portrait (9:16 - Instagram Stories, Reels, TikTok,
                  WhatsApp)
                </p>
              </div>
              <span className="text-[0.6875rem] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                social_portrait (9:16)
              </span>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 border border-gray-100 rounded-lg">
              <div className="h-24">
                <BrandLogo
                  variant="social_portrait"
                  className="h-full"
                  alt="Logomarca Oficial Revista Moda Atual Digital"
                />
              </div>
            </div>
          </div>

          {/* Variant 4: Knockout White */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-orange-600" />
                <p className="text-sm font-semibold text-gray-900">
                  4. Variante Knockout / Vazada (Capas de Revista, Overlays de Vídeo e Fotos)
                </p>
              </div>
              <span className="text-[0.6875rem] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                knockout
              </span>
            </div>
            <div className="flex items-center justify-center p-6 bg-stone-900 rounded-lg shadow-inner">
              <div className="h-12">
                <BrandLogo variant="knockout" className="h-full" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t">
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
              className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Enviar Customização de Logo
            </Button>
            {logoUrl && (
              <Button
                onClick={handleRemove}
                variant="outline"
                disabled={uploading}
                className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <Trash2 className="w-4 h-4" />
                Restaurar Marca Oficial Padrão
              </Button>
            )}
          </div>

          <div className="p-3.5 bg-orange-50 rounded-lg border border-orange-200 flex items-start gap-2.5 text-xs text-orange-900">
            <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <p>
              Todos os 16 templates editoriais e geradores de mídia social alternam automaticamente
              a logomarca de acordo com a proporção de tela do canal de destino (landscape, square
              ou portrait).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
