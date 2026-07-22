import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getEmployees } from '@/services/employees'
import { getAccessibleModules, hasModuleAccess, type ModuleName } from '@/lib/permissions'

interface PermissionsContextType {
  modules: ModuleName[]
  department: string | null
  loading: boolean
  hasAccess: (module: ModuleName) => boolean
}

const PermissionsContext = createContext<PermissionsContextType>({
  modules: ['painel'],
  department: null,
  loading: true,
  hasAccess: () => false,
})

export const usePermissions = () => useContext(PermissionsContext)

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth()
  const [department, setDepartment] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setDepartment(null)
      setLoading(false)
      return
    }
    if (user.role === 'Admin') {
      setDepartment(null)
      setLoading(false)
      return
    }
    getEmployees()
      .then((employees) => {
        const emp = (employees as unknown as Array<{ email: string; department: string }>).find(
          (e) => e.email === user.email,
        )
        setDepartment(emp?.department || null)
      })
      .catch(() => setDepartment(null))
      .finally(() => setLoading(false))
  }, [user, isAuthenticated])

  const role = user?.role
  const modules = getAccessibleModules(role, department || undefined)

  return (
    <PermissionsContext.Provider
      value={{
        modules,
        department,
        loading,
        hasAccess: (m) => hasModuleAccess(role, department || undefined, m),
      }}
    >
      {children}
    </PermissionsContext.Provider>
  )
}
