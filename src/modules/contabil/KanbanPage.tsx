import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTarefas, updateTarefa, STATUS_TAREFA, type Tarefa } from '@/services/tarefas'
import { getClients, type Client } from '@/services/clients'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const COLUMNS = ['Não Iniciada', 'Em Andamento', 'Aguardando Cliente', 'Concluída']

export default function KanbanPage() {
  const { toast } = useToast()
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [t, c] = await Promise.all([getTarefas(), getClients()])
      setTarefas(t as unknown as Tarefa[])
      setClients(c as unknown as Client[])
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('tarefas', () => loadData())

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name || '—'

  const handleDrop = async (status: string) => {
    if (!draggedId) return
    const task = tarefas.find((t) => t.id === draggedId)
    if (!task || task.status === status) {
      setDraggedId(null)
      return
    }
    setTarefas((prev) => prev.map((t) => (t.id === draggedId ? { ...t, status } : t)))
    setDraggedId(null)
    try {
      await updateTarefa(draggedId, { status })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Kanban Operacional</h1>
        <p className="text-slate-500 mt-1">
          Arraste tarefas entre colunas para atualizar o status.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = tarefas.filter(
            (t) => t.status === col || (col === 'Não Iniciada' && t.status === 'Atrasada'),
          )
          return (
            <div
              key={col}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col)}
              className="bg-slate-100 rounded-lg p-3 min-h-[400px]"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-slate-700 text-sm">{col}</h3>
                <Badge variant="secondary" className="text-xs">
                  {items.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {items.map((t) => (
                  <Card
                    key={t.id}
                    draggable
                    onDragStart={() => setDraggedId(t.id)}
                    onDragEnd={() => setDraggedId(null)}
                    className={cn(
                      'cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md',
                      t.status === 'Atrasada' && 'border-destructive/50',
                      draggedId === t.id && 'opacity-50',
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-[10px]">
                          {t.tipo}
                        </Badge>
                        {t.status === 'Atrasada' && (
                          <Badge variant="destructive" className="text-[10px]">
                            Atrasada
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-800 line-clamp-2">
                        {t.descricao}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                        <span>{clientName(t.cliente)}</span>
                        {t.data_vencimento && (
                          <span>
                            {new Date(t.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {items.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-8">Sem tarefas</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
