import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { usePermissions } from '@/hooks/use-permissions'
import type { ModuleName } from '@/lib/permissions'

export function ModuleRoute({
  modules,
  children,
}: {
  modules: ModuleName[]
  children: React.ReactNode
}) {
  const { hasAccess, loading } = usePermissions()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!modules.some((m) => hasAccess(m))) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
