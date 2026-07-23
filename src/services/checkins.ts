import pb from '@/lib/pocketbase/client'

export type TipoCheckin =
  | 'Check-in Regular'
  | 'Revisão de Resultados'
  | 'Planejamento Estratégico'
  | 'Satisfação/Feedback'
  | 'Resolução de Problema'
  | 'Upsell Discussion'

export interface Checkin {
  id: string
  cliente: string
  data_da_reuniao: string
  tipo_checkin: TipoCheckin
  participantes_mb: string[]
  assuntos_abordados: string[]
  feedback_cliente: string
  acao_seguimento: string
  proximo_checkin_agendado: string
  satisfacao_checkin: number
  created: string
  updated: string
}

export const TIPO_CHECKIN_LIST: TipoCheckin[] = [
  'Check-in Regular',
  'Revisão de Resultados',
  'Planejamento Estratégico',
  'Satisfação/Feedback',
  'Resolução de Problema',
  'Upsell Discussion',
]

export const ASSUNTOS_LIST = [
  'Resultados Financeiros',
  'Tarefas/Pendências',
  'Satisfação',
  'Oportunidades',
  'Upsell',
  'Problemas',
  'Roadmap',
]

export const getCheckins = () =>
  pb
    .collection('checkins')
    .getFullList({ sort: '-data_da_reuniao', expand: 'cliente,participantes_mb' })

export const getCheckin = (id: string) =>
  pb.collection('checkins').getOne(id, { expand: 'cliente,participantes_mb' })

export const createCheckin = (data: Partial<Checkin>) => pb.collection('checkins').create(data)

export const updateCheckin = (id: string, data: Partial<Checkin>) =>
  pb.collection('checkins').update(id, data)

export const deleteCheckin = (id: string) => pb.collection('checkins').delete(id)
