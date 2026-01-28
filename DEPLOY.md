# Deployment Guide - DigitalOcean

## 1. Initial Server Setup (SSH into your droplet)

```bash
# Update system
apt update && apt upgrade -y

# Install Docker, Nginx, and Certbot
apt install -y docker.io docker-compose nginx python3-certbot-nginx
```

## 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/BuildsmartSim/mymediacloud.git
cd mymediacloud

# Create environment file (Copy your secrets here!)
nano .env

# Build and start container
docker-compose up -d --build
```

## 3. Configure Nginx

```bash
# Copy the config file from the repo to Nginx
cp nginx.conf /etc/nginx/sites-available/stream.holonomic.uk

# Enable the site
ln -s /etc/nginx/sites-available/stream.holonomic.uk /etc/nginx/sites-enabled/

# Remove default site (if desired)
rm /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Reload Nginx
systemctl reload nginx
```

## 4. Setup SSL (HTTPS)

 This command will automatically update your Nginx config for HTTPS:

```bash
certbot --nginx -d stream.holonomic.uk
```

## 5. Final Checks

- Visit `https://stream.holonomic.uk`
- Login with your Admin credentials
- Verify searching a movie works (IP check)

## 6. Automated Deployment (GitHub Actions)

Your repository includes a workflow to automatically deploy changes to your server whenever you push to the `main` branch.

**Required GitHub Secrets:**
Go to **Settings** > **Secrets and variables** > **Actions** in your GitHub repository and add:

| Secret Name | Value |
|-------------|-------|
| `DO_HOST` | Your Droplet IP Address (e.g., `164.x.x.x`) |
| `DO_USERNAME` | `root` (or your user) |
| `DO_SSH_KEY` | Your **Private** SSH Key (starts with `-----BEGIN OPENSSH PRIVATE KEY-----`) |

**How it works:**
1. You push code to GitHub.
2. GitHub logs into your Droplet via SSH.
3. It runs `git pull` and `docker-compose up -d --build`.


