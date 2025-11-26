# 🚀 GRC Resume Builder

**Professional Resume Optimization & Job Search Platform for GRC Professionals**

Transform your job search with AI-powered resume optimization, multi-board job discovery, and application tracking. Built by GRC professionals, for GRC professionals.

---

## 🎯 What This Does

### **🎯 Industry-Standard ATS Scoring**
- **Fortune 500 ATS Analysis** - Based on Taleo, Workday, iCIMS, Greenhouse
- **GRC Specialized** - Optimized for Governance, Risk, Compliance roles
- **30+ Scoring Criteria** - Parsing, content, and job matching analysis
- **A-F Grade System** - Interview rate predictions (A=45-60% success rate)
- **Federal Job Optimization** - Security clearance and government positions
- **Real-time Feedback** - Immediate improvement recommendations
- **One-Click Tailoring** - Instant resume customization for specific jobs

### **🔍 Job Discovery**
- **Multi-Board Search** - USAJobs, LinkedIn, Indeed, Dice, and more
- **AI-Powered Matching** - Smart job recommendations based on your resume
- **Remote/Hybrid Focus** - Filter for modern work arrangements
- **Real-Time Updates** - Fresh job listings with automatic cleanup

### **📊 Application Tracking**
- **Kanban Workflow** - Visual application management (Applied → Interview → Offer)
- **Status Management** - Track progress and follow-ups
- **Analytics Dashboard** - Success metrics and insights
- **Privacy-First** - Local storage keeps your data secure

---

## 🛠️ Technical Stack

- **Next.js 14** - Modern web framework
- **TypeScript** - Type-safe development
- **TailwindCSS** - Professional styling
- **React** - Component-based architecture
- **Node.js** - Backend API integration

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ installed
- Git for version control

### **Installation**
```bash
# Clone the repository
git clone https://github.com/GRCJP/Resume-Builder-Public.git
cd Resume-Builder-Public

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### **Configuration**
```bash
# Copy environment template
cp .env.example .env.local

# ⚠️ IMPORTANT: API Setup REQUIRED for Full Functionality!
# Follow: docs/getting-started/API_SETUP.md

# Required APIs for complete features:
# - USAJobs API (FREE, 5 min) - Federal jobs
# - Gmail OAuth (FREE, 10 min) - Email parsing  
# - Job Board API (FREE, 3-5 min) - JSearch/Adzuna/SerpApi
# - Email Alerts (FREE, 5 min each) - LinkedIn/Indeed/Lensa

# Add your API keys to .env.local
# Configure your preferred job boards
# Set up Gmail integration for job alerts
```

---

## 🔌 Complete API Integration Setup

### **🇺🇸 USAJobs API (Federal Jobs)**
**Setup Time: 5 minutes | Cost: FREE**
- **Purpose**: Federal government job board for GRC positions
- **Features**: Federal jobs, security clearance positions, GS level matching
- **Setup**: 
  1. Visit [USAJobs Developer Portal](https://developer.usajobs.gov/)
  2. Sign up for API access (5-minute process)
  3. Add to `.env.local`: `USAJOBS_API_KEY=your_key` and `USAJOBS_USER_AGENT=your_email`

### **📧 Gmail OAuth (Email Parsing)**
**Setup Time: 10 minutes | Cost: FREE**
- **Purpose**: Parse job alert emails from LinkedIn, Indeed, Lensa
- **Features**: Automatic job extraction from email alerts
- **Setup**:
  1. Visit [Google Cloud Console](https://console.cloud.google.com/)
  2. Create OAuth2 credentials with Gmail API
  3. Add to `.env.local`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`

### **🔍 Job Board APIs (Choose One or More)**

