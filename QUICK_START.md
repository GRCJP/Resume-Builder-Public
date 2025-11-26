# 🚀 Quick Start Guide

**Get up and running in 5 minutes - Start contributing today!**

---

## ⚡ 5-Minute Quick Start

### **1. Clone & Install**
```bash
git clone https://github.com/GRCJP/Resume-Builder-Public.git
cd Resume-Builder-Public
npm install
```

### **2. Start Development**
```bash
npm run dev
```
Visit `http://localhost:3000`

### **3. API Setup (REQUIRED for Full Functionality)**

⚠️ **IMPORTANT**: API setup is **REQUIRED** for full functionality!

**For Basic Features (No API Setup Needed):**
- ✅ Resume upload and parsing
- ✅ **Industry-Standard ATS Scoring** - Based on Fortune 500 ATS systems
- ✅ Resume tailoring suggestions
- ✅ Application tracking

**🎯 ATS Scoring Highlights:**
- **Industry Standard** - Based on Taleo, Workday, iCIMS, Greenhouse analysis
- **GRC-Focused** - Specialized for Governance, Risk, Compliance roles
- **Comprehensive** - 30+ criteria across parsing, content, and job matching
- **Grade System** - A-F grading with interview rate predictions
- **Federal Jobs** - Security clearance and government position optimization

**For Full Features (API Setup REQUIRED):**
- 🔧 **Job Discovery** - USAJobs, JSearch, Adzuna, SerpApi
- 🔧 **Email Integration** - LinkedIn, Indeed, Lensa job alerts
- 🔧 **Real-time Jobs** - Live job board integration

**Quick API Setup (15 minutes):**
```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Set up APIs (REQUIRED for job features)
# Follow: docs/getting-started/API_SETUP.md

# 3. Required APIs for full functionality:
# - USAJobs API (FREE, 5 min)
# - Gmail OAuth (FREE, 10 min) 
# - One Job Board API: JSearch OR Adzuna OR SerpApi (FREE, 3-5 min)
# - Email Alerts: LinkedIn + Indeed + Lensa (FREE, 5 min each)

# 4. Restart with APIs configured
npm run dev
```

### **4. Make Your First Contribution**
- **UI Improvement?** Edit components in `/components/`
- **Bug Fix?** Check `/lib/` for logic issues
- **Documentation?** Update files in `/docs/`

---

## 🎯 Contribution Paths

### **🎨 Frontend Contributions (No APIs Needed)**
```bash
# Focus on these areas:
components/          # React components
app/globals.css      # Styling
README.md           # Documentation
```

**What you can do immediately:**
- ✅ Improve UI/UX
- ✅ Fix styling issues
- ✅ Enhance accessibility
- ✅ Add new components

### **⚙️ Backend Contributions (APIs Needed)**
```bash
# Focus on these areas:
lib/                # API integrations
app/api/           # API routes
types/             # TypeScript definitions
```

**Required setup:** See [API Setup Guide](./API_SETUP.md)

---

## 🛠️ Development Workflow

### **Step 1: Explore**
```bash
# Understand the codebase
ls -la components/     # UI components
ls -la lib/           # Business logic
ls -la app/api/       # API endpoints
```

### **Step 2: Make Changes**
```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Edit files...

# Test your changes
npm run build
npm run dev
```

### **Step 3: Submit**
```bash
# Commit and push
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

---

## 🧪 Testing Checklist

### **Before Submitting PR:**
- [ ] App starts: `npm run dev`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] UI looks good on mobile
- [ ] Links work properly

### **Quick Commands:**
```bash
npm run dev      # Start development
npm run build    # Test production build
npm run lint     # Check code quality
```

---

## 🆘 Need Help?

### **Common Issues:**
- **Build errors?** Check TypeScript types
- **Style issues?** Review Tailwind classes
- **API issues?** See [API Setup Guide](./API_SETUP.md)

### **Get Support:**
- 📖 [Documentation](./docs/)
- 💬 [Discussions](https://github.com/GRCJP/Resume-Builder-Public/discussions)
- 🐛 [Issues](https://github.com/GRCJP/Resume-Builder-Public/issues)

---

## 🎉 Ready to Contribute!

**Choose your path:**

### **🚀 Immediate Contributions (No Setup)**
1. Fix typos in documentation
2. Improve UI styling
3. Add accessibility features
4. Enhance error messages

### **⚙️ Advanced Contributions (API Setup)**
1. Add new job board integrations
2. Improve email parsing
3. Enhance resume scoring
4. Add new features

---

**Start now! Your contribution helps GRC professionals find better jobs.** 🚀
