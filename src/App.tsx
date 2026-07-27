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
import PromptRefinementPage from './pages/admin/PromptRefinementPage'
import PromptsPage from './pages/admin/PromptsPage'
import About from './pages/About'
import AboutPage from './pages/admin/AboutPage'
import MultiFormatGeneratorPage from './pages/admin/MultiFormatGeneratorPage'
import MultiFormatReviewPage from './pages/admin/MultiFormatReviewPage'

import Partners from './pages/Partners'
import Advertisements from './pages/Advertisements'
import Offers from './pages/Offers'
import AdvertisementsAdminPage from './pages/admin/AdvertisementsPage'
import MarketplaceProductsPage from './pages/admin/MarketplaceProductsPage'
import DeliveryQueuePage from './pages/admin/DeliveryQueuePage'
import DeliveryReviewPage from './pages/admin/DeliveryReviewPage'
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
            <Route path="/editions" element={<Editions />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/advertisements" element={<Advertisements />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/edition/:id" element={<MagazineReader />} />
            <Route path="/reader/latest" element={<MagazineReader isLatest />} />
            <Route path="/reader/:id" element={<MagazineReader />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/texto/:id" element={<StoryTextView />} />
            <Route path="/sobre" element={<About />} />
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
            <Route path="advertisements" element={<AdvertisementsAdminPage />} />
            <Route path="marketplace-products" element={<MarketplaceProductsPage />} />
            <Route path="delivery-queue" element={<DeliveryQueuePage />} />
            <Route path="delivery-queue/:id" element={<DeliveryReviewPage />} />
            <Route path="arquiteto-workflow" element={<ArquitetoWorkflowPage />} />
            <Route path="engenheiro-refinamento" element={<EngenheiroRefinamentoPage />} />
            <Route path="prompt-refinement" element={<PromptRefinementPage />} />
            <Route path="prompts" element={<PromptsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="multi-format-generator" element={<MultiFormatGeneratorPage />} />
            <Route path="multi-format-generator/:id" element={<MultiFormatReviewPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
