# 🎯 QUICK DEPLOYMENT REFERENCE

## Your Deployment Stack

```
Frontend (Vite) → Render/Vercel → Users
         ↓
Backend (Node.js) → Render → MongoDB Atlas
```

---

## 🔗 Important URLs After Deployment

### MongoDB Atlas

- **Dashboard**: https://cloud.mongodb.com
- **Your Connection String**: Already in `backend/.env`

### Render.com

- **Dashboard**: https://dashboard.render.com
- **Backend URL**: `https://[your-service-name].onrender.com`
- **Frontend URL**: `https://[your-site-name].onrender.com`

---

## 📋 Environment Variables Quick Reference

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://express_test:expressTEST@cluster0.dy9csx9.mongodb.net/express
JWT_SECRET=[generate-new-strong-secret-for-production]
JWT_EXPIRE=30d
FRONTEND_URL=https://[your-frontend-url].onrender.com
```

### Frontend (Render Dashboard)

```env
VITE_API_URL=https://[your-backend-url].onrender.com/api
```

---

## ⚡ Quick Commands

### Build & Test Locally

```bash
# Test frontend build
npm run build

# Test backend
cd backend
npm start
```

### Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## 🎬 Deployment Flow (2 Services)

### 1️⃣ Backend First (Render)

```
1. New Web Service
2. Root Directory: backend
3. Build: npm install
4. Start: npm start
5. Add environment variables ⬆️
6. Deploy
7. COPY THE URL ✂️
```

### 2️⃣ Frontend Second (Render)

```
1. New Static Site
2. Build: npm run build
3. Publish: dist
4. Add VITE_API_URL with backend URL ⬆️
5. Deploy
6. DONE! 🎉
```

---

## 🔍 Testing Checklist

After deployment, test these URLs:

**Backend Health Check:**

```
https://[backend].onrender.com/
Should return: {"message":"Lifer Results Management API is running"}
```

**Frontend:**

```
https://[frontend].onrender.com/
Should show: Login page
```

**API Connection:**

```
Login → Should work
Create student → Should work
View dashboard → Should work
```

---

## 🐛 Common Issues & Fixes

| Issue                      | Solution                                |
| -------------------------- | --------------------------------------- |
| Backend won't start        | Check Render logs, verify MONGO_URI     |
| Frontend can't connect     | Verify VITE_API_URL ends with `/api`    |
| Database timeout           | Add 0.0.0.0/0 to MongoDB IP whitelist   |
| "Free instance spins down" | Normal! First request takes 30s to wake |
| CORS error                 | Check FRONTEND_URL in backend env vars  |

---

## 📱 Access from Any Device

Once deployed, share this URL:

```
https://[your-app].onrender.com
```

Works on:

- ✅ Desktop computers
- ✅ Laptops
- ✅ Tablets
- ✅ Smartphones
- ✅ Any device with a browser!

---

## 💰 Costs

- **MongoDB Atlas**: FREE (512MB)
- **Render Backend**: FREE (750 hours/month)
- **Render Frontend**: FREE (unlimited)
- **Total**: $0.00/month 🎉

_Upgrade to paid ($7/month) for always-on backend_

---

## 🎓 Your Files

- ✅ `DEPLOY-NOW.md` - Detailed step-by-step guide
- ✅ `DEPLOYMENT-CHECKLIST.md` - Pre-deployment checklist
- ✅ `DEPLOYMENT-GUIDE.md` - Overview and strategy
- ✅ `README.md` - Project documentation
- ✅ `backend/.env.example` - Environment template
- ✅ This file - Quick reference!

---

## 🚀 Ready to Deploy?

1. Open `DEPLOYMENT-CHECKLIST.md`
2. Follow each step
3. Refer back to this for quick lookups!

**Good luck! You've got this! 🎉**
