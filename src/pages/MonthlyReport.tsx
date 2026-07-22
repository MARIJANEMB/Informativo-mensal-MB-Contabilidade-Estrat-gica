import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getClient, type Client } from '@/services/clients'
import { getMonthlyRecord, fileUrl, type MonthlyRecord } from '@/services/monthly-records'
import {
  getTaxObligations,
  type TaxObligation,
  type ObligationStatus,
} from '@/services/tax-obligations'
import {
  getDocumentObligations,
  generateDiagnosis,
  type DocumentObligation,
} from '@/services/document-obligations'
import { ArrowLeft, Printer, Sparkles, Loader2, ClipboardList } from 'lucide-react'

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
const STATUS_PT: Record<ObligationStatus, string> = {
  Pending: 'Pendente',
  Paid: 'Pago',
  Exempt: 'Isento',
  'Not Applicable': 'Não Aplicável',
}

const DOC_STATUS_VARIANTS: Record<string, 'destructive' | 'default' | 'secondary'> = {
  Pendente: 'destructive',
  Recebido: 'default',
  'Não Necessário': 'secondary',
}

interface DiagnosisResult {
  diagnosis: string
  actionPlan: string[]
}

export default function MonthlyReport() {
  const { clientId } = useParams<{ clientId: string }>()
  const [params] = useSearchParams()
  const month = Number(params.get('month') || new Date().getMonth() + 1)
  const year = Number(params.get('year') || new Date().getFullYear())
  const [client, setClient] = useState<Client | null>(null)
  const [record, setRecord] = useState<MonthlyRecord | null>(null)
  const [obligations, setObligations] = useState<TaxObligation[]>([])
  const [documents, setDocuments] = useState<DocumentObligation[]>([])
  const [loading, setLoading] = useState(true)
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!clientId) return
    Promise.all([
      getClient(clientId),
      getMonthlyRecord(clientId, month, year),
      getTaxObligations(clientId, month, year),
      getDocumentObligations(clientId, month, year),
    ])
      .then(([c, r, o, d]) => {
        setClient(c as unknown as Client)
        setRecord(r as unknown as MonthlyRecord)
        setObligations(o as unknown as TaxObligation[])
        setDocuments(d as unknown as DocumentObligation[])
      })
      .finally(() => setLoading(false))
  }, [clientId, month, year])

  const handleGenerateDiagnosis = async () => {
    if (!clientId) return
    setGenerating(true)
    setDiagnosis(null)
    try {
      const result = (await generateDiagnosis(clientId, month, year)) as unknown as DiagnosisResult
      setDiagnosis(result)
    } catch (err: any) {
      setDiagnosis({
        diagnosis: 'Não foi possível gerar o diagnóstico. Tente novamente.',
        actionPlan: [],
      })
    }
    setGenerating(false)
  }

  if (loading) return <div className="text-center py-8 text-slate-500">Carregando...</div>
  if (!client) return <div className="text-center py-8 text-slate-500">Cliente não encontrado.</div>

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="no-print mb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/clientes/${clientId}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <Button onClick={() => window.print()} variant="outline">
          <Printer className="w-4 h-4 mr-2" /> Imprimir / PDF
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8 md:p-12 print-page space-y-8">
        <div className="border-b-2 border-slate-800 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
              <p className="text-slate-500 text-sm mt-1">CNPJ: {client.cnpj}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-800">Relatório Mensal</h2>
              <p className="text-slate-500 text-sm">
                {MONTHS[month - 1]} {year}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Gerado em: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-3">Notas do Mês</h3>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {record?.notes || 'Nenhuma nota registrada para este mês.'}
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-3">Documentos Anexados</h3>
          {record?.attachments && record.attachments.length > 0 ? (
            <ul className="space-y-2">
              {record.attachments.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                    {i + 1}
                  </span>
                  <a href={fileUrl(record.id, f)} download className="text-primary hover:underline">
                    {f}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Nenhum documento anexado.</p>
          )}
        </section>

        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-3">Obrigações Fiscais</h3>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead>Obrigação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Pagamento</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obligations.map((o) => (
                <TableRow key={o.id} className="border-slate-100">
                  <TableCell className="font-medium">{o.obligation_name}</TableCell>
                  <TableCell>{STATUS_PT[o.status]}</TableCell>
                  <TableCell>
                    {o.payment_date
                      ? new Date(o.payment_date + 'T00:00:00').toLocaleDateString('pt-BR')
                      : '—'}
                  </TableCell>
                  <TableCell className="text-slate-500">{o.observations || '—'}</TableCell>
                </TableRow>
              ))}
              {obligations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-400">
                    Nenhuma obrigação registrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>

        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-3">Documentos Pendentes</h3>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Arquivo</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((d) => (
                <TableRow key={d.id} className="border-slate-100">
                  <TableCell className="font-medium">{d.document_type}</TableCell>
                  <TableCell>
                    <Badge variant={DOC_STATUS_VARIANTS[d.status] || 'secondary'}>{d.status}</Badge>
                  </TableCell>
                  <TableCell>{d.proof ? 'Anexado' : '—'}</TableCell>
                  <TableCell className="text-slate-500">{d.observations || '—'}</TableCell>
                </TableRow>
              ))}
              {documents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-400">
                    Nenhum documento registrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>

        <section className="no-print">
          <div className="border-t-2 border-slate-200 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-slate-800">Diagnóstico com IA</h3>
            </div>
            <Button onClick={handleGenerateDiagnosis} disabled={generating} className="mb-4">
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" /> Gerar Diagnóstico
                </>
              )}
            </Button>
            {diagnosis && (
              <div className="space-y-4 animate-fade-in">
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-700 leading-relaxed">{diagnosis.diagnosis}</p>
                  </CardContent>
                </Card>
                {diagnosis.actionPlan.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <ClipboardList className="w-4 h-4 text-slate-600" />
                        <h4 className="font-semibold text-slate-800">Plano de Ação</h4>
                      </div>
                      <ol className="space-y-2">
                        {diagnosis.actionPlan.map((item, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-700">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                              {i + 1}
                            </span>
                            <span className="pt-0.5">{item}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="border-t-2 border-slate-200 pt-6 text-center">
          <p className="text-sm font-semibold text-slate-600">
            MB Contabilidade – Relatório Mensal de Inteligência
          </p>
        </div>
      </div>
    </div>
  )
}
