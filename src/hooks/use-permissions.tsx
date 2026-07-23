import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getEmployees } from '@/services/employees'
import type { ModuleName } from '@/lib/permissions'

const deptModules: Record<string, ModuleName[]> = {
  Fiscal: ['fiscal', 'configuracoes'],
  Contábil: ['contabil', 'financeiro', 'comercial', 'configuracoes'],
  Folha: ['admin', 'configuracoes'],
  Outros: ['configuracoes'],
}

interface PermissionsContextType {
  hasAccess: (module: ModuleName) => boolean
  isAdmin: boolean
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export const usePermissions = () => {
  const ctx = useContext(PermissionsContext)
  if (!ctx) throw new Error('usePermissions must be used within PermissionsProvider')
  return ctx
}

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth()
  const [department, setDepartment] = useState<string | null>(null)
  const isAdmin = user?.role === 'Admin'

  useEffect(() => {
    if (!isAuthenticated || !user?.email || isAdmin) return
    getEmployees()
      .then((emps: any[]) => {
        const emp = emps.find((e) => e.email === user.email)
        if (emp) setDepartment(emp.department)
      })
      .catch(() => {})
  }, [isAuthenticated, user, isAdmin])

  const hasAccess = (module: ModuleName) => {
    if (!isAuthenticated) return false
    if (isAdmin) return true
    if (department) return (deptModules[department] || []).includes(module)
    return module === 'configuracoes'
  }

  return (
    <PermissionsContext.Provider value={{ hasAccess, isAdmin }}>
      {children}
    </PermissionsContext.Provider>
  )
}
