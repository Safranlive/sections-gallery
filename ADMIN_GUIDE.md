# 🎛️ Sections Gallery - Admin Panel Guide

**Complete guide to managing your section marketplace**

Admin Panel URL: `http://localhost:3001` (development) or `https://admin.yourdomain.com` (production)

---

## 🔐 Accessing the Admin Panel

### Login Credentials

**Default Admin Account**:
- **Email**: `safranlive@gmail.com`
- **Password**: Set in `.env` file (`ADMIN_PASSWORD`)

### First-Time Login

1. Open admin panel: http://localhost:3001
2. Enter your credentials
3. Click **Login**
4. You'll see the Dashboard

---

## 🏠 Dashboard Overview

### Main Navigation

The admin panel has 4 main tabs:

1. **📊 Dashboard** - Overview and quick stats
2. **🎨 Sections** - Manage marketplace sections
3. **🏪 Shops** - View authenticated stores
4. **💰 Purchases** - Track transactions

---

## 📊 Dashboard Tab

### What You'll See

**Statistics Cards**:
- **Total Sections** - Number of sections in marketplace
- **Total Shops** - Number of authenticated stores
- **Total Revenue** - Sum of all purchases

**Quick Actions**:
- **Create New Section** button - Opens section creation form

### Understanding the Stats

**Total Sections**:
- Counts all active sections
- Includes both free and paid sections
- Updates in real-time when sections are added/removed

**Total Shops**:
- Counts unique authenticated shops
- Increments when new shops install your app
- Shows customer base size

**Total Revenue**:
- Sum of all completed purchases
- Displayed in USD
- Excludes pending/failed transactions

---

## 🎨 Sections Tab

### Section List View

**Grid Layout**:
- Cards showing each section
- Thumbnail image
- Section name
- Price
- Category
- Edit and Delete buttons

### Creating a New Section

1. Click **"Create New Section"** button
2. Fill in the form (see below)
3. Click **"Create Section"**
4. Section appears in marketplace immediately

#### Section Form Fields

**Basic Information**:

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| Name | Yes | Section display name | "Hero Banner" |
| Description | Yes | Detailed description | "Full-width hero with CTA" |
| Category | No | Section type | "Hero Sections" |
| Price | Yes | Price in USD | 49.99 |

**Media URLs**:

| Field | Required | Description | Format |
|-------|----------|-------------|--------|
| Thumbnail URL | No | Small preview image | https://example.com/thumb.jpg |
| Preview URL | No | Full preview image | https://example.com/preview.jpg |
| Video URL | No | Demo video | https://youtube.com/watch?v=abc123 |

**Tip**: Use high-quality images (1200x800px recommended for previews)

**Features**:

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| Features | No | Comma-separated list | "Responsive, Customizable, Fast" |

**Section Code**:

| Field | Required | Description | Notes |
|-------|----------|-------------|-------|
| Liquid Code | Yes | Section template | Must include {% schema %} |
| CSS Code | No | Styling | Can be inline or separate |
| JavaScript Code | No | Interactive features | Plain JavaScript |
| Schema JSON | No | Settings configuration | JSON object |

#### Code Upload Methods

**Method 1: Paste Code Directly**
- Copy your code
- Paste into text area
- System handles formatting

**Method 2: Upload from File**
- Click **"Upload File"** button
- Select `.liquid`, `.css`, or `.js` file
- Content populates automatically

#### Liquid Code Requirements

Your Liquid code **must** include a schema:

```liquid
{% schema %}
{
  "name": "Section Name",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Welcome"
    }
  ]
}
{% endschema %}

<div class="my-section">
  <h2>{{ section.settings.heading }}</h2>
</div>
```

**Important**:
- Schema is **required** by Shopify
- Settings define customizable fields
- HTML goes after schema
- Use Liquid syntax for dynamic content

#### CSS Code Guidelines

