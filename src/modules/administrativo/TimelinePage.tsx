import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getTarefas, updateTarefa, type Tarefa, type TarefaStatus } from '@/services/tarefas'
import { getClients, type Client } from '@/services/clients'
import { getEmployees, type Employee } from '@/services/employees'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
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
const STATUS_COLORS: Record<string, string> = {
  'Não Iniciada': 'bg-slate-200 text-slate-700',
  'Em Andamento': 'bg-blue-200 text-blue-700',
  'Aguardando Cliente': 'bg-amber-200 text-amber-700',
  Concluída: 'bg-emerald-200 text-emerald-700',
  Atrasada: 'bg-red-200 text-red-700',
}

export default function TimelinePage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selected, setSelected] = useState<Tarefa | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [t, c, e] = await Promise.all([getTarefas(), getClients(), getEmployees()])
      setTarefas(t as unknown as Tarefa[])
      setClients(c as unknown as Client[])
      setEmployees(e as unknown as Employee[])
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('tarefas', () => loadData())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  const clientName = (id: string) => clients.find((c) => c.id === id)?.name || '—'
  const empName = (id: string) => employees.find((e) => e.id === id)?.name || '—'

  const tasksOnDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return tarefas.filter((t) => t.data_vencimento === dateStr)
  }

  const handleStatusChange = async (id: string, status: TarefaStatus) => {
    setTarefas((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev))
    try {
      await updateTarefa(id, { status })
    } catch (err) {
      console.error(err)
    }
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Timeline</h1>
          <p className="text-slate-500 mt-1">Prazos de tarefas por data de vencimento.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-semibold text-slate-700 min-w-[140px] text-center">
            {MONTHS[month]} {year}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={idx} />
              const dayTasks = tasksOnDay(day)
              return (
                <div
                  key={idx}
                  className={cn(
                    'min-h-[80px] border rounded-lg p-1.5 text-xs',
                    isToday(day) ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50',
                  )}
                >
                  <span className="font-semibold text-slate-600">{day}</span>
                  <div className="mt-1 space-y-0.5">
                    {dayTasks.slice(0, 3).map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelected(t)}
                        className={cn(
                          'px-1.5 py-0.5 rounded text-[10px] cursor-pointer truncate hover:opacity-80',
                          STATUS_COLORS[t.status] || 'bg-slate-200',
                        )}
                      >
                        {t.descricao || t.tipo}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <p className="text-[10px] text-slate-400">+{dayTasks.length - 3} mais</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.descricao || selected?.tipo}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <span className="font-medium">{clientName(selected.cliente)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Responsável:</span>
                <span className="font-medium">{empName(selected.responsavel)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vencimento:</span>
                <span className="font-medium">
                  {selected.data_vencimento
                    ? new Date(selected.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status:</span>
                <Select
                  value={selected.status}
                  onValueChange={(v) => handleStatusChange(selected.id, v as TarefaStatus)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(STATUS_COLORS).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
