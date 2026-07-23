import pb from '@/lib/pocketbase/client'

export interface Tarefa {
  id: string
  cliente: string
  tipo: string
  descricao: string
  data_vencimento: string
  status: string
  responsavel: string
  documentos_necessarios: string[]
  arquivos: string[]
  historico: string
  created: string
  updated: string
}

export const TIPOS_TAREFA = [
  'Livro Caixa',
  'Documentação Fiscal',
  'Declaração (IR/IRPJ)',
  'Reunião de Resultados',
  'NPS Survey',
  'Regularização',
  'Outra',
]
export const STATUS_TAREFA = [
  'Não Iniciada',
  'Em Andamento',
  'Aguardando Cliente',
  'Concluída',
  'Atrasada',
]
export const DOCUMENTOS_CHECKLIST = [
  'Comprovante de Renda',
  'Nota Fiscal',
  'Recibo',
  'Demonstrativo Bancário',
  'Contrato',
  'Outro',
]

export const getTarefas = () =>
  pb.collection('tarefas').getFullList({ sort: 'data_vencimento', expand: 'cliente,responsavel' })

export const getTarefa = (id: string) => pb.collection('tarefas').getOne(id)

export const createTarefa = (data: Partial<Tarefa>) => pb.collection('tarefas').create(data)

export const updateTarefa = (id: string, data: Partial<Tarefa>) =>
  pb.collection('tarefas').update(id, data)

export const deleteTarefa = (id: string) => pb.collection('tarefas').delete(id)

export const arquivosUrl = (recordId: string, filename: string) =>
  `${import.meta.env.VITE_POCKETBASE_URL}/api/files/tarefas/${recordId}/${filename}?download=1`
