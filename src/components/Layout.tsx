import { Outlet } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
