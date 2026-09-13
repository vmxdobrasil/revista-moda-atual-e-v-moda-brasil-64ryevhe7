import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  listBrands,
  updateBrand,
  quickSetAbordagem,
  quickSetFechamento,
  getThrottleRemainingSeconds,
  type VModaBrand,
  type VModaFilters,
  type VModaUpdatePayload,
} from '@/services/vmoda-sync'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  RefreshCw,
  Search,
  CheckCircle2,
  PhoneCall,
  Star,
  ExternalLink,
  ShieldCheck,
  Tag,
  Building2,
  Edit,
  Clock,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Filter,
} from 'lucide-react'

export default function VModaPipelinePage() {
  const { toast } = useToast()

  const [brands, setBrands] = useState<VModaBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isLiveConnected, setIsLiveConnected] = useState(false)
  const [fromCache, setFromCache] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState<string>('')
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null)
  const [throttleSeconds, setThrottleSeconds] = useState(0)

  // Filtros
  const [search, setSearch] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('todas')
  const [prioridadeFilter, setPrioridadeFilter] = useState('todas')
  const [statusFilter, setStatusFilter] = useState('todas')
  const [etapaFilter, setEtapaFilter] = useState('todas')
  const [projectFilter, setProjectFilter] = useState('todos')

  // Modais de edição e confirmação de fechamento
  const [editingBrand, setEditingBrand] = useState<VModaBrand | null>(null)
  const [editFormData, setEditFormData] = useState<VModaUpdatePayload>({})
  const [editSaving, setEditSaving] = useState(false)

  const [confirmFechamentoBrand, setConfirmFechamentoBrand] = useState<VModaBrand | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Timer para o throttle de 60 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getThrottleRemainingSeconds()
      setThrottleSeconds(remaining)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const loadData = useCallback(
    async (force = false) => {
      if (force) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const filters: VModaFilters = {
        categoria: categoriaFilter !== 'todas' ? categoriaFilter : undefined,
        prioridade: prioridadeFilter !== 'todas' ? prioridadeFilter : undefined,
        status: statusFilter !== 'todas' ? statusFilter : undefined,
        pipeline_etapa: etapaFilter !== 'todas' ? etapaFilter : undefined,
        projects: projectFilter !== 'todos' ? projectFilter : undefined,
      }

      try {
        const res = await listBrands(filters, force)
        setBrands(res.brands)
        setIsLiveConnected(res.is_live_connected)
        setFromCache(!!res.from_cache)
        setLastSyncAt(res.last_sync_at)
        setSyncErrorMessage(res.error_message || null)

        if (force) {
          toast({
            title: res.is_live_connected ? 'Base Sincronizada' : 'Modo de Contingência Ativo',
            description: res.is_live_connected
              ? 'Dados atualizados em tempo real com V MODA BRASIL.'
              : 'Conexão direta indisponível; exibindo dados em cache com integridade preservada.',
          })
        }
      } catch (err: any) {
        toast({
          title: 'Erro de Sincronização',
          description: err.message || 'Falha ao consultar API externa.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [categoriaFilter, prioridadeFilter, statusFilter, etapaFilter, projectFilter, toast],
  )

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filtro textual local rápido
  const filteredBrands = useMemo(() => {
    if (!search.trim()) return brands
    const term = search.toLowerCase()
    return brands.filter(
      (b) =>
        b.nome.toLowerCase().includes(term) ||
        (b.contato && b.contato.toLowerCase().includes(term)) ||
        (b.observacoes && b.observacoes.toLowerCase().includes(term)),
    )
  }, [brands, search])

  // Contadores do pipeline
  const stats = useMemo(() => {
    const total = brands.length
    const fechadas = brands.filter(
      (b) => b.status === 'FECHADO' || b.pipeline_etapa === 'fechamento',
    ).length
    const emNegociacao = brands.filter(
      (b) => b.status === 'em_negociacao' || b.pipeline_etapa === 'negociacao',
    ).length
    const contatadas = brands.filter(
      (b) => b.status === 'contatada' || b.pipeline_etapa === 'abordagem',
    ).length
    const upgrades = brands.filter(
      (b) => b.upgrade_vmoda || (b.status === 'FECHADO' && b.adesao_top60),
    ).length

    return { total, fechadas, emNegociacao, contatadas, upgrades }
  }, [brands])

  const handleQuickAbordagem = async (brand: VModaBrand) => {
    try {
      setActionLoadingId(brand.id)
      await quickSetAbordagem(brand.id)
      toast({
        title: 'Status Atualizado',
        description: `Marca ${brand.nome} marcada como contatada (etapa: Abordagem).`,
      })
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao atualizar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleExecuteFechamento = async () => {
    if (!confirmFechamentoBrand) return
    const brand = confirmFechamentoBrand
    try {
      setActionLoadingId(brand.id)
      await quickSetFechamento(brand.id)
      toast({
        title: '🎉 Marca Fechada com Sucesso!',
        description: `Adesão TOP 60 confirmada e liberada a etapa "⭐ Oferta Upgrade V MODA BRASIL" para ${brand.nome}.`,
      })
      setConfirmFechamentoBrand(null)
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro no fechamento',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleOpenEdit = (brand: VModaBrand) => {
    setEditingBrand(brand)
    setEditFormData({
      status: brand.status,
      pipeline_etapa: brand.pipeline_etapa,
      contato: brand.contato || '',
      observacoes: brand.observacoes || '',
    })
  }

  const handleSaveEdit = async () => {
    if (!editingBrand) return
    try {
      setEditSaving(true)
      await updateBrand(editingBrand.id, editFormData)
      toast({
        title: 'Marca Atualizada',
        description: `Alterações de ${editingBrand.nome} sincronizadas com V MODA BRASIL.`,
      })
      setEditingBrand(null)
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setEditSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Editorial Dark */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-neutral-900 text-white rounded-2xl p-6 md:p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-orange-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-600 hover:bg-orange-600 text-white font-medium text-xs tracking-wider uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Integração V MODA BRASIL
              </Badge>
              {isLiveConnected ? (
                <Badge
                  variant="outline"
                  className="text-emerald-400 border-emerald-500/30 bg-emerald-950/40 text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5 inline-block" />
                  API Conectada (Live)
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-amber-400 border-amber-500/30 bg-amber-950/40 text-xs"
                >
                  <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  Modo Resiliente
                </Badge>
              )}
              {fromCache && (
                <Badge variant="outline" className="text-zinc-400 border-zinc-700 text-xs">
                  Cache 1min
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Sincronização de Marcas & Pipeline
            </h1>
            <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
              Base compartilhada de prospecção e fechamento entre a Revista Moda Atual e o
              ecossistema V MODA BRASIL. Ao fechar uma marca, a adesão ao TOP 60 é ativada e a
              Oferta Upgrade é automaticamente liberada.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              disabled={refreshing || throttleSeconds > 0}
              className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border-zinc-700 text-xs gap-2 rounded-xl transition-all"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-orange-500' : ''}`}
              />
              {refreshing
                ? 'Sincronizando...'
                : throttleSeconds > 0
                  ? `Aguarde ${throttleSeconds}s (limite 1/min)`
                  : 'Sincronizar Agora'}
            </Button>
          </div>
        </div>

        {/* Avisos de status de sincronização */}
        {syncErrorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{syncErrorMessage}</span>
            </span>
            <span className="text-zinc-400 text-[11px]">
              Token sincronizado via header seguro{' '}
              <code className="text-orange-400">x-sync-token</code>
            </span>
          </div>
        )}
      </div>

      {/* Métricas do Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="bg-white border-zinc-200 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-medium tracking-wider text-zinc-500">
              Total Marcas
            </CardDescription>
            <CardTitle className="text-2xl font-serif font-bold text-zinc-900">
              {stats.total}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-zinc-400">
            Na base compartilhada
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-medium tracking-wider text-blue-600">
              Contatadas
            </CardDescription>
            <CardTitle className="text-2xl font-serif font-bold text-blue-700">
              {stats.contatadas}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-zinc-400">Em abordagem inicial</CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-medium tracking-wider text-amber-600">
              Em Negociação
            </CardDescription>
            <CardTitle className="text-2xl font-serif font-bold text-amber-700">
              {stats.emNegociacao}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-zinc-400">Propostas em análise</CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 shadow-sm border-l-4 border-l-emerald-500">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-medium tracking-wider text-emerald-600">
              Fechadas (TOP 60)
            </CardDescription>
            <CardTitle className="text-2xl font-serif font-bold text-emerald-700">
              {stats.fechadas}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-zinc-400">Contratos concluídos</CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-medium tracking-wider text-orange-700 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> Upgrade V MODA
            </CardDescription>
            <CardTitle className="text-2xl font-serif font-bold text-orange-800">
              {stats.upgrades}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-orange-600">
            Ambos os ecossistemas
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros e Busca */}
      <Card className="bg-white border-zinc-200 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Buscar por nome da marca, contato ou observação..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-zinc-50 border-zinc-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger className="text-xs bg-zinc-50 border-zinc-200">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas Categorias</SelectItem>
                  <SelectItem value="moda-feminina">Moda Feminina</SelectItem>
                  <SelectItem value="moda-masculina">Moda Masculina</SelectItem>
                  <SelectItem value="alta-costura">Alta Costura</SelectItem>
                  <SelectItem value="fitness-beachwear">Fitness & Beachwear</SelectItem>
                  <SelectItem value="jeanswear">Jeanswear</SelectItem>
                  <SelectItem value="acessorios">Acessórios & Calçados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
                <SelectTrigger className="text-xs bg-zinc-50 border-zinc-200">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas Prioridades</SelectItem>
                  <SelectItem value="maxima">Máxima</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={etapaFilter} onValueChange={setEtapaFilter}>
                <SelectTrigger className="text-xs bg-zinc-50 border-zinc-200">
                  <SelectValue placeholder="Etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas Etapas</SelectItem>
                  <SelectItem value="mapeamento">Mapeamento</SelectItem>
                  <SelectItem value="abordagem">Abordagem</SelectItem>
                  <SelectItem value="apresentacao">Apresentação</SelectItem>
                  <SelectItem value="negociacao">Negociação</SelectItem>
                  <SelectItem value="fechamento">Fechamento</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-xs bg-zinc-50 border-zinc-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos Status</SelectItem>
                  <SelectItem value="prospeccao">Prospecção</SelectItem>
                  <SelectItem value="contatada">Contatada</SelectItem>
                  <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                  <SelectItem value="FECHADO">FECHADO</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>

              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="text-xs bg-zinc-50 border-zinc-200">
                  <SelectValue placeholder="Projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Projetos</SelectItem>
                  <SelectItem value="revista">Revista Moda Atual</SelectItem>
                  <SelectItem value="vmoda_brasil">V MODA BRASIL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Marcas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-5 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-16 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredBrands.length === 0 ? (
        <Card className="bg-white border-dashed border-2 border-zinc-300 py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
            <Filter className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-serif font-bold text-zinc-800 mb-1">
            Nenhuma marca encontrada
          </h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto mb-4">
            Nenhum resultado correspondeu aos filtros selecionados. Tente ajustar os parâmetros de
            categoria, prioridade ou busca.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('')
              setCategoriaFilter('todas')
              setPrioridadeFilter('todas')
              setStatusFilter('todas')
              setEtapaFilter('todas')
              setProjectFilter('todos')
            }}
            className="text-xs"
          >
            Limpar Filtros
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBrands.map((brand) => {
            const isFechado = brand.status === 'FECHADO' || brand.pipeline_etapa === 'fechamento'
            const hasUpgrade = brand.upgrade_vmoda || (isFechado && brand.adesao_top60)
            const isActionBusy = actionLoadingId === brand.id

            return (
              <Card
                key={brand.id}
                className={`relative overflow-hidden transition-all duration-200 hover:shadow-md border ${
                  isFechado
                    ? 'border-emerald-300/80 bg-gradient-to-br from-white to-emerald-50/30'
                    : 'border-zinc-200 bg-white'
                }`}
              >
                {/* Faixa decorativa de status */}
                <div
                  className={`h-1.5 w-full ${
                    isFechado
                      ? 'bg-emerald-500'
                      : brand.status === 'em_negociacao'
                        ? 'bg-amber-500'
                        : brand.status === 'contatada'
                          ? 'bg-blue-500'
                          : 'bg-zinc-300'
                  }`}
                />

                <CardContent className="p-5 space-y-4">
                  {/* Topo do card: Nome + Prioridade */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-zinc-900 tracking-tight leading-snug">
                        {brand.nome}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-zinc-500 capitalize flex items-center gap-1">
                          <Tag className="w-3 h-3 text-zinc-400" />
                          {brand.categoria.replace('-', ' ')}
                        </span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-[11px] text-zinc-400 font-mono">ID: {brand.id}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {brand.prioridade === 'maxima' && (
                        <Badge className="bg-red-500 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider">
                          Prioridade Máxima
                        </Badge>
                      )}
                      {brand.prioridade === 'alta' && (
                        <Badge className="bg-orange-500 hover:bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider">
                          Alta
                        </Badge>
                      )}
                      {brand.prioridade === 'media' && (
                        <Badge variant="secondary" className="text-[10px]">
                          Média
                        </Badge>
                      )}
                      {brand.prioridade === 'baixa' && (
                        <Badge variant="outline" className="text-zinc-400 text-[10px]">
                          Baixa
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Badges de Etapa e Destaque Upgrade */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize font-medium ${
                        brand.pipeline_etapa === 'fechamento'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : brand.pipeline_etapa === 'negociacao'
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : brand.pipeline_etapa === 'abordagem'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-zinc-300 text-zinc-600'
                      }`}
                    >
                      Etapa: {brand.pipeline_etapa.replace('_', ' ')}
                    </Badge>

                    <Badge
                      variant="secondary"
                      className={`text-xs uppercase tracking-wider font-semibold ${
                        isFechado
                          ? 'bg-emerald-600 text-white'
                          : brand.status === 'em_negociacao'
                            ? 'bg-amber-100 text-amber-800'
                            : brand.status === 'contatada'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {brand.status.replace('_', ' ')}
                    </Badge>

                    {hasUpgrade && (
                      <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-white" /> Upgrade V MODA
                      </Badge>
                    )}
                  </div>

                  {/* Informações de Contato e Observações */}
                  <div className="space-y-2 bg-zinc-50 p-3 rounded-lg border border-zinc-100 text-xs">
                    <div>
                      <span className="font-semibold text-zinc-700 block mb-0.5">Contato:</span>
                      <p className="text-zinc-600 break-words">
                        {brand.contato || 'Nenhum contato cadastrado'}
                      </p>
                    </div>
                    {brand.observacoes && (
                      <div>
                        <span className="font-semibold text-zinc-700 block mb-0.5">
                          Observações:
                        </span>
                        <p className="text-zinc-600 italic line-clamp-3">{brand.observacoes}</p>
                      </div>
                    )}
                  </div>

                  {/* Ações Rápidas */}
                  <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(brand)}
                      className="text-xs text-zinc-700 hover:text-zinc-900 gap-1.5 h-8 px-2.5"
                    >
                      <Edit className="w-3.5 h-3.5 text-zinc-500" />
                      Editar
                    </Button>

                    <div className="flex items-center gap-1.5 ml-auto">
                      {brand.pipeline_etapa !== 'abordagem' && !isFechado && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isActionBusy}
                          onClick={() => handleQuickAbordagem(brand)}
                          className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50 h-8 px-2.5 gap-1"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          Abordagem
                        </Button>
                      )}

                      {!isFechado ? (
                        <Button
                          size="sm"
                          disabled={isActionBusy}
                          onClick={() => setConfirmFechamentoBrand(brand)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Fechar Marca
                        </Button>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Adesão TOP 60 Ativa
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de Edição (Apenas campos permitidos: status, pipeline_etapa, contato, observacoes) */}
      <Dialog open={!!editingBrand} onOpenChange={(open) => !open && setEditingBrand(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-500" />
              Editar Marca — {editingBrand?.nome}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Conforme a especificação da API V MODA BRASIL, os campos{' '}
              <strong className="text-zinc-700">nome, categoria e prioridade</strong> são somente
              leitura neste sistema.
            </DialogDescription>
          </DialogHeader>

          {editingBrand && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 rounded-lg border text-xs text-zinc-600">
                <div>
                  <span className="font-semibold block text-zinc-500">Categoria:</span>
                  <span className="capitalize">{editingBrand.categoria.replace('-', ' ')}</span>
                </div>
                <div>
                  <span className="font-semibold block text-zinc-500">Prioridade:</span>
                  <span className="capitalize">{editingBrand.prioridade || 'Média'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-etapa" className="text-xs font-medium">
                    Etapa do Pipeline
                  </Label>
                  <Select
                    value={editFormData.pipeline_etapa || editingBrand.pipeline_etapa}
                    onValueChange={(val) =>
                      setEditFormData((prev) => ({ ...prev, pipeline_etapa: val }))
                    }
                  >
                    <SelectTrigger id="edit-etapa" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mapeamento">Mapeamento</SelectItem>
                      <SelectItem value="abordagem">Abordagem</SelectItem>
                      <SelectItem value="apresentacao">Apresentação</SelectItem>
                      <SelectItem value="negociacao">Negociação</SelectItem>
                      <SelectItem value="fechamento">Fechamento</SelectItem>
                      <SelectItem value="pos_venda">Pós-venda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-status" className="text-xs font-medium">
                    Status Comercial
                  </Label>
                  <Select
                    value={editFormData.status || editingBrand.status}
                    onValueChange={(val) => setEditFormData((prev) => ({ ...prev, status: val }))}
                  >
                    <SelectTrigger id="edit-status" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospeccao">Prospecção</SelectItem>
                      <SelectItem value="contatada">Contatada</SelectItem>
                      <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                      <SelectItem value="FECHADO">FECHADO</SelectItem>
                      <SelectItem value="perdido">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-contato" className="text-xs font-medium">
                  Informações de Contato (Telefone, E-mail, Responsável)
                </Label>
                <Input
                  id="edit-contato"
                  value={editFormData.contato || ''}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, contato: e.target.value }))
                  }
                  placeholder="Ex: fulano@marca.com.br / (11) 99999-9999"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-obs" className="text-xs font-medium">
                  Observações e Histórico de Negociação
                </Label>
                <Textarea
                  id="edit-obs"
                  rows={3}
                  value={editFormData.observacoes || ''}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, observacoes: e.target.value }))
                  }
                  placeholder="Anotações comerciais sobre a marca..."
                  className="text-xs"
                />
              </div>

              {editFormData.pipeline_etapa === 'fechamento' && (
                <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-xs flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <span>
                    Atenção: Salvar na etapa de <strong>Fechamento</strong> concluirá
                    automaticamente a adesão TOP 60 e liberará a etapa "⭐ Oferta Upgrade V MODA
                    BRASIL".
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingBrand(null)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={editSaving}
              className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
            >
              {editSaving ? 'Sincronizando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alerta de Confirmação para Fechamento de Marca */}
      <AlertDialog
        open={!!confirmFechamentoBrand}
        onOpenChange={(open) => !open && setConfirmFechamentoBrand(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl text-zinc-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              Confirmar Fechamento da Marca?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-600 text-sm space-y-2 pt-2">
              <p>
                Você está prestes a fechar a marca{' '}
                <strong className="text-zinc-900">{confirmFechamentoBrand?.nome}</strong> com os
                seguintes efeitos:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-700">
                <li>
                  Status comercial atualizado para <strong>FECHADO</strong>.
                </li>
                <li>
                  Etapa do pipeline definida para <strong>fechamento</strong>.
                </li>
                <li>
                  O sistema V MODA BRASIL conclui automaticamente a adesão <strong>TOP 60</strong>.
                </li>
                <li>
                  Abertura imediata da etapa especial{' '}
                  <strong>⭐ Oferta Upgrade V MODA BRASIL</strong>.
                </li>
                <li>
                  Registro auditado na base central com log{' '}
                  <code className="text-orange-600">revista_sync</code>.
                </li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExecuteFechamento}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              Sim, Concluir Fechamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
