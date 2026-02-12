import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TopBar, ActionList, Icon } from '@shopify/polaris';
import { HomeMajor, CollectionsMajor, SettingsMajor } from '@shopify/polaris-icons';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: HomeMajor, path: '/' },
    { label: 'Sections', icon: CollectionsMajor, path: '/sections' },
    { label: 'Settings', icon: SettingsMajor, path: '/settings' },
  ];

  return (
    <TopBar
      showNavigationToggle
      secondaryMenu={
        <ActionList
          items={navItems.map(item => ({
            content: item.label,
            icon: item.icon,
            onAction: () => navigate(item.path),
          }))}
        />
      }
    />
  );
}

export default Navigation;