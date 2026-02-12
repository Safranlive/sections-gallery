import React, { useState, useEffect } from 'react';
import { Page, Layout, Card, ResourceList, ResourceItem, Badge, Button, ButtonGroup } from '@shopify/polaris';
import api from '../services/api';

export default function MySections() {
  const [installedSections, setInstalledSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstalledSections();
  }, []);

  const fetchInstalledSections = async () => {
    try {
      const response = await api.get('/sections/installed');
      setInstalledSections(response.data);
    } catch (error) {
      console.error('Error fetching installed sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const uninstallSection = async (sectionId) => {
    if (!confirm('Are you sure you want to uninstall this section?')) return;
    
    try {
      await api.delete(`/sections/${sectionId}/uninstall`);
      alert('Section uninstalled successfully!');
      fetchInstalledSections();
    } catch (error) {
      console.error('Error uninstalling section:', error);
      alert('Failed to uninstall section');
    }
  };

  const updateSection = async (sectionId) => {
    try {
      await api.post(`/sections/${sectionId}/update`);
      alert('Section updated successfully!');
      fetchInstalledSections();
    } catch (error) {
      console.error('Error updating section:', error);
      alert('Failed to update section');
    }
  };

  return (
    <Page title="My Sections" subtitle="Manage your installed theme sections">
      <Layout>
        <Layout.Section>
          <Card>
            <ResourceList
              loading={loading}
              resourceName={{ singular: 'section', plural: 'sections' }}
              items={installedSections}
              renderItem={(item) => {
                const { id, name, version, isActive, hasUpdate } = item;
                return (
                  <ResourceItem id={id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3><strong>{name}</strong></h3>
                        <p>Version {version}</p>
                        <Badge status={isActive ? 'success' : 'warning'}>
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {hasUpdate && <Badge status="info">Update Available</Badge>}
                      </div>
                      <ButtonGroup>
                        {hasUpdate && (
                          <Button size="slim" onClick={() => updateSection(id)}>
                            Update
                          </Button>
                        )}
                        <Button size="slim" destructive onClick={() => uninstallSection(id)}>
                          Uninstall
                        </Button>
                      </ButtonGroup>
                    </div>
                  </ResourceItem>
                );
              }}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}