import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  Loader2,
  BookOpen,
  LogOut,
  Menu,
  BarChart3,
  Sparkles,
  Instagram,
  TrendingUp,
  MessageCircle,
  Workflow,
  Trophy,
  LayoutDashboard,
  Wand2,
  Wrench,
  Megaphone,
  Tag,
  FileSearch,
  ClipboardList,
  FileText,
  BookHeart,
  Library,
} from 'lucide-react'
import { CommandBar } from '@/components/CommandBar'

export function AdminLayout() {
  const { isAuthenticated, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (isAuthenticated) {
    // Authenticated — render the layout with Outlet for child routes
  }

  const handleLogout = () => {
    signOut()
    navigate('/admin/login')
  }

  const navContent = (
    <div className="flex flex-col h-full">
      <Link
        to="/admin/editions"
        className="flex items-center gap-2 px-4 py-6 border-b"
        onClick={() => setSidebarOpen(false)}
      >
        <BookOpen className="w-6 h-6 text-orange-500" />
        <span className="font-bold text-gray-800">Moda Atual</span>
      </Link>
      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </Link>
        <Link
          to="/admin/editions"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <BookOpen className="w-5 h-5" /> Edições
        </Link>
        <Link
          to="/admin/analytics"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <BarChart3 className="w-5 h-5" /> Analytics
        </Link>
        <Link
          to="/admin/content-generator"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <Sparkles className="w-5 h-5" /> Gerador de Conteudo
        </Link>
        <Link
          to="/admin/content-workflow"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <Workflow className="w-5 h-5" /> Workflow de Conteúdo
        </Link>
        <Link
          to="/admin/social-posts"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <Instagram className="w-5 h-5" /> Social Posts
        </Link>
        <Link
          to="/admin/social-analytics"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <TrendingUp className="w-5 h-5" /> Social Analytics
        </Link>
        <Link
          to="/admin/ai-persona/chat"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <MessageCircle className="w-5 h-5" /> AI Persona
        </Link>
        <Link
          to="/admin/top60"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <Trophy className="w-5 h-5" /> Parceiros
        </Link>
        <Link
          to="/admin/advertisements"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <Megaphone className="w-5 h-5" /> Anúncios
        </Link>
        <Link
          to="/admin/marketplace-products"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <Tag className="w-5 h-5" /> Ofertas
        </Link>
        <Link
          to="/admin/delivery-queue"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <ClipboardList className="w-5 h-5" /> Fila de Entrega
        </Link>
        <Link
          to="/admin/arquiteto-workflow"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <Wand2 className="w-5 h-5" /> Arquiteto de Workflow
        </Link>
        <Link
          to="/admin/engenheiro-refinamento"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <Wrench className="w-5 h-5" /> Engenheiro de Prompts
        </Link>
        <Link
          to="/admin/prompt-refinement"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <FileSearch className="w-5 h-5" /> Refinamento de Prompts
        </Link>
        <Link
          to="/admin/prompts"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <Library className="w-5 h-5" /> Biblioteca de Prompts
        </Link>
        <Link
          to="/admin/about"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <BookHeart className="w-5 h-5" /> Página Sobre
        </Link>
      </nav>
      <div className="p-4 border-t space-y-2">
        <CommandBar />
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-gray-600 hover:text-red-600"
        >
          <LogOut className="w-5 h-5" /> Sair
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <aside className="hidden md:flex w-64 flex-col bg-white border-r shrink-0 sticky top-0 h-screen">
        {navContent}
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          {navContent}
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-bold text-gray-800 flex-1">Moda Atual Admin</span>
          <CommandBar />
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
