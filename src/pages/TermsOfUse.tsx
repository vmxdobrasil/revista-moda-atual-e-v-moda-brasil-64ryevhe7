import { Link } from 'react-router-dom'
import { FileText, ArrowLeft, Shield, CheckCircle, Scale, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TermsOfUse() {
  const lastUpdate = '25 de Março de 2026'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar ao Início
            </Button>
          </Link>
          <span className="text-xs text-orange-400 font-mono">
            Última atualização: {lastUpdate}
          </span>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" /> Termos de Serviço
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Termos de Uso
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Bem-vindo(a) à Revista MODA ATUAL Digital. Ao acessar nosso aplicativo, edições
            interativas, portal de negócios ou qualquer serviço associado, você concorda
            expressamente com os termos e condições descritos abaixo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
          <Card className="bg-slate-900/80 border-slate-800 text-slate-200">
            <CardContent className="p-4 space-y-2">
              <Shield className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-sm text-white">Propriedade Intelectual</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Todas as edições, fotografias editoriais, matérias e marcas são protegidas por leis
                autorais.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800 text-slate-200">
            <CardContent className="p-4 space-y-2">
              <CheckCircle className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-sm text-white">Hub B2B Atacadista</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Relacionamento comercial ético entre marcas de confecção, lojistas e revendedores.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800 text-slate-200">
            <CardContent className="p-4 space-y-2">
              <Scale className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-sm text-white">Legislação Brasileira</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Regido pelas leis da República Federativa do Brasil e foro de Goiânia/GO.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              1. Objeto e Natureza da Plataforma
            </h2>
            <p>
              A <strong className="text-white">Revista MODA ATUAL Digital</strong> é uma publicação
              multimídia e hub B2B de moda mantido pela empresa{' '}
              <strong className="text-white">VMX do Brasil</strong>. A plataforma oferece:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>
                Leitura interativa de edições da revista através de tecnologia Flipbook digital;
              </li>
              <li>Cobertura de eventos de moda, desfiles, tapetes vermelhos e coluna social;</li>
              <li>Ranking curado das TOP 60 Melhores Marcas do atacado de moda brasileiro;</li>
              <li>Espaço para anunciantes e propostas comerciais customizadas;</li>
              <li>
                Sistemas de IA e assistentes editoriais voltados à produtividade de equipes de moda.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              2. Cadastro e Responsabilidade do Usuário
            </h2>
            <p>
              Ao criar uma conta ou fornecer informações para o recebimento de edições digitais,
              você garante a veracidade e exatidão das informações fornecidas. É vedado o uso de
              identidades falsas ou a tentativa de violar a autenticação restrita do painel
              administrativo.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              3. Relações Comerciais e Anúncios (Hub V MODA)
            </h2>
            <p>
              As marcas listadas no ranking TOP 60 e as campanhas veiculadas no portal de
              anunciantes seguem contratos específicos de publicidade e adesão. A Revista MODA ATUAL
              atua como veículo de mídia, comunicação e vitrine editorial, não respondendo
              diretamente por transações comerciais mercantis finais firmadas entre lojistas e
              indústrias de confecção fora de seu domínio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              4. Uso Aceitável do Aplicativo e TWA
            </h2>
            <p>
              O usuário concorda em utilizar o aplicativo em conformidade com as diretrizes da
              Google Play Store e a legislação aplicável:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>
                É proibida a engenharia reversa, raspagem massiva automatizada (scraping) ou
                sobrecarga intencional dos servidores;
              </li>
              <li>
                É vedada a redistribuição comercial de qualquer conteúdo editorial sem prévia e
                expressa autorização por escrito da VMX do Brasil;
              </li>
              <li>
                Tentativas de contornar regras de autenticação ou interceptar dados comerciais
                resultarão em cancelamento imediato de acesso e medidas legais cabíveis.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              5. Propriedade Intelectual e Marcas Registradas
            </h2>
            <p>
              O nome "Revista MODA ATUAL", seu logotipo exclusivo em fundo laranja, sua identidade
              visual, código-fonte e elementos gráficos constituem propriedade intelectual exclusiva
              da VMX do Brasil ou de seus respectivos licenciadores.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              6. Alterações nos Termos
            </h2>
            <p>
              A VMX do Brasil reserva-se o direito de atualizar periodicamente estes termos para
              refletir novas funcionalidades do aplicativo ou exigências regulatórias. A data de
              última revisão será sempre informada no topo deste documento.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              7. Foro e Legislação Aplicável
            </h2>
            <p>
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Para
              dirimir quaisquer controvérsias decorrentes deste instrumento, fica eleito o Foro da
              Comarca de Goiânia, Estado de Goiás, com expressa renúncia a qualquer outro, por mais
              privilegiado que seja.
            </p>
          </section>
        </div>

        <div className="flex justify-center pt-8 border-t border-slate-800">
          <Link to="/">
            <Button className="bg-orange-600 hover:bg-orange-500 text-white">
              Retornar à Revista MODA ATUAL
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
