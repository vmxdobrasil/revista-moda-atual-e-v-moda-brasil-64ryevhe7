import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, TrendingUp, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

const BRANDS = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  name:
    ['Lumina', 'Aura Noir', 'Essência', 'Vanguard', 'Studio 21', 'Azzaro'][i % 6] +
    (i > 5 ? ' Collection' : ''),
  category: ['Moda Festa', 'Jeanswear', 'Alfaiataria', 'Casual Chic'][i % 4],
  rating: (4 + Math.random()).toFixed(1),
  image: `https://img.usecurling.com/p/400/400?q=fashion%20brand%20logo&seed=${i}&color=${['black', 'orange', 'white'][i % 3]}`,
}))

export default function Marketplace() {
  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950 p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-black dark:bg-zinc-900 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 max-w-xl">
            <Badge className="bg-primary hover:bg-primary text-primary-foreground mb-4 border-none">
              V MODA BRASIL
            </Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              As 100 Melhores Marcas do Atacado
            </h1>
            <p className="text-zinc-400 text-lg">
              Conecte-se com fornecedores premium verificados e abasteça sua loja com exclusividade.
            </p>
          </div>
          <div className="relative z-10 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="search"
                placeholder="Buscar marcas..."
                className="w-full pl-10 bg-white/10 border-white/20 text-white placeholder:text-zinc-400"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
            <TrendingUp className="text-primary w-6 h-6" />
            Em Destaque
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              Ordenar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {BRANDS.map((brand) => (
            <Card
              key={brand.id}
              className="overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer bg-card"
            >
              <div className="aspect-square relative overflow-hidden bg-muted">
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-background/90 backdrop-blur text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  {brand.rating}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {brand.category}
                </div>
                <h3 className="font-bold text-lg font-serif mb-3">{brand.name}</h3>
                <Button className="w-full" variant="secondary">
                  Ver Catálogo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
