import React from 'react';
import { Page, Layout, Card, Button, TextContainer, List } from '@shopify/polaris';
import api from '../services/api';

export default function Pricing() {
  const handleSubscribe = async (tier) => {
    try {
      const response = await api.post('/subscriptions/create', { tier });
      window.location.href = response.data.checkoutUrl;
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  return (
    <Page title="Pricing" subtitle="Choose the perfect plan for your store">
      <Layout>
        <Layout.Section oneThird>
          <Card title="Free" sectioned>
            <TextContainer>
              <p><strong>$0/month</strong></p>
              <List>
                <List.Item>5 premium sections</List.Item>
                <List.Item>Basic customization</List.Item>
                <List.Item>Community support</List.Item>
              </List>
              <Button>Current Plan</Button>
            </TextContainer>
          </Card>
        </Layout.Section>
        <Layout.Section oneThird>
          <Card title="Pro" sectioned>
            <TextContainer>
              <p><strong>$29/month</strong></p>
              <List>
                <List.Item>20 premium sections</List.Item>
                <List.Item>Advanced customization</List.Item>
                <List.Item>Priority support</List.Item>
                <List.Item>Analytics dashboard</List.Item>
              </List>
              <Button primary onClick={() => handleSubscribe('PRO')}>Subscribe</Button>
            </TextContainer>
          </Card>
        </Layout.Section>
        <Layout.Section oneThird>
          <Card title="Premium" sectioned>
            <TextContainer>
              <p><strong>$79/month</strong></p>
              <List>
                <List.Item>Unlimited sections</List.Item>
                <List.Item>Full customization</List.Item>
                <List.Item>24/7 dedicated support</List.Item>
                <List.Item>Advanced analytics</List.Item>
                <List.Item>Custom development</List.Item>
              </List>
              <Button primary onClick={() => handleSubscribe('PREMIUM')}>Subscribe</Button>
            </TextContainer>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}