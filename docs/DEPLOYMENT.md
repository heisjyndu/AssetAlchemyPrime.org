# Deployment Guide - AssetAlchemyPrime.org

This guide covers various deployment options for the AssetAlchemyPrime platform.

## 🚀 Quick Deploy Options

### Netlify (Recommended)
The easiest way to deploy your platform:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)
   - Or connect your GitHub repository for automatic deployments

3. **Environment Variables** (Optional)
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   VITE_FIREBASE_API_KEY=your_firebase_key
   ```

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Follow the prompts

### GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json:
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run: `npm run build && npm run deploy`

## 🐳 Docker Deployment

### Development
```bash
# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:80
# Backend: http://localhost:5000
# Database: localhost:5432
```

### Production
```bash
# Build production image
docker build -t assetalchemyprime-platform .

# Run with environment variables
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=your_db_url \
  -e JWT_SECRET=your_secret \
  assetalchemyprime-platform
```

## ☁️ Cloud Platforms

### AWS (EC2 + RDS)
1. **Launch EC2 instance** (Ubuntu 20.04 LTS)
2. **Install dependencies**:
   ```bash
   sudo apt update
   sudo apt install nodejs npm nginx postgresql-client
   ```
3. **Clone and setup**:
   ```bash
   git clone https://github.com/AssetAlchemyPrime/platform.git
   cd platform
   npm install
   npm run build
   ```
4. **Configure Nginx** (see nginx.conf)
5. **Setup SSL** with Let's Encrypt

### Google Cloud Platform
1. **Create VM instance**
2. **Setup Cloud SQL** (PostgreSQL)
3. **Deploy using Cloud Build**:
   ```yaml
   # cloudbuild.yaml
   steps:
   - name: 'node:18'
     entrypoint: 'npm'
     args: ['install']
   - name: 'node:18'
     entrypoint: 'npm'
     args: ['run', 'build']
   ```

### DigitalOcean App Platform
1. **Connect GitHub repository**
2. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Add environment variables**
4. **Deploy**

## 🗄️ Database Setup

### PostgreSQL (Recommended)
```sql
-- Create database
CREATE DATABASE assetalchemyprime;

-- Create user
CREATE USER assetalchemyprime_user WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE assetalchemyprime TO assetalchemyprime_user;
```

### Supabase (Managed)
1. Create project at [supabase.com](https://supabase.com)
2. Run migrations from `supabase/migrations/`
3. Update environment variables

## 🔧 Environment Configuration

### Production .env
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/assetalchemyprime

# Security
JWT_SECRET=your-super-secure-jwt-secret-key
NODE_ENV=production

# Frontend
FRONTEND_URL=https://yourdomain.com

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@assetalchemyprime.org
SMTP_PASS=your-app-password

# Payments (Optional)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase (Optional)
FIREBASE_PROJECT_ID=assetalchemyprime-prod
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

## 🔒 Security Checklist

### SSL/TLS
- [ ] SSL certificate installed
- [ ] HTTPS redirect configured
- [ ] HSTS headers enabled

### Environment
- [ ] Production environment variables set
- [ ] Debug mode disabled
- [ ] Error logging configured

### Database
- [ ] Database credentials secured
- [ ] Connection encryption enabled
- [ ] Regular backups scheduled

### Application
- [ ] JWT secret is strong and unique
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented

## 📊 Monitoring & Analytics

### Application Monitoring
```javascript
// Add to your deployment
import { initSentry } from './monitoring';

initSentry({
  dsn: 'your-sentry-dsn',
  environment: 'production'
});
```

### Performance Monitoring
- **Google Analytics**: Track user interactions
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and debugging

### Health Checks
```bash
# API health check
curl https://yourdomain.com/api/health

# Database connectivity
curl https://yourdomain.com/api/health/db
```

## 🚨 Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Database Connection**
```bash
# Test connection
psql -h hostname -U username -d database_name -c "SELECT 1;"
```

**Environment Variables**
```bash
# Check if variables are loaded
node -e "console.log(process.env.NODE_ENV)"
```

### Performance Optimization

**Frontend**
- Enable gzip compression
- Use CDN for static assets
- Implement service worker caching

**Backend**
- Enable database connection pooling
- Implement Redis caching
- Use PM2 for process management

## 📞 Support

For deployment issues:
- 📧 Email: devops@assetalchemyprime.org
- 📖 Documentation: [docs.assetalchemyprime.org](https://docs.assetalchemyprime.org)
- 🐛 Issues: [GitHub Issues](https://github.com/AssetAlchemyPrime/platform/issues)

---

**Happy Deploying!** 🚀