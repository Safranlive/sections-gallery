import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import '@shopify/polaris/build/esm/styles.css';
import Dashboard from './pages/Dashboard';
import Sections from './pages/Sections';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Navigation from './components/Navigation';

function App() {
  const config = {
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    host: new URLSearchParams(window.location.search).get('host'),
    forceRedirect: true
  };

  return (
    <AppBridgeProvider config={config}>
      <AppProvider>
        <Router>
          <Navigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sections" element={<Sections />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </AppBridgeProvider>
  );
}

export default App;