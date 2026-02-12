// Sections Gallery Customer App - Main Component
// Shopify Embedded App with native Polaris UI

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, Frame, Loading } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';

// Pages
import Marketplace from './pages/Marketplace';
import SectionDetail from './pages/SectionDetail';
import MySections from './pages/MySections';
import InstallSection from './pages/InstallSection';

// API
import api from './services/api';

function App() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get shop from URL params
    const params = new URLSearchParams(window.location.search);
    const shopParam = params.get('shop');
    
    if (shopParam) {
      setShop(shopParam);
      localStorage.setItem('shop', shopParam);
    } else {
      const storedShop = localStorage.getItem('shop');
      if (storedShop) {
        setShop(storedShop);
      }
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <AppProvider i18n={enTranslations}>
        <Frame>
          <Loading />
        </Frame>
      </AppProvider>
    );
  }

  if (!shop) {
    return (
      <AppProvider i18n={enTranslations}>
        <Frame>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Welcome to Sections Gallery</h1>
            <p>Please install the app from your Shopify admin.</p>
          </div>
        </Frame>
      </AppProvider>
    );
  }

  return (
    <AppProvider i18n={enTranslations}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/marketplace" replace />} />
          <Route path="/marketplace" element={<Marketplace shop={shop} />} />
          <Route path="/sections/:id" element={<SectionDetail shop={shop} />} />
          <Route path="/my-sections" element={<MySections shop={shop} />} />
          <Route path="/install/:sectionId" element={<InstallSection shop={shop} />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
