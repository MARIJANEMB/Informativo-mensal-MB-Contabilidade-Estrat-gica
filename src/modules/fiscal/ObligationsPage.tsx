import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ClipboardList } from 'lucide-react'
import { getClients, type Client } from '@/services/clients'
import {
  getAllTaxObligations,
  type TaxObligation,
  type ObligationStatus,
} from '@/services/tax-obligations'
import { useRealtime } from '@/hooks/use-realtime'

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

const STATUS_LABELS: Record<ObligationStatus, string> = {
  Pending: 'Pendente',
  Paid: 'Pago',
  Exempt: 'Isento',
  'Not Applicable': 'Não Aplicável',
}

const STATUS_VARIANTS: Record<ObligationStatus, 'destructive' | 'default' | 'secondary'> = {
  Pending: 'destructive',
  Paid: 'default',
  Exempt: 'secondary',
  'Not Applicable': 'secondary',
}

export default function ObligationsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [clients, setClients] = useState<Client[]>([])
  const [obligations, setObligations] = useState<TaxObligation[]>([])

  const loadData = useCallback(async () => {
    try {
      const [c, o] = await Promise.all([getClients(), getAllTaxObligations(month, year)])
      setClients(c as unknown as Client[])
      setObligations(o as unknown as TaxObligation[])
    } catch (err) {
      console.error(err)
    }
  }, [month, year])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('tax_obligations', () => loadData())
  useRealtime('clients', () => loadData())

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name || '—'

  const pending = obligations.filter((o) => o.status === 'Pending').length
  const paid = obligations.filter((o) => o.status === 'Paid').length

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Obrigações Fiscais</h1>
        <p className="text-slate-500 mt-1">Visão geral de obrigações de todos os clientes.</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-3xl font-bold text-slate-900">{obligations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Pendentes</p>
            <p className="text-3xl font-bold text-amber-500">{pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Pagas</p>
            <p className="text-3xl font-bold text-emerald-600">{paid}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Obrigação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obligations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                    <ClipboardList className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                    Nenhuma obrigação registrada.
                  </TableCell>
                </TableRow>
              ) : (
                obligations.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link
                        to={`/contabil/clientes/${o.client}`}
                        className="font-medium text-slate-900 hover:text-primary"
                      >
                        {clientName(o.client)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-700">{o.obligation_name}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[o.status]}>{STATUS_LABELS[o.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {o.payment_date
                        ? new Date(o.payment_date + 'T00:00:00').toLocaleDateString('pt-BR')
                        : '—'}
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
