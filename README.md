# 🔔 DheeNotifications - Enterprise Notification Platform

<div align="center">

![DheeNotifications](https://img.shields.io/badge/DheeNotifications-Enterprise-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue?style=for-the-badge&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-6+-red?style=for-the-badge&logo=redis)

**A comprehensive, production-ready notification system built with modern technologies**

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-detailed-setup) • [🏗️ Architecture](#️-architecture) • [🚀 Deploy](#-deployment)

</div>

---

## 🌟 Features

A production-ready, scalable notification platform supporting multiple channels (Email, SMS, In-App, Push) with real-time analytics, template management, and batch processing.

## 🚀 Features

- **Multi-Channel Notifications**: Email, SMS, In-App, Push
- **Authentication**: JWT + API Key authentication
- **Template System**: Dynamic notification templates
- **Batch Processing**: Send to thousands of recipients
- **Real-time Analytics**: Dashboard with charts and metrics
- **Queue System**: Redis-based job processing
- **Professional UI**: Modern React dashboard
- **Production Ready**: Error handling, monitoring, health checks

## 🛠️ Tech Stack

**Backend:**
- Node.js + TypeScript
- Express.js
- Prisma ORM + PostgreSQL
- Redis + BullMQ
- Socket.IO
- Nodemailer + Twilio

**Frontend:**
- Next.js 15 + TypeScript
- React 19
- Tailwind CSS
- Recharts
- Axios

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/dheemanthm2004/dheenotifications.git
cd dheenotifications
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma migrate dev
npm run dev
```

3. **Worker Setup** (separate terminal)
```bash
cd backend
npm run worker
```

4. **Frontend Setup** (separate terminal)
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with backend URL
npm run dev
```

## 🌐 Production Deployment

### Railway (Backend + Database)

1. **Create Railway Project**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add postgresql redis
railway deploy
```

2. **Environment Variables**
Set these in Railway dashboard:
```
DATABASE_URL=<railway-postgres-url>
REDIS_URL=<railway-redis-url>
JWT_SECRET=<your-secret>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASS=<your-app-password>
TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
TWILIO_PHONE=<your-phone>
NODE_ENV=production
```

3. **Deploy Worker Service**
Create second Railway service for worker:
```bash
railway service create worker
railway deploy --service worker
```

### Vercel (Frontend)

1. **Connect GitHub Repository**
- Go to Vercel dashboard
- Import your GitHub repository
- Set build command: `cd frontend && npm run build`
- Set output directory: `frontend/.next`

2. **Environment Variables**
```
NEXT_PUBLIC_API_BASE_URL=https://your-railway-backend.up.railway.app/api
```

## 🔑 API Keys Setup

### Gmail SMTP
1. Enable 2FA on Gmail
2. Generate App Password
3. Use app password in SMTP_PASS

### Twilio SMS
1. Sign up at twilio.com
2. Get Account SID and Auth Token
3. Purchase phone number

## 📊 API Documentation

Once deployed, visit:
- **API Docs**: `https://your-backend-url/api/docs`
- **Health Check**: `https://your-backend-url/api/health`

### Example API Usage

```bash
# Send notification
curl -X POST "https://your-backend-url/api/notify" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "channel": "email",
    "message": "Hello from DheeNotifications!"
  }'
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Worker        │
│   (Vercel)      │───▶│   (Railway)     │───▶│   (Railway)     │
│   Next.js       │    │   Express.js    │    │   BullMQ        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   PostgreSQL    │    │     Redis       │
                       │   (Railway)     │    │   (Railway)     │
                       └─────────────────┘    └─────────────────┘
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE=+1234567890
NODE_ENV=production
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend.up.railway.app/api
```

## 📈 Monitoring

- **Health Endpoint**: `/api/health`
- **Analytics Dashboard**: Real-time metrics
- **Error Logging**: Comprehensive error tracking
- **Performance Monitoring**: Built-in monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 👨‍💻 Author

**Dheemanth M**
- GitHub: [@dheemanthm2004](https://github.com/dheemanthm2004)
- Email: dheemanthmadaiah@gmail.com

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by enterprise notification platforms
- Designed for scalability and performance

---

⭐ **Star this repository if you found it helpful!**