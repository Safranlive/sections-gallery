// Sections Gallery Install Section Page
// Install purchased section to a theme

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Page,
  Layout,
  Card,
  Button,
  Badge,
  Stack,
  Text,
  Select,
  Banner,
  Toast,
  Frame,
  SkeletonBodyText,
  Icon
} from '@shopify/polaris';
import {
  InstallMinor,
  CheckoutMajor,
  CircleTickMajor
} from '@shopify/polaris-icons';
import api from '../services/api';

function InstallSection({ shop }) {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  
  const [section, setSection] = useState(null);
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  
  // Toast
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState(false);

  useEffect(() => {
    loadData();
  }, [sectionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load section details
      const sectionResponse = await api.get(`/sections/${sectionId}?shop=${shop}`);
      setSection(sectionResponse.data.section);
      
      // Check if purchased
      if (!sectionResponse.data.isPurchased) {
        showToast('You must purchase this section first', true);
        setTimeout(() => navigate(`/sections/${sectionId}`), 2000);
        return;
      }
      
      // Load themes
      const themesResponse = await api.get(`/themes?shop=${shop}`);
      setThemes(themesResponse.data.themes);
      
      // Auto-select main theme
      const mainTheme = themesResponse.data.themes.find(t => t.role === 'main');
      if (mainTheme) {
        setSelectedTheme(mainTheme.id.toString());
      }
      
    } catch (error) {
      console.error('Load data error:', error);
      showToast('Failed to load installation data', true);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async () => {
    if (!selectedTheme) {
      showToast('Please select a theme', true);
      return;
    }

    try {
      setInstalling(true);
      
      const response = await api.post(`/sections/${sectionId}/install`, {
        shop,
        themeId: selectedTheme
      });
      
      if (response.data.success) {
        setInstalled(true);
        showToast('Section installed successfully!', false);
      }
      
    } catch (error) {
      console.error('Install error:', error);
      const errorMessage = error.response?.data?.error || 'Installation failed';
      showToast(errorMessage, true);
    } finally {
      setInstalling(false);
    }
  };

  const showToast = (message, isError = false) => {
    setToastMessage(message);
    setToastError(isError);
    setToastActive(true);
  };

  if (loading) {
    return (
      <Page title="Install Section">
        <Layout>
          <Layout.Section>
            <Card>
              <SkeletonBodyText lines={5} />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Frame>
      <Page
        title="Install Section"
        breadcrumbs={[{ content: 'Back', onAction: () => navigate(`/sections/${sectionId}`) }]}
      >
        <Layout>
          {installed ? (
            <Layout.Section>
              <Banner status="success" title="Section Installed!">
                <p>The section has been successfully installed to your theme.</p>
                <ButtonGroup>
                  <Button primary onClick={() => navigate('/my-sections')}>
                    View My Sections
                  </Button>
                  <Button onClick={() => navigate('/marketplace')}>
                    Browse More Sections
                  </Button>
                </ButtonGroup>
              </Banner>
            </Layout.Section>
          ) : (
            <>
              <Layout.Section>
                <Card title={section?.name || 'Section'}>
                  <p>{section?.description}</p>
                </Card>
              </Layout.Section>

              <Layout.Section>
                <Card title="Select Theme">
                  <Stack vertical>
                    <Text>
                      Choose which theme to install this section to:
                    </Text>
                    <Select
                      label="Theme"
                      options={themes.map(theme => ({
                        label: `${theme.name} ${theme.role === 'main' ? '(Current)' : ''}`,
                        value: theme.id.toString()
                      }))}
                      value={selectedTheme}
                      onChange={setSelectedTheme}
                    />
                    <Button
                      primary
                      disabled={!selectedTheme}
                      loading={installing}
                      onClick={handleInstall}
                      icon={InstallMinor}
                    >
                      Install Now
                    </Button>
                  </Stack>
                </Card>
              </Layout.Section>
            </>
          )}
        </Layout>
      </Page>

      {toastActive && (
        <Toast
          content={toastMessage}
          error={toastError}
          onDismiss={() => setToastActive(false)}
        />
      )}
    </Frame>
  );
}

export default InstallSection;
