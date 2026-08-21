import pb from '@/lib/pocketbase/client'

export interface Lead {
  id?: string
  nome: string
  email: string
  telefone?: string
  empresa?: string
  segmento?: 'atacado' | 'varejo' | 'confeccao' | 'estilista' | 'outro'
  origem?: string
  data_captacao?: string
  type?: 'advertise' | 'subscribe' | 'contact' | 'other'
  notes?: string
  created?: string
  updated?: string
}

export const getLeads = async (): Promise<Lead[]> => {
  try {
    return await pb.collection('leads').getFullList<Lead>({
      sort: '-created',
    })
  } catch (err) {
    console.error('Error fetching leads:', err)
    return []
  }
}

export const createLead = async (data: Partial<Lead>): Promise<Lead> => {
  const payload = {
    ...data,
    data_captacao: data.data_captacao || new Date().toISOString(),
  }
  return pb.collection('leads').create<Lead>(payload)
}

export const deleteLead = async (id: string): Promise<boolean> => {
  return pb.collection('leads').delete(id)
}
