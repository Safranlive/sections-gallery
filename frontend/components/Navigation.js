import React from 'react';
import { Navigation } from '@shopify/polaris';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeMinor,
  ProductsMinor,
  CashDollarMinor,
  AnalyticsMajor,
  SettingsMajor,
  CustomersMinor,
} from '@shopify/polaris-icons';

export default function AppNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Navigation location={location.pathname}>
      <Navigation.Section
        items={[
          {
            url: '/',
            label: 'Dashboard',
            icon: HomeMinor,
            selected: location.pathname === '/',
            onClick: (e) => {
              e.preventDefault();
              navigate('/');
            },
          },
          {
            url: '/sections',
            label: 'Sections',
            icon: ProductsMinor,
            selected: location.pathname === '/sections',
            onClick: (e) => {
              e.preventDefault();
              navigate('/sections');
            },
          },
          {
            url: '/pricing',
            label: 'Pricing',
            icon: CashDollarMinor,
            selected: location.pathname === '/pricing',
            onClick: (e) => {
              e.preventDefault();
              navigate('/pricing');
            },
          },
          {
            url: '/analytics',
            label: 'Analytics',
            icon: AnalyticsMajor,
            selected: location.pathname === '/analytics',
            onClick: (e) => {
              e.preventDefault();
              navigate('/analytics');
            },
          },
        ]}
      />
      <Navigation.Section
        title="Management"
        items={[
          {
            url: '/admin',
            label: 'Admin Panel',
            icon: CustomersMinor,
            selected: location.pathname === '/admin',
            onClick: (e) => {
              e.preventDefault();
              navigate('/admin');
            },
            badge: 'New',
          },
          {
            url: '/settings',
            label: 'Settings',
            icon: SettingsMajor,
            selected: location.pathname === '/settings',
            onClick: (e) => {
              e.preventDefault();
              navigate('/settings');
            },
          },
        ]}
      />
    </Navigation>
  );
}
