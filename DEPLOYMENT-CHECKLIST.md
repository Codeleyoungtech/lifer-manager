# ✅ Pre-Deployment Checklist

Complete this checklist before deploying your application.

## 🔧 Prerequisites

- [ ] **GitHub Account** - Create one at https://github.com
- [ ] **Render Account** - Sign up at https://render.com (free)
- [ ] **MongoDB Atlas** - Already configured ✅
- [ ] **Git Installed** - Check with `git --version`

## 📋 Preparation Steps

### 1. Database Configuration

- [ ] Login to MongoDB Atlas
- [ ] Navigate to **Network Access**
- [ ] Add IP: **0.0.0.0/0** (Allow from anywhere)
- [ ] Save your MongoDB connection string

### 2. Code Preparation

- [ ] All changes committed locally ✅
- [ ] Test frontend: `npm run build` ✅
- [ ] Test backend locally ✅
- [ ] Update JWT_SECRET for production (see below)

### 3. Git Repository

- [ ] Create new repository on GitHub
- [ ] Initialize git: `git init`
- [ ] Add remote: `git remote add origin <your-repo-url>`
- [ ] Push code: `git push -u origin main`

## 🔐 Generate Production JWT Secret

Run this command to generate a secure JWT secret:

**Windows (PowerShell):**

```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**OR use online generator:**
https://www.random.org/strings/?num=1&len=64&digits=on&upperalpha=on&loweralpha=on

Copy the result and save it for deployment!

## 🚀 Deployment Steps

### Backend Deployment (Render)

- [ ] Go to Render.com
- [ ] Create **New Web Service**
- [ ] Connect GitHub repository
- [ ] Configure settings:
  - [ ] Root Directory: `backend`
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
- [ ] Add Environment Variables:
  - [ ] `NODE_ENV` = `production`
  - [ ] `MONGO_URI` = Your MongoDB Atlas URI
  - [ ] `JWT_SECRET` = Your generated secret (from above)
  - [ ] `JWT_EXPIRE` = `30d`
- [ ] Click **Create Web Service**
- [ ] Wait for deployment (2-3 minutes)
- [ ] **Copy your backend URL**: `https://________.onrender.com`

### Frontend Deployment (Render)

- [ ] In Render, create **New Static Site**
- [ ] Connect same GitHub repository
- [ ] Configure settings:
  - [ ] Build Command: `npm run build`
  - [ ] Publish Directory: `dist`
- [ ] Add Environment Variable:
  - [ ] `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
- [ ] Click **Create Static Site**
- [ ] Wait for deployment (1-2 minutes)
- [ ] **Your app is live!** 🎉

## ✅ Post-Deployment Testing

### Test Backend

- [ ] Visit your backend URL in browser
- [ ] Should see: `{"message":"Lifer Results Management API is running"}`

### Test Frontend

- [ ] Visit your frontend URL
- [ ] Login page should load
- [ ] Try logging in with your credentials
- [ ] Create a test student
- [ ] Add test attendance
- [ ] Verify data saves correctly

### Test from Mobile

- [ ] Open frontend URL on phone
- [ ] Check responsive design
- [ ] Test basic functionality

## 🎯 Success Criteria

✅ Backend is running and accessible
✅ Frontend loads without errors
✅ Can login successfully
✅ Can create and view data
✅ Data persists after refresh
✅ Works on multiple devices

## 📞 Troubleshooting

**If backend won't connect to MongoDB:**

1. Check MongoDB IP whitelist includes 0.0.0.0/0
2. Verify MONGO_URI is correct in Render environment variables
3. Check Render logs for specific error messages

**If frontend can't reach backend:**

1. Verify VITE_API_URL environment variable is correct
2. Must end with `/api`
3. Should match your Render backend URL
4. Check for CORS errors in browser console (F12)

**If deployment fails:**

1. Check Render build logs
2. Ensure all dependencies are in package.json
3. Verify build commands are correct

## 🎉 You're Ready!

Once all items are checked, your application is deployed and accessible from anywhere!

**Share your URL with:**

- School administrators
- Teachers
- Staff members
- Anyone who needs access!

---

Need specific help? Review the detailed guides:

- **[DEPLOY-NOW.md](./DEPLOY-NOW.md)** - Step-by-step deployment
- **[DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)** - Deployment overview
- **[README.md](./README.md)** - Project documentation
