import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getPropostas,
  updateProposta,
  PROPOSTA_STATUSES,
  type Proposta,
  type PropostaStatus,
} from '@/services/propostas'
import { getClients, PLANOS, type Client } from '@/services/clients'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'

const STATUS_VARIANTS: Record<PropostaStatus, 'default' | 'secondary' | 'destructive'> = {
  Enviada: 'secondary',
  'Em Discussão': 'default',
  Aceita: 'default',
  Recusada: 'destructive',
  Vencida: 'destructive',
}

export default function PropostasPage() {
  const { toast } = useToast()
  const [propostas, setPropostas] = useState<Proposta[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [planoFilter, setPlanoFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [editing, setEditing] = useState<Proposta | null>(null)
  const [form, setForm] = useState<Partial<Proposta>>({})

  const loadData = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([getPropostas(), getClients()])
      setPropostas(p as unknown as Proposta[])
      setClients(c as unknown as Client[])
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('propostas', () => loadData())

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name || '—'

  const filtered = useMemo(() => {
    return propostas.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (planoFilter !== 'all' && p.plano_proposto !== planoFilter) return false
      if (dateFrom && p.data_proposta < dateFrom) return false
      if (dateTo && p.data_proposta > dateTo) return false
      return true
    })
  }, [propostas, statusFilter, planoFilter, dateFrom, dateTo])

  const openEdit = (p: Proposta) => {
    setEditing(p)
    setForm({ ...p })
  }

  const handleSave = async () => {
    if (!editing) return
    try {
      await updateProposta(editing.id, form)
      toast({ title: 'Proposta atualizada.' })
      setEditing(null)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Propostas</h1>
        <p className="text-slate-500 mt-1">Painel comercial de propostas enviadas.</p>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {PROPOSTA_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={planoFilter} onValueChange={setPlanoFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {PLANOS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div>
            <Label className="text-xs">De</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Até</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>NPS</TableHead>
                <TableHead>CSAT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    Nenhuma proposta encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => openEdit(p)}
                  >
                    <TableCell className="font-medium text-slate-900">
                      {clientName(p.cliente)}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {p.data_proposta
                        ? new Date(p.data_proposta + 'T00:00:00').toLocaleDateString('pt-BR')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {p.plano_proposto || '—'}
                    </TableCell>
                    <TableCell className="text-slate-700 text-sm font-medium">
                      {p.valor_mensal
                        ? p.valor_mensal.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {p.status && <Badge variant={STATUS_VARIANTS[p.status]}>{p.status}</Badge>}
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">{p.nps_score ?? '—'}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{p.csat_score ?? '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Proposta</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status || ''}
                  onValueChange={(v) => setForm({ ...form, status: v as PropostaStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPOSTA_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plano Proposto</Label>
                <Select
                  value={form.plano_proposto || ''}
                  onValueChange={(v) => setForm({ ...form, plano_proposto: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANOS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor Mensal (R$)</Label>
                <Input
                  type="number"
                  value={form.valor_mensal || ''}
                  onChange={(e) => setForm({ ...form, valor_mensal: Number(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>NPS</Label>
                  <Input
                    type="number"
                    value={form.nps_score ?? ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        nps_score: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>CSAT</Label>
                  <Input
                    type="number"
                    value={form.csat_score ?? ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        csat_score: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
