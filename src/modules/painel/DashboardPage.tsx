import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2,
  DollarSign,
  AlertCircle,
  TrendingUp,
  UserPlus,
  ClipboardList,
  FileBarChart2,
  BarChart3,
  Settings,
  Briefcase,
  FileText,
  RefreshCw,
} from 'lucide-react'
import { getActiveClients } from '@/services/clients'
import { getTarefas } from '@/services/tarefas'
import { getFaturamento } from '@/services/faturamento'
import { useRealtime } from '@/hooks/use-realtime'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeClients, setActiveClients] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [overdueTasks, setOverdueTasks] = useState(0)
  const [avgMargin, setAvgMargin] = useState(0)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [clients, tarefas, faturamento] = await Promise.all([
        getActiveClients(),
        getTarefas(),
        getFaturamento(),
      ])
      const clientList = (clients as any[]) || []
      const tarefaList = (tarefas as any[]) || []
      const fatList = (faturamento as any[]) || []

      setActiveClients(clientList.length)
      setTotalRevenue(clientList.reduce((sum, c) => sum + (c.valor_mensal || 0), 0))
      setOverdueTasks(tarefaList.filter((t) => t.status === 'Atrasada').length)
      const marg =
        fatList.length > 0
          ? fatList.reduce((sum, f) => sum + (f.margem_percentual || 0), 0) / fatList.length
          : 0
      setAvgMargin(marg)
    } catch (err) {
      console.error('Dashboard data fetch error:', err)
      setError(
        'Não foi possível carregar os dados do painel. Verifique sua conexão e tente novamente.',
      )
    } finally {
      setLoading(false)
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

  const moduleLinks = [
    {
      to: '/administrativo/clientes',
      title: 'Administrativo',
      desc: 'Clientes, Kanban e Timeline',
      icon: Briefcase,
    },
    {
      to: '/contabil/clientes',
      title: 'Contábil',
      desc: 'Clientes e Documentos',
      icon: FileText,
    },
    {
      to: '/fiscal/obrigacoes',
      title: 'Fiscal',
      desc: 'Obrigações e Relatórios',
      icon: ClipboardList,
    },
    {
      to: '/comercial/propostas',
      title: 'Comercial',
      desc: 'Propostas comerciais',
      icon: FileBarChart2,
    },
    {
      to: '/financeiro/rentabilidade',
      title: 'Financeiro',
      desc: 'Análise de rentabilidade',
      icon: BarChart3,
    },
    {
      to: '/configuracoes/marca',
      title: 'Configurações',
      desc: 'Marca, notificações e automações',
      icon: Settings,
    },
  ]

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center animate-fade-in max-w-6xl mx-auto">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Erro ao carregar dados</h2>
          <p className="text-sm text-slate-500 max-w-md">{error}</p>
        </div>
        <Button onClick={loadData} variant="default" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Painel Central</h1>
        <p className="text-slate-500 mt-1">Dashboard Executivo — Visão Geral</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                    <Skeleton className="w-12 h-12 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))
          : kpis.map((kpi) => (
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

      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Atalhos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="w-6 h-6 rounded" />
                  </CardContent>
                </Card>
              ))
            : moduleLinks.map((link) => (
                <Link key={link.to} to={link.to}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <link.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{link.title}</h3>
                          <p className="text-xs text-slate-500">{link.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/administrativo/kanban">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Nova Tarefa</h3>
                  <p className="text-xs text-slate-500">Kanban operacional</p>
                </div>
                <ClipboardList className="w-5 h-5 text-slate-300" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/comercial/propostas">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Nova Proposta</h3>
                  <p className="text-xs text-slate-500">Painel comercial</p>
                </div>
                <FileBarChart2 className="w-5 h-5 text-slate-300" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/financeiro/rentabilidade">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Lançamento Financeiro</h3>
                  <p className="text-xs text-slate-500">Análise de rentabilidade</p>
                </div>
                <BarChart3 className="w-5 h-5 text-slate-300" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/administrativo/clientes">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Novo Cliente</h3>
                  <p className="text-xs text-slate-500">Gerenciar clientes</p>
                </div>
                <UserPlus className="w-5 h-5 text-slate-300" />
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  )
}
