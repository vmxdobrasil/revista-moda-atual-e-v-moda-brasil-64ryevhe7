import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Edit2, Play, Plus } from 'lucide-react'

const editions = [
  {
    id: 1,
    img: 'https://img.usecurling.com/p/100/140?q=fashion%20magazine%20cover',
    title: 'Outono Inverno 26',
    date: '10 Mai 2026',
    status: 'Aprovado',
    color: 'bg-green-500/20 text-green-500',
  },
  {
    id: 2,
    img: 'https://img.usecurling.com/p/100/140?q=wedding%20dress',
    title: 'Especial Noivas',
    date: '22 Jun 2026',
    status: 'Em Revisão',
    color: 'bg-brand-orange/20 text-brand-orange',
  },
  {
    id: 3,
    img: 'https://img.usecurling.com/p/100/140?q=summer%20fashion',
    title: 'Primavera Verão 27',
    date: '15 Ago 2026',
    status: 'Rascunho',
    color: 'bg-muted text-muted-foreground',
  },
]

export default function Editions() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif tracking-tight mb-2">Módulo Editorial</h1>
          <p className="text-muted-foreground">
            Gerencie o fluxo de trabalho das edições da Revista Moda Atual.
          </p>
        </div>
        <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white shadow-lg shadow-brand-orange/20">
          <Plus className="w-4 h-4 mr-2" /> Nova Edição
        </Button>
      </div>

      <Card className="border-border/50 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Capa</th>
                <th className="px-6 py-4 font-medium">Título & Edição</th>
                <th className="px-6 py-4 font-medium">Data de Lançamento</th>
                <th className="px-6 py-4 font-medium">Status (Workflow)</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {editions.map((ed) => (
                <tr key={ed.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <img
                      src={ed.img}
                      alt={ed.title}
                      className="w-12 h-16 object-cover rounded-sm shadow-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-base text-foreground font-serif">{ed.title}</div>
                    <div className="text-muted-foreground text-xs mt-1">Vol {ed.id + 40}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{ed.date}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`border-none ${ed.color}`}>
                      {ed.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="ghost" size="icon" title="Duplicar">
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Editar">
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Publicar">
                      <Play className="w-4 h-4 text-brand-gold" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
