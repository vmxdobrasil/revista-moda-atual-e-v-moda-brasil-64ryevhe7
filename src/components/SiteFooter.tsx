import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'
import { Instagram, Globe, Mail, Phone, ArrowUpRight } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block bg-transparent p-0 m-0">
              <BrandLogo size="lg" className="h-16 md:h-20 w-auto" />
            </Link>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Revista de moda digital e hub de negócios para o mercado atacadista brasileiro.
              Conectando marcas, lojistas e compradores com o melhor do ecossistema de moda
              nacional.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a
                href="https://instagram.com/revistamodaatual"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 hover:text-orange-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://revistamodaatual.com.br"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 hover:text-orange-400 transition-colors"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a
                href="mailto:contato@revistamodaatual.com.br"
                className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 hover:text-orange-400 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-orange-400 mb-4">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/editions" className="hover:text-white transition-colors">
                  Edições Digitais
                </Link>
              </li>
              <li>
                <Link to="/partners" className="hover:text-white transition-colors">
                  TOP 60 Marcas
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Eventos & Desfiles
                </Link>
              </li>
              <li>
                <Link to="/bio" className="hover:text-white transition-colors">
                  Link na Bio
                </Link>
              </li>
              <li>
                <Link to="/advertisements" className="hover:text-white transition-colors">
                  Anúncios e Mídia
                </Link>
              </li>
              <li>
                <Link to="/sobre-nos" className="hover:text-white transition-colors">
                  Sobre a Revista
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-orange-400 mb-4">
              Para Anunciantes
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link
                  to="/public/anunciante"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Portal do Anunciante
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors">
                  Acesso Administrativo
                </Link>
              </li>
              <li className="pt-2 text-xs text-slate-500">Atendimento: Seg a Sex, 9h às 18h</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} Revista MODA ATUAL Digital & V MODA BRASIL. Todos os
            direitos reservados.
          </p>
          <p className="flex items-center gap-1">
            Plataforma desenvolvida para o atacado de moda brasileiro.
          </p>
        </div>
      </div>
    </footer>
  )
}
