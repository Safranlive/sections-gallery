import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import '@shopify/polaris/build/esm/styles.css';
import { AuthProvider } from './context/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';
import Sections from './pages/Sections';
import Pricing from './pages/Pricing';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Admin from './pages/Admin';

const config = {
  apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
  host: new URLSearchParams(window.location.search).get('host'),
  forceRedirect: true,
};

function App() {
  return (
    <AppBridgeProvider config={config}>
      <AppProvider i18n={{}}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sections" element={<Sections />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </AppProvider>
    </AppBridgeProvider>
  );
}

export default App;