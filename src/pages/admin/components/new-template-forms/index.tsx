import { GROUP1, GROUP2, GROUP3, GROUP4, GROUP5 } from './shared'
import { Group1Form } from './group1'
import { Group2Form } from './group2'
import { Group3Form } from './group3'
import { Group4Form } from './group4'
import { Group5Form } from './group5'

export { NEW_TEMPLATE_VALUES, getInitialTemplateData } from './shared'

export function NewTemplateForms({
  template,
  data,
  setData,
}: {
  template: string
  data: any
  setData: (d: any) => void
}) {
  if (GROUP1.includes(template))
    return <Group1Form template={template} data={data} setData={setData} />
  if (GROUP2.includes(template))
    return <Group2Form template={template} data={data} setData={setData} />
  if (GROUP3.includes(template))
    return <Group3Form template={template} data={data} setData={setData} />
  if (GROUP4.includes(template))
    return <Group4Form template={template} data={data} setData={setData} />
  if (GROUP5.includes(template))
    return <Group5Form template={template} data={data} setData={setData} />
  return null
}
