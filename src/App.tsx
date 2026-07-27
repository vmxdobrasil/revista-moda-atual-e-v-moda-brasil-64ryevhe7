import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Editions from './pages/Editions'
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
import ContentWorkflowPage from './pages/admin/ContentWorkflowPage'
import SocialPostsPage from './pages/admin/SocialPostsPage'
import SocialAnalyticsPage from './pages/admin/SocialAnalyticsPage'
import AiPersonaChat from './pages/admin/AiPersonaChat'
import DashboardPage from './pages/admin/DashboardPage'
import Dashboard from './pages/Dashboard'
import StoryTextView from './pages/StoryTextView'
import Top60Page from './pages/admin/Top60Page'
import ArquitetoWorkflowPage from './pages/admin/ArquitetoWorkflowPage'
import EngenheiroRefinamentoPage from './pages/admin/EngenheiroRefinamentoPage'
import { AuthProvider } from './hooks/use-auth'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/vmodebrasil" element={<Navigate to="/" replace />} />
            <Route path="/" element={<Index />} />
            <Route path="/editions" element={<Editions />} />
            <Route path="/edition/:id" element={<MagazineReader />} />
            <Route path="/reader/latest" element={<MagazineReader isLatest />} />
            <Route path="/reader/:id" element={<MagazineReader />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/texto/:id" element={<StoryTextView />} />
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
            <Route path="content-workflow" element={<ContentWorkflowPage />} />
            <Route path="social-posts" element={<SocialPostsPage />} />
            <Route path="social-analytics" element={<SocialAnalyticsPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="ai-persona/chat" element={<AiPersonaChat />} />
            <Route path="top60" element={<Top60Page />} />
            <Route path="arquiteto-workflow" element={<ArquitetoWorkflowPage />} />
            <Route path="engenheiro-refinamento" element={<EngenheiroRefinamentoPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
