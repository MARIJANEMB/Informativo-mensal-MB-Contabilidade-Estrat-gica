import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Ticket = {
  id: string
  title: string
  type: 'service' | 'orientation' | 'news'
  status: 'active' | 'closed'
  date: string
  urgent: boolean
  desc: string
}
export type Pendency = {
  id: string
  dept: 'fiscal' | 'hr' | 'accounting'
  title: string
  deadline: string
  status: 'pending' | 'uploaded' | 'validated'
}
export type Tax = {
  id: string
  name: string
  status: 'paid' | 'awaiting' | 'overdue'
  amount: number
  dueDate: string
}

interface AppState {
  tickets: Ticket[]
  pendencies: Pendency[]
  taxes: Tax[]
  markPendencyUploaded: (id: string) => void
  addTicket: (ticket: Omit<Ticket, 'id' | 'date' | 'status'>) => void
}

const AppStoreContext = createContext<AppState | null>(null)

const initialTickets: Ticket[] = [
  {
    id: 'T-1029',
    title: 'Dúvida sobre emissão de NF-e',
    type: 'service',
    status: 'active',
    date: '21/08/2026 14:30',
    urgent: true,
    desc: 'Cliente não consegue emitir nota de devolução referente à venda 4092.',
  },
  {
    id: 'T-1028',
    title: 'Informativo: Feriado Municipal',
    type: 'news',
    status: 'closed',
    date: '18/08/2026 09:00',
    urgent: false,
    desc: 'Não haverá expediente no dia 25/08 devido ao feriado municipal. Antecipe suas solicitações.',
  },
  {
    id: 'T-1027',
    title: 'Orientação Tributária: Nova alíquota',
    type: 'orientation',
    status: 'active',
    date: '15/08/2026 11:15',
    urgent: false,
    desc: 'A partir do próximo mês, a alíquota do ICMS sofrerá alteração. Prepare seu sistema ERP.',
  },
]

const initialPendencies: Pendency[] = [
  {
    id: 'P-1',
    dept: 'fiscal',
    title: 'Notas Fiscais de Entrada (XML)',
    deadline: '10/08/2026',
    status: 'pending',
  },
  {
    id: 'P-2',
    dept: 'hr',
    title: 'Atestados Médicos (Julho)',
    deadline: '05/08/2026',
    status: 'uploaded',
  },
  {
    id: 'P-3',
    dept: 'accounting',
    title: 'Extrato Bancário Bradesco',
    deadline: '15/08/2026',
    status: 'pending',
  },
]

const initialTaxes: Tax[] = [
  {
    id: 'TX-1',
    name: 'Simples Nacional (DAS)',
    status: 'awaiting',
    amount: 5432.1,
    dueDate: '20/08/2026',
  },
  { id: 'TX-2', name: 'ICMS ST', status: 'paid', amount: 1250.0, dueDate: '15/08/2026' },
  { id: 'TX-3', name: 'INSS Patronal', status: 'overdue', amount: 3450.8, dueDate: '05/08/2026' },
]

export const AppStoreProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [pendencies, setPendencies] = useState<Pendency[]>(initialPendencies)
  const [taxes] = useState<Tax[]>(initialTaxes)

  const markPendencyUploaded = (id: string) => {
    setPendencies((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'uploaded' } : p)))
  }

  const addTicket = (ticket: Omit<Ticket, 'id' | 'date' | 'status'>) => {
    const newTicket: Ticket = {
      ...ticket,
      id: `T-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toLocaleString('pt-BR'),
      status: 'active',
    }
    setTickets((prev) => [newTicket, ...prev])
  }

  return (
    <AppStoreContext.Provider
      value={{ tickets, pendencies, taxes, markPendencyUploaded, addTicket }}
    >
      {children}
    </AppStoreContext.Provider>
  )
}

export default function useAppStore() {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider')
  return ctx
}
