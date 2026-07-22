import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-800">Algo deu errado</h2>
            <p className="text-sm text-slate-500 max-w-md">
              Ocorreu um erro ao carregar esta página. Tente recarregar ou volte mais tarde.
            </p>
          </div>
        )
      )
    }
    return this.props.children
  }
}
