import pb from '@/lib/pocketbase/client'

export type AtendimentoStatus =
  | 'Aberto'
  | 'Em Atendimento'
  | 'Aguardando Cliente'
  | 'Resolvido'
  | 'Fechado'
  | 'Reaberto'
export type AtendimentoPrioridade = 'Baixa' | 'Normal' | 'Alta' | 'Urgente'
export type AtendimentoCategoria =
  | 'Dúvida Técnica'
  | 'Problema Sistema'
  | 'Orientação Tributária'
  | 'Documentação'
  | 'Cobrança'
  | 'Solicitação'
  | 'Reclamação'
  | 'Outro'

export interface Atendimento {
  id: string
  cliente: string
  data_abertura: string
  categoria: AtendimentoCategoria
  assunto: string
  descricao: string
  prioridade: AtendimentoPrioridade
  status: AtendimentoStatus
  responsavel: string
  data_resolucao: string
  tempo_resposta_horas: number
  tempo_resolucao_horas: number
  satisfacao_cliente: number
  tags: string[]
  historico: string
  anexos: string[]
  created: string
  updated: string
}

export const KANBAN_STATUS: AtendimentoStatus[] = [
  'Aberto',
  'Em Atendimento',
  'Aguardando Cliente',
  'Resolvido',
]
export const STATUS_LIST: AtendimentoStatus[] = [
  'Aberto',
  'Em Atendimento',
  'Aguardando Cliente',
  'Resolvido',
  'Fechado',
  'Reaberto',
]
export const PRIORIDADE_LIST: AtendimentoPrioridade[] = ['Baixa', 'Normal', 'Alta', 'Urgente']
export const CATEGORIA_LIST: AtendimentoCategoria[] = [
  'Dúvida Técnica',
  'Problema Sistema',
  'Orientação Tributária',
  'Documentação',
  'Cobrança',
  'Solicitação',
  'Reclamação',
  'Outro',
]

export const getAtendimentos = () =>
  pb.collection('atendimento').getFullList({ sort: '-created', expand: 'cliente,responsavel' })

export const getAtendimento = (id: string) =>
  pb.collection('atendimento').getOne(id, { expand: 'cliente,responsavel' })

export const createAtendimento = (data: Partial<Atendimento>) =>
  pb.collection('atendimento').create(data)

export const updateAtendimento = (id: string, data: Partial<Atendimento>) =>
  pb.collection('atendimento').update(id, data)

export const deleteAtendimento = (id: string) => pb.collection('atendimento').delete(id)
