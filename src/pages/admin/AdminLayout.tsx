import { useAuth } from '@/hooks/use-auth'
import { Navigate, Outlet, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Loader2, LayoutDashboard, Globe, LogOut } from 'lucide-react'

export function AdminLayout() {
  const { isAuthenticated, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <LayoutDashboard className="w-6 h-6 text-orange-500" />
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="outline" asChild size="sm" className="hidden sm:flex gap-2">
            <Link to="/">
              <Globe className="w-4 h-4" />
              Ver Site
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="gap-2 text-gray-600 hover:text-red-600"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}
