import { useState } from 'react'
import {
  Download,
  Copy,
  Check,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Smartphone,
  ShieldCheck,
  FileText,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { STORE_ASSETS_CATALOG, GeneratedAsset } from '@/services/store-assets-generator'
import pb from '@/lib/pocketbase/client'

// Textos Oficiais para a Ficha da Google Play Store
const STORE_LISTING_TEXTS = {
  title: 'Revista MODA ATUAL Digital',
  shortDescription: 'A maior revista de moda digital e hub de negócios do atacado brasileiro.',
  fullDescription: `A Revista MODA ATUAL Digital é o aplicativo oficial do maior ecossistema de moda atacadista do Brasil. Uma publicação digital interativa de alto padrão visual aliada a uma poderosa plataforma de negócios B2B que conecta lojistas, fabricantes, revendedores, estilistas e apaixonados pelo universo da moda.

Experimente uma leitura imersiva com tecnologia flipbook de última geração, descubra antecipadamente as tendências do mercado da confecção nacional e acesse oportunidades comerciais exclusivas direto no seu smartphone.

═════════════════════════════════════
✦ PARA CADA PERFIL DO ECOSSISTEMA
═════════════════════════════════════

◆ PARA LEITORAS, CONSUMIDORAS E ASSINANTES:
• Leitor Flipbook Interativo: Folheie edições mensais completas com alta resolução visual, virada de página suave e zoom detalhado.
• Capa Personalizada: Coloque sua própria foto na capa da edição digital e compartilhe em suas redes sociais.
• Hotspots de Compra Direta: Toque nas peças dos editoriais para consultar valores, descrições detalhadas e falar direto com a marca.
• Cobertura de Eventos: Acompanhe semanas de moda, tapetes vermelhos, lançamentos de coleções e a coluna social exclusiva.

◆ PARA MARCAS ATACADISTAS E FABRICANTES:
• Ranking TOP 60 Melhores Marcas: Posicione sua indústria no guia de compras oficial consultado por lojistas de todo o país.
• Pipeline Comercial V MODA: Conexão direta com novos compradores interessados na grade da sua fábrica.
• Vitrine Editorial Qualificada: Apresente suas coleções em editoriais de moda com acabamento de alta-costura.

◆ PARA ANUNCIANTES E PARCEIROS B2B:
• Portal do Anunciante: Acompanhe métricas reais de visualizações, cliques em hotspots e conversões de leads comerciais.
• Formatos Publicitários Exclusivos: Capas patrocinadas, editoriais de destaque, banners nativos e ações de branded content.
• Integração com WhatsApp Comercial: Conecte o leitor diretamente com a equipe de vendas da sua empresa.

◆ PARA A EQUIPE EDITORIAL & GESTÃO VMX:
• Painel Administrativo Completo: Controle de edições, analytics avançados e fila de distribuição multiformato.
• Automação Inteligente de Conteúdo: Assistentes editoriais e workflows estruturados para geração ágil de pautas.
• Biblioteca de Prompts e Playbooks: Diretrizes editoriais alinhadas às melhores práticas do mercado atacadista.

═════════════════════════════════════
✦ SEGURANÇA, PRIVACIDADE & CONFORMIDADE LGPD
═════════════════════════════════════
A Revista MODA ATUAL adota os mais rigorosos padrões de segurança da informação:
• Criptografia ponta a ponta (HTTPS / TLS 1.3) em todas as requisições.
• Proteção integral de dados corporativos e leads comerciais (sales_leads).
• Sem armazenamento indevido de tokens de autenticação ou credenciais no cache do navegador.
• Total conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
• Suporte a autenticação em duas etapas (2FA) para operadores de sistema.

═════════════════════════════════════
✦ DESTAQUES DO APLICATIVO
═════════════════════════════════════
✓ Modo Offline Inteligente: Acesse edições abertas mesmo sem conexão com a internet.
✓ Design Luxuoso Dark com Detalhes em Laranja: Experiência estética refinada para o segmento premium de moda.
✓ Notificações de Lançamentos: Seja o primeiro a receber novas edições e relatórios de tendências atacadistas.
✓ Link na Bio Centralizador: Acesse canais institucionais e matérias com um só toque.

Baixe agora o aplicativo oficial da Revista MODA ATUAL Digital e leve o melhor do atacado de moda brasileiro sempre com você!`,
}

export default function StoreAssetsPage() {
  const { toast } = useToast()
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState<Record<string, boolean>>({})
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Dispara geração sob demanda de um asset específico
  const generatePreview = async (asset: GeneratedAsset) => {
    try {
      setGenerating((prev) => ({ ...prev, [asset.id]: true }))
      const dataUrl = await asset.render()
      setPreviews((prev) => ({ ...prev, [asset.id]: dataUrl }))
      return dataUrl
    } catch (err: any) {
      toast({
        title: 'Erro ao gerar imagem',
        description: err?.message || 'Falha na renderização Canvas 2D.',
        variant: 'destructive',
      })
      return null
    } finally {
      setGenerating((prev) => ({ ...prev, [asset.id]: false }))
    }
  }

  // Baixa uma única imagem em PNG
  const downloadSingle = async (asset: GeneratedAsset) => {
    try {
      let dataUrl = previews[asset.id]
      if (!dataUrl) {
        dataUrl = (await generatePreview(asset)) || ''
      }
      if (!dataUrl) return

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = asset.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Download iniciado',
        description: `Arquivo ${asset.filename} salvo no seu computador.`,
      })

      // Registro de auditoria gracioso se audit_logs existir
      logAdminAction('store_asset_download', { asset: asset.id, filename: asset.filename })
    } catch (err: any) {
      toast({
        title: 'Falha no download',
        description: err?.message || 'Não foi possível baixar o arquivo.',
        variant: 'destructive',
      })
    }
  }

  // Baixa todas as 10 imagens sequencialmente
  const handleDownloadAll = async () => {
    try {
      setDownloadingAll(true)
      toast({
        title: 'Gerando pacote da loja...',
        description: 'Processando os 10 arquivos em alta resolução. Aguarde.',
      })

      for (let i = 0; i < STORE_ASSETS_CATALOG.length; i++) {
        const asset = STORE_ASSETS_CATALOG[i]
        let dataUrl = previews[asset.id]
        if (!dataUrl) {
          dataUrl = (await asset.render()) || ''
          setPreviews((prev) => ({ ...prev, [asset.id]: dataUrl }))
        }

        if (dataUrl) {
          const link = document.createElement('a')
          link.href = dataUrl
          link.download = asset.filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          // Pequena pausa entre downloads para o navegador não bloquear popups
          await new Promise((r) => setTimeout(r, 450))
        }
      }

      toast({
        title: 'Todos os assets foram baixados!',
        description:
          '10 arquivos PNG (Feature Graphic, Ícone e 8 Mockups 9:16) prontos para o Console do Google.',
      })

      logAdminAction('store_assets_download_all', { total: STORE_ASSETS_CATALOG.length })
    } catch (err: any) {
      toast({
        title: 'Erro ao baixar pacote',
        description: err?.message || 'Falha ao processar imagens.',
        variant: 'destructive',
      })
    } finally {
      setDownloadingAll(false)
    }
  }

  // Copia texto para a área de transferência
  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      toast({
        title: 'Copiado para a área de transferência!',
        description: 'Texto pronto para colar no Google Play Console.',
      })
      setTimeout(() => setCopiedKey(null), 2500)
    } catch {
      toast({
        title: 'Falha ao copiar',
        description: 'Selecione e copie o texto manualmente.',
        variant: 'destructive',
      })
    }
  }

  // Helper para auditoria graciosa
  const logAdminAction = async (action: string, metadata: any) => {
    try {
      await pb.collection('audit_logs').create({
        integration_name: 'google_play_store_assets',
        integration_type: 'event',
        status: 'success',
        executed_at: new Date().toISOString(),
        agent_name: 'Admin Store Generator',
        workflow_id: action,
        error_message: JSON.stringify(metadata),
      })
    } catch {
      // Ignora silenciosamente se audit_logs tiver restrição ou offline
    }
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Publicação Google Play Store (TWA)
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Recursos da Loja (Store Assets)
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Gere e baixe em PNG de alta resolução todos os 10 assets visuais e textos exigidos pelo
            Google Play Console.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20 gap-2"
          >
            {downloadingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Baixando Pacote...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Baixar Todas as Imagens (10 PNGs)
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs Principais */}
      <Tabs defaultValue="visuals" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="visuals" className="gap-2 data-[state=active]:bg-white">
            <ImageIcon className="w-4 h-4" /> Assets Gráficos (10 Arquivos)
          </TabsTrigger>
          <TabsTrigger value="copy" className="gap-2 data-[state=active]:bg-white">
            <FileText className="w-4 h-4" /> Textos da Loja (Google Play)
          </TabsTrigger>
          <TabsTrigger value="package-info" className="gap-2 data-[state=active]:bg-white">
            <ShieldCheck className="w-4 h-4" /> Especificações do Pacote TWA
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Assets Gráficos */}
        <TabsContent value="visuals" className="space-y-6">
          {/* Feature Graphic & Ícone */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-600" />
              Recursos Principais Obrigatórios
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Feature Graphic 1024x500 */}
              <Card className="lg:col-span-2 border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <CardHeader className="pb-3 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-gray-900">
                        Feature Graphic (Gráfico de Recursos)
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        1024 x 500 px • Cabeçalho principal no app Google Play
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-orange-600 border-orange-200 bg-orange-50"
                    >
                      1024 x 500
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="aspect-[1024/500] w-full rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800 relative group">
                    {previews['feature-graphic'] ? (
                      <img
                        src={previews['feature-graphic']}
                        alt="Feature Graphic"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-6 space-y-3">
                        <ImageIcon className="w-10 h-10 text-orange-500 mx-auto opacity-70" />
                        <p className="text-xs text-gray-400">
                          Clique abaixo para renderizar e visualizar em tempo real
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generatePreview(STORE_ASSETS_CATALOG[0])}
                      disabled={generating['feature-graphic']}
                      className="text-xs"
                    >
                      {generating['feature-graphic'] ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Renderizando...
                        </>
                      ) : (
                        'Pré-visualizar'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => downloadSingle(STORE_ASSETS_CATALOG[0])}
                      className="bg-orange-600 hover:bg-orange-500 text-white text-xs gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Baixar PNG (1024x500)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* App Icon 512x512 */}
              <Card className="border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <CardHeader className="pb-3 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-gray-900">
                        Ícone do App
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        512 x 512 px • Imagem PNG sem transparência
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-orange-600 border-orange-200 bg-orange-50"
                    >
                      512 x 512
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="aspect-square w-full max-w-[240px] mx-auto rounded-2xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800 shadow-md">
                    {previews['app-icon'] ? (
                      <img
                        src={previews['app-icon']}
                        alt="Ícone do App"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-6 space-y-2">
                        <Sparkles className="w-8 h-8 text-orange-500 mx-auto" />
                        <p className="text-xs text-gray-400">Ícone oficial em alta fidelidade</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generatePreview(STORE_ASSETS_CATALOG[1])}
                      disabled={generating['app-icon']}
                      className="text-xs"
                    >
                      {generating['app-icon'] ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Gerando...
                        </>
                      ) : (
                        'Pré-visualizar'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => downloadSingle(STORE_ASSETS_CATALOG[1])}
                      className="bg-orange-600 hover:bg-orange-500 text-white text-xs gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Baixar PNG (512x512)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 8 Capturas de Celular 9:16 (1080x1920) */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-orange-600" />8 Capturas de Tela de Smartphone
                  (1080 x 1920 • 9:16)
                </h2>
                <p className="text-xs text-gray-500">
                  Mockups fidedignos às funcionalidades reais do projeto Revista MODA ATUAL & V MODA
                  BRASIL.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STORE_ASSETS_CATALOG.slice(2).map((asset) => (
                <Card
                  key={asset.id}
                  className="border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <CardHeader className="p-3 bg-gray-50/50 border-b border-gray-100">
                    <CardTitle className="text-xs font-bold text-gray-900 line-clamp-1">
                      {asset.name}
                    </CardTitle>
                    <CardDescription className="text-[11px] text-gray-500 line-clamp-1">
                      {asset.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 space-y-3">
                    <div className="aspect-[9/16] w-full rounded-md bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800 shadow-sm relative">
                      {previews[asset.id] ? (
                        <img
                          src={previews[asset.id]}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4 space-y-2">
                          <Smartphone className="w-8 h-8 text-orange-500 mx-auto opacity-60" />
                          <p className="text-[10px] text-gray-400">1080 x 1920 px</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generatePreview(asset)}
                        disabled={generating[asset.id]}
                        className="text-xs w-full h-8"
                      >
                        {generating[asset.id] ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Gerando...
                          </>
                        ) : (
                          'Visualizar'
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => downloadSingle(asset)}
                        className="bg-orange-600 hover:bg-orange-500 text-white text-xs w-full h-8 gap-1"
                      >
                        <Download className="w-3 h-3" /> Baixar PNG
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: Textos Prontos da Loja */}
        <TabsContent value="copy" className="space-y-6">
          {/* Título do App */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">
                  Nome do App (Título)
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Máximo de 30 caracteres permitidos pelo Google Play
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {STORE_LISTING_TEXTS.title.length} / 30 car.
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(STORE_LISTING_TEXTS.title, 'title')}
                  className="gap-1 text-xs"
                >
                  {copiedKey === 'title' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 font-mono text-sm text-gray-900">
                {STORE_LISTING_TEXTS.title}
              </div>
            </CardContent>
          </Card>

          {/* Breve Descrição */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">
                  Breve Descrição (Short Description)
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Máximo de 80 caracteres exibidos na vitrine principal
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {STORE_LISTING_TEXTS.shortDescription.length} / 80 car.
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(STORE_LISTING_TEXTS.shortDescription, 'short')}
                  className="gap-1 text-xs"
                >
                  {copiedKey === 'short' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900">
                {STORE_LISTING_TEXTS.shortDescription}
              </div>
            </CardContent>
          </Card>

          {/* Descrição Completa */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">
                  Descrição Completa (Full Description)
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Máximo de 4000 caracteres. Estruturada por perfis de usuário, LGPD e diferenciais.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {STORE_LISTING_TEXTS.fullDescription.length} / 4000 car.
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(STORE_LISTING_TEXTS.fullDescription, 'full')}
                  className="gap-1 text-xs"
                >
                  {copiedKey === 'full' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-800 whitespace-pre-wrap font-sans max-h-[460px] overflow-y-auto leading-relaxed">
                {STORE_LISTING_TEXTS.fullDescription}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Especificações do Pacote */}
        <TabsContent value="package-info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-orange-600" />
                  Identificação do Pacote TWA
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Dados configurados no manifest.json para compilação via PWABuilder / Bubblewrap
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 block">
                      Package ID (Application ID):
                    </span>
                    <code className="text-sm font-bold text-orange-600">
                      com.vmx.revistamodaatual
                    </code>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">App Name:</span>
                    <span className="font-semibold text-gray-900">Revista MODA ATUAL Digital</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Short Name:</span>
                    <span className="font-semibold text-gray-900">Moda Atual</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Theme Color:</span>
                    <span className="font-mono text-orange-600 font-semibold">#ea580c</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Background Color:</span>
                    <span className="font-mono text-gray-700 font-semibold">#020617</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Display Mode:</span>
                    <span className="font-semibold text-gray-900">
                      standalone (TWA full screen)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  URLs Obrigatórias no Console
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  URLs públicas já publicadas e validadas no domínio de produção
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 block">
                      URL da Política de Privacidade:
                    </span>
                    <a
                      href="/politica-de-privacidade"
                      target="_blank"
                      className="text-orange-600 hover:underline flex items-center gap-1 font-mono text-xs break-all"
                    >
                      /politica-de-privacidade <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">URL dos Termos de Uso:</span>
                    <a
                      href="/termos-de-uso"
                      target="_blank"
                      className="text-orange-600 hover:underline flex items-center gap-1 font-mono text-xs break-all"
                    >
                      /termos-de-uso <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">
                      Digital Asset Links (.well-known):
                    </span>
                    <span className="font-mono text-xs text-gray-600">
                      /.well-known/assetlinks.json (gerado após criar a chave de assinatura SHA-256
                      no Google Play)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
