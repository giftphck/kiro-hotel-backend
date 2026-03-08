# Frontend Deployment Guide - Vercel

This guide provides step-by-step instructions for deploying the Hotel Front Desk Management System frontend to Vercel.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- GitHub repository with your code
- Backend already deployed on Render

---

## Step 1: Configure Production Environment

The production environment file is already configured at `src/environments/environment.prod.ts`.

**Update the backend API URL:**

1. Open `src/environments/environment.prod.ts`
2. Replace `your-backend-url` with your actual Render backend URL:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://your-actual-backend.onrender.com/api'
   };
   ```
3. Commit and push changes:
   ```bash
   git add src/environments/environment.prod.ts
   git commit -m "Update production API URL"
   git push origin main
   ```

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Log in to Vercel**
   - Go to https://vercel.com
   - Sign in with your GitHub account

2. **Import Project**
   - Click **Add New** → **Project**
   - Select your GitHub repository
   - If not connected, click **Connect GitHub** and authorize Vercel

3. **Configure Project**
   - **Framework Preset**: Angular (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist/hotel-management-frontend/browser` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Environment Variables** (Optional)
   - You can set environment variables in Vercel dashboard if needed
   - For this project, the API URL is configured in environment files
   - HTTPS is automatically enabled on Vercel (no configuration needed)

5. **Deploy**
   - Click **Deploy**
   - Wait for deployment to complete (3-5 minutes)
   - You'll receive a URL like: `https://your-app.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory**
   ```bash
   cd frontend
   vercel
   ```

4. **Follow prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? **hotel-front-desk-frontend**
   - In which directory is your code located? **.**
   - Want to override settings? **N**

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

---

## Step 3: Update Backend CORS Configuration

After deploying the frontend, you need to update the backend to allow requests from your Vercel domain.

1. **Get your Vercel URL**
   - Copy your deployment URL (e.g., `https://your-app.vercel.app`)

2. **Update Render Backend**
   - Go to Render dashboard
   - Navigate to your backend service
   - Go to **Environment** tab
   - Update `CORS_ORIGIN` variable:
     - **Key**: `CORS_ORIGIN`
     - **Value**: `https://your-app.vercel.app` (your actual Vercel URL)
   - Click **Save Changes**
   - Render will automatically redeploy

3. **Wait for backend redeploy**
   - This takes 2-3 minutes
   - Monitor in Render dashboard

---

## Step 4: Configure Automatic Deployment

Vercel automatically sets up continuous deployment from your GitHub repository.

**How it works:**
- Every push to `main` branch triggers automatic deployment
- Pull requests get preview deployments
- You can configure deployment settings in Vercel dashboard

**To configure:**
1. Go to your project in Vercel dashboard
2. Click **Settings** → **Git**
3. Configure:
   - **Production Branch**: `main`
   - **Automatic Deployments**: Enabled (default)
   - **Preview Deployments**: Enabled (optional)

---

## Step 5: Verify Deployment

### Test Frontend Functionality

1. **Visit your Vercel URL**
   - Open `https://your-app.vercel.app` in browser

2. **Check Console for Errors**
   - Open browser DevTools (F12)
   - Check Console tab for any errors
   - Verify no CORS errors

3. **Test Core Features**
   - [ ] Application loads without errors
   - [ ] Can view room board
   - [ ] Can create bookings
   - [ ] Can view booking details
   - [ ] API calls succeed (check Network tab)
   - [ ] No CORS errors

4. **Test on Multiple Devices**
   - Desktop browser
   - Mobile browser
   - Tablet (if available)

---

## Vercel Configuration Files

### vercel.json

The `vercel.json` file is already configured for Angular SPA routing:

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist/hotel-front-desk-frontend/browser",
  "framework": "angular"
}
```

This configuration:
- Redirects all routes to `index.html` (required for Angular routing)
- Specifies the build command
- Specifies the output directory
- Tells Vercel this is an Angular project

---

## Environment Variables in Vercel

If you need to set environment variables in Vercel dashboard:

1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. Add variables:
   - **Name**: Variable name (e.g., `API_URL`)
   - **Value**: Variable value
   - **Environment**: Production, Preview, Development
4. Click **Save**
5. Redeploy for changes to take effect

**Note**: For this project, the API URL is configured in `environment.prod.ts`, so you don't need to set environment variables in Vercel.

---

## Production Build Configuration

The production build is configured in `angular.json`:

```json
"production": {
  "budgets": [...],
  "outputHashing": "all",
  "optimization": true,
  "aot": true,
  "buildOptimizer": true,
  "fileReplacements": [
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.prod.ts"
    }
  ]
}
```

**Features enabled:**
- **AOT Compilation**: Ahead-of-Time compilation for faster runtime
- **Build Optimizer**: Advanced optimizations for smaller bundle size
- **Output Hashing**: Cache busting for updated files
- **Optimization**: Minification and tree-shaking
- **File Replacements**: Uses production environment file

---

## Troubleshooting

### Build Fails on Vercel

**Problem**: Build fails with dependency errors
- **Solution**: 
  - Check `package.json` has all dependencies
  - Run `npm install` locally to verify
  - Check Node.js version compatibility
  - Clear Vercel cache and redeploy

**Problem**: Build fails with "Cannot find module"
- **Solution**:
  - Verify import paths are correct
  - Check file names match imports (case-sensitive)
  - Ensure all files are committed to git

### CORS Errors

**Problem**: Browser shows CORS errors
- **Solution**:
  - Verify `CORS_ORIGIN` in Render matches Vercel URL exactly
  - Include `https://` protocol
  - No trailing slash
  - Redeploy backend after changing

