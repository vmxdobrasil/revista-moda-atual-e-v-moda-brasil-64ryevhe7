import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Slider } from '@/components/ui/slider'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Share2, ZoomIn, ZoomOut, Play, BookOpenText } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

import { MagazinePage } from '@/components/magazine/MagazinePage'
import { Hotspot } from '@/components/magazine/Hotspot'

export default function Reader() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  const handleShare = () => {
    toast({
      title: 'Link Copiado!',
      description: 'O link desta edição foi copiado para a área de transferência.',
    })
  }

  const handleTextMode = () => {
    toast({
      title: 'Modo Texto Ativado',
      description: 'A leitura pura foi ativada para este artigo.',
    })
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#FDFDFD] flex flex-col font-sans relative">
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 z-10 bg-[#0A0A0A]/90 backdrop-blur fixed top-0 w-full">
        <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-white">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Hub
          </Link>
        </Button>
        <h2 className="font-serif text-xl md:text-2xl tracking-[0.2em] text-[#C5A059] font-bold text-center">
          REVISTA MODA ATUAL
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="text-white hover:bg-white/10 hover:text-white"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </header>

      {/* Magazine Viewer Area */}
      <main className="flex-1 w-full flex items-center justify-center p-4 md:p-8 pt-20 pb-24 overflow-hidden">
        <Carousel
          opts={{ align: 'start', dragFree: true }}
          className="w-full max-w-[95vw] md:max-w-6xl aspect-[21/29.5] md:aspect-[42/29.5] drop-shadow-2xl"
        >
          <CarouselContent className="h-full ml-0">
            {/* Page 1: Cover */}
            <CarouselItem className="pl-0 basis-full md:basis-1/2 h-full">
              <MagazinePage
                pageNumber={1}
                side="left"
                imageUrl="https://img.usecurling.com/p/800/1200?q=high%20fashion%20editorial%20model"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 flex flex-col items-center justify-between py-16 px-8 text-center">
                  <div className="pt-10">
                    <h1 className="text-7xl md:text-9xl font-serif text-white font-bold tracking-tighter mix-blend-overlay">
                      VOGUE
                    </h1>
                    <p className="text-xl text-[#C5A059] font-serif tracking-widest mt-4">
                      OUTONO INVERNO 2026
                    </p>
                  </div>
                  <div className="text-white">
                    <h3 className="font-serif text-2xl font-bold mb-2">O NOVO MINIMALISMO</h3>
                    <p className="text-sm tracking-widest uppercase">Elegância Redefinida</p>
                  </div>
                </div>
              </MagazinePage>
            </CarouselItem>

            {/* Page 2: Editorial Article */}
            <CarouselItem className="pl-0 basis-full md:basis-1/2 h-full">
              <MagazinePage
                pageNumber={2}
                side="right"
                className="p-8 md:p-12 flex flex-col justify-center"
              >
                <div className="max-w-md mx-auto">
                  <p className="text-[#FF6B00] font-bold text-xs uppercase tracking-widest mb-4">
                    Editorial
                  </p>
                  <h2 className="text-5xl font-serif mb-8 text-[#0A0A0A] leading-tight">
                    O Novo
                    <br />
                    Minimalismo
                  </h2>
                  <p className="text-[#0A0A0A]/80 text-justify leading-relaxed mb-8 font-sans text-sm md:text-base">
                    A temporada de outono traz uma nova perspectiva sobre o minimalismo. Cortes
                    retos, tecidos estruturados e uma paleta de cores sóbria redefinem o luxo
                    silencioso. As marcas atacadistas brasileiras estão liderando esse movimento com
                    maestria e precisão.
                  </p>
                  <div className="w-full aspect-video bg-gray-200 relative group overflow-hidden rounded-sm">
                    <img
                      src="https://img.usecurling.com/p/600/400?q=runway%20fashion%20show"
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      alt="Runway Video"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Button
                        size="icon"
                        className="rounded-full bg-white/30 hover:bg-white/50 backdrop-blur border border-white/50 w-16 h-16"
                      >
                        <Play className="h-8 w-8 text-white ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </MagazinePage>
            </CarouselItem>

            {/* Page 3: Hotspots */}
            <CarouselItem className="pl-0 basis-full md:basis-1/2 h-full">
              <MagazinePage
                pageNumber={3}
                side="left"
                imageUrl="https://img.usecurling.com/p/800/1200?q=elegant%20woman%20dress"
              >
                {/* Hotspots mapped to products */}
                <Hotspot x={45} y={55} onClick={() => setSelectedProduct('vestido-seda')} />
                <Hotspot x={60} y={80} onClick={() => setSelectedProduct('bolsa-couro')} />
              </MagazinePage>
            </CarouselItem>

            {/* Page 4: Ad / Back Cover */}
            <CarouselItem className="pl-0 basis-full md:basis-1/2 h-full">
              <MagazinePage pageNumber={4} side="right" className="bg-[#0A0A0A]">
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                  <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center mb-8">
                    <span className="font-serif text-white text-3xl font-bold">V</span>
                  </div>
                  <h2 className="text-white font-serif text-3xl mb-4">V MODA BRASIL</h2>
                  <p className="text-white/60 text-sm max-w-xs">
                    O marketplace definitivo para atacadistas de moda. Mais de 100 marcas
                    exclusivas.
                  </p>
                  <Button className="mt-8 bg-[#C5A059] text-black hover:bg-[#C5A059]/90 font-bold px-8">
                    Explorar Marcas
                  </Button>
                </div>
              </MagazinePage>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </main>

      {/* Floating Bottom Bar (Reader Controls) */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-[#0A0A0A]/95 backdrop-blur border-t border-white/10 flex items-center justify-between px-6 z-40">
        <div className="hidden md:flex items-center gap-4 w-1/3 max-w-xs">
          <span className="text-xs font-bold text-white/50">Pág 1</span>
          <Slider defaultValue={[1]} max={4} step={1} className="w-full" />
          <span className="text-xs font-bold text-white/50">4</span>
        </div>
        <div className="flex-1 flex justify-center md:hidden">
          <span className="text-sm font-bold font-serif text-[#C5A059]">1 - 2 de 4</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10 hidden sm:flex"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10 hidden sm:flex"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <div className="w-px h-6 bg-white/20 mx-2 hidden sm:block"></div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTextMode}
            className="text-[#FF6B00] border-[#FF6B00] bg-transparent hover:bg-[#FF6B00] hover:text-white transition-colors"
          >
            <BookOpenText className="w-4 h-4 mr-2" /> Modo Texto
          </Button>
        </div>
      </footer>

      {/* Product Slide-over Modal */}
      <Sheet open={!!selectedProduct} onOpenChange={(v) => !v && setSelectedProduct(null)}>
        <SheetContent className="bg-[#FDFDFD] text-[#0A0A0A] overflow-y-auto w-full sm:max-w-md border-l-0 shadow-2xl p-0">
          <div className="p-6 pb-0">
            <SheetHeader className="mb-6">
              <SheetTitle className="font-serif text-3xl font-bold text-left">
                Shop The Look
              </SheetTitle>
            </SheetHeader>
          </div>

          {selectedProduct && (
            <div className="px-6 pb-8 space-y-6 animate-fade-in-up">
              <div className="relative">
                <img
                  src={
                    selectedProduct === 'vestido-seda'
                      ? 'https://img.usecurling.com/p/400/500?q=silk%20dress'
                      : 'https://img.usecurling.com/p/400/500?q=leather%20handbag'
                  }
                  className="w-full aspect-[4/5] object-cover rounded-md shadow-md"
                  alt="Product Image"
                />
                <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 rounded">
                  V MODA BRASIL
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">
                  Lumina Moda Festa
                </p>
                <h3 className="text-2xl font-bold font-serif mb-2">
                  {selectedProduct === 'vestido-seda'
                    ? 'Vestido Seda Pura'
                    : 'Bolsa Couro Estruturada'}
                </h3>
                <p className="text-[#FF6B00] font-bold text-xl mb-4">
                  {selectedProduct === 'vestido-seda' ? 'R$ 1.250,00' : 'R$ 890,00'}
                </p>

                <p className="text-sm text-[#0A0A0A]/70 mb-8 leading-relaxed">
                  {selectedProduct === 'vestido-seda'
                    ? 'Vestido longo em seda pura com caimento fluido, decote em V profundo e fenda lateral. Uma peça essencial para a coleção de outono, com a garantia de qualidade Lumina.'
                    : 'Bolsa estruturada em couro legítimo, com acabamentos em metal dourado. O acessório perfeito para elevar qualquer look minimalista.'}
                </p>

                <div className="space-y-3">
                  <Button className="w-full bg-[#0A0A0A] text-white hover:bg-black/80 h-12 text-md">
                    Adicionar ao Carrinho Atacadista
                  </Button>
                  <Button variant="outline" className="w-full h-12 text-md">
                    Ver Catálogo da Marca
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
