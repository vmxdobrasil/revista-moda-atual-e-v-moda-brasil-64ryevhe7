import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { FileText, PlaySquare, LayoutGrid, Search, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

export default function Social() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif tracking-tight">Automação Social & IA</h1>
        <p className="text-muted-foreground">
          Transforme conteúdo editorial em campanhas de alta performance instantaneamente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Source Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Conteúdo Fonte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar artigos..."
                  className="w-full bg-muted/50 rounded-md pl-9 pr-4 py-2 text-sm border-none outline-none text-foreground"
                />
              </div>

              <div className="space-y-2 mt-4">
                {[
                  { title: 'O Novo Minimalismo', edition: 'Outono Inverno 26', active: true },
                  { title: 'Cores que Vendem', edition: 'Outono Inverno 26', active: false },
                  { title: 'Entrevista: Lumina', edition: 'Especial SP', active: false },
                ].map((article, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-md cursor-pointer border transition-colors ${article.active ? 'bg-brand-orange/10 border-brand-orange/30' : 'bg-transparent border-border/50 hover:bg-muted/50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <FileText
                        className={`w-4 h-4 mt-0.5 ${article.active ? 'text-brand-orange' : 'text-muted-foreground'}`}
                      />
                      <div>
                        <h4
                          className={`text-sm font-medium ${article.active ? 'text-brand-orange' : 'text-foreground'}`}
                        >
                          {article.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">{article.edition}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Output */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="reels" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg border border-border/50">
              <TabsTrigger
                value="reels"
                className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md py-2"
              >
                <PlaySquare className="w-4 h-4 mr-2" /> Reels / TikTok
              </TabsTrigger>
              <TabsTrigger
                value="carousel"
                className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md py-2"
              >
                <LayoutGrid className="w-4 h-4 mr-2" /> Carrossel (Insta)
              </TabsTrigger>
              <TabsTrigger
                value="seo"
                className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md py-2"
              >
                <Search className="w-4 h-4 mr-2" /> SEO & Meta
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="reels" className="m-0">
                <Card className="border-border/50 border-t-4 border-t-brand-orange">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-lg">Script Gerado por IA</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Otimizado para retenção nos primeiros 3 segundos.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      {copied ? (
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copied ? 'Copiado!' : 'Copiar Script'}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="p-4 bg-brand-orange/10 rounded-md border border-brand-orange/20 relative">
                      <Badge className="absolute -top-3 left-4 bg-brand-orange hover:bg-brand-orange text-white">
                        HOOK (0-3s)
                      </Badge>
                      <p className="text-sm text-foreground mt-2 leading-relaxed">
                        <span className="font-bold">Visual:</span> Você segurando o vestido de seda
                        da edição, balançando levemente para mostrar o caimento.
                        <br />
                        <span className="font-bold">Áudio/Texto:</span> "O minimalismo não precisa
                        ser chato, e a nova coleção de outono provou isso."
                      </p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-md border border-border/50 relative mt-6">
                      <Badge variant="secondary" className="absolute -top-3 left-4">
                        DESENVOLVIMENTO (3-10s)
                      </Badge>
                      <p className="text-sm text-foreground mt-2 leading-relaxed">
                        <span className="font-bold">Visual:</span> Cortes rápidos de modelos na
                        passarela, focando nas texturas e cortes retos.
                        <br />
                        <span className="font-bold">Áudio/Texto:</span> "Na Revista Moda Atual deste
                        mês, dissecamos as marcas da V Moda Brasil que estão redefinindo o luxo
                        silencioso."
                      </p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-md border border-border/50 relative mt-6">
                      <Badge variant="secondary" className="absolute -top-3 left-4">
                        CTA (10-15s)
                      </Badge>
                      <p className="text-sm text-foreground mt-2 leading-relaxed">
                        <span className="font-bold">Visual:</span> Tela dividida com a capa da
                        revista e o QR code de compras.
                        <br />
                        <span className="font-bold">Áudio/Texto:</span> "Acesse o link na bio para
                        ler a edição completa e comprar direto do Hub."
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="carousel" className="m-0">
                <Card className="border-border/50 border-t-4 border-t-brand-gold">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-6">
                      A IA dividiu o artigo em 4 slides otimizados para 4:5 (Instagram).
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="aspect-[4/5] bg-muted/50 rounded-lg border border-border/50 overflow-hidden relative group"
                        >
                          <img
                            src={`https://img.usecurling.com/p/300/400?q=minimalist%20fashion&seed=${i}`}
                            className="w-full h-full object-cover opacity-60"
                          />
                          <div className="absolute inset-0 p-4 flex flex-col justify-center text-center">
                            <h4 className="font-serif text-white font-bold drop-shadow-md">
                              Slide {i}
                            </h4>
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="secondary" size="sm">
                              Baixar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seo" className="m-0">
                <Card className="border-border/50">
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                        Title Tag (Ideal: 50-60 chars)
                      </label>
                      <div className="p-3 bg-muted/30 rounded-md border border-border/50 font-mono text-sm">
                        O Novo Minimalismo: Tendências Outono Inverno | V Moda
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                        Meta Description (Ideal: 150-160 chars)
                      </label>
                      <div className="p-3 bg-muted/30 rounded-md border border-border/50 font-mono text-sm">
                        Descubra como o minimalismo e o luxo silencioso estão dominando as
                        tendências de outono inverno 2026. Compre looks exclusivos no atacado na V
                        Moda Brasil.
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                        Keywords Extraídas
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Minimalismo',
                          'Luxo Silencioso',
                          'Outono Inverno 2026',
                          'Moda Atacadista',
                          'Alfaiataria',
                          'V Moda Brasil',
                        ].map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
