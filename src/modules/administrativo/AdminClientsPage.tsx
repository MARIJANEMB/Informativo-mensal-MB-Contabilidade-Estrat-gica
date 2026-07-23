import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { Building2, Search, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  getClients,
  STATUS_CLIENTE,
  REGIMES_TRIBUTARIOS,
  PLANOS,
  type Client,
} from '@/services/clients'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [regimeFilter, setRegimeFilter] = useState<string>('all')
  const [planoFilter, setPlanoFilter] = useState<string>('all')
  const [page, setPage] = useState(0)

  const loadData = useCallback(async () => {
    try {
      const c = await getClients()
      setClients(c as unknown as Client[])
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('clients', () => loadData())

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return clients.filter((c) => {
      if (q && !c.name?.toLowerCase().includes(q) && !c.cnpj?.toLowerCase().includes(q))
        return false
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (regimeFilter !== 'all' && c.regime_tributario !== regimeFilter) return false
      if (planoFilter !== 'all' && c.plano_contratado !== planoFilter) return false
      return true
    })
  }, [clients, search, statusFilter, regimeFilter, planoFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const statusColor: Record<string, string> = {
    Ativo: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    Inativo: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
    Cancelado: 'bg-rose-100 text-rose-700 hover:bg-rose-100',
    Diagnosticado: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clientes</h1>
        <p className="text-slate-500 mt-1">Gestão completa de clientes com filtros e paginação.</p>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v)
                setPage(0)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {STATUS_CLIENTE.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={regimeFilter}
              onValueChange={(v) => {
                setRegimeFilter(v)
                setPage(0)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Regime" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os regimes</SelectItem>
                {REGIMES_TRIBUTARIOS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={planoFilter}
              onValueChange={(v) => {
                setPlanoFilter(v)
                setPage(0)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os planos</SelectItem>
                {PLANOS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Regime</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    <Building2 className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-slate-900">{c.name}</TableCell>
                    <TableCell className="text-slate-500 font-mono text-sm">
                      {c.cnpj || '—'}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {c.regime_tributario || '—'}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {c.plano_contratado || '—'}
                    </TableCell>
                    <TableCell className="text-slate-700 text-sm font-medium">
                      {c.valor_mensal
                        ? c.valor_mensal.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {c.status && (
                        <Badge variant="secondary" className={statusColor[c.status]}>
                          {c.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" asChild>
                        <Link to={`/administrativo/clientes/${c.id}`}>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {filtered.length} clientes • Página {page + 1} de {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
