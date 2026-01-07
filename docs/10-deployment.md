# 10. Deployment Guide

Complete guide for deploying the SN Auto Parts application to production.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon recommended)
- Stripe account with API keys
- Resend account with API key
- Domain name (optional)
- SSL certificate (for HTTPS)

---

## Environment Variables

### Backend Environment Variables

Create `.env` file in `backend/` directory:

```env
# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
LOG_LEVEL=info

# Database (Neon Postgres)
DATABASE_URL="postgresql://user:password@host:5432/snautoparts?sslmode=require"

# Authentication
AUTH_SECRET="your-super-secret-key-change-in-production-min-32-chars"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Resend (Email)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@snautoparts.com"

# Frontend URL
FRONTEND_URL="https://snautoparts.com"
```

### Frontend Environment Variables

Create `environment.prod.ts` in `frontend/src/environments/`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.snautoparts.com/api/v1',
  stripePublishableKey: 'pk_live_...',
  enableMockData: false,
};
```

---

## Database Setup

### Neon Postgres Setup

1. **Create Neon Account:**
   - Go to https://neon.tech
   - Sign up for account
   - Create new project

2. **Get Connection String:**
   - Copy connection string from Neon dashboard
   - Format: `postgresql://user:password@host:5432/dbname?sslmode=require`
   - Set as `DATABASE_URL` in backend `.env`

3. **Run Migrations:**
   ```bash
   cd backend
   npm run db:migrate
   ```

4. **Seed Database (Optional):**
   ```bash
   npm run db:seed
   ```

---

## Backend Deployment

### Build Backend

```bash
cd backend
npm install
npm run build
```

### Production Start

```bash
npm start
```

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/index.js --name snautoparts-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### PM2 Configuration File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'snautoparts-api',
    script: 'dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
```

---

## Frontend Deployment

### Build Frontend

```bash
cd frontend
npm install
npm run build
```

Output will be in `dist/snautoparts/browser/`

### Deploy to Static Hosting

#### Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd frontend
   vercel --prod
   ```

3. Configure environment variables in Vercel dashboard

#### Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:
   ```bash
   cd frontend
   netlify deploy --prod --dir=dist/snautoparts/browser
   ```

#### Nginx

1. Copy build output to server:
   ```bash
   scp -r dist/snautoparts/browser/* user@server:/var/www/snautoparts/
   ```

2. Configure Nginx:
   ```nginx
   server {
       listen 80;
       server_name snautoparts.com;
       
       root /var/www/snautoparts;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## Stripe Webhook Configuration

### Webhook Endpoint Setup

1. **Create Webhook Endpoint in Stripe Dashboard:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://api.snautoparts.com/webhooks/stripe`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`

2. **Get Webhook Secret:**
   - Copy webhook signing secret
   - Set as `STRIPE_WEBHOOK_SECRET` in backend `.env`

3. **Test Webhook:**
   ```bash
   stripe listen --forward-to localhost:3000/webhooks/stripe
   ```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot

# Obtain certificate
sudo certbot --nginx -d snautoparts.com -d www.snautoparts.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name snautoparts.com;
    
    ssl_certificate /etc/letsencrypt/live/snautoparts.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/snautoparts.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    root /var/www/snautoparts;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name snautoparts.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Health Checks

### Backend Health Endpoint

Already implemented at `/health`:

```typescript
fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}));
```

### Monitoring Setup

#### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

Monitor: `https://api.snautoparts.com/health`

#### Application Monitoring

Consider:
- Sentry (error tracking)
- DataDog (APM)
- New Relic (APM)

---

## Database Backup

### Neon Automated Backups

Neon provides automated backups. Configure backup retention in Neon dashboard.

### Manual Backup

```bash
# Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore database
psql $DATABASE_URL < backup_20240101.sql
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong `AUTH_SECRET` (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookie flags in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting (recommended)
- [ ] Enable database SSL connections
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Set up firewall rules
- [ ] Enable database backups
- [ ] Configure Stripe webhook signature verification
- [ ] Set up error monitoring
- [ ] Configure log rotation

---

## Performance Optimization

### Backend

- Use PM2 cluster mode for multiple instances
- Enable database connection pooling
- Use Redis for session storage (optional)
- Enable response compression
- Set up CDN for static assets

### Frontend

- Enable production optimizations in Angular
- Use lazy loading for routes
- Enable AOT compilation
- Minify and compress assets
- Use CDN for assets

---

## Rollback Procedure

### Backend Rollback

```bash
# Stop application
pm2 stop snautoparts-api

# Revert to previous version
git checkout <previous-commit>
npm install
npm run build

# Restart
pm2 restart snautoparts-api
```

### Database Rollback

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back <migration-name>

# Or restore from backup
psql $DATABASE_URL < backup.sql
```

---

## Troubleshooting Deployment

### Check Logs

```bash
# PM2 logs
pm2 logs snautoparts-api

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### Common Issues

1. **Database Connection Failed:**
   - Check `DATABASE_URL` is correct
   - Verify database is accessible
   - Check firewall rules

2. **Stripe Webhook Fails:**
   - Verify webhook secret is correct
   - Check webhook endpoint is accessible
   - Verify SSL certificate

3. **Frontend API Calls Fail:**
   - Check `apiUrl` in environment
   - Verify CORS configuration
   - Check network connectivity

---

**Next:** [11. Development Workflow](11-development-workflow.md) | [Back to Index](README.md)

