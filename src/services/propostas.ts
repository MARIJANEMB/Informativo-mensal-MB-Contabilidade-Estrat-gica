import pb from '@/lib/pocketbase/client'

export type PropostaStatus = 'Enviada' | 'Em Discussão' | 'Aceita' | 'Recusada' | 'Vencida'

export interface Proposta {
  id: string
  cliente: string
  data_proposta: string
  plano_proposto: string
  valor_mensal: number
  status: PropostaStatus
  data_aceita: string
  nps_score: number | null
  csat_score: number | null
  created: string
  updated: string
}

export const PROPOSTA_STATUSES: PropostaStatus[] = [
  'Enviada',
  'Em Discussão',
  'Aceita',
  'Recusada',
  'Vencida',
]

export const getPropostas = () =>
  pb.collection('propostas').getFullList({ sort: '-data_proposta', expand: 'cliente' })

export const getPropostasByClient = (clientId: string) =>
  pb
    .collection('propostas')
    .getFullList({ filter: `cliente = "${clientId}"`, sort: '-data_proposta' })

export const createProposta = (data: Partial<Proposta>) => pb.collection('propostas').create(data)

export const updateProposta = (id: string, data: Partial<Proposta>) =>
  pb.collection('propostas').update(id, data)

export const deleteProposta = (id: string) => pb.collection('propostas').delete(id)
