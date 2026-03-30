# Lensia MVP — Deployment Guide

## System Requirements

- Node.js 18+ (LTS)
- PostgreSQL 15+
- npm 9+
- (Optional) Docker & Docker Compose

---

## Quick Start with Docker

```bash
# Clone the repository
git clone <repo-url> lensia && cd lensia

# Create .env file from example
cp backend/.env.example .env

# Edit .env with your production values
nano .env

# Build and start all services
docker compose up -d --build

# Check status
docker compose ps
```

The app will be available at `http://localhost` (frontend) and `http://localhost:5000` (API).

---

## Manual Deployment (VPS)

### 1. Database Setup

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE USER lensia WITH PASSWORD 'your-strong-password';
CREATE DATABASE lensia_db OWNER lensia;
\q
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm ci --legacy-peer-deps

# Copy and configure environment
cp .env.example .env
nano .env  # Set all required values

# Build
npm run build

# Start with PM2
npm install -g pm2
pm2 start dist/main.js --name lensia-api
pm2 save
pm2 startup
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm ci

# Build for production
npm run build

# The dist/ folder contains static files to serve with Nginx
```

### 4. Nginx Configuration

```bash
sudo apt install nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/lensia.pro`:

```nginx
server {
    listen 80;
    server_name lensia.pro www.lensia.pro;

    # Frontend static files
    root /home/deploy/lensia/frontend/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API reverse proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    # Serve uploaded files
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/lensia.pro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL with Let's Encrypt
sudo certbot --nginx -d lensia.pro -d www.lensia.pro
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_HOST` | Yes | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_USER` | Yes | `lensia` | Database username |
| `DB_PASSWORD` | Yes | `password` | Database password |
| `DB_NAME` | Yes | `lensia_db` | Database name |
| `JWT_SECRET` | Yes | - | Secret key for JWT signing |
| `JWT_EXPIRY` | No | `7d` | JWT token expiration |
| `APP_URL` | Yes | `http://localhost:5000` | Backend public URL |
| `FRONTEND_URL` | Yes | `http://localhost:5173` | Frontend public URL |
| `MP_ACCESS_TOKEN` | No | - | Mercado Pago access token |
| `MP_PUBLIC_KEY` | No | - | Mercado Pago public key |
| `AWS_REGION` | No | `us-east-1` | AWS S3 region |
| `AWS_ACCESS_KEY_ID` | No | - | AWS access key (enables S3) |
| `AWS_SECRET_ACCESS_KEY` | No | - | AWS secret key |
| `AWS_BUCKET_NAME` | No | `lensia-files` | S3 bucket name |
| `SMTP_HOST` | No | - | SMTP server hostname |
| `SMTP_PORT` | No | `587` | SMTP port |
| `SMTP_USER` | No | - | SMTP username |
| `SMTP_PASS` | No | - | SMTP password |
| `SMTP_FROM` | No | `no-reply@lensia.pro` | From email address |

When optional services (MP, AWS, SMTP) are not configured, the system falls back to mock/local mode.

---

## Seed Users

On first startup, the backend auto-creates these test users:

| Email | Password | Role |
|-------|----------|------|
| `admin@lensia.com` | `password` | admin |
| `cliente@lensia.com` | `password` | cliente |
| `optica@lensia.com` | `password` | optica |
| `medico@lensia.com` | `password` | medico |

**Change these passwords in production.**

---

## API Documentation

Swagger UI is available at `/api/docs` when the backend is running.

---

## Updating

```bash
git pull origin main

# Backend
cd backend && npm ci --legacy-peer-deps && npm run build
pm2 restart lensia-api

# Frontend
cd ../frontend && npm ci && npm run build
# Nginx serves static files — no restart needed
```

With Docker:
```bash
docker compose up -d --build
```
