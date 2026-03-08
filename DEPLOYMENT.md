# Deployment Guide - Hotel Front Desk Management System

This guide provides step-by-step instructions for deploying the Hotel Front Desk Management System to production using free-tier services.

## Architecture Overview

- **Frontend**: Angular SPA deployed on Vercel (Free tier)
- **Backend**: Node.js + Express API deployed on Render (Free tier)
- **Database**: PostgreSQL hosted on Supabase (Free tier)
- **Scheduler**: External cron service (cron-job.org - Free tier)

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Render account (sign up at https://render.com)
- Supabase account (sign up at https://supabase.com)
- cron-job.org account (sign up at https://cron-job.org)

---

## Part 1: Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Log in to https://supabase.com
2. Click "New Project"
3. Fill in project details:
   - **Name**: hotel-front-desk-db
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for project to be provisioned (2-3 minutes)

### Step 2: Get Database Connection String

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string** section
3. Select **URI** tab
4. Copy the connection string (format: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres`)
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. Save this connection string - you'll need it for backend deployment

### Step 3: Run Database Migrations

The database schema is automatically created when the backend starts. No manual migration needed.

---

## Part 2: Backend Deployment (Render)

### Step 1: Push Code to GitHub

1. Ensure your code is committed to a GitHub repository
2. Make sure the `render.yaml` file is in the project root
3. Push all changes:
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

### Step 2: Connect GitHub to Render

1. Log in to https://render.com
2. Click **New** → **Web Service**
3. Click **Connect GitHub** (if not already connected)
4. Authorize Render to access your GitHub repositories
5. Select your hotel management repository

### Step 3: Configure Web Service

Render should auto-detect the `render.yaml` configuration. If not, configure manually:

- **Name**: hotel-front-desk-backend
- **Region**: Oregon (US West) or closest to your users
- **Branch**: main
- **Root Directory**: backend
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free

### Step 4: Set Environment Variables

In the Render dashboard, go to **Environment** tab and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Set environment to production |
| `PORT` | `10000` | Render's default port (auto-set) |
| `DATABASE_URL` | `postgresql://postgres:...` | Paste your Supabase connection string |
| `CORS_ORIGIN` | `https://your-app.vercel.app` | Will update after frontend deployment |
| `SCHEDULER_API_KEY` | `your-secure-random-key` | Generate a strong random key (see below) |

**Generate SCHEDULER_API_KEY:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use online generator:
# https://www.random.org/strings/
```

### Step 5: Deploy Backend

1. Click **Create Web Service**
2. Render will start building and deploying
3. Wait for deployment to complete (5-10 minutes)
4. Once deployed, you'll see a URL like: `https://hotel-front-desk-backend.onrender.com`
5. Test the health endpoint: `https://your-backend-url.onrender.com/api/health`

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45,
  "database": "connected",
  "environment": "production"
}
```

### Important Notes for Render Free Tier

⚠️ **Render free tier limitations:**
- Service will **sleep after 15 minutes of inactivity**
- First request after sleep takes **30-60 seconds** to wake up
- 750 hours/month of runtime (sufficient for most use cases)
- Automatic deploys on git push

💡 **Tip**: The external cron service will keep your backend awake by calling it daily at noon.

---

## Part 3: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend Configuration

1. Update `frontend/src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://your-backend-url.onrender.com/api'
   };
   ```
   Replace `your-backend-url` with your actual Render backend URL.

2. Commit and push changes:
   ```bash
   git add frontend/src/environments/environment.prod.ts
   git commit -m "Update production API URL"
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. Log in to https://vercel.com
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Angular
   - **Root Directory**: frontend
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist/hotel-front-desk-frontend` (auto-detected)
5. Click **Deploy**
6. Wait for deployment (3-5 minutes)
7. Once deployed, you'll get a URL like: `https://your-app.vercel.app`

### Step 3: Update Backend CORS

1. Go back to Render dashboard
2. Navigate to your backend service → **Environment**
3. Update `CORS_ORIGIN` variable:
   - **Value**: `https://your-app.vercel.app` (your actual Vercel URL)
4. Save changes
5. Render will automatically redeploy with new CORS settings

### Step 4: Test Frontend

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test basic functionality:
   - Login/authentication
   - View room board
   - Create a booking
   - Check API connectivity

---

## Part 4: Automated Scheduler Setup (cron-job.org)

The system requires a daily automated task to check out rooms at noon. Since Render free tier doesn't support built-in cron jobs, we use an external service.

### Step 1: Create Cron Job Account

1. Go to https://cron-job.org
2. Sign up for a free account
3. Verify your email

### Step 2: Create Checkout Cron Job

1. Log in to cron-job.org
2. Click **Create Cron Job**
3. Configure the job:

**Basic Settings:**
- **Title**: Hotel Checkout Automation
- **Address (URL)**: `https://your-backend-url.onrender.com/api/scheduler/trigger-checkout`
- **Request Method**: POST

**Schedule:**
- **Execution**: Every day
- **Time**: 12:00 (noon) in your timezone
- **Timezone**: Select your hotel's timezone

**Request Headers:**
Click **Add Header** and add:
- **Header Name**: `x-api-key`
- **Header Value**: `your-scheduler-api-key` (same as SCHEDULER_API_KEY from Render)

**Advanced Settings:**
- **Timeout**: 30 seconds
- **Retries**: 2
- **Retry Interval**: 5 minutes

4. Click **Create**

### Step 3: Test Cron Job

1. In cron-job.org dashboard, find your job
2. Click **Run now** to test
3. Check execution history - should show success (200 OK)
4. Verify in your application that rooms were checked out

### Step 4: Monitor Cron Job

- cron-job.org provides execution history and email notifications
- Enable email notifications for failed executions
- Check logs regularly to ensure automation is working

---

## Part 5: Verification Checklist

After completing all deployment steps, verify:

### Backend Verification
- [ ] Health endpoint returns "healthy" status
- [ ] Database connection is "connected"
- [ ] API endpoints respond correctly (test with Postman/curl)
- [ ] CORS allows requests from frontend domain

### Frontend Verification
- [ ] Application loads without errors
- [ ] Can view room board
- [ ] Can create bookings
- [ ] Can view reports
- [ ] All API calls succeed

### Scheduler Verification
- [ ] Cron job executes successfully
- [ ] Rooms are checked out at noon
- [ ] Room status changes to CLEANING
- [ ] No errors in execution logs

### Integration Verification
- [ ] Frontend can communicate with backend
- [ ] Data persists in database
- [ ] Real-time updates work correctly
- [ ] No CORS errors in browser console

---

## Troubleshooting

### Backend Issues

**Problem**: Health check shows "database: disconnected"
- **Solution**: Verify DATABASE_URL is correct in Render environment variables
- Check Supabase database is running
- Ensure IP restrictions are not blocking Render

**Problem**: CORS errors in browser
- **Solution**: Update CORS_ORIGIN in Render to match your Vercel URL exactly
- Include protocol (https://) and no trailing slash
- Redeploy backend after changing

**Problem**: Backend is slow to respond
- **Solution**: This is normal for Render free tier after inactivity
- First request wakes up the service (30-60 seconds)
- Subsequent requests are fast
- Cron job helps keep service awake

### Frontend Issues

**Problem**: API calls fail with 404
- **Solution**: Check environment.prod.ts has correct backend URL
- Ensure URL includes /api path
- Verify backend is deployed and running

**Problem**: Build fails on Vercel
- **Solution**: Check build command is correct
- Verify all dependencies are in package.json
- Check Angular version compatibility

### Scheduler Issues

**Problem**: Cron job fails with 401 Unauthorized
- **Solution**: Verify x-api-key header matches SCHEDULER_API_KEY
- Check header name is exactly "x-api-key"
- Ensure API key has no extra spaces

**Problem**: Cron job times out
- **Solution**: Increase timeout to 60 seconds
- Check backend is awake (may need to wake up first)
- Verify checkout logic doesn't have infinite loops

---

## Monitoring and Maintenance

### Daily Checks
- Verify cron job executed successfully
- Check for any error notifications
- Monitor application performance

### Weekly Checks
- Review Render logs for errors
- Check database storage usage (Supabase free tier: 500MB)
- Verify all features working correctly

### Monthly Checks
- Review Render usage (750 hours/month limit)
- Check Supabase database size
- Update dependencies if needed

---

## Updating the Application

### Backend Updates
1. Make changes to backend code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```
3. Render automatically deploys (if autoDeploy is enabled)
4. Monitor deployment in Render dashboard

### Frontend Updates
1. Make changes to frontend code
2. Update environment files if needed
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update frontend"
   git push origin main
   ```
4. Vercel automatically deploys
5. Monitor deployment in Vercel dashboard

---

## Cost Summary

All services used are **FREE**:

| Service | Plan | Limitations |
|---------|------|-------------|
| Vercel | Free | 100GB bandwidth/month, unlimited projects |
| Render | Free | 750 hours/month, sleeps after 15min inactivity |
| Supabase | Free | 500MB database, 2GB bandwidth/month |
| cron-job.org | Free | Unlimited jobs, 1-minute minimum interval |

**Total Monthly Cost: $0**

---

## Security Best Practices

1. **API Keys**: Never commit API keys to git
2. **Environment Variables**: Use Render/Vercel environment variables
3. **Database**: Use strong passwords, enable SSL
4. **CORS**: Only allow your frontend domain
5. **Scheduler**: Use strong API key for scheduler endpoint
6. **HTTPS**: Always use HTTPS (automatic on Vercel/Render)

---

## Support and Resources

- **Render Documentation**: https://render.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **cron-job.org Help**: https://cron-job.org/en/documentation/

---

## Quick Reference

### Important URLs
- Backend: `https://your-backend-url.onrender.com`
- Frontend: `https://your-app.vercel.app`
- Health Check: `https://your-backend-url.onrender.com/api/health`
- Database: Supabase dashboard

### Environment Variables Reference

**Backend (Render):**
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
CORS_ORIGIN=https://your-app.vercel.app
SCHEDULER_API_KEY=your-secure-random-key
```

**Frontend (environment.prod.ts):**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.onrender.com/api'
};
```

---

**Deployment Complete! 🎉**

Your Hotel Front Desk Management System is now live and ready to use.
