import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page, Layout, Card, Form, FormLayout, Select, Checkbox, Button, Banner } from '@shopify/polaris';
import api from '../services/api';

export default function InstallSection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [autoPublish, setAutoPublish] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [sectionResponse, themesResponse] = await Promise.all([
        api.get(`/sections/${id}`),
        api.get('/shopify/themes')
      ]);
      setSection(sectionResponse.data);
      setThemes(themesResponse.data.map(t => ({
        label: t.name,
        value: t.id.toString()
      })));
      if (themesResponse.data.length > 0) {
        setSelectedTheme(themesResponse.data[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load installation data');
    }
  };

  const handleInstall = async () => {
    if (!selectedTheme) {
      setError('Please select a theme');
      return;
    }

    setInstalling(true);
    setError(null);

    try {
      await api.post(`/sections/${id}/install`, {
        themeId: selectedTheme,
        autoPublish
      });
      alert('Section installed successfully!');
      navigate('/my-sections');
    } catch (error) {
      console.error('Error installing section:', error);
      setError(error.response?.data?.message || 'Failed to install section');
    } finally {
      setInstalling(false);
    }
  };

  if (!section) return <Page title="Loading..." />;

  return (
    <Page
      title={`Install ${section.name}`}
      breadcrumbs={[{ content: 'Back', onAction: () => navigate(-1) }]}
    >
      <Layout>
        <Layout.Section>
          {error && (
            <Banner status="critical" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          )}
          <Card sectioned>
            <Form onSubmit={handleInstall}>
              <FormLayout>
                <Select
                  label="Select Theme"
                  options={themes}
                  value={selectedTheme}
                  onChange={setSelectedTheme}
                  placeholder="Choose a theme"
                />
                <Checkbox
                  label="Automatically publish changes"
                  checked={autoPublish}
                  onChange={setAutoPublish}
                  helpText="The section will be immediately available on your live theme"
                />
                <Button primary submit loading={installing}>
                  Install Section
                </Button>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <Card title="What happens next?" sectioned>
            <p>1. The section will be added to your selected theme</p>
            <p>2. You can customize it in the theme editor</p>
            <p>3. Add it to any page using the theme customizer</p>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}