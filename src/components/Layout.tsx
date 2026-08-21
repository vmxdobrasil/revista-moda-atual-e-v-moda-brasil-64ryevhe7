import { Outlet } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { Chatbot } from '@/components/Chatbot'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <Chatbot />
    </div>
  )
}
