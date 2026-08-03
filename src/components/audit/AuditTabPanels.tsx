import { Card, CardContent } from '@/components/ui/card'
import { AuditDataTable, StatusBadge, PriorityBadge } from '@/components/audit/AuditDataTable'
import type { AuditReport } from '@/services/audit'
import { ShieldCheck } from 'lucide-react'

const N = 'indisponível'
const fmt = (v: string | null) => (v ? new Date(v).toLocaleString('pt-BR') : N)

export function CollectionsPanel({ report }: { report: AuditReport }) {
  return (
    <Card>
      <CardContent className="p-4">
        <AuditDataTable
          columns={[
            { key: 'name', label: 'Coleção' },
            { key: 'count', label: 'Registros' },
            { key: 'lastRecord', label: 'Último Registro', render: (v) => fmt(v) },
            { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
            { key: 'priority', label: 'Prioridade', render: (v) => <PriorityBadge priority={v} /> },
          ]}
          data={report.collections}
        />
      </CardContent>
    </Card>
  )
}

export function HooksPanel({ report }: { report: AuditReport }) {
  return (
    <Card>
      <CardContent className="p-4">
        <AuditDataTable
          columns={[
            { key: 'name', label: 'Integração' },
            { key: 'type', label: 'Tipo' },
            { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
            { key: 'lastExecution', label: 'Última Execução', render: (v) => fmt(v) },
            { key: 'deps', label: 'Dependências' },
            {
              key: 'error_message',
              label: 'Erro',
              render: (v) => (v ? <span className="text-red-500 text-xs">{v}</span> : '—'),
            },
            { key: 'priority', label: 'Prioridade', render: (v) => <PriorityBadge priority={v} /> },
          ]}
          data={report.hooks}
        />
      </CardContent>
    </Card>
  )
}

export function AgentsPanel({ report }: { report: AuditReport }) {
  return (
    <Card>
      <CardContent className="p-4">
        <AuditDataTable
          columns={[
            { key: 'name', label: 'Agente' },
            { key: 'description', label: 'Descrição' },
            { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
            { key: 'lastExecution', label: 'Última Execução', render: (v) => fmt(v) },
            { key: 'priority', label: 'Prioridade', render: (v) => <PriorityBadge priority={v} /> },
          ]}
          data={report.agents}
        />
      </CardContent>
    </Card>
  )
}

export function DeliveryPanel({ report }: { report: AuditReport }) {
  const dq = report.deliveryQueue
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <StatusBadge status={dq.healthStatus} />
          <span className="text-sm text-gray-500">
            Total: {dq.total} | Pendentes: {dq.pending}
          </span>
          <span className="text-sm text-gray-500">Tempo Médio: {dq.avgProcessingTime || N}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(dq.byStatus).map(([k, v]) => (
            <div key={k} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-800">{v}</p>
              <p className="text-xs text-gray-500">{k}</p>
            </div>
          ))}
        </div>
        {dq.items.length > 0 && (
          <AuditDataTable
            columns={[
              { key: 'theme', label: 'Tema' },
              { key: 'status', label: 'Status' },
              { key: 'processingTime', label: 'Tempo' },
              { key: 'created', label: 'Criado', render: (v) => fmt(v) },
              {
                key: 'priority',
                label: 'Prioridade',
                render: (v) => <PriorityBadge priority={v} />,
              },
              {
                key: 'error_note',
                label: 'Erro',
                render: (v) => (v ? <span className="text-red-500 text-xs">{v}</span> : '—'),
              },
            ]}
            data={dq.items}
          />
        )}
      </CardContent>
    </Card>
  )
}

export function DivergencesPanel({ report }: { report: AuditReport }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-bold">
            Hooks: {report.hooksDivergence.documented} documentados → {report.hooksDivergence.found}{' '}
            encontrados
          </h3>
          {report.hooksDivergence.additional.map((h) => (
            <div key={h.name} className="border-l-2 border-orange-400 pl-3 py-1">
              <p className="font-medium">{h.name}</p>
              <p className="text-sm text-gray-500">{h.purpose}</p>
              <StatusBadge status={h.status} />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-bold">
            Prompts: {report.promptsDivergence.documented} documentados →{' '}
            {report.promptsDivergence.found} encontrados
          </h3>
          {report.promptsDivergence.additional.map((p) => (
            <div key={p.slug} className="border-l-2 border-orange-400 pl-3 py-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500">
                slug: {p.slug} | categoria: {p.category}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-bold">
            Módulos Admin: {report.adminModulesDivergence.documented} documentados →{' '}
            {report.adminModulesDivergence.found} encontrados
          </h3>
          {report.adminModulesDivergence.additional.map((m) => (
            <div key={m.name} className="border-l-2 border-orange-400 pl-3 py-1">
              <p className="font-medium">{m.name}</p>
              <p className="text-sm text-gray-500">{m.description}</p>
              <p className="text-xs text-gray-400">{m.route}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function FixPanel({ report }: { report: AuditReport }) {
  const f = report.arquitetoFix
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-500" />
          <h3 className="font-bold">Arquiteto de Workflow — Correção Aplicada</h3>
          <StatusBadge status={f.status} />
        </div>
        <p className="text-sm text-gray-600">
          <strong>Bug:</strong> {f.bug}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Correção:</strong> {f.fix}
        </p>
        <div>
          <p className="text-sm font-medium mb-1">Parâmetros Corrigidos:</p>
          {f.parameterCorrections.map((c, i) => (
            <div key={i} className="bg-gray-50 rounded p-2 text-sm">
              <code>{c.hook}</code>: <code>{c.field}</code> → <code>{c.correctedTo}</code> (
              {c.reason})
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
