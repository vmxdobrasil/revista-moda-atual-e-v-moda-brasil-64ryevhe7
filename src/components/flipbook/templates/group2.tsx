import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Megaphone, Award, Building2, Handshake } from 'lucide-react'
import { getBrands, type Top60Brand } from '@/services/top60'

function Top60MarcasRenderer({ d }: { d: any }) {
  const [brands, setBrands] = useState<Top60Brand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBrands(d.category || undefined)
      .then(setBrands)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [d.category])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Carregando marcas...
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white p-6 md:p-10 overflow-hidden">
      <div className="border-b-2 border-orange-500 pb-4 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-5 h-5 text-orange-500" />
          <span className="text-xs font-bold tracking-[0.3em] text-orange-600 uppercase">
            Top 60 Marcas
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-serif text-gray-900">Ranking de Marcas</h2>
      </div>
      <div className="flex-1 overflow-auto space-y-1">
        {brands.map((brand) => (
          <div key={brand.id} className="flex items-center gap-3 p-2 border-b border-gray-100">
            <span className="text-orange-600 font-bold text-lg w-8 text-center">
              {brand.position}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">{brand.name}</p>
              {brand.description && <p className="text-xs text-gray-500">{brand.description}</p>}
            </div>
            {brand.score ? (
              <span className="text-sm text-orange-500 font-medium">{brand.score}</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export function renderGroup2(template: string, d: any) {
  if (template === 'top60_marcas') {
    return <Top60MarcasRenderer d={d} />
  }

  if (template === 'anuncio_patrocinado') {
    const advertiser = d.advertiser || ''
    const image = d.image || ''
    const headline = d.headline || 'Anúncio Patrocinado'
    const description = d.description || ''
    const link = d.link || '/'

    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-orange-50 to-white p-6 md:p-10 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-orange-500" />
          <span className="text-xs font-bold tracking-[0.2em] text-orange-600 uppercase">
            Patrocinado
          </span>
        </div>
        {image && <img src={image} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{headline}</h2>
        {advertiser && (
          <p className="text-sm text-orange-600 font-semibold mb-2">por {advertiser}</p>
        )}
        {description && (
          <p className="text-gray-700 flex-1 text-base leading-relaxed">{description}</p>
        )}
        <Link
          to={link}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors self-start"
        >
          Saber Mais <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  if (template === 'perfil_marca') {
    const brandName = d.brand_name || 'Perfil de Marca'
    const logo = d.logo || ''
    const description = d.description || ''
    const website = d.website || ''
    const socialHandle = d.social_handle || ''

    return (
      <div className="h-full flex flex-col bg-white p-6 md:p-10 overflow-hidden">
        <div className="flex items-center gap-4 border-b-2 border-orange-500 pb-4 mb-4">
          {logo ? (
            <img src={logo} alt={brandName} className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <Building2 className="w-12 h-12 text-orange-400" />
          )}
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-orange-600 uppercase">
              Perfil de Marca
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-gray-900">{brandName}</h2>
          </div>
        </div>
        {description && (
          <p className="text-gray-700 flex-1 text-base leading-relaxed">{description}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 font-medium hover:underline"
            >
              {website}
            </a>
          )}
          {socialHandle && <span className="text-gray-500">{socialHandle}</span>}
        </div>
      </div>
    )
  }

  if (template === 'parceiro_anunciante') {
    const partnerName = d.partner_name || 'Parceiro'
    const logo = d.logo || ''
    const description = d.description || ''
    const contactInfo = d.contact_info || ''
    const link = d.link || '/'

    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-orange-50/50 to-white p-6 md:p-10 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <Handshake className="w-5 h-5 text-orange-500" />
          <span className="text-xs font-bold tracking-[0.2em] text-orange-600 uppercase">
            Parceiro
          </span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          {logo ? (
            <img src={logo} alt={partnerName} className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-orange-400" />
            </div>
          )}
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900">{partnerName}</h2>
        </div>
        {description && (
          <p className="text-gray-700 flex-1 text-base leading-relaxed">{description}</p>
        )}
        {contactInfo && <p className="text-sm text-gray-500 mt-3">{contactInfo}</p>}
        <Link
          to={link}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors self-start"
        >
          Visitar <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return null
}
