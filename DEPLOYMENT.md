# 🚀 Sections Gallery - Production Deployment Guide

**Complete guide to deploying Sections Gallery to production**

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] All code tested locally
- [ ] Production Shopify app created
- [ ] Production database ready
- [ ] Domain names configured
- [ ] SSL certificates (handled by hosting providers)
- [ ] Environment variables prepared
- [ ] Payment testing completed
- [ ] Admin credentials set

---

## 🏗️ Architecture Overview

Sections Gallery consists of 3 separate applications:

```
┌─────────────────────────────────────────────┐
│           Sections Gallery Stack             │
└─────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Backend    │  │  Frontend    │  │    Admin     │
│   Node.js    │  │    React     │  │    React     │
│   Port 5000  │  │   Port 3000  │  │   Port 3001  │
└──────────────┘  └──────────────┘  └──────────────┘
       │                 │                  │
       └─────────────────┴──────────────────┘
                         │
                ┌────────┴────────┐
                │   PostgreSQL    │
                │    Database     │
                └─────────────────┘
```

**Deployment Strategy**:
1. **Backend** → Railway/Heroku/DigitalOcean
2. **Frontend** → Vercel/Netlify
3. **Admin** → Vercel/Netlify
4. **Database** → Railway PostgreSQL/Heroku Postgres

---

## 🎯 Deployment Option 1: Railway (Recommended)

**Why Railway?**
- ✅ Free tier with generous limits
- ✅ PostgreSQL included
- ✅ Auto-deployment from GitHub
- ✅ Easy environment variables
- ✅ Built-in SSL
- ✅ Great for startups

### Step 1: Deploy Database

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click **"New Project"**
   - Select **"Provision PostgreSQL"**

3. **Get Database URL**
   - Click database service
   - Go to **"Connect"** tab
   - Copy **"Postgres Connection URL"**
   - Format: `postgresql://postgres:password@containers-us-west-123.railway.app:6543/railway`

4. **Save for Later**
   - You'll need this for backend deployment

### Step 2: Deploy Backend API

1. **Push Code to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Backend Service**
   - In Railway dashboard
   - Click **"New"** → **"GitHub Repo"**
   - Select your `sections-gallery` repository

3. **Configure Build**
   - Railway auto-detects Node.js
   - Build command: `npm install`
   - Start command: `npm start` or `node server.js`

4. **Set Environment Variables**
   - Click service → **"Variables"** tab
   - Add all variables (see below)

5. **Production Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=5000
   HOST=https://your-backend.up.railway.app
   
   SHOPIFY_API_KEY=your_production_api_key
   SHOPIFY_API_SECRET=your_production_api_secret
   SHOPIFY_HOST_NAME=your-domain.com
   SCOPES=read_themes,write_themes
   
   DATABASE_URL=postgresql://postgres:password@containers-us-west-123.railway.app:6543/railway
   
   ADMIN_EMAIL=safranlive@gmail.com
   ADMIN_PASSWORD=your_secure_password
   JWT_SECRET=your_random_secret_string
   
   FRONTEND_URL=https://your-frontend.vercel.app
   ADMIN_URL=https://your-admin.vercel.app
   ```

6. **Run Migrations**
   - In Railway dashboard
   - Click service → **"Settings"** → **"Deploy"**
   - Or run locally with production DATABASE_URL:
   ```bash
   DATABASE_URL="your_production_url" npx prisma migrate deploy
   DATABASE_URL="your_production_url" npm run seed
   ```

7. **Get Backend URL**
   - Railway generates URL automatically
   - Format: `https://sections-gallery.up.railway.app`
   - Or add custom domain in settings

### Step 3: Deploy Frontend (Vercel)

1. **Prepare Frontend**
   ```bash
   cd frontend
   
   # Create .env.production
   echo "REACT_APP_API_URL=https://your-backend.up.railway.app" > .env.production
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click **"New Project"**
   - Import your `sections-gallery` repository
   - Configure:
     - **Root Directory**: `frontend`
     - **Framework**: Create React App
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`

