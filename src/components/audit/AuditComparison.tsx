import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getAuditSnapshots, getAuditSnapshot } from '@/services/audit-snapshots'
import type { AuditReport } from '@/services/audit'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

export function AuditComparison() {
  const [current, setCurrent] = useState<AuditReport | null>(null)
  const [previous, setPrevious] = useState<AuditReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const snapshots = await getAuditSnapshots()
        const successful = snapshots.filter((s) => s.status === 'success')
        if (successful.length > 0) {
          const cur = await getAuditSnapshot(successful[0].id)
          if (cur.snapshot_data) setCurrent(cur.snapshot_data)
          if (successful.length > 1) {
            const prev = await getAuditSnapshot(successful[1].id)
            if (prev.snapshot_data) setPrevious(prev.snapshot_data)
          }
        }
      } catch (err) {
        console.error('Failed to load comparison:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Skeleton className="h-48 w-full" />
  if (!current)
    return (
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-4">
          <p className="text-gray-500 text-sm text-center py-8">
            Nenhum snapshot disponível para comparação. Gere um snapshot para visualizar a
            comparação entre períodos.
          </p>
        </CardContent>
      </Card>
    )

  const comparison = current.collections.map((c) => {
    const prev = previous?.collections.find((p) => p.name === c.name)
    const prevCount = prev?.count ?? 0
    const diff = c.count - prevCount
    return { name: c.name, current: c.count, previous: prevCount, diff }
  })

  return (
    <Card className="rounded-xl border-none bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-800">Comparação entre Períodos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">Coleção</th>
                <th className="pb-2 px-2 font-medium text-right">Atual</th>
                <th className="pb-2 px-2 font-medium text-right">Anterior</th>
                <th className="pb-2 px-2 font-medium text-right">Variação</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((c) => (
                <tr key={c.name} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-800">{c.name}</td>
                  <td className="py-2 px-2 text-right">{c.current}</td>
                  <td className="py-2 px-2 text-right text-gray-500">{c.previous}</td>
                  <td className="py-2 px-2 text-right">
                    {c.diff === 0 ? (
                      <span className="inline-flex items-center text-gray-400">
                        <Minus className="w-3 h-3" /> 0
                      </span>
                    ) : c.diff > 0 ? (
                      <span className="inline-flex items-center text-green-600">
                        <ArrowUp className="w-3 h-3" /> +{c.diff}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-500">
                        <ArrowDown className="w-3 h-3" /> {c.diff}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
