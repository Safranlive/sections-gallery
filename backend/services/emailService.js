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
        <h1 style="color: #2C3E50;">Subscription Confirmed! 🎉</h1>
        <p>Hi ${storeName},</p>
        <p>Your subscription to the <strong>${tier}</strong> plan has been confirmed.</p>
        
        <h2 style="color: #2C3E50;">Subscription Details</h2>
        <ul>
          <li><strong>Plan:</strong> ${tier}</li>
          <li><strong>Price:</strong> $${price}/month</li>
          <li><strong>Billing:</strong> Monthly</li>
        </ul>

        <p>You now have access to all ${tier} features. Start exploring!</p>

        <p><a href="${process.env.SHOPIFY_APP_URL}" style="background: #3498DB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Dashboard</a></p>

        <p>Questions? Contact us anytime at support@sections-gallery.com</p>

        <p>Best regards,<br>The Sections Gallery Team</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Sections Gallery" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html,
      });
      console.log(`Subscription confirmation sent to ${email}`);
    } catch (error) {
      console.error('Error sending subscription confirmation:', error);
    }
  }

  /**
   * Send section installed notification
   */
  async sendSectionInstalledNotification(email, storeName, sectionName) {
    if (!this.transporter) return;

    const subject = `Section Installed: ${sectionName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2C3E50;">Section Installed Successfully!</h1>
        <p>Hi ${storeName},</p>
        <p>The <strong>${sectionName}</strong> section has been successfully installed to your theme.</p>
        
        <h2 style="color: #2C3E50;">Next Steps</h2>
        <ol>
          <li>Go to your Shopify theme editor</li>
          <li>Add the section to your desired page</li>
          <li>Customize the settings to match your brand</li>
          <li>Preview and publish!</li>
        </ol>

        <p><a href="https://${storeName}/admin/themes" style="background: #3498DB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Open Theme Editor</a></p>

        <p>Need help? Check our <a href="${process.env.SHOPIFY_APP_URL}/docs" style="color: #3498DB;">documentation</a>.</p>

        <p>Happy customizing!<br>The Sections Gallery Team</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Sections Gallery" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html,
      });
      console.log(`Section installed notification sent to ${email}`);
    } catch (error) {
      console.error('Error sending section installed notification:', error);
    }
  }
}

module.exports = new EmailService();