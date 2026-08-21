import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getLatestEdition, getEditions, Edition } from '@/services/magazine'
import { getEvents, FashionEvent } from '@/services/fashion_events'
import { SubscriberCoverBadge } from '@/components/SubscriberCoverBadge'
import {
  Smartphone,
  Instagram,
  Globe,
  Mail,
  BookOpen,
  Award,
  Sparkles,
  Calendar,
  ExternalLink,
  Share2,
  ArrowRight,
  Download,
  MessageCircle,
} from 'lucide-react'

export default function LinkInBio() {
  const [latestEdition, setLatestEdition] = useState<Edition | null>(null)
  const [editions, setEditions] = useState<Edition[]>([])
  const [events, setEvents] = useState<FashionEvent[]>([])

  useEffect(() => {
    getLatestEdition()
      .then((ed) => setLatestEdition(ed))
      .catch(() => {})

    getEditions()
      .then((list) => setEditions(list.slice(0, 4)))
      .catch(() => {})

    getEvents()
      .then((list) => setEvents(list.slice(0, 3)))
      .catch(() => {})
  }, [])

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com/revistamodaatual',
      label: '@revistamodaatual',
    },
    {
      name: 'WhatsApp Atendimento',
      icon: MessageCircle,
      url: 'https://wa.me/5511999999999?text=Ol%C3%A1,%20vim%20pelo%20Link%20da%20Bio%20da%20Revista%20Moda%20Atual!',
      label: 'Contato Comercial B2B',
    },
    {
      name: 'Site Oficial',
      icon: Globe,
      url: 'https://revistamodaatual.com.br',
      label: 'revistamodaatual.com.br',
    },
    {
      name: 'E-mail',
      icon: Mail,
      url: 'mailto:contato@revistamodaatual.com.br',
      label: 'contato@revistamodaatual.com.br',
    },
  ]

  const actionButtons = [
    {
      title: '📖 Ler Última Edição Digital',
      subtitle: 'Edição completa interativa com hotspots e compras',
      link: '/reader/latest',
      primary: true,
    },
    {
      title: '🏆 TOP 60 Marcas de Moda',
      subtitle: 'Guia das principais fabricantes e marcas atacadistas',
      link: '/partners',
      primary: false,
    },
    {
      title: '📸 Holofote & Eventos de Moda',
      subtitle: 'Coberturas de desfiles, galas e lançamentos',
      link: '/events',
      primary: false,
    },
    {
      title: '💼 Anunciar na Revista Moda Atual',
      subtitle: 'Propostas de mídia, páginas e catálogos B2B',
      link: '/advertisements',
      primary: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white selection:bg-orange-600 selection:text-white font-sans py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-transparent rounded-2xl transition-transform hover:scale-105 duration-300">
            <BrandLogo size="lg" className="h-20 w-auto" />
          </div>

          <div>
            <h1 className="font-serif text-2xl font-extrabold tracking-wider uppercase text-white">
              Revista Moda Atual
            </h1>
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest mt-1">
              Hub Digital de Moda Atacadista
            </p>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed max-w-xs font-light">
            Conectando marcas, confecções e lojistas de todo o Brasil com o melhor do mercado de
            moda.
          </p>

          {/* Social Icons Row */}
          <div className="flex items-center gap-3 pt-2">
            {socialLinks.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  title={item.name}
                  className="w-11 h-11 rounded-full bg-slate-800/80 border border-slate-700/80 hover:border-orange-500 flex items-center justify-center text-slate-200 hover:bg-orange-600 hover:text-white transition-all duration-300 hover:scale-110 shadow-md"
                >
                  <Icon className="w-5 h-5" />
                </a>
              )
            })}
          </div>
        </div>

        {/* Featured Edition Card (if any) */}
        {latestEdition && (
          <div className="w-full">
            <Link to="/reader/latest" className="block group">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600/30 to-amber-600/30 border border-orange-500/40 p-4 shadow-xl group-hover:border-orange-400 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-24 rounded-lg bg-slate-900 overflow-hidden shrink-0 shadow-md relative">
                    {latestEdition.cover_url ? (
                      <img
                        src={latestEdition.cover_url}
                        alt={latestEdition.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-orange-400">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-1 right-1 pointer-events-none">
                      <SubscriberCoverBadge variant="compact" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">
                      ★ Destaque do Mês
                    </span>
                    <h3 className="font-serif font-bold text-base text-white truncate group-hover:text-orange-300 transition-colors">
                      {latestEdition.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      Toque para folhear a revista digital interativa agora.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Main Action Links */}
        <div className="w-full space-y-3">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold text-center mb-3">
            Acesso Rápido
          </h2>

          {actionButtons.map((btn, idx) => (
            <Link key={idx} to={btn.link} className="block group">
              <div
                className={`w-full p-4 rounded-xl border transition-all duration-300 flex items-center justify-between shadow-md ${
                  btn.primary
                    ? 'bg-orange-600 hover:bg-orange-500 border-orange-500 text-white font-bold'
                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-100'
                } group-hover:scale-[1.02]`}
              >
                <div className="text-left space-y-0.5">
                  <div className="text-sm font-bold flex items-center gap-1.5">{btn.title}</div>
                  <div className={`text-xs ${btn.primary ? 'text-orange-100' : 'text-slate-400'}`}>
                    {btn.subtitle}
                  </div>
                </div>
                <ArrowRight
                  className={`w-4 h-4 ${
                    btn.primary ? 'text-white' : 'text-slate-400'
                  } group-hover:translate-x-1 transition-transform`}
                />
              </div>
            </Link>
          ))}
        </div>

        {/* App Download / PWA Section */}
        <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-600/20 text-orange-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Aplicativo Revista Digital</h3>
              <p className="text-xs text-slate-400">Instale no seu celular sem ocupar espaço</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link to="/" className="w-full">
              <Button
                variant="outline"
                className="w-full text-xs h-10 border-slate-700 hover:bg-slate-800 text-slate-200"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
                Instalar App
              </Button>
            </Link>
            <Link to="/reader/latest" className="w-full">
              <Button
                variant="outline"
                className="w-full text-xs h-10 border-slate-700 hover:bg-slate-800 text-slate-200"
              >
                <BookOpen className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
                Web Reader
              </Button>
            </Link>
          </div>
        </div>

        {/* Events preview */}
        {events.length > 0 && (
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                Últimos Eventos & Desfiles
              </h2>
              <Link
                to="/events"
                className="text-xs text-orange-400 hover:text-orange-300 font-medium"
              >
                Ver todos
              </Link>
            </div>

            <div className="space-y-2">
              {events.map((ev) => (
                <Link key={ev.id} to="/events" className="block group">
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 flex items-center justify-between transition-colors">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                        {ev.title}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-orange-500" />
                        <span>{ev.date}</span>
                        <span>•</span>
                        <span>{ev.category || 'Evento'}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0 ml-2" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-6 border-t border-slate-900 text-center space-y-2 w-full text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Revista Moda Atual & V Moda Brasil</p>
          <div className="flex justify-center gap-4 text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">
              Página Inicial
            </Link>
            <span>•</span>
            <Link to="/sobre-nos" className="hover:text-white transition-colors">
              Sobre Nós
            </Link>
            <span>•</span>
            <Link to="/advertisements" className="hover:text-white transition-colors">
              Anunciar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
