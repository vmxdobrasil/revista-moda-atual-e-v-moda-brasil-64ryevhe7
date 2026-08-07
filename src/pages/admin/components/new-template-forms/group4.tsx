import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField, ImageListEditor, setField } from './shared'

export function Group4Form({
  template,
  data,
  setData,
}: {
  template: string
  data: any
  setData: (d: any) => void
}) {
  if (template === 'story_social') {
    return (
      <div className="space-y-4 border-t pt-4">
        <FormField label="Hook / Gancho">
          <Input
            value={data.hook || ''}
            onChange={(e) => setField(data, setData, 'hook', e.target.value)}
            placeholder="Ex: Você viu essa tendência?"
          />
        </FormField>
        <FormField label="Imagem (URL)">
          <Input
            value={data.image || ''}
            onChange={(e) => setField(data, setData, 'image', e.target.value)}
            placeholder="URL da imagem"
          />
        </FormField>
        <FormField label="Legenda">
          <Textarea
            value={data.caption || ''}
            onChange={(e) => setField(data, setData, 'caption', e.target.value)}
            rows={4}
            placeholder="Legenda do story..."
          />
        </FormField>
        <FormField label="Link">
          <Input
            value={data.link || ''}
            onChange={(e) => setField(data, setData, 'link', e.target.value)}
            placeholder="/"
          />
        </FormField>
      </div>
    )
  }

  if (template === 'newsletter_preview') {
    return (
      <div className="space-y-4 border-t pt-4">
        <FormField label="Assunto">
          <Input
            value={data.subject || ''}
            onChange={(e) => setField(data, setData, 'subject', e.target.value)}
            placeholder="Assunto do email"
          />
        </FormField>
        <FormField label="Pré-header">
          <Input
            value={data.preheader || ''}
            onChange={(e) => setField(data, setData, 'preheader', e.target.value)}
            placeholder="Texto de pré-header"
          />
        </FormField>
        <FormField label="Conteúdo">
          <Textarea
            value={data.content || ''}
            onChange={(e) => setField(data, setData, 'content', e.target.value)}
            rows={6}
            placeholder="Conteúdo do email..."
          />
        </FormField>
        <FormField label="Link CTA">
          <Input
            value={data.cta_link || ''}
            onChange={(e) => setField(data, setData, 'cta_link', e.target.value)}
            placeholder="/"
          />
        </FormField>
      </div>
    )
  }

  if (template === 'capa_edicao') {
    return (
      <div className="space-y-4 border-t pt-4">
        <FormField label="Imagem da Capa (URL)">
          <Input
            value={data.cover_image || ''}
            onChange={(e) => setField(data, setData, 'cover_image', e.target.value)}
            placeholder="URL da imagem"
          />
        </FormField>
        <FormField label="Título da Edição">
          <Input
            value={data.title || ''}
            onChange={(e) => setField(data, setData, 'title', e.target.value)}
            placeholder="Ex: Edição #42"
          />
        </FormField>
        <FormField label="Subtítulo">
          <Input
            value={data.subtitle || ''}
            onChange={(e) => setField(data, setData, 'subtitle', e.target.value)}
            placeholder="Subtítulo da capa"
          />
        </FormField>
        <FormField label="Link para a Edição">
          <Input
            value={data.link || ''}
            onChange={(e) => setField(data, setData, 'link', e.target.value)}
            placeholder="/edition/..."
          />
        </FormField>
      </div>
    )
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <FormField label="Título do Editorial">
        <Input
          value={data.title || ''}
          onChange={(e) => setField(data, setData, 'title', e.target.value)}
          placeholder="Ex: Nova Era"
        />
      </FormField>
      <FormField label="Introdução">
        <Textarea
          value={data.intro || ''}
          onChange={(e) => setField(data, setData, 'intro', e.target.value)}
          rows={2}
          placeholder="Texto introdutório..."
        />
      </FormField>
      <ImageListEditor
        label="Galeria de Imagens"
        images={data.images || []}
        onChange={(imgs) => setField(data, setData, 'images', imgs)}
      />
      <FormField label="Corpo do Editorial">
        <Textarea
          value={data.body || ''}
          onChange={(e) => setField(data, setData, 'body', e.target.value)}
          rows={6}
          placeholder="Texto do editorial..."
        />
      </FormField>
    </div>
  )
}
