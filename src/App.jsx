import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import Calculator from './pages/Calculator';
import HalfLife from './pages/HalfLife';
import Login from './pages/Login';
import Schedule from './pages/Schedule';
import PriceChecker from './pages/PriceChecker';
import Encyclopedia from './pages/Encyclopedia';
import Settings from './pages/Settings';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tracker" element={<Tracker />} />
          <Route path="calculator" element={<Calculator />} />
          <Route path="half-life" element={<HalfLife />} />
          <Route path="login" element={<Login />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="price-checker" element={<PriceChecker />} />
          <Route path="encyclopedia" element={<Encyclopedia />} />
          <Route path="settings" element={<Settings />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
