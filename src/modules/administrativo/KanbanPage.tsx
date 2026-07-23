import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  getTarefas,
  updateTarefa,
  KANBAN_COLUMNS,
  type Tarefa,
  type TarefaStatus,
} from '@/services/tarefas'
import { getClients, type Client } from '@/services/clients'
import { getEmployees, type Employee } from '@/services/employees'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

export default function KanbanPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [draggedId, setDraggedId] = useState<string | null>(null)

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

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name || '—'
  const empName = (id: string) => employees.find((e) => e.id === id)?.name || '—'

  const isOverdue = (t: Tarefa) => {
    if (t.status === 'Concluída' || !t.data_vencimento) return false
    return new Date(t.data_vencimento + 'T23:59:59') < new Date()
  }

  const handleDrop = async (status: TarefaStatus) => {
    if (!draggedId) return
    const task = tarefas.find((t) => t.id === draggedId)
    if (!task || task.status === status) {
      setDraggedId(null)
      return
    }
    setTarefas((prev) => prev.map((t) => (t.id === draggedId ? { ...t, status } : t)))
    try {
      await updateTarefa(draggedId, { status })
    } catch (err) {
      console.error(err)
    }
    setDraggedId(null)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Kanban Operacional</h1>
        <p className="text-slate-500 mt-1">Arraste cartões entre colunas para alterar o status.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = tarefas.filter((t) => t.status === col)
          return (
            <div
              key={col}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col)}
              className="bg-slate-100 rounded-lg p-3 min-h-[400px] transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-slate-700">{col}</h3>
                <span className="text-xs font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {colTasks.map((t) => (
                  <Card
                    key={t.id}
                    draggable
                    onDragStart={() => setDraggedId(t.id)}
                    className={cn(
                      'cursor-move transition-shadow hover:shadow-md',
                      isOverdue(t) && 'border-l-4 border-l-red-500',
                    )}
                  >
                    <CardContent className="p-3">
                      <p className="text-sm font-medium text-slate-900 line-clamp-2">
                        {t.descricao || t.tipo}
                      </p>
                      <div className="mt-2 space-y-0.5">
                        <p className="text-xs text-slate-500">{clientName(t.cliente)}</p>
                        <p className="text-xs text-slate-400">
                          {t.data_vencimento
                            ? new Date(t.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')
                            : 'Sem prazo'}
                        </p>
                        <p className="text-xs text-slate-400">{empName(t.responsavel)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {colTasks.length === 0 && (
                  <p className="text-xs text-slate-300 text-center py-4">Vazio</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
