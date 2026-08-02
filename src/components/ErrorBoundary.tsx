import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6 mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Algo deu errado</h2>
            <p className="text-gray-500 mb-6">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8"
            >
              Recarregar Página
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
