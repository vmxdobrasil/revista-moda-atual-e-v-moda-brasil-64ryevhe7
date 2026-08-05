import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { FunilBreakdown } from '@/services/conversion'

const chartConfig: ChartConfig = {
  clicks: { label: 'Cliques', color: 'hsl(142, 71%, 45%)' },
  orders: { label: 'Pedidos', color: 'hsl(25, 95%, 53%)' },
  conversion_rate: { label: 'Conv. %', color: 'hsl(280, 65%, 60%)' },
}

interface Props {
  byOrigin: Record<string, FunilBreakdown>
  byVariant: Record<string, FunilBreakdown>
}

export function FunnelCharts({ byOrigin, byVariant }: Props) {
  const originData = Object.entries(byOrigin).map(([key, val]) => ({
    link_origin: key,
    ...val,
  }))
  const variantData = Object.entries(byVariant).map(([key, val]) => ({
    cta_variant: key,
    ...val,
  }))

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Por Origem do Link</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart data={originData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="link_origin" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="clicks" fill="var(--color-clicks)" radius={4} />
              <Bar dataKey="orders" fill="var(--color-orders)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">A/B Test — Taxa de Conversão por Variante</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart data={variantData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="cta_variant" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="avg_conversion_rate" fill="var(--color-conversion_rate)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