**Inline CSS** (in Liquid file):
```liquid
<style>
  .my-section {
    padding: 2rem;
    background: #f5f5f5;
  }
</style>
```

**Separate CSS** (in CSS field):
```css
.my-section {
  padding: 2rem;
  background: #f5f5f5;
}
```

**Best Practices**:
- Use unique class names
- Avoid `!important`
- Make it responsive
- Test on mobile

#### JavaScript Guidelines

**Vanilla JavaScript Only**:
```javascript
document.addEventListener('DOMContentLoaded', function() {
  const section = document.querySelector('.my-section');
  section.addEventListener('click', function() {
    console.log('Section clicked');
  });
});
```

**Don't Use**:
- jQuery (unless merchant has it)
- External libraries (no CDN access)
- ES6 modules

**Best Practices**:
- Wait for DOM ready
- Use event delegation
- Clean up listeners
- Handle errors gracefully

### Editing a Section

1. Find section in list
2. Click **"Edit"** button
3. Modal opens with current values
4. Modify any field
5. Click **"Update Section"**
6. Changes save immediately

**What You Can Edit**:
- ✅ Name, description, category
- ✅ Price
- ✅ All media URLs
- ✅ Features list
- ✅ All code (Liquid, CSS, JS)
- ✅ Schema JSON

**What Happens**:
- Existing purchases not affected
- New customers see updated version
- Already installed sections need reinstall to update

### Deleting a Section

1. Click **"Delete"** button on section card
2. Confirmation prompt appears
3. Click **"Yes, delete it"** to confirm
4. Section removed from marketplace

**Important Notes**:
- ⚠️ Deletion is permanent
- ⚠️ Already purchased sections remain functional
- ⚠️ Customers keep their installations
- ⚠️ New purchases blocked

**When to Delete**:
- Section has major bugs
- Replacing with better version
- Discontinuing product
- Testing completed

---

## 🏪 Shops Tab

### Shop List View

**Table Columns**:
- **Shop Domain** - Full myshopify.com domain
- **First Install** - When shop first authenticated
- **Purchases** - Number of sections bought

### Shop Information

**What You See**:
- Complete shop domain
- OAuth installation date
- Purchase count
- Purchase details (expandable)

**What You Can't See** (Privacy):
- Shop owner information
- Access tokens
- Customer data
- Sales information

### Understanding Shop Data

**Shop Domain**:
- Format: `store-name.myshopify.com`
- Unique identifier
- Used for API calls
- Click to copy

**First Install Date**:
- When shop completed OAuth
- UTC timestamp
- Tracks customer lifetime

**Purchase Count**:
- Total sections purchased
- Includes all transactions
- Shows customer value

### Shop Actions

**View Purchases**:
1. Click shop row
2. See all purchases
3. Section names and prices
4. Purchase dates

**No Direct Management**:
- Cannot delete shops (automatic via OAuth)
- Cannot modify shop data
- Cannot access shop admin
- Cannot see shop owner details

---

## 💰 Purchases Tab

### Purchase History View

**Table Columns**:
- **Shop** - Which store made the purchase
- **Section** - Which section was purchased
- **Amount** - Price paid
- **Date** - When purchase occurred
- **Status** - completed/pending/failed

### Purchase Details

**Purchase Record Includes**:
- Shop domain
- Section name
- Amount paid (USD)
- Purchase timestamp
- Payment status
- Charge ID (internal)

### Purchase Statuses

**Completed** ✅:
- Payment successful
- Section access granted
- Installation available
- Most common status

**Pending** ⏳:
- Payment initiated
- Awaiting Shopify confirmation
- Installation blocked
- Usually resolves quickly

**Failed** ❌:
- Payment declined
- Access not granted
- Rare occurrence
- Customer should retry

### Revenue Tracking

**Total Revenue**:
- Sum of all completed purchases
- Displayed in Dashboard
- Real-time updates
- Excludes pending/failed

**Calculating Revenue**:
```
Total Revenue = SUM(amount WHERE status = 'completed')
```

