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

## 6. Automating Deployment (Optional)

To enable automatic updates when you push to GitHub:

1.  Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2.  Click **New repository secret**.
3.  Add the following secrets:
    *   `DO_HOST`: The IP address of your Droplet (e.g., `123.45.67.89`).
    *   `DO_USERNAME`: The username you use to SSH (usually `root`).
    *   `DO_SSH_KEY`: Your private SSH key (the content of your private key file, e.g., `id_rsa`).
        *   *Note: If you don't have a specific key pair for this, generate one with `ssh-keygen` and add the public key to `~/.ssh/authorized_keys` on the Droplet.*

Once these are set, any push to the `main` branch will trigger the **Deploy to DigitalOcean Droplet** action.
