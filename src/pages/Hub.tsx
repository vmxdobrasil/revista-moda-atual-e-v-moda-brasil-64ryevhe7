import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Filter } from 'lucide-react'

const brands = [
  {
    id: 1,
    name: 'LUMINA',
    category: 'Festa',
    img: 'https://img.usecurling.com/p/400/500?q=glamour%20dress',
    rank: 1,
  },
  {
    id: 2,
    name: 'AURA CONFECÇÕES',
    category: 'Casual',
    img: 'https://img.usecurling.com/p/400/500?q=casual%20fashion',
    rank: 2,
  },
  {
    id: 3,
    name: 'VÉRTICE',
    category: 'Alfaiataria',
    img: 'https://img.usecurling.com/p/400/500?q=woman%20suit',
    rank: 3,
  },
  {
    id: 4,
    name: 'KROMA ACCESSORIES',
    category: 'Acessórios',
    img: 'https://img.usecurling.com/p/400/500?q=leather%20handbag',
    rank: 4,
  },
  {
    id: 5,
    name: 'SOLARIS',
    category: 'Praia',
    img: 'https://img.usecurling.com/p/400/500?q=beachwear',
    rank: 5,
  },
  {
    id: 6,
    name: 'TRAMA',
    category: 'Tricô',
    img: 'https://img.usecurling.com/p/400/500?q=knitwear',
    rank: 6,
  },
  {
    id: 7,
    name: 'ESSÊNCIA',
    category: 'Íntima',
    img: 'https://img.usecurling.com/p/400/500?q=lingerie',
    rank: 7,
  },
  {
    id: 8,
    name: 'MÉTROPOLE',
    category: 'Urbano',
    img: 'https://img.usecurling.com/p/400/500?q=streetwear',
    rank: 8,
  },
]

export default function Hub() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-serif tracking-tight text-brand-gold mb-2">
            V MODA BRASIL Hub
          </h1>
          <p className="text-muted-foreground">
            O ecossistema definitivo para o mercado atacadista. As 100 melhores marcas.
          </p>
        </div>
        <Button variant="outline" className="border-border">
          <Filter className="w-4 h-4 mr-2" /> Filtrar Marcas
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {brands.map((brand) => (
          <Card
            key={brand.id}
            className="group overflow-hidden border-border/50 bg-card hover:border-brand-gold/50 transition-colors cursor-pointer"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={brand.img}
                alt={brand.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <Badge className="absolute top-4 left-4 bg-brand-gold text-black border-none font-bold">
                #{brand.rank}
              </Badge>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-serif text-xl font-bold tracking-wider">
                  {brand.name}
                </h3>
                <p className="text-brand-orange text-sm font-medium">{brand.category}</p>
              </div>
            </div>
            <CardContent className="p-4 flex justify-between items-center bg-card">
              <span className="text-xs text-muted-foreground">Catálogo Completo</span>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-brand-gold transition-colors" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
