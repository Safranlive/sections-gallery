import React, { useState } from 'react';
import { Page, Layout, Card, Form, FormLayout, TextField, Button, SettingToggle, TextContainer } from '@shopify/polaris';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Settings() {
  const { store } = useAuth();
  const [storeName, setStoreName] = useState(store?.shopifyDomain || '');
  const [autoInstall, setAutoInstall] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', {
        storeName,
        autoInstall
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page title="Settings" subtitle="Manage your Sections Gallery preferences">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Form onSubmit={handleSave}>
              <FormLayout>
                <TextField
                  label="Store Name"
                  value={storeName}
                  onChange={setStoreName}
                  disabled
                />
                <SettingToggle
                  action={{
                    content: autoInstall ? 'Disable' : 'Enable',
                    onAction: () => setAutoInstall(!autoInstall)
                  }}
                  enabled={autoInstall}
                >
                  <TextContainer>
                    Auto-install section updates
                  </TextContainer>
                </SettingToggle>
                <Button primary submit loading={saving}>
                  Save Settings
                </Button>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}