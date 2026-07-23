import pb from '@/lib/pocketbase/client'

export type RiscoChurn = 'Baixo' | 'Médio' | 'Alto' | 'Crítico'
export type StatusOnboarding =
  | 'Não Iniciado'
  | 'Apresentação'
  | 'Diagnóstico'
  | 'Plano Aceito'
  | 'Implementação'
  | 'Completo'
export type FrequenciaCheckin = 'Semanal' | 'Quinzenal' | 'Mensal' | 'Trimestral'

export interface SucessoCliente {
  id: string
  cliente: string
  customer_success_manager: string
  data_inicio_relacionamento: string
  status_onboarding: StatusOnboarding
  data_onboarding_concluido: string
  health_score: number
  risco_churn: RiscoChurn
  data_ultima_checkin: string
  frequencia_checkin: FrequenciaCheckin
  tickets_abertos: number
  tempo_medio_resolucao_horas: number
  nps_score: number
  csat_score: number
  utiliza_todos_servicos: 'Sim' | 'Não' | 'Parcialmente'
  oportunidades_upsell: string[]
  data_proximo_revisar_contrato: string
  notas_cs: string
  created: string
  updated: string
}

export const RISCO_CHURN_LIST: RiscoChurn[] = ['Baixo', 'Médio', 'Alto', 'Crítico']
export const ONBOARDING_LIST: StatusOnboarding[] = [
  'Não Iniciado',
  'Apresentação',
  'Diagnóstico',
  'Plano Aceito',
  'Implementação',
  'Completo',
]
export const FREQUENCIA_LIST: FrequenciaCheckin[] = ['Semanal', 'Quinzenal', 'Mensal', 'Trimestral']
export const UPSELL_LIST = [
  'Upgrade',
  'BPO',
  'Consultoria',
  'Planejamento Tributário',
  'Dev Liderança',
  'Diagnóstico',
]

export const getSucessoClientes = () =>
  pb
    .collection('sucesso_cliente')
    .getFullList({ sort: '-health_score', expand: 'cliente,customer_success_manager' })

export const getSucessoCliente = (id: string) =>
  pb.collection('sucesso_cliente').getOne(id, { expand: 'cliente,customer_success_manager' })

export const createSucessoCliente = (data: Partial<SucessoCliente>) =>
  pb.collection('sucesso_cliente').create(data)

export const updateSucessoCliente = (id: string, data: Partial<SucessoCliente>) =>
  pb.collection('sucesso_cliente').update(id, data)

export const deleteSucessoCliente = (id: string) => pb.collection('sucesso_cliente').delete(id)
