import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getFaturamento, type FaturamentoMensal } from '@/services/faturamento'
import { getClients, type Client } from '@/services/clients'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, Award } from 'lucide-react'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const fmtBRL = (v: number) =>
  (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function RentabilidadePage() {
  const [data, setData] = useState<FaturamentoMensal[]>([])
  const [clients, setClients] = useState<Client[]>([])

  const loadData = useCallback(async () => {
    try {
      const [f, c] = await Promise.all([getFaturamento(), getClients()])
      setData(f as unknown as FaturamentoMensal[])
      setClients(c as unknown as Client[])
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('faturamento_mensal', () => loadData())

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name || '—'

  const sorted = useMemo(
    () => [...data].sort((a, b) => (b.margem_percentual || 0) - (a.margem_percentual || 0)),
    [data],
  )

  const summary = useMemo(() => {
    if (data.length === 0)
      return {
        avg: 0,
        highest: null as null | FaturamentoMensal,
        lowest: null as null | FaturamentoMensal,
        total: 0,
      }
    const avg = data.reduce((s, f) => s + (f.margem_percentual || 0), 0) / data.length
    const highest = sorted[0]
    const lowest = sorted[sorted.length - 1]
    const total = data.reduce((s, f) => s + (f.receita || 0), 0)
    return { avg, highest, lowest, total }
  }, [data, sorted])

  const marginColor = (pct: number) =>
    pct > 60
      ? 'text-emerald-600 font-bold'
      : pct >= 40
        ? 'text-amber-600 font-semibold'
        : 'text-red-600 font-semibold'

  const cards = [
    {
      label: 'Margem Média',
      value: `${summary.avg.toFixed(2)}%`,
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Maior Margem',
      value: summary.highest
        ? `${clientName(summary.highest.cliente)} (${(summary.highest.margem_percentual || 0).toFixed(1)}%)`
        : '—',
      icon: Award,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Menor Margem',
      value: summary.lowest
        ? `${clientName(summary.lowest.cliente)} (${(summary.lowest.margem_percentual || 0).toFixed(1)}%)`
        : '—',
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-rose-50',
    },
    {
      label: 'Receita Total',
      value: fmtBRL(summary.total),
      icon: DollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Rentabilidade</h1>
        <p className="text-slate-500 mt-1">Análise de faturamento e margens por cliente.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((kpi) => (
          <Card key={kpi.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{kpi.label}</p>
                  <p className="text-lg font-bold text-slate-900 mt-1 line-clamp-2">{kpi.value}</p>
                </div>
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    kpi.bg,
                    kpi.color,
                  )}
                >
                  <kpi.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Mês/Ano</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Margem Líquida</TableHead>
                <TableHead>% Margem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                    Nenhum dado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium text-slate-900">
                      {clientName(f.cliente)}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {MONTHS[(f.mes || 1) - 1]}/{f.ano}
                    </TableCell>
                    <TableCell className="text-slate-700 text-sm">{fmtBRL(f.receita)}</TableCell>
                    <TableCell className="text-slate-700 text-sm">
                      {fmtBRL(f.margem_liquida)}
                    </TableCell>
                    <TableCell className={cn(marginColor(f.margem_percentual || 0))}>
                      {(f.margem_percentual || 0).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
