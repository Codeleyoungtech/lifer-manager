# 🎓 Lifer Results Management System

A comprehensive school management platform for managing student results, attendance, subjects, and more.

## ✨ Features

- 📊 **Student Management** - Add, edit, and organize students by class
- 📝 **Result Management** - Input and calculate grades, positions, and remarks
- 📅 **Attendance Tracking** - Smart auto-calculation based on max attendance
- 📚 **Subject Management** - Configure subjects and grading systems
- 📈 **Dashboard** - Visual insights and analytics
- 🖨️ **Report Generation** - Generate PDF result sheets
- 🔐 **Secure Authentication** - JWT-based authentication system

## 🚀 Recent Updates

✅ **Attendance Auto-Calculate** - Input either present or absent days, the other calculates automatically
✅ **Fixed Position Ranking** - Proper handling of tied scores (standard competition ranking)
✅ **Deployment Ready** - Configured for cloud deployment

## 📦 Tech Stack

**Frontend:**

- Vite
- Vanilla JavaScript
- HTML5 & CSS3

**Backend:**

- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- RESTful API

## 🏃‍♂️ Running Locally

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- pnpm (or npm)

### Setup

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd lifer-shortened
```

2. **Install dependencies**

```bash
pnpm install
cd backend
pnpm install
cd ..
```

3. **Configure environment**

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

4. **Run the application**

```bash
# Terminal 1 - Frontend
pnpm run dev

# Terminal 2 - Backend
cd backend
pnpm run dev
```

5. **Access the app**

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🌐 Deployment

We've prepared everything you need for deployment!

### Quick Deploy Guide

See **[DEPLOY-NOW.md](./DEPLOY-NOW.md)** for detailed step-by-step instructions.

### What's Configured:

- ✅ Environment-based API configuration
- ✅ Production build scripts
- ✅ MongoDB Atlas integration
- ✅ Render.com deployment files
- ✅ CORS and security headers

### Deploy to:

- **Backend**: Render.com (free tier)
- **Frontend**: Render.com or Vercel (free tier)
- **Database**: MongoDB Atlas (already configured)

## 📱 Multi-Device Access

Once deployed, access your application from:

- 💻 Desktop computers
- 📱 Tablets
- 📞 Mobile phones
- 🌍 Any device with a web browser!

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Helmet.js security headers
- CORS protection
- MongoDB injection prevention

## 📖 Documentation

- **[DEPLOY-NOW.md](./DEPLOY-NOW.md)** - Complete deployment guide
- **[DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)** - Deployment overview
- See `backend/.env.example` for environment variables

## 🛠️ Project Structure

```
lifer-shortened/
├── src/                    # Frontend source
│   ├── pages/             # HTML pages
│   ├── scripts/           # JavaScript modules
│   ├── assets/            # CSS and static assets
│   └── config.js          # Environment configuration
├── backend/               # Backend API
│   ├── src/
│   │   ├── features/      # Feature modules
│   │   ├── shared/        # Shared utilities
│   │   └── app.js         # Express app
│   └── .env              # Environment variables (not in git)
└── dist/                 # Production build (generated)
```

## 🤝 Contributing

This is a private school management system. For issues or improvements, contact the development team.

## 📄 License

Proprietary - All rights reserved

## 🎯 Roadmap

- [ ] Mobile app version
- [ ] Email notifications
- [ ] Parent portal
- [ ] Advanced analytics
- [ ] Bulk operations
- [ ] Report customization

---

**Ready to deploy?** Check out [DEPLOY-NOW.md](./DEPLOY-NOW.md) to get started! 🚀
