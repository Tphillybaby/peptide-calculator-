import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

const Calculator = lazy(() => import('./pages/Calculator'));
const HalfLife = lazy(() => import('./pages/HalfLife'));
const Schedule = lazy(() => import('./pages/Schedule'));
const PriceChecker = lazy(() => import('./pages/PriceChecker'));
const Encyclopedia = lazy(() => import('./pages/Encyclopedia'));

function App() {
  return (
    <BrowserRouter>
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
          <Route path="settings" element={<Settings />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
