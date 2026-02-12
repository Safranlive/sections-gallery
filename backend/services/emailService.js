const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.warn('Email service not configured. Set SMTP environment variables.');
    }
  }

  /**
   * Send welcome email to new merchant
   */
  async sendWelcomeEmail(email, storeName) {
    if (!this.transporter) {
      console.log('Email not sent - transporter not configured');
      return;
    }

    const subject = 'Welcome to Sections Gallery!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2C3E50;">Welcome to Sections Gallery! 🎉</h1>
        <p>Hi ${storeName},</p>
        <p>Thank you for installing Sections Gallery! You now have access to premium theme sections that will help you build beautiful, high-converting pages.</p>
        
        <h2 style="color: #2C3E50;">Getting Started</h2>
        <ol>
          <li>Browse available sections in your dashboard</li>
          <li>Install sections with one click</li>
          <li>Customize them in your theme editor</li>
          <li>Publish and watch your conversions grow!</li>
        </ol>

        <h2 style="color: #2C3E50;">Your Free Tier Includes</h2>
        <ul>
          <li>5 premium sections</li>
          <li>Basic customization options</li>
          <li>Community support</li>
        </ul>

        <p>Ready to unlock more sections? <a href="${process.env.SHOPIFY_APP_URL}/pricing" style="color: #3498DB;">Upgrade to Pro or Premium</a></p>

        <p>Need help? Reply to this email or visit our <a href="${process.env.SHOPIFY_APP_URL}/support" style="color: #3498DB;">support center</a>.</p>

        <p>Happy building!<br>The Sections Gallery Team</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Sections Gallery" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html,
      });
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  /**
   * Send subscription confirmation email
   */
  async sendSubscriptionConfirmation(email, storeName, tier, price) {
    if (!this.transporter) return;

    const subject = `Subscription Confirmed - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #27AE60;">Subscription Confirmed! ✓</h1>
        <p>Hi ${storeName},</p>
        <p>Your subscription to Sections Gallery ${tier.toUpperCase()} has been confirmed!</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Subscription Details</h3>
          <p><strong>Plan:</strong> ${tier.toUpperCase()}</p>
          <p><strong>Price:</strong> $${price}/month</p>
          <p><strong>Status:</strong> Active</p>
        </div>

        <p>You now have access to all ${tier.toUpperCase()} features. Start exploring!</p>
        
        <p><a href="${process.env.SHOPIFY_APP_URL}" style="background: #3498DB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a></p>

        <p>Questions? We're here to help at <a href="mailto:${process.env.SMTP_USER}">${process.env.SMTP_USER}</a></p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Sections Gallery" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html,
      });
    } catch (error) {
      console.error('Error sending subscription confirmation:', error);
    }
  }

  /**
   * Send section installation confirmation
   */
  async sendSectionInstalled(email, storeName, sectionName) {
    if (!this.transporter) return;

    const subject = `Section Installed: ${sectionName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2C3E50;">Section Installed Successfully!</h1>
        <p>Hi ${storeName},</p>
        <p>The <strong>${sectionName}</strong> section has been installed to your store.</p>
        
        <h3>Next Steps:</h3>
        <ol>
          <li>Go to your Shopify theme editor</li>
          <li>Add the section to your desired page</li>
          <li>Customize the content and styling</li>
          <li>Preview and publish</li>
        </ol>

        <p><a href="https://${storeName}/admin/themes" style="background: #3498DB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Open Theme Editor</a></p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Sections Gallery" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html,
      });
    } catch (error) {
      console.error('Error sending section installed email:', error);
    }
  }

  /**
   * Send subscription cancellation email
   */
  async sendSubscriptionCanceled(email, storeName) {
    if (!this.transporter) return;

    const subject = 'Subscription Canceled';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #E74C3C;">Subscription Canceled</h1>
        <p>Hi ${storeName},</p>
        <p>Your Sections Gallery subscription has been canceled. You'll continue to have access to your current features until the end of your billing period.</p>
        
        <p>We're sorry to see you go! If you have any feedback or encountered issues, please let us know.</p>

        <p>You can reactivate your subscription anytime from your dashboard.</p>

        <p><a href="${process.env.SHOPIFY_APP_URL}/pricing" style="background: #3498DB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Plans</a></p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Sections Gallery" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html,
      });
    } catch (error) {
      console.error('Error sending cancellation email:', error);
    }
  }
}

module.exports = new EmailService();