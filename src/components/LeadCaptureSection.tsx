import { useState, useRef } from 'react'
import { createLead, Lead } from '@/services/leads'
import { createSubscriber } from '@/services/newsletter'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Sparkles,
  Send,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  User,
  Loader2,
  Camera,
  Upload,
} from 'lucide-react'

export function LeadCaptureSection({ source = 'landing_page' }: { source?: string }) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<Lead>>({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    segmento: 'atacado',
    origem: source,
    type: 'subscribe',
    notes: '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast({
          title: 'Arquivo muito grande',
          description: 'A foto deve ter até 5MB.',
          variant: 'destructive',
        })
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome?.trim() || !formData.email?.trim()) {
      return toast({
        title: 'Campos Obrigatórios',
        description: 'Por favor, preencha pelo menos nome e e-mail.',
        variant: 'destructive',
      })
    }

    setLoading(true)
    try {
      // Cria o lead
      await createLead({
        ...formData,
        origem: source,
      })

      // Salva ou atualiza também na coleção subscribers
      try {
        const subFormData = new FormData()
        subFormData.append('name', (formData.nome || '').trim())
        subFormData.append('email', (formData.email || '').trim().toLowerCase())
        subFormData.append('segment', (formData.segmento as string) || 'atacado')
        subFormData.append('status', 'ativo')
        subFormData.append('source', 'site')
        subFormData.append('engagement_score', '100')
        if (avatarFile) {
          subFormData.append('avatar', avatarFile)
        }
        await createSubscriber(subFormData)
      } catch (subErr) {
        console.warn('Subscriber save warning in LeadCaptureSection:', subErr)
      }

      setSubmitted(true)
      toast({
        title: 'Inscrição Confirmada!',
        description: 'Você receberá os lançamentos e catálogos exclusivos da Revista Moda Atual.',
      })
    } catch (err) {
      console.error('Lead capture error:', err)
      toast({
        title: 'Erro ao cadastrar',
        description: 'Ocorreu um imprevisto ao registrar seu contato. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-border/80 shadow-2xl p-8 sm:p-12 lg:p-16 text-white">
        {/* Subtle orange accent glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Text & Benefits */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <Badge
              variant="outline"
              className="border-orange-500/50 text-orange-400 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold rounded-full tracking-wide inline-flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              CONECTIVIDADE & INTELIGÊNCIA B2B
            </Badge>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Receba em Primeira Mão os Lançamentos do Atacado
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
              Cadastre-se gratuitamente para receber catálogos, prévias de coleções, convites para
              desfiles e matérias exclusivas da Revista Moda Atual direto no seu e-mail e WhatsApp.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                <span>Acesso antecipado aos lookbooks e edições interativas</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                <span>Contato direto com os fabricantes do ranking TOP 60</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                <span>Oportunidades especiais de publicidade e mídia editorial</span>
              </div>
            </div>
          </div>

          {/* Right Column: Capture Form or Success State */}
          <div className="lg:col-span-6">
            <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-md shadow-xl text-white">
              <CardContent className="p-6 sm:p-8">
                {submitted ? (
                  <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95">
                    <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-white">
                      Cadastro Concluído!
                    </h3>
                    <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                      Obrigado pelo seu interesse. Nossa equipe editorial e comercial enviará os
                      destaques em breve.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSubmitted(false)
                        setAvatarFile(null)
                        setAvatarPreview(null)
                        setFormData({
                          nome: '',
                          email: '',
                          telefone: '',
                          empresa: '',
                          segmento: 'atacado',
                          origem: source,
                          type: 'subscribe',
                          notes: '',
                        })
                      }}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      Cadastrar outro contato
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Upload Foto do Assinante */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-orange-500/40 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="relative group cursor-pointer shrink-0"
                      >
                        <Avatar className="h-14 w-14 border-2 border-dashed border-orange-500 group-hover:border-orange-400 ring-2 ring-orange-500/20">
                          {avatarPreview ? (
                            <AvatarImage
                              src={avatarPreview}
                              alt="Preview"
                              className="object-cover"
                            />
                          ) : null}
                          <AvatarFallback className="bg-slate-900 text-orange-400 flex flex-col items-center justify-center">
                            <Camera className="w-5 h-5 mb-0.5" />
                            <span className="text-[8px]">Sua Foto</span>
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1 justify-center sm:justify-start">
                          <Sparkles className="w-3 h-3" /> Foto do Assinante na Capa * (Obrigatória)
                        </span>
                        <p className="text-[11px] text-slate-400">
                          Foto pequena que aparecerá no selo de capa da revista digital.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] h-6 px-2 border-slate-700 text-slate-300 hover:border-orange-500 mt-0.5"
                        >
                          <Upload className="w-2.5 h-2.5 mr-1 text-orange-400" />
                          {avatarFile ? 'Trocar Foto' : 'Escolher Foto'}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-serif font-bold text-lg text-white">
                        Cadastre seu Negócio
                      </h3>
                      <p className="text-xs text-slate-400">
                        Preencha o formulário para conexão com a Revista Moda Atual.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-300">Nome Completo *</Label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                          <Input
                            required
                            placeholder="Seu nome"
                            value={formData.nome || ''}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            className="pl-9 bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-orange-500 h-10 text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-300">E-mail Corporativo *</Label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                          <Input
                            type="email"
                            required
                            placeholder="email@empresa.com"
                            value={formData.email || ''}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="pl-9 bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-orange-500 h-10 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-300">WhatsApp / Telefone</Label>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                          <Input
                            placeholder="(11) 99999-9999"
                            value={formData.telefone || ''}
                            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                            className="pl-9 bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-orange-500 h-10 text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-300">Nome da Empresa / Loja</Label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                          <Input
                            placeholder="Ex: Confecção Bella"
                            value={formData.empresa || ''}
                            onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                            className="pl-9 bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-orange-500 h-10 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-300">Segmento Principal</Label>
                        <select
                          value={formData.segmento || 'atacado'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              segmento: e.target.value as any,
                            })
                          }
                          className="w-full h-10 px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="atacado">Moda Atacado / Distribuição</option>
                          <option value="varejo">Lojista / Varejo</option>
                          <option value="confeccao">Fabricante / Confecção</option>
                          <option value="estilista">Estilista / Designer</option>
                          <option value="outro">Outro Segmento</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-300">Principal Interesse</Label>
                        <select
                          value={formData.type || 'subscribe'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              type: e.target.value as any,
                            })
                          }
                          className="w-full h-10 px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="subscribe">Receber Catálogos e Lançamentos</option>
                          <option value="advertise">Anunciar na Revista / Mídia</option>
                          <option value="contact">Parceria Comercial B2B</option>
                          <option value="other">Outro Assunto</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold h-11 text-sm shadow-lg shadow-orange-600/30 gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Registrando...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Quero Receber Informações & Catálogos
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
export default LeadCaptureSection
