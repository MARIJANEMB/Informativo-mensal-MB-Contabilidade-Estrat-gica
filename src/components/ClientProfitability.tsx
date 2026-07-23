import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getFaturamentoByClient, type FaturamentoMensal } from '@/services/faturamento'
import { cn } from '@/lib/utils'

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]
const fmtBRL = (v: number) =>
  (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function ClientProfitability({ clientId }: { clientId: string }) {
  const [data, setData] = useState<FaturamentoMensal[]>([])

  useEffect(() => {
    getFaturamentoByClient(clientId).then((d) => setData(d as unknown as FaturamentoMensal[]))
  }, [clientId])

  const marginColor = (pct: number) =>
    pct > 60
      ? 'text-emerald-600 font-bold'
      : pct >= 40
        ? 'text-amber-600 font-semibold'
        : 'text-red-600 font-semibold'

  if (data.length === 0)
    return (
      <p className="text-sm text-slate-400 text-center py-8">
        Nenhum registro de faturamento encontrado.
      </p>
    )

  return (
    <Table>
      <TableHeader className="bg-slate-50">
        <TableRow>
          <TableHead>Mês/Ano</TableHead>
          <TableHead>Receita</TableHead>
          <TableHead>Custos Variáveis</TableHead>
          <TableHead>Custos Operação</TableHead>
          <TableHead>Margem Bruta</TableHead>
          <TableHead>Margem Operacional</TableHead>
          <TableHead>Margem Líquida</TableHead>
          <TableHead>% Margem</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((f) => (
          <TableRow key={f.id}>
            <TableCell className="font-medium">
              {MONTHS[(f.mes || 1) - 1]}/{f.ano}
            </TableCell>
            <TableCell>{fmtBRL(f.receita)}</TableCell>
            <TableCell>{fmtBRL(f.custos_variaveis)}</TableCell>
            <TableCell>{fmtBRL(f.custos_operacao)}</TableCell>
            <TableCell>{fmtBRL(f.margem_bruta)}</TableCell>
            <TableCell>{fmtBRL(f.margem_operacional)}</TableCell>
            <TableCell>{fmtBRL(f.margem_liquida)}</TableCell>
            <TableCell className={cn(marginColor(f.margem_percentual || 0))}>
              {(f.margem_percentual || 0).toFixed(2)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
