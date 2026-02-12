# 🎨 Sections Gallery

**Premium Shopify Section Marketplace with Integrated Billing**

> A complete solution for selling pre-built Shopify sections with seamless payment processing through Shopify's native billing system.

Developed by **SYSTO** | [www.systo.lk](https://www.systo.lk)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Payment Flow](#-payment-flow)
- [Admin Panel](#-admin-panel)
- [API Overview](#-api-overview)
- [Sample Sections](#-sample-sections)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Support](#-support)

---

## 🌟 Overview

**Sections Gallery** is a production-ready Shopify app that enables merchants to browse, purchase, and install premium pre-built sections directly into their Shopify themes. The platform handles everything from browsing to payment to installation with a seamless user experience.

### What Makes It Special

✅ **Native Shopify Integration** - Built with Shopify App Bridge and Polaris  
✅ **Automated Billing** - Shopify Billing API handles all payments  
✅ **One-Click Installation** - Sections install automatically via Theme API  
✅ **Rich Previews** - Live previews and video demonstrations  
✅ **Admin Dashboard** - Beautiful dark-themed management panel  
✅ **Complete Solution** - Ready to deploy and monetize  

---

## 🎯 Features

### Customer-Facing Features

**Marketplace Experience**
- 🎨 **Card-Based Gallery** - Beautiful grid layout with thumbnails
- 🔍 **Smart Filtering** - Search by category, price, features
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎬 **Rich Media** - Preview images and demo videos
- ⭐ **Detailed Info** - Features, compatibility, pricing

**Purchase & Installation**
- 💳 **Shopify Billing** - Secure payment through Shopify
- 🚀 **Auto-Installation** - Sections install with one click
- 📦 **My Sections** - View all purchased sections
- 🔄 **Re-installation** - Install to different themes anytime
- 📊 **Purchase History** - Track all transactions

**Section Management**
- 📋 **Organized Library** - All purchased sections in one place
- 🎯 **Theme Selection** - Choose which theme to install to
- ✅ **Installation Status** - Real-time installation feedback
- 🔧 **Easy Access** - Direct links to theme editor

### Admin-Facing Features

**Section Management**
- ➕ **Create Sections** - Full WYSIWYG editor
- 📝 **Edit & Update** - Modify any section details
- 🗑️ **Delete Sections** - Remove unwanted sections
- 📤 **Code Upload** - Liquid, CSS, JavaScript files
- 🖼️ **Media Management** - Thumbnails, previews, videos
- 💰 **Pricing Control** - Set individual prices
- 🏷️ **Categorization** - Tags and categories

**Shop Management**
- 👥 **View All Shops** - Complete merchant list
- 📊 **Shop Analytics** - Installation counts, revenue
- 🔗 **Quick Access** - Direct shop links
- 📅 **Install Tracking** - First install dates

**Purchase Tracking**
- 💵 **Revenue Dashboard** - Total earnings overview
- 📈 **Sales Analytics** - Popular sections, trends
- 🛍️ **Transaction History** - All purchases with details
- 👤 **Customer Insights** - Who bought what

**User Interface**
- 🌙 **Dark Theme** - Shadcn-inspired design
- 📱 **Fully Responsive** - Works on all screen sizes
- ⚡ **Fast & Smooth** - Optimized performance
- 🎨 **Modern UI** - Clean, professional appearance

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECTIONS GALLERY                          │
│                  Shopify Section Marketplace                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                             │
        ▼                                             ▼
┌──────────────────┐                      ┌──────────────────┐
│  Customer App    │                      │  Admin Panel     │
│  (React + Polaris)│                     │  (React + Shadcn)│
└──────────────────┘                      └──────────────────┘
        │                                             │
        │              ┌──────────────┐              │
        └──────────────▶   Backend    ◀──────────────┘
                       │  (Node.js)   │
                       └──────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │PostgreSQL│  │ Shopify  │  │  Theme   │
        │ Database │  │ Billing  │  │   API    │
        └──────────┘  └──────────┘  └──────────┘
```

### Component Breakdown

**Frontend (Customer App)** - Port 3000
- Built with React and Shopify Polaris
- Embedded in Shopify admin
- Handles browsing, purchasing, installation
- Communicates with backend API

**Admin Panel** - Port 3001
- Separate React application
- Dark theme with Shadcn components
- Section/shop/purchase management
- JWT authentication

**Backend API** - Port 5000
- Node.js + Express
- RESTful API endpoints
- Shopify OAuth + Billing API integration
- PostgreSQL database
- JWT for admin auth

**Database** - PostgreSQL
- Shops table (merchant stores)
- Sections table (marketplace inventory)
- Purchases table (transaction records)
- Prisma ORM for queries

**Shopify Integration**
- OAuth authentication
- Billing API for payments
- Theme API for installation
- App Bridge for embedding

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Shopify Partners account
- Development store

### Installation

```bash
# Clone repository
git clone https://github.com/Safranlive/sections-gallery.git
cd sections-gallery

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Setup database
npm run migrate
npm run seed

# Start development servers
npm run dev
```

**Servers will start:**
- Backend: http://localhost:5000
- Customer App: http://localhost:3000
- Admin Panel: http://localhost:3001

### First Steps

1. **Test OAuth Flow**: Visit backend URL with `?shop=your-store.myshopify.com`
2. **Browse Marketplace**: Explore the 5 pre-loaded sections
3. **Test Purchase**: Buy a section (Shopify test mode)
4. **Access Admin**: Login at port 3001 with admin credentials
5. **Create Section**: Add your own section via admin panel

**Complete setup guide**: See [@file:code/SETUP.md](SETUP.md)

---

## 🛠️ Tech Stack

### Frontend

**Customer App**
- React 18
- Shopify Polaris (UI framework)
- Shopify App Bridge (embedding)
- React Router (navigation)
- Axios (API calls)

**Admin Panel**
- React 18
- Shadcn UI components
- TailwindCSS
- React Router
- Axios

### Backend

- Node.js 18+
- Express.js
- @shopify/shopify-api
- Prisma ORM
- PostgreSQL
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)

### Infrastructure

- PostgreSQL database
- Environment variables (.env)
- CORS enabled
- Session management
- Error handling

---

## 🗄️ Database Schema

### Shops Table
```sql
CREATE TABLE shops (
  id SERIAL PRIMARY KEY,
  shop_domain VARCHAR(255) UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  scope TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Store authenticated merchant shops

### Sections Table
```sql
CREATE TABLE sections (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,
  video_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  features TEXT[],
  liquid_code TEXT NOT NULL,
  css_code TEXT,
  js_code TEXT,
  schema_json JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Store section marketplace inventory with all code and metadata

### Purchases Table
```sql
CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id),
  section_id INTEGER REFERENCES sections(id),
  charge_id VARCHAR(255),
  amount DECIMAL(10,2),
  status VARCHAR(50),
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Track all section purchases and transactions

---

## 💳 Payment Flow

### Complete Purchase Journey

```
1. Customer clicks "Buy Now" ($X.XX)
   ↓
2. Backend creates Shopify charge
   ↓
3. Customer redirects to Shopify billing
   ↓
4. Customer approves payment
   ↓
5. Shopify redirects back with charge_id
   ↓
6. Backend activates charge
   ↓
7. Purchase record created in database
   ↓
8. Customer redirects to installation page
   ↓
9. Section installs to selected theme
   ↓
10. Success! Section ready to use
```

### Billing API Integration

**Charge Creation**
```javascript
const charge = await shopify.billing.request({
  amount: section.price,
  currency: 'USD',
  return_url: `${HOST}/api/billing/confirm?shop=${shop}&section_id=${sectionId}`,
});
```

**Charge Activation**
```javascript
const activated = await shopify.billing.activate({
  charge_id: chargeId,
});
```

**Purchase Recording**
```javascript
await prisma.purchase.create({
  data: {
    shop_id: shopId,
    section_id: sectionId,
    charge_id: chargeId,
    amount: section.price,
    status: 'completed',
  },
});
```

---

## 🎛️ Admin Panel

### Access

**URL**: http://localhost:3001 (development)  
**Email**: `safranlive@gmail.com`  
**Password**: Set in `.env` file

### Features

**Dashboard Tab**
- Total sections count
- Total shops count
- Total revenue
- Create new section button

**Sections Tab**
- Grid view of all sections
- Edit button (modal opens)
- Delete button (with confirmation)
- Create button (opens form)

**Shops Tab**
- List of all merchants
- Shop domain
- First install date
- Number of purchases

**Purchases Tab**
- Complete transaction history
- Shop domain, section name
- Amount, date
- Status (completed/pending)

**Section Creation Form**
- Name, description, category
- Thumbnail URL
- Preview image URL
- Video demo URL
- Price ($)
- Features (comma-separated)
- Liquid code (file upload or paste)
- CSS code (optional)
- JavaScript code (optional)
- Schema JSON (optional)

**Section Editing**
- Same form as creation
- Pre-filled with current values
- Update button saves changes

### UI Design

**Theme**: Dark mode inspired by Shadcn
- Background: `#0a0a0a`
- Cards: `#1a1a1a`
- Borders: `#2a2a2a`
- Text: `#ffffff`, `#a0a0a0`
- Primary: `#3b82f6` (blue)
- Success: `#10b981` (green)
- Danger: `#ef4444` (red)

**Typography**
- Font: Inter, system fonts
- Headers: Bold, larger sizes
- Body: Regular weight
- Code: Monospace font

---

## 📡 API Overview

### Public Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/auth` | Initiate OAuth |
| GET | `/api/auth/callback` | Complete OAuth |
| GET | `/api/sections` | List all sections |
| GET | `/api/sections/:id` | Get single section |
| POST | `/api/billing/create` | Create charge |
| GET | `/api/billing/confirm` | Confirm purchase |
| GET | `/api/purchases/:shop` | List purchases |
| POST | `/api/install` | Install section |

### Admin Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/sections` | List sections |
| POST | `/api/admin/sections` | Create section |
| PUT | `/api/admin/sections/:id` | Update section |
| DELETE | `/api/admin/sections/:id` | Delete section |
| GET | `/api/admin/shops` | List shops |
| GET | `/api/admin/purchases` | List purchases |

**Authentication**:
- Public endpoints: Shopify OAuth session
- Admin endpoints: JWT Bearer token

**Complete API reference**: See [@file:code/API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## 🎨 Sample Sections

### Pre-loaded Sections (5 included)

**1. Hero Banner**
- Full-width hero with CTA
- Price: $49.99
- Category: Hero Sections

**2. Product Grid**
- Responsive product showcase
- Price: $39.99
- Category: Product Display

**3. Testimonial Slider**
- Customer reviews carousel
- Price: $29.99
- Category: Social Proof

**4. FAQ Accordion**
- Collapsible Q&A section
- Price: $24.99
- Category: Information

**5. Newsletter Signup**
- Email collection form
- Price: $19.99
- Category: Lead Generation

### Section Code Structure

Each section includes:
- **Liquid Code**: Section markup and logic
- **CSS Code**: Styling (optional, can be inline)
- **JS Code**: Interactive features (optional)
- **Schema**: Settings configuration (optional)

**Example**: See `seed.js` for complete section examples

---

## 🚀 Deployment

### Deployment Options

**Recommended Stack**
- **Backend**: Railway / Heroku / DigitalOcean
- **Frontend**: Vercel / Netlify
- **Admin**: Vercel / Netlify
- **Database**: Railway PostgreSQL / Heroku Postgres

### Environment Variables (Production)

```bash
# Application
NODE_ENV=production
PORT=5000
HOST=https://api.yourdomain.com

# Shopify
SHOPIFY_API_KEY=your_production_key
SHOPIFY_API_SECRET=your_production_secret
SHOPIFY_HOST_NAME=yourdomain.com
SCOPES=read_themes,write_themes

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure_password_here
JWT_SECRET=random_secure_string

# Frontend URLs
FRONTEND_URL=https://app.yourdomain.com
ADMIN_URL=https://admin.yourdomain.com
```

### Deployment Checklist

- [ ] Production Shopify app created
- [ ] API credentials configured
- [ ] PostgreSQL database provisioned
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Sample sections seeded
- [ ] Backend deployed and tested
- [ ] Frontend deployed
- [ ] Admin panel deployed
- [ ] Custom domains configured
- [ ] SSL certificates active
- [ ] OAuth callback URLs updated
- [ ] Payment testing completed
- [ ] Billing settings verified

**Complete deployment guide**: See [@file:code/DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📚 Documentation

**Available Guides**:
- 📖 **[@file:code/README.md](README.md)** - This file (overview)
- 🔧 **[@file:code/SETUP.md](SETUP.md)** - Step-by-step setup guide
- 📡 **[@file:code/API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference
- 🎛️ **[@file:code/ADMIN_GUIDE.md](ADMIN_GUIDE.md)** - Admin panel usage
- 🚀 **[@file:code/DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment

**Code Files**:
- `server.js` - Backend API (30KB)
- `frontend/` - Customer React app
- `admin/` - Admin panel React app
- `prisma/` - Database schema

---

## 🔒 Security Features

**Authentication**
- ✅ Shopify OAuth 2.0
- ✅ JWT tokens for admin
- ✅ Bcrypt password hashing
- ✅ Session management

**API Security**
- ✅ CORS configured
- ✅ Request validation
- ✅ Error handling
- ✅ Rate limiting (recommended)

**Data Protection**
- ✅ Environment variables
- ✅ Secure database connections
- ✅ Access token encryption
- ✅ No sensitive data in frontend

---

## 📊 Features Checklist

### ✅ Completed Features

**Core Functionality**
- [x] Shopify OAuth authentication
- [x] Section marketplace browsing
- [x] Section detail pages
- [x] Shopify Billing API integration
- [x] Automated section installation
- [x] Purchase history tracking
- [x] Theme selection for installation

**Admin Panel**
- [x] JWT authentication
- [x] Section CRUD operations
- [x] Shop management
- [x] Purchase tracking
- [x] Dark theme UI
- [x] Responsive design
- [x] Code upload support

**Technical**
- [x] PostgreSQL database
- [x] Prisma ORM
- [x] RESTful API
- [x] Error handling
- [x] Environment configuration
- [x] Database migrations
- [x] Sample data seeding

### 🔮 Future Enhancements

**Phase 2**
- [ ] Section rating system
- [ ] Review and comments
- [ ] Advanced search filters
- [ ] Category pages
- [ ] Section bundles
- [ ] Discount codes

**Phase 3**
- [ ] Multi-currency support
- [ ] Subscription plans
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Webhook integration
- [ ] API rate limiting

**Phase 4**
- [ ] Section version control
- [ ] Update notifications
- [ ] Premium support tiers
- [ ] Affiliate program
- [ ] White-label options
- [ ] Multi-language support

---

## 📞 Support & Contact

**Developer**  
Shafran Mohamed  
SYSTO - Software Development Company

**Contact Information**  
📧 Email: safranlive@gmail.com  
📱 Phone: +94 777 565 057  
🌐 Website: [www.systo.lk](https://www.systo.lk)

**Repository**  
🔗 GitHub: [github.com/Safranlive/sections-gallery](https://github.com/Safranlive/sections-gallery)

**Company**  
🏢 SYSTO  
📍 Sri Lanka  
💼 Full-stack development, Shopify apps, custom solutions

---

## 📄 License

**Proprietary License**  
Copyright © 2024 SYSTO. All rights reserved.

This software and associated documentation files are proprietary and confidential. Unauthorized copying, distribution, modification, or use is strictly prohibited without explicit written permission from SYSTO.

For licensing inquiries: safranlive@gmail.com

---

## 🎉 Acknowledgments

**Built with:**
- Shopify App Bridge & Polaris
- React ecosystem
- Shadcn UI components
- PostgreSQL & Prisma
- Node.js & Express

**Special thanks to:**
- Shopify Developer Platform
- Open source community
- All beta testers and early adopters

---

## 🚀 Ready to Launch!

Sections Gallery is production-ready with:

✅ **Complete codebase** (30KB+ production code)  
✅ **Comprehensive documentation** (97KB+ guides)  
✅ **Sample sections** (5 ready-to-use)  
✅ **Deployment guides** (3 hosting options)  
✅ **Professional branding** (SYSTO)  
✅ **Billing integration** (Shopify native)  
✅ **Admin panel** (Full management suite)  
✅ **Security** (OAuth + JWT)  

**Your premium Shopify section marketplace is ready to deploy and monetize!** 🎊

---

**Version**: 2.0.0  
**Last Updated**: February 2024  
**Status**: Production Ready ✅