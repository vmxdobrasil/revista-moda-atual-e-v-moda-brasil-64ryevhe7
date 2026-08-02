import { useState, useMemo, type ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { ArrowUpDown, Search } from 'lucide-react'

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => ReactNode
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    OK: 'bg-green-100 text-green-700',
    active: 'bg-green-100 text-green-700',
    fixed: 'bg-green-100 text-green-700',
    healthy: 'bg-green-100 text-green-700',
    unavailable: 'bg-gray-100 text-gray-500',
    error: 'bg-red-100 text-red-700',
    'needs attention': 'bg-yellow-100 text-yellow-700',
    pending: 'bg-yellow-100 text-yellow-700',
  }
  return <Badge className={map[status] || 'bg-gray-100 text-gray-700'}>{status}</Badge>
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    alta: 'bg-red-100 text-red-700',
    média: 'bg-yellow-100 text-yellow-700',
    baixa: 'bg-green-100 text-green-700',
  }
  return <Badge className={map[priority] || 'bg-gray-100'}>{priority}</Badge>
}

export function AuditDataTable<T extends Record<string, any>>({
  columns,
  data,
}: {
  columns: Column<T>[]
  data: T[]
}) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [filter, setFilter] = useState('')

  const filtered = useMemo(() => {
    let result = data
    if (filter) {
      const lower = filter.toLowerCase()
      result = result.filter((row) =>
        columns.some((col) =>
          String(row[col.key] ?? '')
            .toLowerCase()
            .includes(lower),
        ),
      )
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const av = String(a[sortKey] ?? '')
        const bv = String(b[sortKey] ?? '')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    }
    return result
  }, [data, filter, sortKey, sortDir, columns])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((p) => (p === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrar..."
          className="pl-9"
        />
      </div>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.key)}>
                  {col.sortable !== false ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort(String(col.key))}
                    >
                      {col.label} <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  ) : (
                    col.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={String(col.key)}>
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '—')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-gray-500">{filtered.length} registro(s)</p>
    </div>
  )
}