#### **JSearch API (Recommended)**
**Setup Time: 5 minutes | Cost: FREE (100 requests/month)**
- **Purpose**: Comprehensive job database with advanced filtering
- **Features**: Real-time jobs, company information, salary data
- **Setup**:
  1. Visit [RapidAPI](https://rapidapi.com/hub)
  2. Subscribe to JSearch API (FREE tier available)
  3. Add to `.env.local`: `JSEARCH_RAPIDAPI_KEY=your_key`

#### **Adzuna API**
**Setup Time: 3 minutes | Cost: FREE (1,000 requests/month)**
- **Purpose**: Job board aggregation with company insights
- **Features**: Job market trends, salary comparisons
- **Setup**:
  1. Visit [Adzuna Developer Portal](https://developer.adzuna.com/)
  2. Apply for API access (instant approval)
  3. Add to `.env.local`: `ADZUNA_APP_ID=your_id` and `ADZUNA_API_KEY=your_key`

#### **SerpApi (Google Jobs)**
**Setup Time: 3 minutes | Cost: FREE (100 searches/month)**
- **Purpose**: Google Jobs search integration
- **Features**: Google-powered job search, comprehensive coverage
- **Setup**:
  1. Visit [SerpApi](https://serpapi.com/)
  2. Create free account
  3. Add to `.env.local`: `SERPAPI_KEY=your_key`

### **📧 Email Alert Integrations (FREE)**
**Setup Time: 5 minutes each | Cost: FREE**
- **LinkedIn Email Alerts** - Set up job alerts → Auto-parse in app
- **Indeed Email Alerts** - Configure email notifications → Extract jobs
- **Lensa Email Alerts** - Create job alerts → Import automatically

### **⚡ Quick Setup Summary**
```bash
# Required for Full Functionality (ALL FREE):
✅ USAJobs API (5 min) - Federal GRC jobs
✅ Gmail OAuth (10 min) - Email parsing
✅ One Job Board API (3-5 min) - Private sector jobs
✅ Email Alerts (5 min each) - LinkedIn/Indeed/Lensa

# Total Setup Time: 20-30 minutes for complete functionality
```

### **📋 Complete Setup Guide**
For detailed step-by-step instructions with troubleshooting:
- **[✅ API Setup Checklist](./docs/getting-started/API-SETUP-CHECKLIST.md)** - Step-by-step checklist
- **[🛠️ Complete API Setup Guide](./docs/getting-started/API_SETUP.md)** - Detailed instructions
- **[🔌 API Integration Documentation](./docs/api/)** - Technical implementation details

---

## 📚 Complete Documentation

### **🚀 New to the project? Start here:**
- **[⚡ Quick Start Guide](./QUICK_START.md)** - 5-minute setup and first contribution
- **[✅ API Setup Checklist](./docs/getting-started/API-SETUP-CHECKLIST.md)** - Step-by-step API setup
- **[📖 Documentation Hub](./docs/README.md)** - Complete documentation index

### **🛠️ Development Resources:**
- **[🛠️ Development Setup](./docs/development/development-setup.md)** - Complete development environment
- **[🤝 Contributing Guide](./docs/development/contributing-guide.md)** - How to contribute effectively
- **[🎯 ATS Scoring Model](./docs/development/ats-scoring-model.md)** - Industry-standard scoring system

### **🔌 API Integration Documentation:**
- **[🔌 API Integration Guide](./docs/api/api-integration-guide.md)** - Complete overview of all APIs
- **[🇺🇸 USAJobs API](./docs/api/usajobs-api.md)** - Federal jobs detailed setup
- **[📧 Gmail Integration](./docs/api/gmail-api.md)** - Email parsing and OAuth setup
- **[🔍 Job Board APIs](./docs/api/job-board-apis.md)** - JSearch, Adzuna, SerpApi setup
- **[🔧 API Reference](./docs/api/reference.md)** - Complete API documentation

### **📚 Training & Learning:**
- **[📚 Training Program](./docs/training/training-program.md)** - Complete 4-week training curriculum
- **[🎯 Lesson Plans](./docs/training/lesson-plans.md)** - Detailed lesson plans and exercises
- **[🛠️ Practical Projects](./docs/training/projects.md)** - Hands-on project assignments
- **[📋 Assessment Guide](./docs/training/assessment.md)** - Knowledge checks and certification

---

## 🤝 Community

This is a community-driven open source project. We welcome contributions from:

- **GRC Professionals** - Industry expertise and feedback
- **Developers** - Feature development and bug fixes
- **Designers** - UX/UI improvements
- **Writers** - Documentation and guides

### **How to Contribute**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
5. Join the community discussion

---

## 🎯 Features in Detail

### **📊 ATS Scoring Engine**
- Real-time resume analysis
- Industry benchmark comparison
- Keyword optimization suggestions
- Readability and formatting checks

### **🤖 AI-Powered Matching**
- Resume-to-job compatibility scoring
- Missing keyword identification
- Natural language processing
- Smart recommendation algorithms

### **📱 Professional Interface**
- Clean, intuitive design
- Mobile-responsive layout
- Accessibility compliance
- Modern user experience

---

## 🔒 Security & Privacy

- **Local Storage** - Your data stays on your device
- **No Tracking** - No analytics or telemetry
- **Secure APIs** - Encrypted API communications
- **Privacy First** - No data collection or sharing

---

## 📄 License

MIT License - Free to use, modify, and distribute.

---

## 🎯 Mission

Help GRC professionals advance their careers with modern tools and professional development practices. Built by the community, for the community.

---

**🚀 Start optimizing your GRC career today!**
