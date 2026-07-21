import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle2, Clock, FileWarning, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import useAppStore from '@/stores/use-app-store'
import { cn } from '@/lib/utils'

export default function Index() {
  const { tickets, pendencies, taxes } = useAppStore()

  const activeTickets = tickets.filter((t) => t.status === 'active').length
  const pendingDocs = pendencies.filter((p) => p.status === 'pending').length
  const overdueTaxes = taxes.filter((t) => t.status === 'overdue').length
  const isTaxAlert = overdueTaxes > 0

  const steps = ['Documentação', 'Processamento', 'Auditoria', 'Relatório Final']
  const currentStep = 1 // Processamento (0-indexed)
  const progressPct = (currentStep / (steps.length - 1)) * 100

  const urgentActions = [
    ...taxes
      .filter((t) => t.status === 'overdue')
      .map((t) => ({ id: t.id, title: `Guia em Atraso: ${t.name}`, type: 'tax', urgent: true })),
    ...pendencies
      .filter((p) => p.status === 'pending')
      .map((p) => ({ id: p.id, title: `Falta Documento: ${p.title}`, type: 'doc', urgent: false })),
    ...tickets
      .filter((t) => t.status === 'active' && t.urgent)
      .map((t) => ({ id: t.id, title: `Atenção: ${t.title}`, type: 'ticket', urgent: true })),
  ].slice(0, 4)

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Visão Geral</h1>
          <p className="text-slate-500 mt-1">Resumo das atividades da Acme Corp LTDA.</p>
        </div>
        <Badge variant="outline" className="w-fit bg-white px-3 py-1 font-medium">
          Competência: Agosto 2026
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Atendimentos Ativos
            </CardTitle>
            <Clock className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{activeTickets}</div>
            <p className="text-xs text-slate-500 mt-1">{tickets.length} total no histórico</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Pendências Documentais
            </CardTitle>
            <FileWarning className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{pendingDocs}</div>
            <p className="text-xs text-slate-500 mt-1">Envie até o dia 10</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Saúde Tributária</CardTitle>
            {isTaxAlert ? (
              <AlertCircle className="w-4 h-4 text-destructive" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                isTaxAlert ? 'text-destructive' : 'text-emerald-600',
              )}
            >
              {isTaxAlert ? 'Alerta' : 'Em dia'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {overdueTaxes > 0 ? `${overdueTaxes} guia(s) vencida(s)` : 'Nenhum débito pendente'}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Fechamento do Mês</CardTitle>
            <PieChart className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">Em Andamento</div>
            <Progress value={progressPct} className="h-2 mt-3" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Progresso do Fechamento (Agosto 2026)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative flex justify-between items-start mt-8 pb-4">
              <div className="absolute left-0 top-4 w-full h-[2px] bg-slate-100 z-0"></div>
              <div
                className="absolute left-0 top-4 h-[2px] bg-primary z-0 transition-all duration-1000"
                style={{ width: `${progressPct}%` }}
              ></div>

              {steps.map((step, idx) => {
                const isActive = idx === currentStep
                const isPast = idx < currentStep
                return (
                  <div
                    key={idx}
                    className="relative z-10 flex flex-col items-center gap-3 w-24 text-center"
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors',
                        isPast
                          ? 'bg-primary text-primary-foreground border-primary'
                          : isActive
                            ? 'bg-white text-primary border-primary ring-4 ring-primary/10'
                            : 'bg-white text-slate-300 border-slate-200',
                      )}
                    >
                      {isPast ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isActive || isPast ? 'text-slate-800' : 'text-slate-400',
                      )}
                    >
                      {step}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Ações Necessárias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {urgentActions.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                Tudo em dia! Nenhuma ação pendente.
              </p>
            ) : (
              urgentActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-800 line-clamp-2">
                      {action.title}
                    </p>
                    {action.urgent && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        Urgente
                      </Badge>
                    )}
                  </div>
                  <Link
                    to={
                      action.type === 'tax' || action.type === 'doc'
                        ? '/pendencias'
                        : '/atendimentos'
                    }
                    className="text-primary hover:text-primary/80 shrink-0 mt-0.5"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
