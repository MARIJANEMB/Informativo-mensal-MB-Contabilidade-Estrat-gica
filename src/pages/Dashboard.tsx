import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Building2, ArrowRight } from 'lucide-react'
import { getClients, type Client } from '@/services/clients'
import { getAllTaxObligations, type TaxObligation } from '@/services/tax-obligations'
import { useRealtime } from '@/hooks/use-realtime'

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [obligations, setObligations] = useState<TaxObligation[]>([])
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const loadData = useCallback(async () => {
    try {
      const [c, o] = await Promise.all([getClients(), getAllTaxObligations(month, year)])
      setClients(c as unknown as Client[])
      setObligations(o as unknown as TaxObligation[])
    } catch (err) {
      console.error(err)
    }
  }, [month, year])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('clients', () => {
    loadData()
  })
  useRealtime('tax_obligations', () => {
    loadData()
  })

  const getStats = (clientId: string) => {
    const obs = obligations.filter((o) => o.client === clientId)
    const total = obs.length
    const paid = obs.filter((o) => o.status === 'Paid').length
    const pending = obs.filter((o) => o.status === 'Pending').length
    const exempt = obs.filter((o) => o.status === 'Exempt').length
    const progress = total > 0 ? Math.round(((paid + exempt) / total) * 100) : 0
    return { total, paid, pending, exempt, progress }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Visão geral dos clientes — {month.toString().padStart(2, '0')}/{year}
        </p>
      </div>
      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-slate-500">
            <Building2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="font-medium">Nenhum cliente cadastrado</p>
            <Link to="/clientes" className="text-primary hover:underline text-sm mt-2 inline-block">
              Cadastrar clientes →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => {
            const stats = getStats(client.id)
            return (
              <Link key={client.id} to={`/clientes/${client.id}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 line-clamp-1">{client.name}</h3>
                          <p className="text-xs text-slate-400 font-mono">{client.cnpj}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {stats.pending > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {stats.pending} Pendente(s)
                        </Badge>
                      )}
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
                        {stats.paid} Pago(s)
                      </Badge>
                      {stats.exempt > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {stats.exempt} Isento(s)
                        </Badge>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Fechamento</span>
                        <span className="font-semibold">{stats.progress}%</span>
                      </div>
                      <Progress value={stats.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
