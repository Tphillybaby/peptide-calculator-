import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Log from './pages/Log';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Settings from './pages/Settings';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPeptides from './pages/admin/AdminPeptides';
import AdminUsers from './pages/admin/AdminUsers';
import AdminForum from './pages/admin/AdminForum';
import AdminReviews from './pages/admin/AdminReviews';
import AdminPrices from './pages/admin/AdminPrices';
import CookieConsent from './components/CookieConsent';
import SupportTickets from './components/SupportTickets';
import AdminTickets from './components/AdminTickets';
import AdminAuditLogs from './components/AdminAuditLogs';
import AdminMonitoring from './components/AdminMonitoring';
import AdminSecurityAudit from './components/AdminSecurityAudit';
import PromotionalAuthPopup from './components/PromotionalAuthPopup';
import SEO from './components/SEO';
import PageLoader from './components/PageLoader';

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
const ForumPage = lazy(() => import('./pages/Forum'));
const Inventory = lazy(() => import('./pages/Inventory'));

// New feature pages
const InjectionSites = lazy(() => import('./pages/InjectionSites'));
const BloodWork = lazy(() => import('./pages/BloodWork'));
const TitrationPlan = lazy(() => import('./pages/TitrationPlan'));
const Reviews = lazy(() => import('./pages/Reviews'));
const AccountSecurity = lazy(() => import('./pages/AccountSecurity'));

// Admin pages (lazy loaded)
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminFeatureFlags = lazy(() => import('./pages/admin/AdminFeatureFlags'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminPromoCodes = lazy(() => import('./pages/admin/AdminPromoCodes'));
const AdminExport = lazy(() => import('./pages/admin/AdminExport'));

import { SessionTimeoutWarning } from './hooks/useSessionTimeout';
import { useDeepLinkHandler, initDeepLinks } from './hooks/useDeepLinkHandler';

import { initAnalytics } from './lib/analytics';
import { initSentry } from './lib/sentry';
import { initializeNativeServices } from './services/nativeService';

function App() {
  React.useEffect(() => {
    // Initialize error tracking first
    initSentry();
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
    <>
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
          <Route path="calculator" element={
            <Suspense fallback={<PageLoader type="calculator" />}>
              <Calculator />
            </Suspense>
          } />
          <Route path="half-life" element={
            <Suspense fallback={<PageLoader type="calculator" />}>
              <HalfLife />
            </Suspense>
          } />
          <Route path="stack-builder" element={
            <Suspense fallback={<PageLoader type="calculator" />}>
              <StackProtocol />
            </Suspense>
          } />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          {/* Auth callback route for OAuth/Magic Links */}
          <Route path="callback" element={<Navigate to="/dashboard" replace />} />
          <Route path="reset-password" element={<Navigate to="/update-password" replace />} />
          <Route path="price-checker" element={
            <Suspense fallback={<PageLoader type="prices" />}>
              <PriceChecker />
            </Suspense>
          } />
          <Route path="encyclopedia" element={
            <Suspense fallback={<PageLoader type="encyclopedia" />}>
              <Encyclopedia />
            </Suspense>
          } />
          <Route path="encyclopedia/:name" element={
            <Suspense fallback={<PageLoader type="guide" />}>
              <PeptideDetail />
            </Suspense>
          } />
          <Route path="guides" element={
            <Suspense fallback={<PageLoader type="guide" />}>
              <Guides />
            </Suspense>
          } />
          <Route path="guides/beginner" element={
            <Suspense fallback={<PageLoader type="guide" />}>
              <BeginnerGuide />
            </Suspense>
          } />
          <Route path="guides/injection" element={
            <Suspense fallback={<PageLoader type="guide" />}>
              <InjectionGuide />
            </Suspense>
          } />
          <Route path="safety" element={
            <Suspense fallback={<PageLoader type="guide" />}>
              <Safety />
            </Suspense>
          } />
          <Route path="forum" element={
            <Suspense fallback={<PageLoader type="forum" />}>
              <ForumPage />
            </Suspense>
          } />
          <Route path="inventory" element={
            <Suspense fallback={<PageLoader type="inventory" />}>
              <Inventory />
            </Suspense>
          } />

          {/* New Feature Routes */}
          <Route path="injection-sites" element={
            <Suspense fallback={<PageLoader type="guide" />}>
              <InjectionSites />
            </Suspense>
          } />
          <Route path="blood-work" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader type="dashboard" />}>
                <BloodWork />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="titration" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader type="calculator" />}>
                <TitrationPlan />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="reviews" element={
            <Suspense fallback={<PageLoader type="forum" />}>
              <Reviews />
            </Suspense>
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
              <Suspense fallback={<PageLoader type="dashboard" />}>
                <AccountSecurity />
              </Suspense>
            </ProtectedRoute>
          } />

          {/* Admin Routes - Requires admin role */}
          <Route path="admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<Suspense fallback={<PageLoader type="dashboard" />}><AdminAnalytics /></Suspense>} />
            <Route path="peptides" element={<AdminPeptides />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="forum" element={<AdminForum />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="prices" element={<AdminPrices />} />
            <Route path="promo-codes" element={<Suspense fallback={<PageLoader type="dashboard" />}><AdminPromoCodes /></Suspense>} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="announcements" element={<Suspense fallback={<PageLoader type="dashboard" />}><AdminAnnouncements /></Suspense>} />
            <Route path="feature-flags" element={<Suspense fallback={<PageLoader type="dashboard" />}><AdminFeatureFlags /></Suspense>} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="export" element={<Suspense fallback={<PageLoader type="dashboard" />}><AdminExport /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<PageLoader type="dashboard" />}><AdminSettings /></Suspense>} />
            <Route path="monitoring" element={<AdminMonitoring />} />
            <Route path="security" element={<AdminSecurityAudit />} />
          </Route>
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SessionTimeoutWarning />
      <PromotionalAuthPopup />
      <CookieConsent />
    </>
  );
}

export default App;