3. **Add Environment Variables**
   - In Vercel project settings
   - **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend.up.railway.app
   ```

4. **Deploy**
   - Click **"Deploy"**
   - Vercel builds and deploys
   - Get URL: `https://your-app.vercel.app`

### Step 4: Deploy Admin Panel (Vercel)

1. **Prepare Admin**
   ```bash
   cd admin
   
   # Create .env.production
   echo "REACT_APP_API_URL=https://your-backend.up.railway.app" > .env.production
   ```

2. **Deploy to Vercel**
   - In Vercel dashboard
   - Click **"New Project"**
   - Import same repository
   - Configure:
     - **Root Directory**: `admin`
     - **Framework**: Create React App
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`

3. **Add Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend.up.railway.app
   ```

4. **Deploy**
   - Get URL: `https://your-admin.vercel.app`

### Step 5: Update Shopify App Settings

1. **Production Shopify App**
   - Go to Partners Dashboard
   - Create new app (or use existing)
   - Go to **"App setup"**

2. **Update URLs**
   - **App URL**: `https://your-frontend.vercel.app`
   - **Allowed redirection URL(s)**:
     ```
     https://your-backend.up.railway.app/api/auth/callback
     ```

3. **Update Backend Environment**
   - Update `FRONTEND_URL` in Railway
   - Update `ADMIN_URL` in Railway

4. **Test OAuth Flow**
   - Visit: `https://your-backend.up.railway.app/api/auth?shop=your-store.myshopify.com`
   - Complete OAuth
   - Should redirect to frontend

---

## 🎯 Deployment Option 2: Heroku

### Step 1: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Other: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create sections-gallery-api
   ```

4. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SHOPIFY_API_KEY=your_key
   heroku config:set SHOPIFY_API_SECRET=your_secret
   heroku config:set ADMIN_EMAIL=safranlive@gmail.com
   heroku config:set ADMIN_PASSWORD=your_password
   heroku config:set JWT_SECRET=your_secret
   heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
   heroku config:set ADMIN_URL=https://your-admin.vercel.app
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **Run Migrations**
   ```bash
   heroku run npx prisma migrate deploy
   heroku run npm run seed
   ```

8. **Get App URL**
   ```bash
   heroku open
   # Or: https://sections-gallery-api.herokuapp.com
   ```

### Step 2: Deploy Frontend & Admin

Same as Railway option (use Vercel or Netlify)

---

## 🎯 Deployment Option 3: DigitalOcean

### Step 1: Create Droplet

1. **Sign up at DigitalOcean**
   - Go to [digitalocean.com](https://digitalocean.com)

2. **Create Droplet**
   - Choose **Ubuntu 22.04 LTS**
   - Select **Basic plan** ($6/month minimum)
   - Choose datacenter region
   - Add SSH key

3. **Access Droplet**
   ```bash
   ssh root@your_droplet_ip
   ```

### Step 2: Setup Server

1. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PostgreSQL**
   ```bash
   sudo apt-get install postgresql postgresql-contrib
   sudo -u postgres createdb sections_gallery
   sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_password';"
   ```

3. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/Safranlive/sections-gallery.git
   cd sections-gallery
   npm install
   ```

5. **Setup Environment**
   ```bash
   cp .env.example .env
   nano .env
   # Fill in production values
   ```

6. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

7. **Start with PM2**
   ```bash
   pm2 start server.js --name sections-gallery-api
   pm2 startup
   pm2 save
   ```

### Step 3: Setup Nginx

1. **Install Nginx**
   ```bash
   sudo apt-get install nginx
   ```

2. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/sections-gallery
   ```

   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/sections-gallery /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Setup SSL (Let's Encrypt)**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

### Step 4: Deploy Frontend & Admin

Use Vercel or Netlify (same as previous options)

---

## 🌐 Custom Domain Setup

### For Backend (Railway Example)

1. **Add Custom Domain**
   - Railway dashboard
   - Click service → **"Settings"** → **"Domains"**
   - Click **"Custom Domain"**
   - Enter: `api.yourdomain.com`

2. **Configure DNS**
   - Go to your domain registrar
   - Add CNAME record:
     ```
     Type: CNAME
     Name: api
     Value: your-service.up.railway.app
     ```

3. **Wait for SSL**
   - Railway auto-provisions SSL
   - Usually takes 5-10 minutes

### For Frontend (Vercel)

1. **Add Domain in Vercel**
   - Project settings → **"Domains"**
   - Enter: `app.yourdomain.com`

2. **Configure DNS**
   - Add CNAME record:
     ```
     Type: CNAME
     Name: app
     Value: cname.vercel-dns.com
     ```

3. **SSL Auto-Configured**
   - Vercel handles SSL automatically

### For Admin Panel

Same process, use subdomain like `admin.yourdomain.com`

---

## 🔒 Security Checklist

### Environment Variables

- [ ] All secrets in environment variables (not code)
- [ ] Different credentials for production
- [ ] Strong admin password (12+ characters)
- [ ] Unique JWT secret (32+ characters)
- [ ] Shopify API credentials secured

### Database

- [ ] Strong database password
- [ ] Connection encrypted (SSL)
- [ ] Regular backups enabled
- [ ] Access restricted by IP (if possible)

### API Security

- [ ] CORS configured for specific domains (no *)
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection

### HTTPS/SSL

- [ ] Backend uses HTTPS
- [ ] Frontend uses HTTPS
- [ ] Admin panel uses HTTPS
- [ ] No mixed content warnings
- [ ] SSL certificates valid

### Shopify App

- [ ] OAuth callback URL uses HTTPS
- [ ] App URL uses HTTPS
- [ ] Scopes minimal (only what's needed)
- [ ] API credentials not exposed

---

## ✅ Post-Deployment Testing

### 1. Backend API

**Test Health**:
```bash
curl https://api.yourdomain.com/api/sections
```

**Expected**: JSON array of sections

**Test OAuth**:
```
https://api.yourdomain.com/api/auth?shop=your-store.myshopify.com
```

**Expected**: Redirect to Shopify authorization

### 2. Frontend App

**Visit**: `https://app.yourdomain.com`

**Check**:
- [ ] Sections load
- [ ] Images display
- [ ] Can click section for details
- [ ] Purchase button works
- [ ] OAuth completes
- [ ] Installation works

### 3. Admin Panel

**Visit**: `https://admin.yourdomain.com`

**Check**:
- [ ] Can login
- [ ] Dashboard shows stats
- [ ] Can create section
- [ ] Can edit section
- [ ] Can delete section
- [ ] Shops display
- [ ] Purchases display

### 4. End-to-End Flow

1. **Install App** (as merchant)
   - Visit OAuth URL
   - Approve permissions
   - Redirects to marketplace

2. **Browse Sections**
   - See all sections
   - Click for details
   - View previews

3. **Purchase Section**
   - Click "Buy Now"
   - Complete Shopify billing
   - Redirect to install page

4. **Install Section**
   - Select theme
   - Click install
   - Verify in theme editor

5. **Admin Verification**
   - Login to admin
   - See new shop
   - See new purchase
   - Revenue updated

---

## 🔄 Continuous Deployment

### Auto-Deploy from GitHub

**Railway**:
- Automatically deploys on git push
- Monitors main branch
- Can configure other branches

**Vercel**:
- Auto-deploys on git push
- Preview deployments for PRs
- Production deploys from main

**Heroku**:
```bash
# Enable automatic deploys
heroku labs:enable runtime-dyno-metadata
git push heroku main
```

### Deployment Workflow

1. **Develop Locally**
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git commit -m "Add new feature"
   ```

2. **Test Locally**
   ```bash
   npm run dev
   # Test all features
   ```

3. **Push to GitHub**
   ```bash
   git push origin feature/new-feature
   ```

4. **Create Pull Request**
   - Review changes
   - Vercel creates preview deployment
   - Test preview

5. **Merge to Main**
   - PR approved
   - Merge to main
   - Auto-deploys to production

---

## 📊 Monitoring & Maintenance

### Application Monitoring

**Railway**:
- Built-in metrics
- View logs in dashboard
- Monitor resource usage

**Heroku**:
```bash
# View logs
heroku logs --tail

