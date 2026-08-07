import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField, ImageListEditor, setField } from './shared'

export function Group5Form({
  template,
  data,
  setData,
}: {
  template: string
  data: any
  setData: (d: any) => void
}) {
  const isMarketing = template === 'coluna_marketing_moda'

  return (
    <div className="space-y-4 border-t pt-4">
      {isMarketing && (
        <div className="p-3 bg-orange-50 border border-orange-100 rounded text-sm text-orange-800 mb-2">
          Esta coluna é assinada pelo <strong>CEO</strong> da Revista Moda Atual.
        </div>
      )}
      <FormField label="Título da Coluna">
        <Input
          value={data.title || ''}
          onChange={(e) => setField(data, setData, 'title', e.target.value)}
          placeholder={isMarketing ? 'Ex: Visão Estratégica' : 'Ex: Holofote da Semana'}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Autor">
          <Input
            value={data.author || ''}
            onChange={(e) => setField(data, setData, 'author', e.target.value)}
            placeholder={isMarketing ? 'CEO' : 'Nome do autor'}
          />
        </FormField>
        <FormField label="Data">
          <Input
            value={data.date || ''}
            onChange={(e) => setField(data, setData, 'date', e.target.value)}
            placeholder="Ex: Janeiro 2026"
          />
        </FormField>
      </div>
      <FormField label="Corpo da Coluna">
        <Textarea
          value={data.body || ''}
          onChange={(e) => setField(data, setData, 'body', e.target.value)}
          rows={8}
          placeholder="Texto da coluna... (use Enter para parágrafos)"
        />
      </FormField>
      <ImageListEditor
        label="Imagens"
        images={data.images || []}
        onChange={(imgs) => setField(data, setData, 'images', imgs)}
      />
      <FormField label={isMarketing ? 'Assinatura do CEO' : 'Assinatura'}>
        <Input
          value={data.signature || ''}
          onChange={(e) => setField(data, setData, 'signature', e.target.value)}
          placeholder={isMarketing ? 'CEO — Revista Moda Atual' : 'Nome do autor'}
        />
      </FormField>
    </div>
  )
}
