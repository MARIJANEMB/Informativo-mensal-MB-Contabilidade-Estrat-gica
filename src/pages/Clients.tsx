import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Building2, Plus, Pencil, Trash2, ArrowRight } from 'lucide-react'
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  type Client,
} from '@/services/clients'
import { getAllTaxObligations, type TaxObligation } from '@/services/tax-obligations'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'

export default function Clients() {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [obligations, setObligations] = useState<TaxObligation[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState({ name: '', cnpj: '', contact_email: '', contact_phone: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const now = new Date()

  const loadData = useCallback(async () => {
    try {
      const [c, o] = await Promise.all([
        getClients(),
        getAllTaxObligations(now.getMonth() + 1, now.getFullYear()),
      ])
      setClients(c as unknown as Client[])
      setObligations(o as unknown as TaxObligation[])
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('clients', () => {
    loadData()
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', cnpj: '', contact_email: '', contact_phone: '' })
    setDialogOpen(true)
  }
  const openEdit = (c: Client) => {
    setEditing(c)
    setForm({
      name: c.name,
      cnpj: c.cnpj,
      contact_email: c.contact_email,
      contact_phone: c.contact_phone,
    })
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
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
      } else {
        toast({
          title: 'Erro',
          description: err.message || 'Falha ao salvar.',
          variant: 'destructive',
        })
      }
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

  const pendingCount = (cid: string) =>
    obligations.filter((o) => o.client === cid && o.status === 'Pending').length

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
                <TableHead>CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-center">Pendências</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                    <Building2 className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                    Nenhum cliente cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link
                        to={`/clientes/${c.id}`}
                        className="font-medium text-slate-900 hover:text-primary"
                      >
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-500 font-mono text-sm">{c.cnpj}</TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {c.contact_email || '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      {pendingCount(c.id) > 0 ? (
                        <Badge variant="destructive">{pendingCount(c.id)}</Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          0
                        </Badge>
                      )}
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
                          <Link to={`/clientes/${c.id}`}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                value={form.cnpj}
                onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email de Contato</Label>
              <Input
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
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