# Monitor dynos
heroku ps
```

**DigitalOcean**:
```bash
# View PM2 logs
pm2 logs sections-gallery-api

# Monitor process
pm2 monit
```

### Database Maintenance

**Backups**:
- Railway: Automatic backups
- Heroku: `heroku pg:backups:capture`
- Manual: `pg_dump`

**Health Checks**:
```bash
# Check database size
npx prisma db execute --sql "SELECT pg_size_pretty(pg_database_size('sections_gallery'));"

# Check table sizes
npx prisma studio
```

### Performance Monitoring

**Metrics to Track**:
- Response times
- Error rates
- Database query performance
- Memory usage
- CPU usage

**Tools**:
- New Relic (application monitoring)
- Datadog (infrastructure monitoring)
- Sentry (error tracking)
- LogRocket (session replay)

---

## 🐛 Troubleshooting Production

### Common Issues

**1. OAuth Redirect Error**

**Symptom**: "redirect_uri_mismatch"

**Solution**:
- Check Shopify app settings
- Callback URL must match exactly
- Use HTTPS in production
- No trailing slashes

**2. CORS Error**

**Symptom**: "Access-Control-Allow-Origin" error

**Solution**:
```javascript
// server.js
app.use(cors({
  origin: [
    'https://app.yourdomain.com',
    'https://admin.yourdomain.com'
  ],
  credentials: true
}));
```

**3. Database Connection Error**

**Symptom**: "Connection refused" or "Authentication failed"

**Solution**:
- Check DATABASE_URL format
- Verify database is running
- Check firewall rules
- Ensure SSL connection if required

**4. Environment Variables Not Loading**

**Symptom**: "undefined" errors, app crashes

**Solution**:
- Verify all variables set in hosting platform
- Restart service after changes
- Check variable names (case-sensitive)
- No spaces in values

**5. Build Fails**

**Symptom**: Deployment fails during build

**Solution**:
- Check build logs
- Verify package.json scripts
- Ensure all dependencies listed
- Check Node version compatibility

---

## 💰 Cost Breakdown

### Free Tier Options

**Railway**:
- Free: $5/month credits
- Database: Included
- Enough for: Small apps, testing

**Vercel**:
- Free: Unlimited deployments
- Bandwidth: 100GB/month
- Enough for: Most startups

**Total Free**: $0/month (with limitations)

### Paid Options

**Railway**:
- Hobby: $5/month
- Pro: $20/month
- Includes: Database, deployments

**Vercel**:
- Pro: $20/month per user
- Team: Custom pricing

**Heroku**:
- Hobby: $7/month per dyno
- Mini Postgres: $5/month

**Total Paid**: $15-50/month

### At Scale

**10,000 monthly users**:
- Backend: $20-50/month
- Frontend: $20/month (Vercel Pro)
- Database: $15-25/month
- **Total**: $55-95/month

---

## 📞 Support

**Deployment Issues?**

Contact developer:
- 📧 Email: safranlive@gmail.com
- 📱 Phone: +94 777 565 057
- 🌐 Website: [www.systo.lk](https://www.systo.lk)

**Documentation**:
- [@file:code/README.md](README.md) - Overview
- [@file:code/SETUP.md](SETUP.md) - Local setup
- [@file:code/API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
- [@file:code/ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Admin usage

---

## 🎉 Deployment Complete!

Your Sections Gallery is now live in production!

**What you have**:
✅ Backend API running on Railway/Heroku  
✅ Frontend app on Vercel  
✅ Admin panel on Vercel  
✅ Production database with PostgreSQL  
✅ Custom domains configured  
✅ SSL certificates active  
✅ OAuth working  
✅ Billing integrated  

**Your premium Shopify section marketplace is ready for customers!** 🚀

---

**Version**: 2.0.0  
**Last Updated**: February 2024  
**Status**: Production Ready ✅