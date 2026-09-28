import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, Lock, Database, UserCheck, Eye, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PrivacyPolicy() {
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
            <ShieldCheck className="w-3.5 h-3.5" /> LGPD & Privacidade de Dados
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Política de Privacidade
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            A Revista MODA ATUAL Digital e o ecossistema V MODA BRASIL (VMX do Brasil) têm o
            compromisso de resguardar a privacidade e proteger os dados pessoais de seus leitores,
            assinantes, anunciantes e marcas atacadistas parceiras.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
          <Card className="bg-slate-900/80 border-slate-800 text-slate-200">
            <CardContent className="p-4 space-y-2">
              <Lock className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-sm text-white">Criptografia Ponta a Ponta</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Todas as conexões usam TLS 1.3 / HTTPS com proteção ativa contra vazamento e
                interceptação.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800 text-slate-200">
            <CardContent className="p-4 space-y-2">
              <Database className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-sm text-white">Dados Comerciais Seguros</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Leads de vendas (sales_leads) e tokens de sincronização são processados com
                isolamento estrito.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800 text-slate-200">
            <CardContent className="p-4 space-y-2">
              <UserCheck className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-sm text-white">Conformidade LGPD (Lei 13.709)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direito de acesso, exclusão, anonimização e revogação de consentimento a qualquer
                momento.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              1. Identificação do Controlador
            </h2>
            <p>
              O controlador dos dados pessoais tratados através desta aplicação web e PWA/TWA é a{' '}
              <strong className="text-white">VMX DO BRASIL / Revista MODA ATUAL Digital</strong>,
              sob a gestão executiva de Valter Mendonça (CEO). Para esclarecimento de qualquer
              dúvida sobre privacidade, entre em contato pelo e-mail institucional:{' '}
              <a
                href="mailto:privacidade@revistamodaatual.com.br"
                className="text-orange-400 underline"
              >
                privacidade@revistamodaatual.com.br
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              2. Natureza dos Dados Coletados
            </h2>
            <p>
              Nosso sistema opera exclusivamente como uma publicação editorial digital e hub de
              negócios do mercado da moda atacadista nacional (B2B e B2C de estilo). Coletamos
              apenas as seguintes categorias de dados:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-200">Leitores e Assinantes:</strong> Nome, endereço de
                e-mail, segmento de interesse (atacado, varejo ou consumidora) e foto de capa
                opcional gerada pela leitora para a experiência personalizada de capa interativa.
              </li>
              <li>
                <strong className="text-slate-200">Marcas Atacadistas e Anunciantes:</strong> Nome
                da marca, categoria comercial, porte da confecção, dados de contato institucional
                (WhatsApp comercial, e-mail comercial do responsável) e dados de propostas de
                publicidade.
              </li>
              <li>
                <strong className="text-slate-200">Usuários Administrativos:</strong> Credenciais
                autenticadas (e-mail, senha criptografada em hash seguro e código 2FA).
              </li>
              <li>
                <strong className="text-slate-200">Dados Técnicos da Sessão:</strong> Logs de
                auditoria, endereço IP de acesso para segurança, eventos de navegação agregados para
                mensuração editorial e identificadores de Service Worker.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              3. Finalidade e Base Legal do Tratamento
            </h2>
            <p>
              Os dados são tratados em conformidade com o Artigo 7º da LGPD (Lei Geral de Proteção
              de Dados Pessoais nº 13.709/2018):
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-200">
                  Execução de Contrato e Prestação Editorial:
                </strong>{' '}
                Permitir o acesso completo às edições digitais, flipbook, newsletter e portal de
                anunciantes.
              </li>
              <li>
                <strong className="text-slate-200">Interesse Legítimo B2B:</strong> Conectar
                compradores e confecções atacadistas pelo ranking TOP 60 Melhores Marcas e pelo
                Pipeline comercial V MODA.
              </li>
              <li>
                <strong className="text-slate-200">Consentimento do Usuário:</strong> Envio de
                newsletters semanais e campanhas de lançamentos de coleções. O usuário pode revogar
                seu consentimento a qualquer clique através do link de descadastramento.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              4. Não Compartilhamento e Sigilo Comercial
            </h2>
            <p>
              A Revista MODA ATUAL não comercializa, não aluga e não cede listas de e-mails ou leads
              de vendas a terceiros não autorizados. Os dados de leads comerciais (coleção{' '}
              <code className="text-orange-400">sales_leads</code>) são de uso restrito à equipe
              comercial e às confecções parceiras devidamente contratadas no programa V MODA BRASIL.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              5. Armazenamento Offline, PWA e Service Worker
            </h2>
            <p>Nosso Service Worker opera sob rígidas regras de segurança:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>
                Nenhum dado pessoal, token de autenticação, credencial ou resposta privada de API é
                armazenado no cache do navegador.
              </li>
              <li>
                Apenas a casca da aplicação (HTML, folhas de estilo CSS, scripts e ícones públicos)
                é mantida em cache para viabilizar o funcionamento offline.
              </li>
              <li>
                O token de sincronização comercial permanece estritamente no backend seguro do
                servidor.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              6. Direitos do Titular (Artigo 18 da LGPD)
            </h2>
            <p>
              A qualquer momento, mediante solicitação simples, você poderá exercer seus direitos de
              confirmação de existência de tratamento, acesso aos dados, correção de dados
              incompletos ou inexatos, anonimização, bloqueio ou eliminação de dados desnecessários,
              portabilidade e revogação do consentimento.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              7. Canal de Contato com o DPO / Encarregado de Dados
            </h2>
            <p>Para solicitações relacionadas à proteção de dados e privacidade:</p>
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
              <p>
                <strong className="text-white">Encarregado:</strong> Setor de Compliance & Segurança
                VMX do Brasil
              </p>
              <p>
                <strong className="text-white">E-mail:</strong> privacidade@revistamodaatual.com.br
              </p>
              <p>
                <strong className="text-white">Endereço Web:</strong>{' '}
                https://revistamodaatual.com.br
              </p>
            </div>
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
