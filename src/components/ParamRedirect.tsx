import { Navigate, useParams } from 'react-router-dom'

interface ParamRedirectProps {
  to: string
}

export function ParamRedirect({ to }: ParamRedirectProps) {
  const params = useParams()
  let target = to
  for (const [key, value] of Object.entries(params)) {
    if (value) target = target.replace(`:${key}`, value)
  }
  return <Navigate to={target} replace />
}
