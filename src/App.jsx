import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import PageTracker from './components/PageTracker';
import PageLoader from './components/PageLoader';
import TikTokPixel from './components/TikTokPixel';

// Core components - keep these eagerly loaded for fast initial render
const Layout = lazy(() => import('./components/Layout'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const AdminRoute = lazy(() => import('./components/AdminRoute'));

// Auth pages - commonly accessed, lazy load
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

// Main pages - lazy load all
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Log = lazy(() => import('./pages/Log'));
const Settings = lazy(() => import('./pages/Settings'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Contact = lazy(() => import('./pages/Contact'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));

// Feature pages
const Calculator = lazy(() => import('./pages/Calculator'));
const StackProtocol = lazy(() => import('./pages/StackProtocol'));
const HalfLife = lazy(() => import('./pages/HalfLife'));
const PriceChecker = lazy(() => import('./pages/PriceChecker'));
const Encyclopedia = lazy(() => import('./pages/Encyclopedia'));
const PeptideDetail = lazy(() => import('./pages/PeptideDetail'));
const Guides = lazy(() => import('./pages/Guides'));
const Safety = lazy(() => import('./pages/Safety'));
const BeginnerGuide = lazy(() => import('./pages/guides/BeginnerGuide'));
const InjectionGuide = lazy(() => import('./pages/guides/InjectionGuide'));
const StorageGuide = lazy(() => import('./pages/guides/StorageGuide'));
const ForumPage = lazy(() => import('./pages/Forum'));
const Inventory = lazy(() => import('./pages/Inventory'));
const InjectionSites = lazy(() => import('./pages/InjectionSites'));
const BloodWork = lazy(() => import('./pages/BloodWork'));
const TitrationPlan = lazy(() => import('./pages/TitrationPlan'));
const Reviews = lazy(() => import('./pages/Reviews'));
const AccountSecurity = lazy(() => import('./pages/AccountSecurity'));

// New Feature Pages
const AchievementsPage = lazy(() => import('./pages/Achievements'));
const ResearchPage = lazy(() => import('./pages/Research'));
const InteractionsPage = lazy(() => import('./pages/Interactions'));
const NotificationsPage = lazy(() => import('./pages/Notifications'));

// Admin components - lazy load entire admin section
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPeptides = lazy(() => import('./pages/admin/AdminPeptides'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminForum = lazy(() => import('./pages/admin/AdminForum'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminPrices = lazy(() => import('./pages/admin/AdminPrices'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminFeatureFlags = lazy(() => import('./pages/admin/AdminFeatureFlags'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminPromoCodes = lazy(() => import('./pages/admin/AdminPromoCodes'));
const AdminExport = lazy(() => import('./pages/admin/AdminExport'));
const AdminTickets = lazy(() => import('./components/AdminTickets'));
const AdminAuditLogs = lazy(() => import('./components/AdminAuditLogs'));
const AdminMonitoring = lazy(() => import('./components/AdminMonitoring'));
const AdminSecurityAudit = lazy(() => import('./components/AdminSecurityAudit'));
const AdminDatabaseMetrics = lazy(() => import('./components/AdminDatabaseMetrics'));

// Support components - lazy load
const SupportTickets = lazy(() => import('./components/SupportTickets'));
const CookieConsent = lazy(() => import('./components/CookieConsent'));
const PromotionalAuthPopup = lazy(() => import('./components/PromotionalAuthPopup'));
const SEO = lazy(() => import('./components/SEO'));

import { SessionTimeoutWarning } from './hooks/useSessionTimeout';
import { useDeepLinkHandler, initDeepLinks } from './hooks/useDeepLinkHandler';

import { initAnalytics } from './lib/analytics';
import { initializeNativeServices } from './services/nativeService';

function App() {
  React.useEffect(() => {
    // Initialize analytics
    initAnalytics();
    // Initialize native mobile features (only runs on iOS/Android)
    initializeNativeServices();
    // Initialize deep link handling
    initDeepLinks();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  // Handle deep links for native app auth callbacks
  useDeepLinkHandler();

  return (
    <Suspense fallback={<PageLoader type="dashboard" />}>
      <PageTracker />
      <TikTokPixel />
      <SEO />
      <Routes>
        <Route path="/" element={
          <ErrorBoundary>
            <Layout />
          </ErrorBoundary>
        }>
          <Route index element={<Dashboard />} />
          <Route path="log" element={<Log />} />
          {/* Backwards compatibility redirects */}
          <Route path="tracker" element={<Navigate to="/log" replace />} />
          <Route path="schedule" element={<Navigate to="/log" replace />} />
          <Route path="calculator" element={<Calculator />} />
          <Route path="half-life" element={<HalfLife />} />
          <Route path="stack-builder" element={<StackProtocol />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          {/* Auth callback route for OAuth/Magic Links */}
          <Route path="callback" element={<AuthCallback />} />
          <Route path="reset-password" element={<Navigate to="/update-password" replace />} />
          <Route path="update-password" element={<UpdatePassword />} />
          <Route path="price-checker" element={<PriceChecker />} />
          <Route path="encyclopedia" element={<Encyclopedia />} />
          <Route path="encyclopedia/:name" element={<PeptideDetail />} />
          <Route path="guides" element={<Guides />} />
          <Route path="guides/beginner" element={<BeginnerGuide />} />
          <Route path="guides/injection" element={<InjectionGuide />} />
          <Route path="guides/storage" element={<StorageGuide />} />
          <Route path="safety" element={<Safety />} />
          <Route path="forum" element={<ForumPage />} />
          <Route path="inventory" element={<Inventory />} />

          {/* New Feature Routes */}
          <Route path="injection-sites" element={<InjectionSites />} />
          <Route path="blood-work" element={
            <ProtectedRoute>
              <BloodWork />
            </ProtectedRoute>
          } />
          <Route path="titration" element={
            <ProtectedRoute>
              <TitrationPlan />
            </ProtectedRoute>
          } />
          <Route path="reviews" element={<Reviews />} />

          {/* New Feature Routes */}
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="research" element={<ResearchPage />} />
          <Route path="interactions" element={<InteractionsPage />} />
          <Route path="notifications" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } />

          <Route path="settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="support" element={
            <ProtectedRoute>
              <SupportTickets />
            </ProtectedRoute>
          } />
          <Route path="account-security" element={
            <ProtectedRoute>
              <AccountSecurity />
            </ProtectedRoute>
          } />

          {/* Admin Routes - Requires admin role */}
          <Route path="admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="peptides" element={<AdminPeptides />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="forum" element={<AdminForum />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="prices" element={<AdminPrices />} />
            <Route path="promo-codes" element={<AdminPromoCodes />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="feature-flags" element={<AdminFeatureFlags />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="export" element={<AdminExport />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="monitoring" element={<AdminMonitoring />} />
            <Route path="database" element={<AdminDatabaseMetrics />} />
            <Route path="security" element={<AdminSecurityAudit />} />
          </Route>
          <Route path="contact" element={<Contact />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>

      </Routes>
      <SessionTimeoutWarning />
      <PromotionalAuthPopup />
      <CookieConsent />
    </Suspense>
  );
}

export default App;
