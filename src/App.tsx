import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt'
import Index from './pages/Index'
import Editions from './pages/Editions'
import Events from './pages/Events'
import LinkInBio from './pages/LinkInBio'
import NotFound from './pages/NotFound'
import { Layout } from '@/components/Layout'
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
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import TwoFactorVerify from './pages/TwoFactorVerify'
import SecuritySettings from './pages/admin/SecuritySettings'
import MultiFormatGeneratorPage from './pages/admin/MultiFormatGeneratorPage'
import MultiFormatReviewPage from './pages/admin/MultiFormatReviewPage'
import AuditPage from './pages/admin/AuditPage'
import SeoSpecialistPage from './pages/admin/SeoSpecialistPage'
import CoverArtDirectorPage from './pages/admin/CoverArtDirectorPage'
import EditionCoversPage from './pages/admin/EditionCoversPage'
import EditorialQaPage from './pages/admin/EditorialQaPage'
import NewsletterPage from './pages/admin/NewsletterPage'
import AdRevenuePage from './pages/admin/AdRevenuePage'
import ConversionPage from './pages/admin/ConversionPage'
import MarketWatchPage from './pages/admin/MarketWatchPage'
import SocialEngagementPage from './pages/admin/SocialEngagementPage'
import SkillsPage from './pages/admin/SkillsPage'
import LogoSettingsPage from './pages/admin/LogoSettingsPage'
import PublicAdvertiser from './pages/PublicAdvertiser'

import Partners from './pages/Partners'
import Advertisements from './pages/Advertisements'
import AdvertisementsAdminPage from './pages/admin/AdvertisementsPage'
import DeliveryQueuePage from './pages/admin/DeliveryQueuePage'
import DeliveryReviewPage from './pages/admin/DeliveryReviewPage'
import { AuthProvider } from './hooks/use-auth'
import { LogoProvider } from './hooks/use-logo'

const App = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <AuthProvider>
        <LogoProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OfflineIndicator />
            <PwaInstallPrompt />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/editions" element={<Editions />} />
                <Route path="/events" element={<Events />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/advertisements" element={<Advertisements />} />
                <Route path="/offers" element={<Navigate to="/" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/texto/:id" element={<StoryTextView />} />
                <Route path="/sobre-nos" element={<About />} />
              </Route>

              {/* LinkInBio page */}
              <Route path="/bio" element={<LinkInBio />} />
              <Route path="/linkinbio" element={<LinkInBio />} />

              <Route path="/edition/:id" element={<MagazineReader />} />
              <Route path="/reader/latest" element={<MagazineReader isLatest />} />
              <Route path="/reader/:id" element={<MagazineReader />} />

              <Route path="/public/anunciante" element={<PublicAdvertiser />} />
              <Route path="/esqueci-senha" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin/2fa-verify" element={<TwoFactorVerify />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="editions" element={<EditionsPage />} />
                <Route path="editions/new" element={<EditionCreatePage />} />
                <Route path="editions/:id" element={<EditionEditPage />} />
                <Route path="editions/:id/covers" element={<EditionCoversPage />} />
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
                <Route path="marketplace-products" element={<Navigate to="/" replace />} />
                <Route path="delivery-queue" element={<DeliveryQueuePage />} />
                <Route path="delivery-queue/:id" element={<DeliveryReviewPage />} />
                <Route path="arquiteto-workflow" element={<ArquitetoWorkflowPage />} />
                <Route path="engenheiro-refinamento" element={<EngenheiroRefinamentoPage />} />
                <Route path="prompt-refinement" element={<PromptRefinementPage />} />
                <Route path="prompts" element={<PromptsPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="multi-format-generator" element={<MultiFormatGeneratorPage />} />
                <Route path="multi-format-generator/:id" element={<MultiFormatReviewPage />} />
                <Route path="audit" element={<AuditPage />} />
                <Route path="security" element={<SecuritySettings />} />
                <Route path="seo-specialist" element={<SeoSpecialistPage />} />
                <Route path="cover-art-director" element={<CoverArtDirectorPage />} />
                <Route path="editorial-qa" element={<EditorialQaPage />} />
                <Route path="newsletter" element={<NewsletterPage />} />
                <Route path="ad-revenue" element={<AdRevenuePage />} />
                <Route path="conversion" element={<ConversionPage />} />
                <Route path="market-watch" element={<MarketWatchPage />} />
                <Route path="social-engagement" element={<SocialEngagementPage />} />
                <Route path="skills" element={<SkillsPage />} />
                <Route path="logo-settings" element={<LogoSettingsPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </LogoProvider>
      </AuthProvider>
    </ErrorBoundary>
  </BrowserRouter>
)

export default App
