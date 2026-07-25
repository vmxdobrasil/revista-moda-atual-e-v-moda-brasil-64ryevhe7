import { useState, useMemo, useCallback } from 'react'
import {
  getBrands,
  getCategories,
  deleteBrand,
  deleteCategory,
  type Top60Brand,
  type Top60Category,
} from '@/services/top60'
import { useRealtime } from '@/hooks/use-realtime'
import { BrandCard } from './components/BrandCard'
import { BrandForm } from './components/BrandForm'
import { CategoryForm } from './components/CategoryForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, Settings2, Trash2, Pencil, Trophy } from 'lucide-react'

export default function Top60Page() {
  const [brands, setBrands] = useState<Top60Brand[]>([])
  const [categories, setCategories] = useState<Top60Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [brandFormOpen, setBrandFormOpen] = useState(false)
  const [catFormOpen, setCatFormOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Top60Brand | null>(null)
  const [editingCat, setEditingCat] = useState<Top60Category | null>(null)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      const [b, c] = await Promise.all([getBrands(), getCategories()])
      setBrands(b)
      setCategories(c)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar dados.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useRealtime('top60_brands', () => loadData())
  useRealtime('top60_categories', () => loadData())
  useMemo(() => {
    loadData()
  }, [loadData])

  const filtered = useMemo(() => {
    return brands.filter((b) => {
      if (catFilter !== 'all' && b.expand?.category?.slug !== catFilter) return false
      if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [brands, search, catFilter])

  const grouped = useMemo(() => {
    const map = new Map<string, { category: Top60Category; brands: Top60Brand[] }>()
    for (const brand of filtered) {
      const cat = brand.expand?.category
      if (!cat) continue
      if (!map.has(cat.id)) map.set(cat.id, { category: cat, brands: [] })
      map.get(cat.id)!.brands.push(brand)
    }
    return Array.from(map.values()).sort((a, b) => a.category.order - b.category.order)
  }, [filtered])

  const handleDeleteBrand = async (id: string) => {
    try {
      await deleteBrand(id)
      toast({ title: 'Sucesso', description: 'Marca excluída.' })
      loadData()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    }
  }
  const handleDeleteCat = async (id: string) => {
    try {
      await deleteCategory(id)
      toast({ title: 'Sucesso', description: 'Categoria excluída.' })
      loadData()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <Trophy className="text-orange-500" /> Top 60 Marcas
          </h2>
          <p className="text-gray-500 mt-1">Ranking das melhores marcas do atacado brasileiro.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEditingCat(null)
              setCatFormOpen(true)
            }}
            className="gap-2"
          >
            <Settings2 className="w-4 h-4" /> Categorias
          </Button>
          <Button
            onClick={() => {
              setEditingBrand(null)
              setBrandFormOpen(true)
            }}
            className="bg-orange-500 hover:bg-orange-600 gap-2"
          >
            <Plus className="w-4 h-4" /> Nova Marca
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {grouped.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Nenhuma marca encontrada.</p>
      ) : (
        grouped.map(({ category, brands: catBrands }) => (
          <div key={category.id} className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h3 className="text-xl font-serif font-bold text-gray-800">
                {category.name}{' '}
                <span className="text-sm text-gray-400 font-normal">({catBrands.length})</span>
              </h3>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditingCat(category)
                    setCatFormOpen(true)
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Isso não afetará as marcas existentes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteCat(category.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {catBrands.map((brand) => (
                <div key={brand.id} className="relative group">
                  <BrandCard
                    brand={brand}
                    onEdit={() => {
                      setEditingBrand(brand)
                      setBrandFormOpen(true)
                    }}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingBrand(brand)
                        setBrandFormOpen(true)
                      }}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="secondary" className="h-7 w-7 text-red-500">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir marca?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteBrand(brand.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <BrandForm
        open={brandFormOpen}
        onOpenChange={setBrandFormOpen}
        onSaved={loadData}
        editingBrand={editingBrand}
      />
      <CategoryForm
        open={catFormOpen}
        onOpenChange={setCatFormOpen}
        onSaved={loadData}
        editingCategory={editingCat}
        nextOrder={categories.length + 1}
      />
    </div>
  )
}