**Revenue by Section**:
- See which sections sell best
- Sort by purchase count
- Identify top performers
- Guide pricing decisions

### Export Functionality (Future)

**Coming Soon**:
- Export to CSV
- Date range filtering
- Revenue reports
- Tax documentation

---

## 🎨 User Interface Guide

### Dark Theme Design

**Color Scheme**:
- Background: `#0a0a0a` (deep black)
- Cards: `#1a1a1a` (dark gray)
- Borders: `#2a2a2a` (medium gray)
- Text: `#ffffff` (white)
- Muted Text: `#a0a0a0` (light gray)
- Primary: `#3b82f6` (blue)
- Success: `#10b981` (green)
- Danger: `#ef4444` (red)

**Inspired by**: Shadcn UI design system

### Typography

**Fonts**:
- Primary: Inter
- Fallback: System fonts
- Code: Monospace

**Sizes**:
- Heading 1: 2.5rem (40px)
- Heading 2: 2rem (32px)
- Heading 3: 1.5rem (24px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)

### Buttons

**Primary Button**:
- Blue background (#3b82f6)
- White text
- Hover: Darker blue
- Use for main actions

**Danger Button**:
- Red background (#ef4444)
- White text
- Hover: Darker red
- Use for delete actions

**Secondary Button**:
- Transparent background
- Border outline
- Hover: Light fill
- Use for cancel actions

### Forms

**Input Fields**:
- Dark background
- Light border
- White text
- Focus: Blue border

**Text Areas**:
- Same styling as inputs
- Resizable
- Monospace for code

**File Upload**:
- Drag and drop area
- Or click to browse
- Shows file name when selected

### Cards

**Section Cards**:
- Hover effect (lift + shadow)
- Thumbnail at top
- Content below
- Actions at bottom

**Stat Cards**:
- Large number display
- Icon indicator
- Label below
- Colored accent

### Modals

**Edit Modal**:
- Centered overlay
- Dark background
- Scrollable content
- Close button (X)

**Confirm Dialog**:
- Smaller size
- Warning icon
- Yes/No buttons
- Escape to cancel

### Responsive Design

**Desktop** (1024px+):
- Full sidebar navigation
- Multi-column layouts
- Large forms

**Tablet** (768px - 1023px):
- Collapsible sidebar
- Two-column layouts
- Medium forms

**Mobile** (< 768px):
- Bottom navigation
- Single column
- Compact forms
- Touch-friendly buttons

---

## ⚙️ Settings & Configuration

### Admin Credentials

**Changing Admin Password**:
1. Stop server
2. Edit `.env` file
3. Update `ADMIN_PASSWORD`
4. Restart server
5. Login with new password

**Changing Admin Email**:
1. Stop server
2. Edit `.env` file
3. Update `ADMIN_EMAIL`
4. Restart server
5. Login with new email

**Security Best Practices**:
- Use strong passwords (12+ characters)
- Include uppercase, lowercase, numbers, symbols
- Don't share credentials
- Change password regularly
- Use password manager

### JWT Token Settings

**Token Expiration**:
- Default: 24 hours
- Configurable in `server.js`
- Balance security vs UX

**Token Secret**:
- Set in `.env` as `JWT_SECRET`
- Use random string (32+ characters)
- Never expose publicly
- Rotate if compromised

### Backend URL

**Development**:
```
http://localhost:5000
```

**Production**:
```
https://api.yourdomain.com
```

Update in admin panel API configuration.

---

## 🔒 Security Best Practices

### Authentication

**JWT Tokens**:
- Stored in localStorage (development)
- Use httpOnly cookies (production)
- Include in Authorization header
- Expires after 24 hours

**Login Security**:
- No username enumeration
- Rate limiting recommended
- Failed login tracking
- Account lockout (optional)

### Authorization

**Admin-Only Access**:
- All admin endpoints require JWT
- Token validated on every request
- Invalid tokens rejected
- Expired tokens auto-logout

### Data Protection

**Sensitive Data**:
- Access tokens encrypted in database
- Passwords hashed with bcrypt
- No plain text secrets
- Environment variables for config

**CORS Policy**:
- Whitelist specific domains
- No wildcard (`*`) in production
- Include credentials flag
- Verify origin

### API Security

**Input Validation**:
- Sanitize all inputs
- Validate data types
- Check string lengths
- Prevent SQL injection

**Output Encoding**:
- Escape HTML
- Prevent XSS attacks
- Sanitize user content
- Safe JSON responses

---

## 🐛 Troubleshooting

### Common Issues

**1. Can't Login**

**Symptoms**:
- "Invalid credentials" error
- Button doesn't respond
- Page refreshes but stays on login

**Solutions**:
```bash
# Check .env file
cat .env | grep ADMIN

# Verify email and password match
# No spaces, correct capitalization

# Check server logs
npm run server

# Test login endpoint
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"safranlive@gmail.com","password":"yourpassword"}'
```

**2. Section Create/Edit Fails**

**Symptoms**:
- Form submits but no section appears
- Error message shows
- Page reloads without saving

**Solutions**:
- Check all required fields filled
- Verify Liquid code has schema
- Check price is valid number
- Look for server errors in console
- Verify JWT token still valid

**3. Sections Don't Display**

**Symptoms**:
- Sections tab is empty
- "No sections found" message
- Loading spinner forever

**Solutions**:
```bash
# Check database
npx prisma studio

# Verify sections exist
# Check backend is running
curl http://localhost:5000/api/admin/sections \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check console for errors
```

**4. Image URLs Don't Work**

**Symptoms**:
- Broken image icons
- "Failed to load" errors
- Blank thumbnails

**Solutions**:
- Verify URLs are publicly accessible
- Check HTTPS (not HTTP)
- Test URL in browser directly
- Use image hosting service (Cloudinary, S3)
- Check CORS headers on image host

**5. Token Expired**

**Symptoms**:
- "Invalid token" error
- Redirects to login
- API calls fail with 401

**Solutions**:
- Login again to get new token
- Token expires after 24 hours (default)
- Check system time is correct
- Verify JWT_SECRET hasn't changed

**6. Shops Don't Appear**

**Symptoms**:
- Shops tab empty
- No data shown
- Fresh install has no shops

**Solutions**:
- Shops populate when merchants install app
- Complete OAuth flow at least once
- Check backend OAuth endpoint works
- Verify database connection

**7. Revenue Calculation Wrong**

**Symptoms**:
- Total revenue doesn't match sum
- Negative numbers
- Missing purchases

**Solutions**:
- Only counts completed purchases
- Check purchase status in database
- Verify price format (decimal)
- Look for pending/failed transactions

---

## 💡 Tips & Best Practices

### Section Management

**Naming Sections**:
- ✅ Descriptive names ("Hero Banner")
- ✅ Include version if iterating ("Hero v2")
- ❌ Generic names ("Section 1")
- ❌ Technical names ("hero_banner_v1")

**Pricing Strategy**:
- Research competitor pricing
- Start higher, can always lower
- Bundle discounts for multiple sections
- Premium for advanced features
- Free sections for lead generation

**Description Writing**:
- Lead with benefits
- List key features
- Mention compatibility
- Include use cases
- Call to action

**Media Assets**:
- Professional thumbnails (1200x800px)
- Clean preview screenshots
- Short demo videos (< 2min)
- Show section in context
- Multiple device views

### Content Organization

**Categories**:
- Hero Sections
- Product Display
- Social Proof
- Information
- Lead Generation
- Navigation
- Footer
- Custom

**Features Tags**:
- Responsive
- Customizable
- Animation
- Video Support
- Form Integration
- etc.

### Testing Sections

**Before Publishing**:
1. Test on development store
2. Check multiple themes
3. Verify mobile responsive
4. Test all settings
5. Review code quality
6. Spell check description
7. Test purchase flow
8. Verify installation works

### Customer Support

**Common Questions**:
- How to install
- How to customize
- Troubleshooting errors
- Refund requests
- Custom development

**Response Templates**:
- Installation guide
- Customization instructions
- Error solutions
- Refund policy
- Contact information

---

## 📊 Analytics & Insights

### Key Metrics to Track

**Section Performance**:
- Total purchases per section
- Revenue per section
- Conversion rate (views to purchases)
- Average purchase value
- Most popular categories

**Customer Behavior**:
- New shops per week/month
- Average sections per customer
- Customer lifetime value
- Repeat purchase rate
- Churn rate

**Revenue Metrics**:
- Monthly recurring revenue (if subscriptions)
- Total revenue
- Average order value
- Revenue per shop
- Growth rate

### Using Data for Decisions

**Which Sections to Create**:
- Look at popular categories
- Check customer requests
- Analyze competitor offerings
- Identify gaps in marketplace
- Survey customers

**Pricing Optimization**:
- Test different price points
- A/B test pricing
- Seasonal discounts
- Bundle pricing
- Volume discounts

**Marketing Focus**:
- Promote top sellers
- Feature new sections
- Highlight customer favorites
- Seasonal campaigns
- Partner integrations

---

## 🚀 Advanced Features (Future)

### Planned Enhancements

**Version 2.0**:
- [ ] Section ratings and reviews
- [ ] Customer comments
- [ ] Section updates/changelog
- [ ] Bulk actions (edit/delete multiple)
- [ ] Advanced search filters

**Version 3.0**:
- [ ] Analytics dashboard
- [ ] Revenue charts
- [ ] Customer segmentation
- [ ] Email notifications
- [ ] Webhook integrations

**Version 4.0**:
- [ ] Multi-language support
- [ ] Currency conversion
- [ ] Subscription plans
- [ ] API access for developers
- [ ] White-label options

---

## 📞 Need Help?

### Support Channels

**Developer Support**:
- 📧 Email: safranlive@gmail.com
- 📱 Phone: +94 777 565 057
- 🌐 Website: [www.systo.lk](https://www.systo.lk)

**Documentation**:
- [@file:code/README.md](README.md) - Project overview
- [@file:code/SETUP.md](SETUP.md) - Setup guide
- [@file:code/API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
- [@file:code/DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide

**Community**:
- GitHub Issues (bug reports)
- GitHub Discussions (questions)
- Email support (urgent issues)

---

## 📝 Quick Reference

### Common Tasks

**Add New Section**:
1. Dashboard → Create New Section
2. Fill form
3. Upload code
4. Create

**Edit Section Price**:
1. Sections tab
2. Find section
3. Click Edit
4. Update price
5. Save

**Delete Section**:
1. Sections tab
2. Click Delete
3. Confirm

**Check Revenue**:
1. Dashboard tab
2. View Total Revenue card

**View Shop Purchases**:
1. Shops tab
2. Click shop row
3. See purchases

### Keyboard Shortcuts

**Navigation**:
- `Ctrl/Cmd + K` - Quick search (future)
- `Esc` - Close modal
- `Tab` - Navigate form fields
- `Enter` - Submit form

### URLs

**Admin Panel**:
```
http://localhost:3001
```

**Backend API**:
```
http://localhost:5000
```

**Prisma Studio**:
```
http://localhost:5555
```

---

## 🎉 Admin Panel Mastery

You now know how to:

✅ Login securely  
✅ Navigate all tabs  
✅ Create sections  
✅ Edit existing sections  
✅ Delete sections  
✅ View shops  
✅ Track purchases  
✅ Calculate revenue  
✅ Troubleshoot issues  
✅ Follow best practices  

**Your Sections Gallery admin panel is ready to manage your marketplace!** 🚀

---

**Last Updated**: February 2024  
**Version**: 2.0.0  
**Status**: Production Ready ✅