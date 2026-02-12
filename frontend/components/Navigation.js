import React from 'react';
import { Navigation } from '@shopify/polaris';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeMinor,
  ProductsMinor,
  CashDollarMinor,
  AnalyticsMajor,
  SettingsMajor
} from '@shopify/polaris-icons';

export default function NavigationMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Navigation location={location.pathname}>
      <Navigation.Section
        items={[
          {
            label: 'Dashboard',
            icon: HomeMinor,
            onClick: () => navigate('/'),
            selected: location.pathname === '/'
          },
          {
            label: 'Sections',
            icon: ProductsMinor,
            onClick: () => navigate('/sections'),
            selected: location.pathname === '/sections'
          },
          {
            label: 'Pricing',
            icon: CashDollarMinor,
            onClick: () => navigate('/pricing'),
            selected: location.pathname === '/pricing'
          },
          {
            label: 'Analytics',
            icon: AnalyticsMajor,
            onClick: () => navigate('/analytics'),
            selected: location.pathname === '/analytics'
          },
          {
            label: 'Settings',
            icon: SettingsMajor,
            onClick: () => navigate('/settings'),
            selected: location.pathname === '/settings'
          }
        ]}
      />
    </Navigation>
  );
}