import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, DollarSign, AlertCircle, TrendingUp } from 'lucide-react'
import { getActiveClients } from '@/services/clients'
import { getTarefas } from '@/services/tarefas'
import { getFaturamento } from '@/services/faturamento'
import { useRealtime } from '@/hooks/use-realtime'

export default function DashboardPage() {
  const [activeClients, setActiveClients] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [overdueTasks, setOverdueTasks] = useState(0)
  const [avgMargin, setAvgMargin] = useState(0)

  const loadData = useCallback(async () => {
    try {
      const [clients, tarefas, faturamento] = await Promise.all([
        getActiveClients(),
        getTarefas(),
        getFaturamento(),
      ])
      setActiveClients((clients as any[]).length)
      setTotalRevenue((clients as any[]).reduce((sum, c) => sum + (c.valor_mensal || 0), 0))
      setOverdueTasks((tarefas as any[]).filter((t) => t.status === 'Atrasada').length)
      const fatList = faturamento as any[]
      const marg =
        fatList.length > 0
          ? fatList.reduce((sum, f) => sum + (f.margem_percentual || 0), 0) / fatList.length
          : 0
      setAvgMargin(marg)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('tarefas', () => loadData())
  useRealtime('clients', () => loadData())
  useRealtime('faturamento_mensal', () => loadData())

  const kpis = [
    {
      label: 'Clientes Ativos',
      value: activeClients.toString(),
      icon: Building2,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Receita Mensal',
      value: totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Tarefas Atrasadas',
      value: overdueTasks.toString(),
      icon: AlertCircle,
      color: 'text-destructive',
      bg: 'bg-rose-50',
    },
    {
      label: 'Margem Média',
      value: `${avgMargin.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Painel Central</h1>
        <p className="text-slate-500 mt-1">Dashboard Executivo — Visão Geral</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{kpi.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center`}
                >
                  <kpi.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/kanban">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Kanban Operacional</h3>
                <p className="text-xs text-slate-500">Tarefas por status</p>
              </div>
              <TrendingUp className="w-5 h-5 text-slate-300" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/faturamento">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Análise de Rentabilidade</h3>
                <p className="text-xs text-slate-500">Margens por cliente</p>
              </div>
              <DollarSign className="w-5 h-5 text-slate-300" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
