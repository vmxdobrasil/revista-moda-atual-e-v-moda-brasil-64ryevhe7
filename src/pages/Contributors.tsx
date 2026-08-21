import { useEffect, useState } from 'react'
import { getContributors, Contributor } from '@/services/contributors'
import { ContributorCard } from '@/components/contributors/ContributorCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Users, Sparkles, Award } from 'lucide-react'

export default function Contributors() {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const list = await getContributors('-featured,-created')
        setContributors(list)
      } catch (err) {
        console.error('Erro ao carregar colaboradores:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const featured = contributors.filter((c) => c.featured)
  const regular = contributors.filter((c) => !c.featured)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-primary selection:text-white pb-24">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-900 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/30 px-3.5 py-1 text-xs font-semibold gap-1.5 uppercase tracking-wider"
          >
            <Users className="h-3.5 w-3.5" />
            Equipe & Colunistas
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-serif">
            Nossos Colaboradores
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Conheça as vozes, pesquisadores, estilistas e jornalistas responsáveis pela curadoria
            editorial, cobertura de moda e inteligência de mercado da Revista MODA ATUAL.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
        {loading ? (
          <div className="space-y-12">
            <div>
              <Skeleton className="h-7 w-48 bg-slate-900 mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl bg-slate-900" />
                ))}
              </div>
            </div>
          </div>
        ) : contributors.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 max-w-lg mx-auto space-y-3">
            <Users className="h-10 w-10 mx-auto text-slate-600 mb-2" />
            <h3 className="text-lg font-bold text-slate-200">Nenhum colaborador cadastrado</h3>
            <p className="text-xs text-slate-400">
              A equipe editorial está sendo configurada. Volte em breve para conhecer nossos
              colunistas.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Section */}
            {featured.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-xl font-bold tracking-tight text-white uppercase text-xs tracking-widest">
                    Corpo Editorial em Destaque
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featured.map((item) => (
                    <ContributorCard key={item.id} contributor={item} variant="featured" />
                  ))}
                </div>
              </section>
            )}

            {/* All / Regular Contributors Section */}
            {regular.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                  <Award className="h-4 w-4 text-primary" />
                  <h2 className="text-xl font-bold tracking-tight text-white uppercase text-xs tracking-widest">
                    Colunistas & Especialistas Convidados
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regular.map((item) => (
                    <ContributorCard key={item.id} contributor={item} variant="compact" />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
