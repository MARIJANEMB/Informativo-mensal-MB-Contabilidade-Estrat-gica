import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, FileBarChart2, Download, AlertCircle, Building2 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, PieChart, Pie, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/use-app-store'
import { cn } from '@/lib/utils'

const expenseData = [
  { month: 'Mar', valor: 13500 },
  { month: 'Abr', valor: 18000 },
  { month: 'Mai', valor: 16000 },
  { month: 'Jun', valor: 21000 },
  { month: 'Jul', valor: 19500 },
  { month: 'Ago', valor: 17200 },
]

const taxDistData = [
  { name: 'Simples Nacional', value: 5432, fill: 'var(--color-simples)' },
  { name: 'ICMS ST', value: 1250, fill: 'var(--color-icms)' },
  { name: 'INSS Patronal', value: 3450, fill: 'var(--color-inss)' },
]

const chartConfig = {
  simples: { label: 'Simples Nacional', color: 'hsl(var(--chart-1))' },
  icms: { label: 'ICMS ST', color: 'hsl(var(--chart-2))' },
  inss: { label: 'INSS Patronal', color: 'hsl(var(--chart-3))' },
  valor: { label: 'Despesas (R$)', color: 'hsl(var(--primary))' },
}

export default function Closing() {
  const { pendencies, taxes } = useAppStore()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showReport, setShowReport] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setShowReport(true)
      toast({
        title: 'Relatório Gerado',
        description: 'O relatório executivo mensal está pronto para visualização e download.',
      })
    }, 1500)
  }

  const overdueTaxes = taxes.filter((t) => t.status === 'overdue')
  const pendingDocs = pendencies.filter((p) => p.status === 'pending')

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Fechamento & Relatórios
          </h1>
          <p className="text-slate-500 mt-1">
            Acompanhe o status do mês e gere insights executivos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              Módulo Fiscal
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              Apuração de impostos e entrega de declarações concluídas.
            </p>
            <div className="mt-4 pt-4 border-t flex justify-between text-sm">
              <span className="font-medium text-slate-700">Status</span>
              <Badge
                variant="outline"
                className="text-emerald-700 bg-emerald-50 border-emerald-200"
              >
                100% Concluído
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              Folha de Pagamento
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              Recibos, pró-labore e eSocial transmitidos com sucesso.
            </p>
            <div className="mt-4 pt-4 border-t flex justify-between text-sm">
              <span className="font-medium text-slate-700">Status</span>
              <Badge
                variant="outline"
                className="text-emerald-700 bg-emerald-50 border-emerald-200"
              >
                100% Concluído
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-500/20 bg-amber-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              Contábil
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              Aguardando documentos para conciliação bancária.
            </p>
            <div className="mt-4 pt-4 border-t flex justify-between text-sm">
              <span className="font-medium text-slate-700">Status</span>
              <Badge variant="secondary" className="text-amber-800 bg-amber-100">
                80% Concluído
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {!showReport && !isGenerating && (
        <div className="flex justify-center mt-12 mb-8">
          <Button
            size="lg"
            className="h-14 px-8 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            onClick={handleGenerate}
          >
            <FileBarChart2 className="w-5 h-5 mr-2" />
            Gerar Relatório Executivo Mensal
          </Button>
        </div>
      )}

      {isGenerating && (
        <Card className="max-w-4xl mx-auto mt-12 p-8 border-slate-200 shadow-xl rounded-xl">
          <div className="space-y-6">
            <div className="flex justify-between">
              <Skeleton className="h-10 w-[300px]" />
              <Skeleton className="h-10 w-[150px]" />
            </div>
            <Skeleton className="h-4 w-[250px]" />
            <div className="grid grid-cols-2 gap-8 mt-8">
              <Skeleton className="h-[250px] w-full" />
              <Skeleton className="h-[250px] w-full" />
            </div>
          </div>
        </Card>
      )}

      {showReport && (
        <div className="max-w-4xl mx-auto mt-12 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-up">
          <div className="bg-slate-900 text-white p-8 flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Insight Executivo Mensal</h2>
              <p className="text-slate-400 mt-2 text-lg">Competência: Agosto 2026</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 text-slate-300 mb-1">
                <Building2 className="w-4 h-4" />
                <h3 className="font-semibold text-white">Acme Corp LTDA</h3>
              </div>
              <p className="text-sm text-slate-400 font-mono">CNPJ: 12.345.678/0001-90</p>
            </div>
          </div>

          <div className="p-8 space-y-10">
            {/* Sec 1: Resumo */}
            <section>
              <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">
                Resumo Financeiro e Tributário
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">
                    Evolução de Despesas
                  </h4>
                  <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <BarChart data={expenseData}>
                      <CartesianGrid vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        fontSize={12}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="valor" fill="var(--color-valor)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">
                    Distribuição Tributária
                  </h4>
                  <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <PieChart>
                      <Pie
                        data={taxDistData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {taxDistData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="flex justify-center gap-4 mt-2">
                    {taxDistData.map((tax, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: `var(--chart-${i + 1})` }}
                        />
                        {tax.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Sec 2: Plano de Ação */}
            <section>
              <div className="bg-rose-50 border-l-4 border-destructive p-6 rounded-r-xl">
                <h3 className="text-lg font-bold text-destructive flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5" /> Plano de Ação Estratégico
                </h3>
                <p className="text-sm text-slate-700 mb-4">
                  Com base nas análises deste mês, recomendamos as seguintes ações imediatas para
                  manter a regularidade da empresa:
                </p>
                <ul className="space-y-3">
                  {overdueTaxes.map((tax) => (
                    <li
                      key={tax.id}
                      className="flex items-start gap-3 bg-white p-3 rounded border border-rose-100 shadow-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-rose-100 text-destructive flex items-center justify-center shrink-0 font-bold text-sm">
                        !
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">
                          Regularizar {tax.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Guia encontra-se vencida desde {tax.dueDate}. O atraso gera multas
                          diárias.
                        </p>
                      </div>
                    </li>
                  ))}
                  {pendingDocs.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-start gap-3 bg-white p-3 rounded border border-rose-100 shadow-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-sm">
                        ?
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">Enviar {doc.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Necessário para concluir o fechamento do departamento{' '}
                          {doc.dept === 'fiscal'
                            ? 'Fiscal'
                            : doc.dept === 'hr'
                              ? 'Pessoal'
                              : 'Contábil'}
                          .
                        </p>
                      </div>
                    </li>
                  ))}
                  {overdueTaxes.length === 0 && pendingDocs.length === 0 && (
                    <li className="text-emerald-600 font-medium text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Nenhuma ação crítica pendente. Parabéns
                      pela organização!
                    </li>
                  )}
                </ul>
              </div>
            </section>
          </div>

          <div className="bg-slate-50 p-6 border-t flex justify-end">
            <Button variant="outline" className="bg-white">
              <Download className="w-4 h-4 mr-2" /> Exportar PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