### API Calls Fail

**Problem**: API calls return 404 or fail
- **Solution**:
  - Check `environment.prod.ts` has correct backend URL
  - Verify backend is deployed and running
  - Test backend health endpoint directly
  - Check Network tab in DevTools for actual request URL

### Routing Issues

**Problem**: Direct URL navigation returns 404
- **Solution**:
  - Verify `vercel.json` is configured correctly
  - Ensure routes redirect to `index.html`
  - Check Angular routing configuration

### Slow Initial Load

**Problem**: First page load is slow
- **Solution**:
  - This is normal for Render free tier (backend wakes up)
  - Consider upgrading to paid tier
  - Optimize bundle size (check budgets in angular.json)
  - Enable lazy loading for feature modules

---

## Monitoring and Maintenance

### Vercel Dashboard

Monitor your deployment:
- **Deployments**: View deployment history and logs
- **Analytics**: Track page views and performance (paid feature)
- **Logs**: View runtime logs
- **Domains**: Manage custom domains

### Performance Monitoring

1. **Lighthouse Audit**
   - Run in Chrome DevTools
   - Check Performance, Accessibility, Best Practices, SEO scores
   - Follow recommendations

2. **Bundle Size**
   - Check build output for bundle sizes
   - Keep initial bundle under 500KB
   - Use lazy loading for large features

### Updating the Application

1. **Make changes to code**
2. **Test locally**:
   ```bash
   npm run build
   npm run serve
   ```
3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Update frontend"
   git push origin main
   ```
4. **Vercel automatically deploys**
5. **Monitor deployment in Vercel dashboard**

---

## Custom Domain (Optional)

To use a custom domain:

1. **Add Domain in Vercel**
   - Go to project **Settings** → **Domains**
   - Click **Add**
   - Enter your domain (e.g., `hotel.example.com`)

2. **Configure DNS**
   - Add CNAME record in your DNS provider:
     - **Name**: `hotel` (or `@` for root domain)
     - **Value**: `cname.vercel-dns.com`
   - Wait for DNS propagation (5-60 minutes)

3. **Update Backend CORS**
   - Update `CORS_ORIGIN` in Render to include custom domain
   - Can have multiple origins separated by comma

---

## Vercel Free Tier Limits

**Included in Free Tier:**
- ✅ Unlimited projects
- ✅ 100GB bandwidth per month
- ✅ Automatic HTTPS
- ✅ Automatic deployments
- ✅ Preview deployments
- ✅ Edge Network (CDN)
- ✅ Serverless Functions (100GB-hours)

**Limitations:**
- ⚠️ 100GB bandwidth/month (sufficient for most small-medium apps)
- ⚠️ No custom domains on free tier (use .vercel.app subdomain)
- ⚠️ No advanced analytics

---

## Security Best Practices

1. **HTTPS**: Automatic on Vercel ✅
2. **Environment Variables**: Use Vercel dashboard for sensitive data
3. **CORS**: Only allow your backend domain
4. **Content Security Policy**: Configure in `vercel.json` if needed
5. **Dependencies**: Keep dependencies updated
6. **Secrets**: Never commit secrets to git

---

## Quick Reference

### Important Commands

```bash
# Build for production
npm run build

# Serve production build locally
npm run serve

# Deploy to Vercel (CLI)
vercel --prod

# Check build output
ls -lh dist/hotel-management-frontend/browser
```

### Important Files

- `src/environments/environment.prod.ts` - Production API URL
- `vercel.json` - Vercel configuration
- `angular.json` - Angular build configuration
- `package.json` - Dependencies and scripts

### Important URLs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Your Frontend**: https://your-app.vercel.app
- **Your Backend**: https://your-backend.onrender.com

---

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Angular Deployment**: https://angular.io/guide/deployment
- **Vercel Community**: https://github.com/vercel/vercel/discussions

---

**Frontend Deployment Complete! 🎉**

Your Angular frontend is now live on Vercel with automatic deployments enabled.
