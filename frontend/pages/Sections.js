import React, { useState, useEffect } from 'react';
import { Page, Layout, Card, ResourceList, ResourceItem, Thumbnail, Button } from '@shopify/polaris';
import axios from 'axios';

export default function Sections() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await axios.get('/api/sections');
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const installSection = async (sectionId) => {
    try {
      await axios.post(`/api/sections/${sectionId}/install`);
      alert('Section installed successfully!');
      fetchSections();
    } catch (error) {
      console.error('Error installing section:', error);
      alert('Failed to install section');
    }
  };

  return (
    <Page title="Browse Sections" subtitle="Explore and install premium theme sections">
      <Layout>
        <Layout.Section>
          <Card>
            <ResourceList
              loading={loading}
              resourceName={{ singular: 'section', plural: 'sections' }}
              items={sections}
              renderItem={(item) => {
                const { id, name, description, thumbnail, category } = item;
                return (
                  <ResourceItem
                    id={id}
                    media={<Thumbnail source={thumbnail} alt={name} />}
                    accessibilityLabel={`View details for ${name}`}
                  >
                    <h3>
                      <strong>{name}</strong>
                    </h3>
                    <div>{description}</div>
                    <div style={{ marginTop: '8px' }}>
                      <Button size="slim" primary onClick={() => installSection(id)}>
                        Install
                      </Button>
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