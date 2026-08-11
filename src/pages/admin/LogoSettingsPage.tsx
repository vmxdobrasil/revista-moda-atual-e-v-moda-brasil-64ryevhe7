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
          Identidade Visual & Logomarcas Oficiais
        </h2>
        <p className="text-gray-500 mt-1">
          Gerencie as 3 variações oficiais da logomarca "Revista MODA ATUAL Digital" aplicadas em
          todo o ecossistema (Portal, Painel Admin, Leitor Imersivo, Capas e Redes Sociais).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-600" />
              <span>Matriz Visual Oficial — Revista MODA ATUAL Digital</span>
            </span>
            {!logoUrl && (
              <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-800 font-semibold px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Padronização Ativa
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Ativos visuais em altíssima resolução (300 DPI equivalentes), preparados para layouts
            web, mobile, e-reader e exportações A4 para impressão.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Variant 1: Primary Orange */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-orange-600" />
                <p className="text-sm font-semibold text-gray-900">
                  1. Variante Principal (Retângulo Laranja) — `primary`
                </p>
              </div>
              <span className="text-[0.6875rem] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                Header, Footer, Admin, Páginas Institucionais
              </span>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 border border-gray-100 rounded-lg">
              <div className="h-14">
                <BrandLogo variant="primary" className="h-full" />
              </div>
            </div>
          </div>

          {/* Variant 2: Knockout White */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-orange-600" />
                <p className="text-sm font-semibold text-gray-900">
                  2. Variante Knockout (Letras Brancas Transparentes) — `knockout`
                </p>
              </div>
              <span className="text-[0.6875rem] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                Capas de Revista, Fotos, Vídeos, Overlays Imersivos
              </span>
            </div>
            <div className="flex items-center justify-center p-6 bg-stone-900 rounded-lg shadow-inner">
              <div className="h-12">
                <BrandLogo variant="knockout" className="h-full" />
              </div>
            </div>
          </div>

          {/* Variant 3: Alternative Orange */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-600" />
                <p className="text-sm font-semibold text-gray-900">
                  3. Variante Alternativa (Formato Vertical / Compacto) — `alt`
                </p>
              </div>
              <span className="text-[0.6875rem] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                Stories, Formatos Verticais, Redes Sociais
              </span>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 border border-gray-100 rounded-lg">
              <div className="h-16">
                <BrandLogo variant="alt" className="h-full" />
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
              A marca oficial "Revista MODA ATUAL Digital" está integrada ao Leitor Imersivo,
              exportadores PDF, geradores de conteúdo social e aos 16 templates editoriais com
              margens de segurança pré-configuradas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
