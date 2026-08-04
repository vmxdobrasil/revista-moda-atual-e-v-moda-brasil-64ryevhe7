import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'

export interface SeoFieldValues {
  seo_title: string
  seo_description: string
  keywords: string
  canonical_url: string
  slug: string
}

interface SeoFieldsFormProps {
  values: SeoFieldValues
  onChange: (values: SeoFieldValues) => void
}

export function SeoFieldsForm({ values, onChange }: SeoFieldsFormProps) {
  const update = (field: keyof SeoFieldValues, val: string) => {
    onChange({ ...values, [field]: val })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="w-5 h-5 text-orange-500" /> SEO Metadata
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>SEO Title</Label>
          <Input
            value={values.seo_title}
            onChange={(e) => update('seo_title', e.target.value)}
            placeholder="Título otimizado para SEO (máx 60 caracteres)"
            maxLength={200}
          />
          <p className="text-xs text-gray-400">{values.seo_title.length} caracteres</p>
        </div>
        <div className="space-y-2">
          <Label>SEO Description</Label>
          <Textarea
            value={values.seo_description}
            onChange={(e) => update('seo_description', e.target.value)}
            placeholder="Meta description (máx 160 caracteres)"
            rows={2}
            maxLength={320}
          />
          <p className="text-xs text-gray-400">{values.seo_description.length} caracteres</p>
        </div>
        <div className="space-y-2">
          <Label>Keywords</Label>
          <Input
            value={values.keywords}
            onChange={(e) => update('keywords', e.target.value)}
            placeholder="moda, tendências, V MODA BRASIL"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Slug (URL amigável)</Label>
            <Input
              value={values.slug}
              onChange={(e) => update('slug', e.target.value)}
              placeholder="edicao-janeiro-2026"
            />
          </div>
          <div className="space-y-2">
            <Label>Canonical URL</Label>
            <Input
              value={values.canonical_url}
              onChange={(e) => update('canonical_url', e.target.value)}
              placeholder="https://revistamodaatual.com.br/..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
