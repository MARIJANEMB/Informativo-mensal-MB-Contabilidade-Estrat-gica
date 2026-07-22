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
import { FileText } from 'lucide-react'
import { getClients, type Client } from '@/services/clients'
import { getAllDocumentObligations, type DocumentObligation } from '@/services/document-obligations'
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

export default function DocumentsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [clients, setClients] = useState<Client[]>([])
  const [documents, setDocuments] = useState<DocumentObligation[]>([])

  const loadData = useCallback(async () => {
    try {
      const [c, d] = await Promise.all([getClients(), getAllDocumentObligations(month, year)])
      setClients(c as unknown as Client[])
      setDocuments(d as unknown as DocumentObligation[])
    } catch (err) {
      console.error(err)
    }
  }, [month, year])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('document_obligations', () => loadData())
  useRealtime('clients', () => loadData())

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name || '—'

  const pending = documents.filter((d) => d.status === 'Pendente').length
  const received = documents.filter((d) => d.status === 'Recebido').length

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Documentos</h1>
        <p className="text-slate-500 mt-1">Visão geral de documentos de todos os clientes.</p>
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
            <p className="text-3xl font-bold text-slate-900">{documents.length}</p>
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
            <p className="text-sm text-slate-500">Recebidos</p>
            <p className="text-3xl font-bold text-emerald-600">{received}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                    <FileText className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                    Nenhum documento registrado.
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Link
                        to={`/contabil/clientes/${d.client}`}
                        className="font-medium text-slate-900 hover:text-primary"
                      >
                        {clientName(d.client)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-700">{d.document_type}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          d.status === 'Pendente'
                            ? 'destructive'
                            : d.status === 'Recebido'
                              ? 'default'
                              : 'secondary'
                        }
                      >
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 max-w-[200px] truncate">
                      {d.observations || '—'}
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
