import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import type { ModuleName } from '@/lib/permissions'

interface PermissionsContextType {
  hasAccess: (module: ModuleName) => boolean
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export const usePermissions = () => {
  const ctx = useContext(PermissionsContext)
  if (!ctx) throw new Error('usePermissions must be used within PermissionsProvider')
  return ctx
}

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth()
  const hasAccess = (_module: ModuleName) => isAuthenticated
  return <PermissionsContext.Provider value={{ hasAccess }}>{children}</PermissionsContext.Provider>
}
