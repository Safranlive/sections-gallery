import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import MySections from './pages/MySections';
import SectionDetail from './pages/SectionDetail';
import InstallSection from './pages/InstallSection';
import Analytics from './pages/Analytics';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/my-sections" element={<MySections />} />
            <Route path="/section/:id" element={<SectionDetail />} />
            <Route path="/install/:id" element={<InstallSection />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Router>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;