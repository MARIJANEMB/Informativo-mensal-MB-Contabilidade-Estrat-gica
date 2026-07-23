import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Zap, Bell, FileBarChart2, TrendingDown, CheckCircle2, FileText } from 'lucide-react'

const AUTOMATIONS = [
  {
    name: 'generate_diagnosis',
    title: 'Diagnóstico com IA',
    description: 'Gera diagnóstico automático e plano de ação para relatórios mensais usando IA.',
    icon: FileBarChart2,
  },
  {
    name: 'low_nps_flagging',
    title: 'Flag NPS Baixo',
    description:
      'Quando nps_score < 7, adiciona automaticamente a tag "Satisfação Baixa" ao cliente.',
    icon: TrendingDown,
  },
  {
    name: 'notifications_check',
    title: 'Verificação de Notificações',
    description: 'Verifica tarefas vencendo em 3 dias e no dia atual, notificando o responsável.',
    icon: Bell,
  },
  {
    name: 'proposal_accepted',
    title: 'Proposta Aceita → Onboarding',
    description:
      'Quando uma proposta é aceita, cria uma tarefa de "Regularização" com vencimento em 5 dias.',
    icon: CheckCircle2,
  },
  {
    name: 'faturamento_margins_create',
    title: 'Cálculo de Margens (Criação)',
    description:
      'Calcula automaticamente margem bruta, operacional, líquida e percentual ao criar faturamento.',
    icon: Zap,
  },
  {
    name: 'faturamento_margins_update',
    title: 'Cálculo de Margens (Atualização)',
    description: 'Recalcula margens automaticamente ao atualizar dados de faturamento.',
    icon: Zap,
  },
]

export default function AutomacoesPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Automações</h1>
        <p className="text-slate-500 mt-1">Gatilhos e automações ativos no sistema.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AUTOMATIONS.map((auto) => (
          <Card key={auto.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <auto.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{auto.title}</CardTitle>
                    <p className="text-xs font-mono text-slate-400">{auto.name}</p>
                  </div>
                </div>
                <Switch checked disabled />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-slate-600">
                {auto.description}
              </CardDescription>
              <div className="mt-3 pt-3 border-t flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" /> Ativo
                </Badge>
                <span className="text-xs text-slate-400">Hook deployado no backend</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
