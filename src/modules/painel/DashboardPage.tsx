import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Briefcase,
  Calculator,
  Receipt,
  Users,
  Building2,
  FileText,
  ClipboardList,
  ArrowRight,
} from 'lucide-react'
import { getClients, type Client } from '@/services/clients'
import { getEmployees } from '@/services/employees'
import { getAllTaxObligations, type TaxObligation } from '@/services/tax-obligations'
import { getAllDocumentObligations, type DocumentObligation } from '@/services/document-obligations'
import { useRealtime } from '@/hooks/use-realtime'
import { usePermissions } from '@/hooks/use-permissions'
import type { ModuleName } from '@/lib/permissions'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { hasAccess } = usePermissions()
  const [clients, setClients] = useState<Client[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [obligations, setObligations] = useState<TaxObligation[]>([])
  const [documents, setDocuments] = useState<DocumentObligation[]>([])
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const loadData = useCallback(async () => {
    try {
      const [c, e, o, d] = await Promise.all([
        getClients(),
        getEmployees(),
        getAllTaxObligations(month, year),
        getAllDocumentObligations(month, year),
      ])
      setClients(c as unknown as Client[])
      setEmployees(e as unknown as any[])
      setObligations(o as unknown as TaxObligation[])
      setDocuments(d as unknown as DocumentObligation[])
    } catch (err) {
      console.error(err)
    }
  }, [month, year])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('clients', () => loadData())
  useRealtime('employees', () => loadData())
  useRealtime('tax_obligations', () => loadData())
  useRealtime('document_obligations', () => loadData())

  const pendingObligations = obligations.filter((o) => o.status === 'Pending').length
  const pendingDocuments = documents.filter((d) => d.status === 'Pendente').length
  const lastDiagnosis = localStorage.getItem('lastDiagnosisDate')

  const moduleCards: Array<{
    module: ModuleName
    title: string
    icon: typeof Briefcase
    stats: Array<{ label: string; value: string | number }>
    path: string
  }> = [
    {
      module: 'admin',
      title: 'Administrativo',
      icon: Briefcase,
      stats: [{ label: 'Colaboradores', value: employees.length }],
      path: '/admin/colaboradores',
    },
    {
      module: 'contabil',
      title: 'Contábil',
      icon: Calculator,
      stats: [
        { label: 'Clientes', value: clients.length },
        { label: 'Documentos Pendentes', value: pendingDocuments },
      ],
      path: '/contabil/clientes',
    },
    {
      module: 'fiscal',
      title: 'Fiscal',
      icon: Receipt,
      stats: [
        { label: 'Obrigações Pendentes', value: pendingObligations },
        {
          label: 'Último Diagnóstico',
          value: lastDiagnosis ? new Date(lastDiagnosis).toLocaleDateString('pt-BR') : '—',
        },
      ],
      path: '/fiscal/obrigacoes',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Painel Central</h1>
        <p className="text-slate-500 mt-1">
          Visão geral — {month.toString().padStart(2, '0')}/{year}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {moduleCards
          .filter((card) => hasAccess(card.module))
          .map((card) => (
            <Card key={card.module} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <card.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{card.title}</h2>
                </div>
                <div className="space-y-2 mb-4">
                  {card.stats.map((stat) => (
                    <div key={stat.label} className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">{stat.label}</span>
                      <span className="text-lg font-bold text-slate-900">{stat.value}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate(card.path)}>
                  Acessar Módulo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>

      {clients.length > 0 && hasAccess('contabil') && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Clientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <Card
                key={client.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/contabil/clientes/${client.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 line-clamp-1">{client.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{client.cnpj}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
