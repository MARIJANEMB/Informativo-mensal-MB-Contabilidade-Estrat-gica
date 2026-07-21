import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { MessageCircle, FileText, Megaphone, Plus, Search } from 'lucide-react'
import useAppStore, { Ticket } from '@/stores/use-app-store'
import { format } from 'date-fns'

export default function ServiceLog() {
  const { tickets } = useAppStore()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const filteredTickets = tickets.filter((t) => {
    if (filter !== 'all' && t.type !== filter) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'service':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'orientation':
        return <FileText className="w-5 h-5 text-emerald-500" />
      case 'news':
        return <Megaphone className="w-5 h-5 text-amber-500" />
      default:
        return <MessageCircle className="w-5 h-5 text-slate-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'service':
        return 'Atendimento'
      case 'orientation':
        return 'Orientação'
      case 'news':
        return 'Informativo'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Atendimentos e Informativos
          </h1>
          <p className="text-slate-500 mt-1">Histórico de comunicação com sua equipe contábil.</p>
        </div>
        <Button className="shrink-0 shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Novo Chamado
        </Button>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 rounded-t-xl">
          <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
            <TabsList className="bg-slate-200/50">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="service">Atendimentos</TabsTrigger>
              <TabsTrigger value="orientation">Orientações</TabsTrigger>
              <TabsTrigger value="news">Informativos</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar histórico..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Nenhum registro encontrado.</div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-white p-2 rounded-lg border shadow-sm">
                      {getIcon(ticket.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {getTypeLabel(ticket.type)} • {ticket.id}
                        </span>
                        {ticket.urgent && (
                          <Badge variant="destructive" className="text-[10px] h-4">
                            Urgente
                          </Badge>
                        )}
                        {ticket.status === 'active' ? (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px] h-4"
                          >
                            Aberto
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-slate-400 border-slate-200 text-[10px] h-4"
                          >
                            Fechado
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900">{ticket.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1 max-w-xl">
                        {ticket.desc}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:block">
                    {ticket.date}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <SheetContent className="sm:max-w-md w-full p-0 flex flex-col">
          {selectedTicket && (
            <>
              <div className="p-6 border-b bg-slate-50">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-white">
                    {getTypeLabel(selectedTicket.type)}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">{selectedTicket.id}</span>
                </div>
                <SheetTitle className="text-xl leading-tight mb-2">
                  {selectedTicket.title}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedTicket.date}</span>
                </SheetDescription>
              </div>
              <div className="p-6 flex-1 overflow-auto bg-white">
                <div className="prose prose-sm prose-slate max-w-none">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedTicket.desc}
                  </p>
                </div>

                <div className="mt-8 border-t pt-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">Interações</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border text-sm text-slate-600 italic text-center">
                    Nenhuma interação adicional registrada.
                  </div>
                </div>
              </div>
              {selectedTicket.status === 'active' && (
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <Input placeholder="Escreva uma resposta..." />
                    <Button>Enviar</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
