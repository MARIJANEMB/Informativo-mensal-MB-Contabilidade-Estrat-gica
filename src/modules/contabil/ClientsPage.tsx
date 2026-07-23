import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, Plus, Pencil, Trash2, ArrowRight } from 'lucide-react'
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  REGIMES_TRIBUTARIOS,
  PLANOS,
  STATUS_CLIENTE,
  TAGS_CLIENTE,
  type Client,
} from '@/services/clients'
import { getEmployees, type Employee } from '@/services/employees'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'

const emptyForm: Partial<Client> = { name: '', cnpj: '', status: 'Ativo', tags: [] }

export default function ClientsPage() {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState<Partial<Client>>(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const loadData = useCallback(async () => {
    try {
      const [c, e] = await Promise.all([getClients(), getEmployees()])
      setClients(c as unknown as Client[])
      setEmployees(e as unknown as Employee[])
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('clients', () => loadData())

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }
  const openEdit = (c: Client) => {
    setEditing(c)
    setForm({ ...c })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setFieldErrors({})
    try {
      if (editing) await updateClient(editing.id, form)
      else await createClient(form)
      setDialogOpen(false)
      toast({ title: 'Sucesso', description: editing ? 'Cliente atualizado.' : 'Cliente criado.' })
    } catch (err: any) {
      const errors = extractFieldErrors(err)
      if (Object.keys(errors).length > 0) setFieldErrors(errors)
      else toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteClient(id)
      toast({ title: 'Cliente excluído.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const toggleTag = (tag: string) => {
    const tags = form.tags || []
    setForm({ ...form, tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] })
  }

  const statusColor: Record<string, string> = {
    Ativo: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    Inativo: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
    Cancelado: 'bg-rose-100 text-rose-700 hover:bg-rose-100',
    Diagnosticado: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clientes</h1>
          <p className="text-slate-500 mt-1">Gerencie as empresas clientes.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Novo Cliente
        </Button>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Regime</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    <Building2 className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                    Nenhum cliente cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link
                        to={`/contabil/clientes/${c.id}`}
                        className="font-medium text-slate-900 hover:text-primary"
                      >
                        {c.name}
                      </Link>
                      <p className="text-xs text-slate-400 font-mono">{c.cnpj}</p>
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
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(c.tags || []).slice(0, 2).map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px]">
                            {t}
                          </Badge>
                        ))}
                        {(c.tags || []).length > 2 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{c.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(c)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        <Button size="icon" variant="ghost" asChild>
                          <Link to={`/contabil/clientes/${c.id}`}>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Nome *</Label>
              <Input
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {fieldErrors.name && <p className="text-sm text-red-500">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                value={form.cnpj || ''}
                onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
              />
              {fieldErrors.cnpj && <p className="text-sm text-red-500">{fieldErrors.cnpj}</p>}
            </div>
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={form.data_inicio || ''}
                onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Regime Tributário</Label>
              <Select
                value={form.regime_tributario || ''}
                onValueChange={(v) => setForm({ ...form, regime_tributario: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {REGIMES_TRIBUTARIOS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plano Contratado</Label>
              <Select
                value={form.plano_contratado || ''}
                onValueChange={(v) => setForm({ ...form, plano_contratado: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
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
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status || 'Ativo'}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_CLIENTE.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contato Principal</Label>
              <Input
                value={form.contato_principal || ''}
                onChange={(e) => setForm({ ...form, contato_principal: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Celular</Label>
              <Input
                value={form.celular || ''}
                onChange={(e) => setForm({ ...form, celular: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email Secundário</Label>
              <Input
                value={form.email_secundario || ''}
                onChange={(e) => setForm({ ...form, email_secundario: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                value={form.endereco || ''}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Responsável MB</Label>
              <Select
                value={form.responsavel_mb || ''}
                onValueChange={(v) => setForm({ ...form, responsavel_mb: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {TAGS_CLIENTE.map((tag) => (
                  <Badge
                    key={tag}
                    variant={(form.tags || []).includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Notas</Label>
              <Textarea
                value={form.notas || ''}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                className="min-h-[60px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
