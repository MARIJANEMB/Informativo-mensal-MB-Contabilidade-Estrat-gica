import { Navigate } from 'react-router-dom'
import { usePermissions } from '@/hooks/use-permissions'
import type { ModuleName } from '@/lib/permissions'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface ModuleRouteProps {
  modules: ModuleName[]
  children: React.ReactNode
}

export function ModuleRoute({ modules, children }: ModuleRouteProps) {
  const { hasAccess } = usePermissions()
  const hasPermission = modules.some((m) => hasAccess(m))
  if (!hasPermission) return <Navigate to="/" replace />
  return <ErrorBoundary>{children}</ErrorBoundary>
}
