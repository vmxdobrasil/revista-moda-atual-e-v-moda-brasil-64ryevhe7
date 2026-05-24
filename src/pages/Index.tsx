import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const viewsData = [
  { name: 'Out/Inv 26', views: 12400 },
  { name: 'Noivas', views: 8200 },
  { name: 'Verão 26', views: 15300 },
  { name: 'Especial SP', views: 9800 },
]

const radarData = [
  { subject: 'Festa', A: 120, fullMark: 150 },
  { subject: 'Casual', A: 98, fullMark: 150 },
  { subject: 'Alfaiataria', A: 86, fullMark: 150 },
  { subject: 'Acessórios', A: 99, fullMark: 150 },
  { subject: 'Praia', A: 85, fullMark: 150 },
]

export default function Index() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif tracking-tight">IA & Insights</h1>
        <p className="text-muted-foreground">Bem-vindo ao hub de inteligência da V MODA BRASIL.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo Médio de Leitura
            </CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-brand-orange">12m 45s</CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cliques no Marketplace
            </CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-brand-gold">8.402</CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Engajamento Social (IA)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-green-500">+24.5%</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-serif">Acessos por Edição</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ views: { label: 'Leituras', color: 'hsl(var(--chart-1))' } }}
              className="h-[300px] w-full"
            >
              <BarChart data={viewsData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="views"
                  fill="var(--color-views)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-serif">Interesse por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ A: { label: 'Interesse', color: 'hsl(var(--chart-2))' } }}
              className="h-[300px] w-full"
            >
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <PolarRadiusAxis
                  stroke="hsl(var(--muted-foreground))"
                  angle={30}
                  domain={[0, 150]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Interesse"
                  dataKey="A"
                  stroke="var(--color-A)"
                  fill="var(--color-A)"
                  fillOpacity={0.6}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
