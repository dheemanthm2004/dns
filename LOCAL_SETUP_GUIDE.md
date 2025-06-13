# 🚀 DheeNotifications - Complete Local Setup Guide

## 📋 What You've Built
**Enterprise-grade notification platform** with:
- ✅ Multi-channel notifications (Email, SMS, In-app)
- ✅ Real-time analytics dashboard
- ✅ Template management system
- ✅ Batch processing with CSV upload
- ✅ Professional admin interface
- ✅ JWT authentication + API keys
- ✅ Production-ready architecture

---

## 🛠️ Prerequisites Installation

### 1. Install Node.js (v18 or higher)
```bash
# Download from https://nodejs.org/
# Or using nvm (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### 2. Install PostgreSQL
**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or using chocolatey:
choco install postgresql
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. Install Redis
**Windows:**
```bash
# Download from https://github.com/microsoftarchive/redis/releases
# Or using chocolatey:
choco install redis-64
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 4. Install Git & VS Code
```bash
# Git: https://git-scm.com/downloads
# VS Code: https://code.visualstudio.com/download
```

---

## 📥 Clone & Setup Project

### 1. Clone Repository
```bash
# Open terminal/command prompt
git clone https://github.com/dheemanthm2004/dns.git
cd dns
```

### 2. Open in VS Code
```bash
code .
```

### 3. Install VS Code Extensions (Recommended)
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**
- **Thunder Client** (for API testing)

---

## 🗄️ Database Setup

### 1. Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE dheenotifications;
CREATE USER dheeno WITH PASSWORD 'dheeno123';
GRANT ALL PRIVILEGES ON DATABASE dheenotifications TO dheeno;
\q
```

### 2. Test Database Connection
```bash
psql -h localhost -U dheeno -d dheenotifications -p 5432
# Enter password: dheeno123
# If connected successfully, type \q to exit
```

---

## ⚙️ Environment Configuration

### 1. Backend Environment (.env)
```bash
cd backend
cp .env.example .env
```

**Edit `backend/.env`:**
```env
# Database
DATABASE_URL="postgresql://dheeno:dheeno123@localhost:5432/dheenotifications"

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Twilio SMS (get from https://console.twilio.com/)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE=your-twilio-phone-number

# Environment
NODE_ENV=development
PORT=4000
```

### 2. Frontend Environment (.env.local)
```bash
cd ../frontend
cp .env.example .env.local
```

**Edit `frontend/.env.local`:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

---

## 📦 Install Dependencies

### 1. Backend Dependencies
```bash
cd backend
npm install
```

### 2. Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 🗄️ Database Migration

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name "initial_setup"
```

**Expected output:**
```
✓ Generated Prisma Client
✓ Database migration completed
```

---

## 🚀 Running the Application

### Method 1: Manual (3 Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
**Expected:** `🚀 DheeNotifications Server running on port 4000`

**Terminal 2 - Worker:**
```bash
cd backend
npm run worker
```
**Expected:** `Worker started and listening for jobs...`

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```
**Expected:** `✓ Ready in 2.1s`

### Method 2: Using VS Code Tasks (Recommended)

**Create `.vscode/tasks.json`:**
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Start Worker",
      "type": "shell",
      "command": "npm run worker",
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder}/frontend"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Start All Services",
      "dependsOrder": "parallel",
      "dependsOn": ["Start Backend", "Start Worker", "Start Frontend"]
    }
  ]
}
```

**Run all services:**
- Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
- Type "Tasks: Run Task"
- Select "Start All Services"

---

## 🧪 Testing Your Setup

### 1. Check Services
- **Backend:** http://localhost:4000 (should show API info)
- **Frontend:** http://localhost:3000 (should show login page)
- **API Docs:** http://localhost:4000/api/docs
- **Health Check:** http://localhost:4000/api/health

### 2. Test Registration
1. Go to http://localhost:3000
2. Click "Sign up"
3. Register with your email
4. Login and explore the dashboard

### 3. Test Notifications
1. Go to "Send Notification"
2. Test email notification to your email
3. Check "Logs" to see delivery status
4. Explore "Analytics" for insights

---

## 🔧 Gmail App Password Setup

### 1. Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification

### 2. Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "DheeNotifications"
4. Copy the 16-character password
5. Use this in your `.env` file as `SMTP_PASS`

---

## 📱 Twilio SMS Setup

### 1. Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for free account
3. Verify your phone number

### 2. Get Credentials
1. Go to https://console.twilio.com/
2. Copy Account SID and Auth Token
3. Get a Twilio phone number
4. Add to your `.env` file

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check if database exists
psql -U postgres -l
```

### Redis Connection Issues
```bash
# Check Redis status
redis-cli ping
# Should return: PONG

# Restart Redis
sudo systemctl restart redis-server
```

### Port Already in Use
```bash
# Kill process on port 4000
npx kill-port 4000

# Kill process on port 3000
npx kill-port 3000
```

### Prisma Issues
```bash
cd backend
npx prisma db push
npx prisma generate
```

---

## 🚀 Production Deployment

### Railway (Backend)
1. Go to https://railway.app/
2. Connect GitHub repository
3. Deploy backend folder
4. Add environment variables
5. Enable PostgreSQL and Redis add-ons

### Vercel (Frontend)
1. Go to https://vercel.com/
2. Import GitHub repository
3. Set build command: `cd frontend && npm run build`
4. Set output directory: `frontend/.next`
5. Add environment variables

---

## 📚 Project Structure
```
dns/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, validation
│   │   ├── worker/         # Background jobs
│   │   └── utils/          # Utilities
│   ├── prisma/             # Database schema
│   └── package.json
├── frontend/               # Next.js React app
│   ├── app/                # Pages (App Router)
│   ├── components/         # Reusable components
│   ├── contexts/           # React contexts
│   └── package.json
└── README.md
```

---

## 🎯 Key Features to Showcase

### 1. **Multi-Channel Notifications**
- Email via Gmail SMTP
- SMS via Twilio
- In-app real-time notifications

### 2. **Professional Dashboard**
- Real-time analytics
- Template management
- Batch processing
- User settings

### 3. **Enterprise Architecture**
- JWT authentication
- API rate limiting
- Background job processing
- Error handling & monitoring

### 4. **Production Ready**
- Database migrations
- Environment configuration
- Health checks
- Deployment guides

---

## 🏆 Interview Talking Points

1. **"I built a scalable notification platform that handles multiple channels"**
2. **"Implemented JWT authentication with role-based access control"**
3. **"Used Redis for background job processing and rate limiting"**
4. **"Built real-time analytics dashboard with PostgreSQL"**
5. **"Deployed on Railway and Vercel with CI/CD pipeline"**

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure environment variables are correct
4. Check that PostgreSQL and Redis are running

**Your enterprise notification platform is ready to impress! 🚀**