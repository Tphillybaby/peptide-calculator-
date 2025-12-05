import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPeptides from './pages/admin/AdminPeptides';
import CookieConsent from './components/CookieConsent';

const Calculator = lazy(() => import('./pages/Calculator'));
const HalfLife = lazy(() => import('./pages/HalfLife'));
const Schedule = lazy(() => import('./pages/Schedule'));
const PriceChecker = lazy(() => import('./pages/PriceChecker'));
const Encyclopedia = lazy(() => import('./pages/Encyclopedia'));
const PeptideDetail = lazy(() => import('./pages/PeptideDetail'));
const Guides = lazy(() => import('./pages/Guides'));
const Safety = lazy(() => import('./pages/Safety'));
const BeginnerGuide = lazy(() => import('./pages/guides/BeginnerGuide'));
const InjectionGuide = lazy(() => import('./pages/guides/InjectionGuide'));


import { initAnalytics } from './lib/analytics';

function App() {
  React.useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={
            <ErrorBoundary>
              <Layout />
            </ErrorBoundary>
          }>
            <Route index element={<Dashboard />} />
            <Route path="tracker" element={<Tracker />} />
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
            <Route path="schedule" element={
              <Suspense fallback={<div style={{ padding: '20px' }}>Loading schedule...</div>}>
                <Schedule />
              </Suspense>
            } />
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
            <Route path="settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="peptides" element={<AdminPeptides />} />
            </Route>
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieConsent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
