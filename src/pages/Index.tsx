import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEditions, Edition } from '@/services/magazine'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen } from 'lucide-react'

export default function Index() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEditions()
      .then((data) => {
        setEditions(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b py-5 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <img
          src="https://img.usecurling.com/i?q=v%20moda%20brasil%20logo&color=orange&shape=outline"
          alt="V MODA BRASIL"
          className="h-8 md:h-10"
        />
        <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm md:text-base">
          <BookOpen className="w-5 h-5" />
          <span>Acervo Digital</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16 md:py-24">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
            Revista Moda Atual
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Explore as últimas edições da nossa revista digital imersiva. Descubra as principais
            tendências, editoriais exclusivos e tenha acesso direto ao melhor do atacado brasileiro
            através de nossa vitrine interativa.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[0.7118] bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
            {editions.map((ed) => (
              <Card
                key={ed.id}
                className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-none bg-white rounded-xl"
              >
                <div className="relative aspect-[0.7118] overflow-hidden bg-gray-100">
                  <img
                    src={ed.cover_url}
                    alt={ed.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <Button
                      asChild
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white shadow-lg h-12 text-md"
                    >
                      <Link to={`/edition/${ed.id}`}>
                        Ler Edição <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {ed.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {ed.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
