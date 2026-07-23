import pb from '@/lib/pocketbase/client'

export interface FaturamentoMensal {
  id: string
  cliente: string
  mes: number
  ano: number
  receita: number
  custos_variaveis: number
  custos_operacao: number
  margem_bruta: number
  margem_operacional: number
  margem_liquida: number
  margem_percentual: number
  created: string
  updated: string
}

export const getFaturamento = () =>
  pb.collection('faturamento_mensal').getFullList({ sort: '-ano,-mes', expand: 'cliente' })

export const getFaturamentoByClient = (clientId: string) =>
  pb
    .collection('faturamento_mensal')
    .getFullList({ filter: `cliente = "${clientId}"`, sort: '-ano,-mes' })

export const createFaturamento = (data: Partial<FaturamentoMensal>) =>
  pb.collection('faturamento_mensal').create(data)

export const updateFaturamento = (id: string, data: Partial<FaturamentoMensal>) =>
  pb.collection('faturamento_mensal').update(id, data)

export const deleteFaturamento = (id: string) => pb.collection('faturamento_mensal').delete(id)
