import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import MagazineReader from './pages/MagazineReader'
import Login from './pages/Login'
import { AdminLayout } from './pages/admin/AdminLayout'
import EditionsPage from './pages/admin/EditionsPage'
import EditionEditPage from './pages/admin/EditionEditPage'
import EditionCreatePage from './pages/admin/EditionCreatePage'
import PageEditPage from './pages/admin/PageEditPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import EditionAnalyticsPage from './pages/admin/EditionAnalyticsPage'
import ContentGeneratorPage from './pages/admin/ContentGeneratorPage'
import SocialPostsPage from './pages/admin/SocialPostsPage'
import SocialAnalyticsPage from './pages/admin/SocialAnalyticsPage'
import { AuthProvider } from './hooks/use-auth'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/edition/:id" element={<MagazineReader />} />
            <Route path="/reader/latest" element={<MagazineReader isLatest />} />
            <Route path="/reader/:id" element={<MagazineReader />} />
          </Route>

          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/editions" replace />} />
            <Route path="editions" element={<EditionsPage />} />
            <Route path="editions/new" element={<EditionCreatePage />} />
            <Route path="editions/:id" element={<EditionEditPage />} />
            <Route path="editions/:editionId/pages/:pageId/edit" element={<PageEditPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="analytics/:editionId" element={<EditionAnalyticsPage />} />
            <Route path="content-generator" element={<ContentGeneratorPage />} />
            <Route path="social-posts" element={<SocialPostsPage />} />
            <Route path="social-analytics" element={<SocialAnalyticsPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
