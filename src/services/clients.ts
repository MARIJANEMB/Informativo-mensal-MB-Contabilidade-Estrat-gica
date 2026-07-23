import pb from '@/lib/pocketbase/client'

export const REGIMES_TRIBUTARIOS = ['Simples Nacional', 'Lucro Presumido', 'Lucro Real']
export const PLANOS = [
  'Essencial T1',
  'Essencial T2',
  'Essencial T3',
  'Estratégico T1',
  'Estratégico T2',
  'Estratégico T3',
]
export const STATUS_CLIENTE = ['Ativo', 'Inativo', 'Cancelado', 'Diagnosticado']
export const TAGS_CLIENTE = [
  'Comércio',
  'Serviços',
  'Imobiliária',
  'Saúde',
  'Educação',
  'Alto Potencial Upsell',
  'Churn Risk',
  'VIP',
  'Satisfação Baixa',
]

export interface Client {
  id: string
  name: string
  cnpj: string
  contact_email: string
  contact_phone: string
  data_inicio: string
  regime_tributario: string
  plano_contratado: string
  valor_mensal: number
  status: string
  contato_principal: string
  celular: string
  email: string
  email_secundario: string
  endereco: string
  responsavel_mb: string
  tags: string[]
  ultima_interacao: string
  notas: string
  created: string
  updated: string
}

export const getClients = () =>
  pb.collection('clients').getFullList({ sort: '-updated', expand: 'responsavel_mb' })

export const getActiveClients = () =>
  pb.collection('clients').getFullList({ filter: 'status = "Ativo"', expand: 'responsavel_mb' })

export const getClient = (id: string) => pb.collection('clients').getOne(id)

export const createClient = (data: Partial<Client>) => pb.collection('clients').create(data)

export const updateClient = (id: string, data: Partial<Client>) =>
  pb.collection('clients').update(id, data)

export const deleteClient = (id: string) => pb.collection('clients').delete(id)
