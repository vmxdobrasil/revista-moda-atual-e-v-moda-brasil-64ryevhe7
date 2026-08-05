import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { FunilContentItem } from '@/services/conversion'

interface Props {
  contents: FunilContentItem[]
}

export function TopContentsTable({ contents }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top 10 Conteúdos por Taxa de Conversão</CardTitle>
      </CardHeader>
      <CardContent>
        {contents.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">
            Nenhum conteúdo com dados suficientes no período selecionado.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                <TableHead>Conteúdo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Imp.</TableHead>
                <TableHead className="text-right">Cliques</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
                <TableHead className="text-right">Conv. %</TableHead>
                <TableHead>Variante</TableHead>
                <TableHead>Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contents.map((c, i) => (
                <TableRow key={c.content_id}>
                  <TableCell className="font-bold text-gray-400">{i + 1}</TableCell>
                  <TableCell className="font-medium text-gray-800">
                    {c.content_title || c.content_id}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {c.content_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {c.impressions.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">{c.clicks.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right">{c.orders.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right font-bold text-orange-600">
                    {c.conversion_rate.toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {c.cta_variant || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">{c.link_origin || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
