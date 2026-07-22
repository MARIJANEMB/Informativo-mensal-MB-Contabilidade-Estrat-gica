import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Users, Plus, Pencil, Trash2, ArrowUpDown, Search } from 'lucide-react'
import { getEmployees, deleteEmployee, type Employee, type Department } from '@/services/employees'
import { EmployeeForm } from '@/components/EmployeeForm'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type SortField = 'name' | 'email' | 'department' | 'role'
type SortDir = 'asc' | 'desc'

const deptColors: Record<Department, string> = {
  Fiscal: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  Contábil: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  Folha: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  Outros: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
}

export default function Employees() {
  const { toast } = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const data = await getEmployees()
      setEmployees(data as unknown as Employee[])
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('employees', () => {
    loadData()
  })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const list = employees.filter(
      (e) =>
        e.name?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.role?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q),
    )
    list.sort((a, b) => {
      const av = (a[sortField] || '').toLowerCase()
      const bv = (b[sortField] || '').toLowerCase()
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return list
  }, [employees, search, sortField, sortDir])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (e: Employee) => {
    setEditing(e)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteEmployee(deleteId)
      toast({ title: 'Colaborador excluído.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
    setDeleteId(null)
  }

  const renderSortHeader = (field: SortField, label: string) => (
    <TableHead
      onClick={() => toggleSort(field)}
      className="cursor-pointer select-none hover:text-slate-900"
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={cn('w-3 h-3', sortField === field ? 'text-primary' : 'text-slate-300')}
        />
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Colaboradores</h1>
          <p className="text-slate-500 mt-1">Gerencie a equipe MB Contábil.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Novo Colaborador
        </Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Buscar por nome, email, cargo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                {renderSortHeader('name', 'Nome')}
                {renderSortHeader('email', 'Email')}
                <TableHead>Telefone</TableHead>
                {renderSortHeader('role', 'Cargo')}
                {renderSortHeader('department', 'Departamento')}
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <Users className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                    Nenhum colaborador encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium text-slate-900">{e.name}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{e.email}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{e.phone || '—'}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{e.role || '—'}</TableCell>
                    <TableCell>
                      {e.department && (
                        <Badge
                          className={deptColors[e.department as Department]}
                          variant="secondary"
                        >
                          {e.department}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(e)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(e.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
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

      <EmployeeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={loadData}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é permanente e não pode ser desfeita. O colaborador será removido
              permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
