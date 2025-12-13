# 🚀 Quick Deployment Guide

## Option 1: Deploy to Render.com (Recommended - Free & Easy)

### Prerequisites

- [x] MongoDB Atlas is already set up ✅
- [ ] GitHub account
- [ ] Render.com account (free)

---

## 📦 Step 1: Prepare Your Code

### A. Update MongoDB Atlas IP Whitelist

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to: **Network Access** → **IP Access List**
3. Click **Add IP Address**
4. Select **Allow Access from Anywhere** (0.0.0.0/0)
   - This allows Render to connect to your database
5. Click **Confirm**

### B. Build Your Frontend (Test Locally First)

```bash
npm run build
```

This creates a `dist` folder with your production-ready frontend.

---

## 🔧 Step 2: Push to GitHub

If you haven't already:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/lifer-results.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 3: Deploy Backend to Render

### A. Sign Up & Create Web Service

1. Go to [Render.com](https://render.com) and sign up (free)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `lifer-backend` (or any name)
   - **Region**: Choose closest to you
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### B. Set Environment Variables

Click **Advanced** → **Add Environment Variable**:

| Key          | Value                                                          |
| ------------ | -------------------------------------------------------------- |
| `NODE_ENV`   | `production`                                                   |
| `MONGO_URI`  | Your MongoDB Atlas connection string                           |
| `JWT_SECRET` | Generate a strong random string (e.g., use password generator) |
| `JWT_EXPIRE` | `30d`                                                          |

### C. Deploy!

1. Click **Create Web Service**
2. Wait 2-3 minutes for deployment
3. **Copy your backend URL**: `https://lifer-backend-xxxx.onrender.com`

---

## 🎨 Step 4: Deploy Frontend to Render

### A. Create Static Site

1. Click **New** → **Static Site**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `lifer-results` (or any name)
   - **Root Directory**: Leave empty (use root)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

### B. Set Environment Variable

Click **Advanced** → **Add Environment Variable**:

| Key            | Value                                       |
| -------------- | ------------------------------------------- |
| `VITE_API_URL` | `https://your-backend-url.onrender.com/api` |

⚠️ **IMPORTANT**: Replace `your-backend-url` with your actual backend URL from Step 3C

### C. Deploy!

1. Click **Create Static Site**
2. Wait 1-2 minutes
3. **Your app is live!** 🎉

---

## 📱 Step 5: Access from Any Device

Your app is now accessible at:

```
https://lifer-results-xxxx.onrender.com
```

**From any device:**

1. Open a web browser
2. Go to your Render URL
3. Login with your credentials
4. Everything syncs automatically via MongoDB Atlas!

---

## 🔄 Future Updates

Every time you push to GitHub:

1. Render automatically detects changes
2. Rebuilds and redeploys your app
3. Zero downtime!

To update:

```bash
git add .
git commit -m "Your update message"
git push
```

---

## ⚡ Option 2: Deploy Frontend to Vercel (Faster Alternative)

Vercel has better performance for static sites:

### Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign up
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure:

   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL` = Your Render backend URL + `/api`

5. Click **Deploy**

Your frontend will be at: `https://lifer-results.vercel.app`

---

## 🛠️ Troubleshooting

### Backend won't connect to MongoDB

- Check MongoDB Atlas IP whitelist (should include 0.0.0.0/0)
- Verify MONGO_URI environment variable is correct
- Check Render logs for error messages

### Frontend can't reach backend

- Verify VITE_API_URL is correct (must end with `/api`)
- Check backend is running (visit backend URL in browser)
- Look for CORS errors in browser console

### "Free instance will spin down with inactivity"

- Render free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Upgrade to paid plan ($7/month) for always-on service

---

## 💰 Cost Breakdown

| Service                    | Free Tier                              | Paid Option          |
| -------------------------- | -------------------------------------- | -------------------- |
| **MongoDB Atlas**          | 512MB storage                          | $9/month (10GB)      |
| **Render Backend**         | 750 hours/month (enough for 1 service) | $7/month (always-on) |
| **Render/Vercel Frontend** | Unlimited                              | N/A (free is enough) |

**Total Cost**: FREE for everything! 🎉

---

## 📞 Need Help?

Common issues:

1. **Build fails**: Check that all dependencies are in package.json
2. **Database connection fails**: Verify MongoDB Atlas IP whitelist
3. **API calls fail**: Confirm VITE_API_URL environment variable is set correctly

Happy deploying! 🚀
