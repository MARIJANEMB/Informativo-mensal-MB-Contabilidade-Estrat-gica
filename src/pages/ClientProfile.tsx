import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ArrowLeft, FileBarChart2 } from 'lucide-react'
import { getClient, type Client } from '@/services/clients'
import { MonthlyDataForm } from '@/components/MonthlyDataForm'
import { TaxObligationList } from '@/components/TaxObligationList'
import { DocumentObligationList } from '@/components/DocumentObligationList'

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

export default function ClientProfile() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const [client, setClient] = useState<Client | null>(null)
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  useEffect(() => {
    if (!clientId) return
    getClient(clientId)
      .then((c) => setClient(c as unknown as Client))
      .catch(() => navigate('/clientes'))
  }, [clientId, navigate])

  if (!client) return <div className="text-center py-8 text-slate-500">Carregando...</div>

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/clientes')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{client.name}</h1>
          <p className="text-slate-500 mt-1">
            {client.cnpj}
            {client.contact_email && ` • ${client.contact_email}`}
          </p>
        </div>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">Competência:</span>
            <Select value={month.toString()} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={year.toString()} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[now.getFullYear(), now.getFullYear() - 1].map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => navigate(`/clientes/${clientId}/relatorio?month=${month}&year=${year}`)}
          >
            <FileBarChart2 className="w-4 h-4 mr-2" /> Gerar Relatório do Mês
          </Button>
        </CardContent>
      </Card>
      <Tabs defaultValue="data">
        <TabsList>
          <TabsTrigger value="data">Entradas</TabsTrigger>
          <TabsTrigger value="obligations">Obrigações Fiscais</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        <TabsContent value="data" className="mt-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <MonthlyDataForm clientId={clientId!} month={month} year={year} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="obligations" className="mt-6">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <TaxObligationList clientId={clientId!} month={month} year={year} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents" className="mt-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <DocumentObligationList clientId={clientId!} month={month} year={year} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-800 mb-2">Relatório Mensal</h3>
              <p className="text-sm text-slate-500 mb-4">
                Gere um relatório consolidado com notas, documentos e obrigações fiscais do mês
                selecionado.
              </p>
              <Button
                onClick={() =>
                  navigate(`/clientes/${clientId}/relatorio?month=${month}&year=${year}`)
                }
              >
                <FileBarChart2 className="w-4 h-4 mr-2" /> Gerar Relatório
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
