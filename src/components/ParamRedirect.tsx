import { useParams, Navigate } from 'react-router-dom'

export function ParamRedirect({ to }: { to: string }) {
  const params = useParams()
  const path = Object.keys(params).reduce((p, key) => p.replace(`:${key}`, params[key] || ''), to)
  return <Navigate to={path} replace />
}
