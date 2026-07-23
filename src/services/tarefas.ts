import pb from '@/lib/pocketbase/client'

export type TarefaStatus =
  | 'Não Iniciada'
  | 'Em Andamento'
  | 'Aguardando Cliente'
  | 'Concluída'
  | 'Atrasada'
export type TarefaTipo =
  | 'Livro Caixa'
  | 'Documentação Fiscal'
  | 'Declaração (IR/IRPJ)'
  | 'Reunião de Resultados'
  | 'NPS Survey'
  | 'Regularização'
  | 'Outra'

export interface Tarefa {
  id: string
  cliente: string
  tipo: TarefaTipo
  descricao: string
  data_vencimento: string
  status: TarefaStatus
  responsavel: string
  documentos_necessarios: string
  arquivos: string[]
  historico: string
  created: string
  updated: string
}

export const KANBAN_COLUMNS: TarefaStatus[] = [
  'Não Iniciada',
  'Em Andamento',
  'Aguardando Cliente',
  'Concluída',
]

export const getTarefas = () =>
  pb.collection('tarefas').getFullList({ sort: '-data_vencimento', expand: 'cliente,responsavel' })

export const getTarefasByClient = (clientId: string) =>
  pb.collection('tarefas').getFullList({
    filter: `cliente = "${clientId}"`,
    sort: '-data_vencimento',
    expand: 'responsavel',
  })

export const createTarefa = (data: Partial<Tarefa>) => pb.collection('tarefas').create(data)

export const updateTarefa = (id: string, data: Partial<Tarefa>) =>
  pb.collection('tarefas').update(id, data)

export const deleteTarefa = (id: string) => pb.collection('tarefas').delete(id)
