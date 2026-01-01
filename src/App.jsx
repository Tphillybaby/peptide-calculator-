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
import CookieConsent from './components/CookieConsent';
import SupportTickets from './components/SupportTickets';
import AdminTickets from './components/AdminTickets';
import AdminAuditLogs from './components/AdminAuditLogs';
import AdminMonitoring from './components/AdminMonitoring';
import AdminSecurityAudit from './components/AdminSecurityAudit';

const Calculator = lazy(() => import('./pages/Calculator'));
const HalfLife = lazy(() => import('./pages/HalfLife'));
const PriceChecker = lazy(() => import('./pages/PriceChecker'));
const Encyclopedia = lazy(() => import('./pages/Encyclopedia'));
const PeptideDetail = lazy(() => import('./pages/PeptideDetail'));
const Guides = lazy(() => import('./pages/Guides'));
const Safety = lazy(() => import('./pages/Safety'));
const BeginnerGuide = lazy(() => import('./pages/guides/BeginnerGuide'));
const InjectionGuide = lazy(() => import('./pages/guides/InjectionGuide'));
const ForumPage = lazy(() => import('./pages/Forum'));

import { initAnalytics } from './lib/analytics';
import { initializeNativeServices } from './services/nativeService';

function App() {
  React.useEffect(() => {
    initAnalytics();
    // Initialize native mobile features (only runs on iOS/Android)
    initializeNativeServices();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
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
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading calculator...</div>}>
                  <Calculator />
                </Suspense>
              } />
              <Route path="half-life" element={
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading half-life tools...</div>}>
                  <HalfLife />
                </Suspense>
              } />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<SignUp />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="price-checker" element={
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading price checker...</div>}>
                  <PriceChecker />
                </Suspense>
              } />
              <Route path="encyclopedia" element={
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading encyclopedia...</div>}>
                  <Encyclopedia />
                </Suspense>
              } />
              <Route path="encyclopedia/:name" element={
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading...</div>}>
                  <PeptideDetail />
                </Suspense>
              } />
              <Route path="guides" element={
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading guides...</div>}>
                  <Guides />
                </Suspense>
              } />
              <Route path="guides/beginner" element={
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading guide...</div>}>
                  <BeginnerGuide />
                </Suspense>
              } />
              <Route path="guides/injection" element={
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading guide...</div>}>
                  <InjectionGuide />
                </Suspense>
              } />
              <Route path="safety" element={
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading safety info...</div>}>
                  <Safety />
                </Suspense>
              } />
              <Route path="forum" element={
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading forum...</div>}>
                  <ForumPage />
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

              {/* Admin Routes - Requires admin role */}
              <Route path="admin" element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="peptides" element={<AdminPeptides />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="tickets" element={<AdminTickets />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
                <Route path="monitoring" element={<AdminMonitoring />} />
                <Route path="security" element={<AdminSecurityAudit />} />
              </Route>
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
