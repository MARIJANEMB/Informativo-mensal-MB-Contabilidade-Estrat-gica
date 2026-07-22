import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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
import { ArrowLeft, Printer } from 'lucide-react'

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

export default function MonthlyReport() {
  const { clientId } = useParams<{ clientId: string }>()
  const [params] = useSearchParams()
  const month = Number(params.get('month') || new Date().getMonth() + 1)
  const year = Number(params.get('year') || new Date().getFullYear())
  const [client, setClient] = useState<Client | null>(null)
  const [record, setRecord] = useState<MonthlyRecord | null>(null)
  const [obligations, setObligations] = useState<TaxObligation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!clientId) return
    Promise.all([
      getClient(clientId),
      getMonthlyRecord(clientId, month, year),
      getTaxObligations(clientId, month, year),
    ])
      .then(([c, r, o]) => {
        setClient(c as unknown as Client)
        setRecord(r as unknown as MonthlyRecord)
        setObligations(o as unknown as TaxObligation[])
      })
      .finally(() => setLoading(false))
  }, [clientId, month, year])

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
        <Button onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Imprimir / PDF
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8 md:p-12 print-page">
        <div className="border-b-2 border-slate-800 pb-6 mb-8">
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
        <section className="mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-3">Notas do Mês</h3>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {record?.notes || 'Nenhuma nota registrada para este mês.'}
            </p>
          </div>
        </section>
        <section className="mb-8">
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
        <section className="mb-8">
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
        <div className="border-t-2 border-slate-200 pt-6 text-center">
          <p className="text-sm font-semibold text-slate-600">
            MB Contabilidade – Relatório Mensal de Inteligência
          </p>
        </div>
      </div>
    </div>
  )
}
