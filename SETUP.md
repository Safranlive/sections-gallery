# 🚀 Sections Gallery - Complete Setup Guide

**Step-by-step instructions to get Sections Gallery running locally**

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org))
- [ ] **PostgreSQL** installed and running ([Download](https://www.postgresql.org/download/))
- [ ] **Shopify Partners Account** ([Sign up](https://partners.shopify.com))
- [ ] **Development Store** created in Partners Dashboard
- [ ] **Git** installed ([Download](https://git-scm.com))
- [ ] **Code Editor** (VS Code recommended)

---

## 🎯 Setup Overview

**Total Time**: 30-45 minutes

**Steps**:
1. Clone repository
2. Install dependencies
3. Setup PostgreSQL database
4. Create Shopify app
5. Configure environment variables
6. Run database migrations
7. Seed sample data
8. Start development servers
9. Test OAuth flow
10. Test marketplace
11. Access admin panel

---

## Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/Safranlive/sections-gallery.git

# Navigate to project directory
cd sections-gallery

# Verify files
ls -la
```

**Expected files**:
- `server.js` - Backend API
- `package.json` - Dependencies
- `prisma/` - Database schema
- `frontend/` - Customer app
- `admin/` - Admin panel
- `.env.example` - Environment template

---

## Step 2: Install Dependencies

### Root Dependencies (Backend)

```bash
# Install backend dependencies
npm install
```

**This installs**:
- Express.js (API server)
- @shopify/shopify-api (Shopify integration)
- Prisma (database ORM)
- PostgreSQL driver
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- CORS, dotenv, etc.

### Frontend Dependencies

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Return to root
cd ..
```

**This installs**:
- React 18
- Shopify Polaris
- Shopify App Bridge
- React Router
- Axios

### Admin Panel Dependencies

```bash
# Navigate to admin
cd admin

# Install dependencies
npm install

# Return to root
cd ..
```

**This installs**:
- React 18
- Shadcn UI components
- TailwindCSS
- React Router
- Axios

---

## Step 3: Setup PostgreSQL Database

### Option A: Local PostgreSQL

**Install PostgreSQL**:
- **macOS**: `brew install postgresql`
- **Windows**: Download installer
- **Linux**: `sudo apt-get install postgresql`

**Start PostgreSQL**:
```bash
# macOS
brew services start postgresql

# Linux
sudo service postgresql start

# Windows
# PostgreSQL starts automatically
```

**Create Database**:
```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE sections_gallery;

# Create user (optional)
CREATE USER sections_user WITH PASSWORD 'your_password';

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE sections_gallery TO sections_user;

# Exit
\q
```

**Your DATABASE_URL**:
```
postgresql://sections_user:your_password@localhost:5432/sections_gallery
```

Or if using default postgres user:
```
postgresql://postgres:password@localhost:5432/sections_gallery
```

### Option B: Cloud Database (Railway)

**Free PostgreSQL from Railway**:

1. Go to [Railway.app](https://railway.app)
2. Sign up / Login
3. Click **"New Project"**
4. Select **"Provision PostgreSQL"**
5. Click database → **"Connect"**
6. Copy **"Postgres Connection URL"**

**Your DATABASE_URL**:
```
postgresql://postgres:password@containers-us-west-123.railway.app:6543/railway
```

### Option C: Cloud Database (Heroku)

1. Create Heroku account
2. Install Heroku CLI
3. Run: `heroku addons:create heroku-postgresql:mini`
4. Get URL: `heroku config:get DATABASE_URL`

---

## Step 4: Create Shopify App

### 4.1 Access Partners Dashboard

1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Login to your Partners account
3. Click **"Apps"** in sidebar
4. Click **"Create app"**
5. Select **"Create app manually"**

### 4.2 Configure App Settings

**App Name**: `Sections Gallery Dev`

**App URL**: `http://localhost:3000`

**Allowed redirection URL(s)**:
```
http://localhost:5000/api/auth/callback
```

**GDPR webhooks** (optional for dev):
- Skip for now or use placeholder URLs

### 4.3 Get API Credentials

1. Click your app name
2. Go to **"App setup"** tab
3. Find **"API credentials"** section
4. Copy:
   - **API key** (Client ID)
   - **API secret key** (Client Secret)

### 4.4 Configure App Scopes

1. In **"Configuration"** tab
2. Find **"API access scopes"**
3. Add these scopes:
   - `read_themes` - Read theme files
   - `write_themes` - Write theme files

4. Click **"Save"**

### 4.5 Install to Development Store

1. Create development store if you haven't:
   - Partners Dashboard → **"Stores"**
   - **"Add store"** → **"Development store"**

2. Install your app:
   - Go to your app
   - Click **"Select store"**
   - Choose your dev store
   - Click **"Install app"**

---

## Step 5: Configure Environment Variables

### 5.1 Create .env File

```bash
# Copy example file
cp .env.example .env

# Open in editor
nano .env
# or
code .env
```

### 5.2 Fill in Variables

```bash
# Application Settings
NODE_ENV=development
PORT=5000
HOST=http://localhost:5000

# Shopify Credentials
SHOPIFY_API_KEY=your_api_key_from_step_4
SHOPIFY_API_SECRET=your_api_secret_from_step_4
SHOPIFY_HOST_NAME=localhost
SCOPES=read_themes,write_themes

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sections_gallery

# Admin Panel
ADMIN_EMAIL=safranlive@gmail.com
ADMIN_PASSWORD=admin123
JWT_SECRET=your_random_secret_string_here

# Frontend URLs
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### 5.3 Generate JWT Secret

```bash
# Generate random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output to JWT_SECRET
```

### 5.4 Verify Configuration

```bash
# Check .env file exists
cat .env

# Ensure all variables are set
# No empty values!
```

---

## Step 6: Run Database Migrations

### 6.1 Generate Prisma Client

```bash
# Generate Prisma client
npx prisma generate
```

**This creates**:
- `node_modules/@prisma/client`
- Type definitions for database queries

### 6.2 Run Migrations

```bash
# Create database tables
npx prisma migrate dev --name init
```

**This creates**:
- `shops` table
- `sections` table  
- `purchases` table
- Migration history

### 6.3 Verify Database

```bash
# Open Prisma Studio (GUI)
npx prisma studio
```

**Browser opens**: http://localhost:5555

**Check**:
- Tables exist (shops, sections, purchases)
- No data yet (empty tables)
- Schema matches design

---

## Step 7: Seed Sample Data

### 7.1 Run Seed Script

```bash
# Seed database with 5 sample sections
npm run seed
```

**This creates**:
1. Hero Banner ($49.99)
2. Product Grid ($39.99)
3. Testimonial Slider ($29.99)
4. FAQ Accordion ($24.99)
5. Newsletter Signup ($19.99)

### 7.2 Verify Seeded Data

```bash
# Open Prisma Studio
npx prisma studio
```

**Check**:
- `sections` table has 5 rows
- Each section has:
  - Name, description
  - Thumbnail URL
  - Price
  - Liquid code
  - CSS/JS code
  - Features array

**Or query directly**:
```bash
# Using psql
psql sections_gallery

# Query
SELECT id, name, price FROM sections;

# Exit
\q
```

---

## Step 8: Start Development Servers

### Option A: All Servers at Once

```bash
# Start all three servers concurrently
npm run dev
```

**This starts**:
- Backend API → http://localhost:5000
- Customer App → http://localhost:3000  
- Admin Panel → http://localhost:3001

**Logs show**:
```
[backend] Server running on http://localhost:5000
[frontend] webpack compiled successfully
[admin] webpack compiled successfully
```

### Option B: Individual Servers

**Terminal 1 - Backend**:
```bash
npm run server
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm start
```

**Terminal 3 - Admin**:
```bash
cd admin
npm start
```

---

## Step 9: Test OAuth Flow

### 9.1 Initiate OAuth

**Open browser**:
```
http://localhost:5000/api/auth?shop=your-store.myshopify.com
```

Replace `your-store` with your development store name.

### 9.2 OAuth Flow

1. **Redirects to Shopify** - Permission screen
2. **Click "Install"** - Approve permissions
3. **Redirects back** - To your app
4. **Success!** - Shop saved to database

### 9.3 Verify OAuth

**Check database**:
```bash
# Open Prisma Studio
npx prisma studio

# Check shops table
# Should have 1 row with your shop domain
```

**Or check logs**:
```
Shop authenticated: your-store.myshopify.com
Access token saved
```

---

## Step 10: Test Customer Marketplace

### 10.1 Browse Sections

**Open**: http://localhost:3000

**You should see**:
- 5 section cards in grid layout
- Thumbnail images
- Section names
- Prices
- Categories

**Test**:
- Click any section card
- Detail page opens
- See description, features, price
- Preview and video buttons

### 10.2 Test Purchase Flow

1. **Click "Buy Now"** on any section
2. **Redirect to Shopify billing** (test mode)
3. **Click "Approve"** (no real charge in dev)
4. **Redirect back** to app
5. **Choose theme** to install to
6. **Click "Install"**
7. **Success message** appears

### 10.3 Verify Purchase

**Open**: http://localhost:3000/my-sections

**You should see**:
- Purchased section listed
- Purchase date
- "Install to Theme" button
- Can reinstall anytime

### 10.4 Test Installation

1. **Click "Install to Theme"**
2. **Select theme** from dropdown
3. **Click "Install Section"**
4. **Success!** Section installed
5. **Check Shopify admin** → Themes → Customize
6. **Add section** → Your section appears!

---

## Step 11: Test Admin Panel

### 11.1 Login to Admin

**Open**: http://localhost:3001

**Login**:
- Email: `safranlive@gmail.com`
- Password: (from your .env file)

**Click "Login"**

### 11.2 Explore Dashboard

**Dashboard Tab**:
- Total Sections: 5
- Total Shops: 1
- Total Revenue: (sum of purchases)

### 11.3 Test Section Management

**Sections Tab**:
- See all 5 seeded sections
- Click **"Edit"** on any section
- Modal opens with current data
- Change price, description, etc.
- Click **"Update Section"**
- Changes saved!

**Create New Section**:
1. Click **"Create New Section"**
2. Fill in form:
   - Name: "Test Section"
   - Description: "My test section"
   - Thumbnail URL: (any image URL)
   - Price: 9.99
   - Liquid code: (paste section code)
3. Click **"Create Section"**
4. New section appears in list!

**Delete Section**:
1. Click **"Delete"** on test section
2. Confirmation prompt
3. Click **"Yes, delete"**
4. Section removed!

### 11.4 Check Shops

**Shops Tab**:
- Your development store listed
- Shop domain shown
- Install date
- Number of purchases

### 11.5 Check Purchases

**Purchases Tab**:
- All test purchases listed
- Shop domain
- Section name  
- Amount paid
- Purchase date
- Status (completed)

---

## ✅ Verification Checklist

After setup, verify everything works:

### Backend
- [ ] Server running on port 5000
- [ ] Database connected
- [ ] Prisma client generated
- [ ] 5 sample sections in database
- [ ] Environment variables loaded

### Frontend
- [ ] App running on port 3000
- [ ] All 5 sections display
- [ ] Can click section for details
- [ ] Purchase flow works
- [ ] My Sections page works
- [ ] Installation works

### Admin Panel
- [ ] Panel running on port 3001
- [ ] Can login with credentials
- [ ] Dashboard shows stats
- [ ] Can view all sections
- [ ] Can create new section
- [ ] Can edit existing section
- [ ] Can delete section
- [ ] Shops page shows data
- [ ] Purchases page shows data

### Shopify Integration
- [ ] OAuth flow completes
- [ ] Shop saved to database
- [ ] Billing API works
- [ ] Theme API works
- [ ] Section installs to theme
- [ ] Section appears in theme editor

---

## 🔧 Troubleshooting

### Common Issues

**1. Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**:
- PostgreSQL not running
- Start: `brew services start postgresql` (macOS)
- Or check DATABASE_URL in .env

**2. Prisma Client Error**
```
Error: @prisma/client did not initialize yet
```

**Solution**:
```bash
npx prisma generate
npm run server
```

**3. OAuth Redirect Error**
```
Error: redirect_uri_mismatch
```

**Solution**:
- Check Shopify app settings
- Allowed redirect URL must be: `http://localhost:5000/api/auth/callback`
- Must match exactly (no trailing slash!)

**4. Billing API Error**
```
Error: billing not enabled
```

**Solution**:
- Development stores: Billing works in test mode
- Production: Need approved app listing

**5. Theme API Error**
```
Error: insufficient permissions
```

**Solution**:
- Check app scopes include:
  - `read_themes`
  - `write_themes`
- Reinstall app after scope changes

**6. Admin Login Error**
```
Error: Invalid credentials
```

**Solution**:
- Check ADMIN_EMAIL and ADMIN_PASSWORD in .env
- Default: safranlive@gmail.com / (your password)
- No spaces in .env file!

**7. Port Already in Use**
```
Error: Port 5000 already in use
```

**Solution**:
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

**8. CORS Error in Browser**
```
Error: Access-Control-Allow-Origin
```

**Solution**:
- Backend has CORS enabled for localhost:3000 and localhost:3001
- If using different ports, update server.js CORS config

**9. Missing Environment Variables**
```
Error: SHOPIFY_API_KEY is not defined
```

**Solution**:
```bash
# Verify .env file exists
ls -la .env

# Check contents
cat .env

# Ensure no empty values
# Restart server after changes
```

**10. Seed Script Error**
```
Error: Cannot read property 'create'
```

**Solution**:
```bash
# Run migrations first
npx prisma migrate dev --name init

# Then seed
npm run seed
```

---

## 📝 Quick Reference

### Common Commands

```bash
# Start all servers
npm run dev

# Start backend only
npm run server

# Start frontend only
cd frontend && npm start

# Start admin only
cd admin && npm start

# Database migrations
npx prisma migrate dev

# Seed data
npm run seed

# Prisma Studio (GUI)
npx prisma studio

# Check database
psql sections_gallery

# Generate Prisma client
npx prisma generate
```

### Important URLs

```
Backend API:     http://localhost:5000
Customer App:    http://localhost:3000
Admin Panel:     http://localhost:3001
Prisma Studio:   http://localhost:5555

OAuth Init:      http://localhost:5000/api/auth?shop=store.myshopify.com
OAuth Callback:  http://localhost:5000/api/auth/callback
```

### Default Credentials

```
Admin Email:     safranlive@gmail.com
Admin Password:  (set in .env file)
```

---

## 🎯 Next Steps

Now that Sections Gallery is running:

### Development
1. **Customize sections** - Edit seed.js with your sections
2. **Style changes** - Modify CSS files
3. **Add features** - Extend functionality
4. **Test thoroughly** - Try all user flows

### Content
1. **Add real sections** - Create production sections
2. **Upload media** - Professional thumbnails/videos
3. **Write descriptions** - Compelling copy
4. **Set pricing** - Market research

### Deployment
1. **Read deployment guide** - [@file:code/DEPLOYMENT.md](DEPLOYMENT.md)
2. **Choose hosting** - Railway/Heroku/DigitalOcean
3. **Setup production** - Database, environment
4. **Deploy apps** - Backend, frontend, admin
5. **Configure domains** - Custom URLs
6. **Test production** - Full flow

### Marketing
1. **App listing** - Submit to Shopify App Store
2. **Documentation** - User guides
3. **Support** - Email, chat
4. **Analytics** - Track usage

---

## 📚 Additional Resources

**Documentation**:
- [@file:code/README.md](README.md) - Project overview
- [@file:code/API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
- [@file:code/ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Admin usage
- [@file:code/DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment

**Shopify Resources**:
- [Shopify App Development](https://shopify.dev/docs/apps)
- [Theme Kit Documentation](https://shopify.dev/docs/themes)
- [Billing API](https://shopify.dev/docs/apps/billing)
- [App Bridge](https://shopify.dev/docs/api/app-bridge)

**Technology Docs**:
- [React](https://react.dev)
- [Shopify Polaris](https://polaris.shopify.com)
- [Prisma](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com)
- [PostgreSQL](https://www.postgresql.org/docs)

---

## 📞 Need Help?

**Developer Support**  
Shafran Mohamed  
SYSTO

📧 Email: safranlive@gmail.com  
📱 Phone: +94 777 565 057  
🌐 Website: [www.systo.lk](https://www.systo.lk)

**Issues**:
- Report bugs on GitHub
- Request features
- Ask questions

---

## 🎉 Setup Complete!

Your Sections Gallery development environment is ready!

**You now have**:
✅ Backend API running  
✅ Customer marketplace live  
✅ Admin panel accessible  
✅ Database with sample data  
✅ Shopify integration working  
✅ All features functional  

**Start building your section marketplace!** 🚀

---

**Last Updated**: February 2024  
**Version**: 2.0.0  
**Status**: Development Ready ✅