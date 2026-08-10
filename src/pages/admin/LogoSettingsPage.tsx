import { useState, useEffect, useRef } from 'react'
import { getSiteSettings, uploadLogo, removeLogo } from '@/services/logo-settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useLogo } from '@/hooks/use-logo'
import { BrandLogo } from '@/components/BrandLogo'
import { Upload, Trash2, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'

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
        description: 'O novo logo personalizado foi aplicado em todo o sistema.',
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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Identidade Visual & Logomarca Oficial</h2>
        <p className="text-gray-500 mt-1">
          Gerencie a exibição da marca "Revista MODA ATUAL Digital" em todo o ecossistema (Portal,
          Painel Admin, Leitor e Redes Sociais).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Previsualização das Variantes Oficiais</span>
            {!logoUrl && (
              <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-800 font-semibold px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> Marca Oficial Ativa
              </span>
            )}
          </CardTitle>
          <CardDescription>
            A logomarca oficial é otimizada para alta resolução (300 DPI) e adapta-se
            automaticamente conforme o contraste da tela.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              1. Variante Principal (Header & Destaques) — Fundo Laranja #ea580c
            </p>
            <div className="flex items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="h-14">
                <BrandLogo variant="primary" className="h-full" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              2. Variante Knockout (Transparente / Vazada) — Para sobreposição em fotos e capas
            </p>
            <div className="flex items-center justify-center p-6 bg-gray-900 rounded-lg">
              <div className="h-12">
                <BrandLogo variant="knockout" className="h-full" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              3. Variante Monocromática — Para layouts minimalistas e impressões
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="h-10">
                  <BrandLogo variant="mono" monoColor="orange" className="h-full" />
                </div>
              </div>
              <div className="flex items-center justify-center p-4 bg-gray-100 border border-gray-200 rounded-lg">
                <div className="h-10">
                  <BrandLogo variant="mono" monoColor="black" className="h-full" />
                </div>
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
              Enviar Logo Personalizado
            </Button>
            {logoUrl && (
              <Button
                onClick={handleRemove}
                variant="outline"
                disabled={uploading}
                className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <Trash2 className="w-4 h-4" />
                Restaurar Logomarca Oficial
              </Button>
            )}
          </div>
          <div className="p-3 bg-blue-50 rounded-md border border-blue-200 flex items-start gap-2.5 text-xs text-blue-800">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              A marca oficial "Revista MODA ATUAL Digital" está sincronizada diretamente com o
              leitor da revista, exportador de relatórios e geradores de conteúdo social.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
