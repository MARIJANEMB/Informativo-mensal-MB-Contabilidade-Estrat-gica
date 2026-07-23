import pb from '@/lib/pocketbase/client'

export interface Proposta {
  id: string
  cliente: string
  data_proposta: string
  plano_proposto: string
  valor_mensal: number
  status: string
  data_aceita: string
  nps_score: number
  csat_score: number
  created: string
  updated: string
}

export const PLANOS = [
  'Essencial T1',
  'Essencial T2',
  'Essencial T3',
  'Estratégico T1',
  'Estratégico T2',
  'Estratégico T3',
]
export const STATUS_PROPOSTA = ['Enviada', 'Em Discussão', 'Aceita', 'Recusada', 'Vencida']

export const getPropostas = () =>
  pb.collection('propostas').getFullList({ sort: '-data_proposta', expand: 'cliente' })

export const createProposta = (data: Partial<Proposta>) => pb.collection('propostas').create(data)

export const updateProposta = (id: string, data: Partial<Proposta>) =>
  pb.collection('propostas').update(id, data)

export const deleteProposta = (id: string) => pb.collection('propostas').delete(id)
