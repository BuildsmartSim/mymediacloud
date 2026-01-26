#!/bin/bash

# CloudStream One-Click Setup Script
# Run this on your DigitalOcean Droplet as root

set -e

echo "========================================"
echo "   🚀 CloudStream Server Setup Bot      "
echo "========================================"

# 0. Add Swap Memory (Crucial for 1GB Servers)
if [ ! -f /swapfile ]; then
    echo ""
    echo "💾 [0/5] Adding 2GB Swap Memory (Prevent Build Crashes)..."
    fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
    echo "✅ Swap added."
else
    echo "✅ Swap already exists."
fi

# 1. Update and Install System Dependencies
echo ""
echo "📦 [1/5] Installing System Dependencies (Docker, Nginx)..."
apt-get update -qq
apt-get install -y docker.io docker-compose nginx python3-certbot-nginx -qq
echo "✅ Dependencies installed."

# 2. Check Service Status
systemctl enable docker
systemctl start docker

# 3. Environment Configuration
echo ""
echo "🔑 [2/5] Checking Configuration..."
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "creating .env from template..."
    cp .env.production.example .env
    
    echo ""
    echo "🛑 ACTION REQUIRED:"
    echo "Use 'nano .env' to paste' your secrets."
    echo "Then run this script again."
    exit 1
fi
echo "✅ .env file present."

# 4. Docker Deployment
echo ""
echo "🐳 [3/5] Building and Starting Application..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build
echo "✅ App is running on localhost:3000."

# 5. Nginx Configuration
echo ""
echo "🌐 [4/5] Configuring Nginx Reverse Proxy..."
# Copy config
cp nginx.conf /etc/nginx/sites-available/stream.holonomic.uk
# Enable site
ln -sf /etc/nginx/sites-available/stream.holonomic.uk /etc/nginx/sites-enabled/
# Disable default
rm -f /etc/nginx/sites-enabled/default
# Reload
nginx -t && systemctl reload nginx
echo "✅ Nginx configured."

# 6. SSL Certificate
echo ""
echo "🔒 [5/5] Requesting SSL Certificate (HTTPS)..."
# We use --register-unsafely-without-email to allow non-interactive mode if user didn't modify script
# Better: use the email from .env if possible? Or just ask. 
# For simplicity for this user, we will try to just run it interactively if not exists.

if [ -d "/etc/letsencrypt/live/stream.holonomic.uk" ]; then
    echo "✅ Certificate already exists."
else
    certbot --nginx -d stream.holonomic.uk --non-interactive --agree-tos --email admin@holonomic.uk
    echo "✅ SSL Certificate installed."
fi

echo ""
echo "========================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "Parsed URL: https://stream.holonomic.uk"
echo "========================================"
