# ✅ API Setup Prerequisite Checklist

Complete checklist for ALL API integrations required for full GRC Resume Builder functionality.

---

## 🎯 Overview

This checklist ensures you have ALL APIs properly configured for complete functionality. **API setup is REQUIRED for full features.**

---

## 📋 Prerequisite Checklist

### **🇺🇸 USAJobs API (REQUIRED - Federal Jobs)**
**Setup Time: 5 minutes | Cost: FREE**

- [ ] **Register Account**
  - [ ] Visit [USAJobs Developer Portal](https://developer.usajobs.gov/)
  - [ ] Click "Get Started" and create account
  - [ ] Fill out application (Educational/Non-commercial)

- [ ] **Get API Credentials**
  - [ ] Receive API key via email
  - [ ] Note registered email for User-Agent

- [ ] **Configure Environment**
  - [ ] Add `USAJOBS_API_KEY=your_key` to `.env.local`
  - [ ] Add `USAJOBS_USER_AGENT=your_email@example.com` to `.env.local`

- [ ] **Test Integration**
  - [ ] Run `npm run dev`
  - [ ] Test USAJobs search functionality
  - [ ] Verify federal jobs appear

---

### **📧 Gmail OAuth (REQUIRED - Email Parsing)**
**Setup Time: 10 minutes | Cost: FREE**

- [ ] **Create Google Cloud Project**
  - [ ] Visit [Google Cloud Console](https://console.cloud.google.com/)
  - [ ] Create project: "GRC Resume Builder Dev"

- [ ] **Enable Gmail API**
  - [ ] Go to "APIs & Services" → "Library"
  - [ ] Search and enable "Gmail API"

- [ ] **Create OAuth2 Credentials**
  - [ ] Go to "APIs & Services" → "Credentials"
  - [ ] Create "OAuth 2.0 Client IDs"
  - [ ] Add redirect URI: `http://localhost:3000/api/gmail-callback`

- [ ] **Configure Environment**
  - [ ] Add `GOOGLE_CLIENT_ID=your_id` to `.env.local`
  - [ ] Add `GOOGLE_CLIENT_SECRET=your_secret` to `.env.local`
  - [ ] Add `GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail-callback` to `.env.local`

- [ ] **Get Refresh Token**
  - [ ] Start app: `npm run dev`
  - [ ] Visit `http://localhost:3000/api/gmail-auth`
  - [ ] Complete OAuth flow
  - [ ] Copy refresh token to `.env.local`

- [ ] **Test Integration**
  - [ ] Verify Gmail connection works
  - [ ] Test email parsing functionality

---

### **🔍 Job Board API (CHOOSE ONE - Required for Job Discovery)**

#### **Option A: JSearch API (RECOMMENDED)**
**Setup Time: 5 minutes | Cost: FREE (100 requests/month)**

- [ ] **Register RapidAPI Account**
  - [ ] Visit [RapidAPI](https://rapidapi.com/hub)
  - [ ] Create free account
  - [ ] Search for "JSearch API"

- [ ] **Subscribe to API**
  - [ ] Click "Subscribe to Test" (FREE tier)
  - [ ] Review limits (100 requests/month)

- [ ] **Configure Environment**
  - [ ] Add `JSEARCH_RAPIDAPI_KEY=your_key` to `.env.local`

- [ ] **Test Integration**
  - [ ] Test JSearch job search
  - [ ] Verify results appear

#### **Option B: Adzuna API**
**Setup Time: 3 minutes | Cost: FREE (1000 requests/month)**

- [ ] **Register Adzuna Account**
  - [ ] Visit [Adzuna Developer Portal](https://developer.adzuna.com/)
  - [ ] Create account and apply

- [ ] **Get Credentials**
  - [ ] Receive App ID and API Key
  - [ ] Note both values

- [ ] **Configure Environment**
  - [ ] Add `ADZUNA_APP_ID=your_id` to `.env.local`
  - [ ] Add `ADZUNA_API_KEY=your_key` to `.env.local`

- [ ] **Test Integration**
  - [ ] Test Adzuna job search
  - [ ] Verify results appear

#### **Option C: SerpApi**
**Setup Time: 3 minutes | Cost: FREE (100 searches/month)**

- [ ] **Register SerpApi Account**
  - [ ] Visit [SerpApi](https://serpapi.com/)
  - [ ] Create free account

- [ ] **Get API Key**
  - [ ] Copy API key from dashboard

- [ ] **Configure Environment**
  - [ ] Add `SERPAPI_KEY=your_key` to `.env.local`

- [ ] **Test Integration**
  - [ ] Test Google Jobs search
  - [ ] Verify results appear

---

### **📧 Email Alert Integrations (RECOMMENDED - All FREE)**

#### **LinkedIn Email Alerts**
**Setup Time: 5 minutes | Cost: FREE**

- [ ] **Create LinkedIn Job Alerts**
  - [ ] Visit [LinkedIn Jobs](https://www.linkedin.com/jobs/)
  - [ ] Search for "GRC Analyst" OR "Risk Manager"
  - [ ] Create job alert with email notifications
  - [ ] Set frequency to "Daily"

- [ ] **Test Integration**
  - [ ] Wait for LinkedIn email alert
  - [ ] Check "Email Jobs" section in app
  - [ ] Verify LinkedIn jobs are parsed

#### **Indeed Email Alerts**
**Setup Time: 5 minutes | Cost: FREE**

- [ ] **Create Indeed Job Alerts**
  - [ ] Visit [Indeed](https://www.indeed.com/)
  - [ ] Search for "GRC" positions
  - [ ] Click "Get new jobs emailed to me"
  - [ ] Set up alert with relevant keywords

- [ ] **Test Integration**
  - [ ] Wait for Indeed email alert
  - [ ] Check "Email Jobs" section in app
  - [ ] Verify Indeed jobs are parsed

#### **Lensa Email Alerts**
**Setup Time: 5 minutes | Cost: FREE**

- [ ] **Create Lensa Job Alerts**
  - [ ] Visit [Lensa](https://lensa.ai/)
  - [ ] Search for GRC positions
  - [ ] Set up email job alerts
  - [ ] Choose alert frequency

- [ ] **Test Integration**
  - [ ] Wait for Lensa email alert
  - [ ] Check "Email Jobs" section in app
  - [ ] Verify Lensa jobs are parsed

---

## 🧪 Final Testing Checklist

### **Basic Functionality (No APIs Required)**
- [ ] Resume upload works
- [ ] ATS scoring displays correctly
- [ ] Resume tailoring generates suggestions
- [ ] Application tracking saves data locally
- [ ] App starts without errors: `npm run dev`

### **API Functionality (APIs Required)**
- [ ] USAJobs returns federal GRC positions
- [ ] Job scanner shows results from configured job board API
- [ ] Gmail integration parses job alert emails
- [ ] Email jobs appear from LinkedIn/Indeed/Lensa
- [ ] All API endpoints return data without errors

### **Complete Feature Test**
- [ ] Upload resume and get ATS score
- [ ] Scan for jobs (federal + private sector)
- [ ] Parse email job alerts
- [ ] Track applications in Kanban board
- [ ] Tailor resume for specific jobs

---

## 🚀 Quick Setup Commands

```bash
# 1. Clone and install
git clone https://github.com/GRCJP/Resume-Builder-Public.git
cd Resume-Builder-Public
npm install

# 2. Configure environment
cp .env.example .env.local
# Add all API keys from checklist above

# 3. Start development
npm run dev

# 4. Test functionality
# Visit http://localhost:3000
# Complete checklist items above
```

---

## 🔧 Troubleshooting Quick Reference

### **Common Issues & Solutions**

**USAJobs Not Working**
- [ ] Check API key is correct
- [ ] Verify email matches USAJobs account
- [ ] Ensure `USAJOBS_USER_AGENT` is set

**Gmail OAuth Failing**
- [ ] Verify redirect URI matches exactly
- [ ] Check OAuth consent screen is configured
- [ ] Ensure refresh token is valid

**Job Board API Issues**
- [ ] Verify API key is active
- [ ] Check subscription status
- [ ] Ensure correct endpoint usage

**Email Parsing Issues**
- [ ] Check Gmail OAuth is working
- [ ] Verify email alerts are set up
- [ ] Check email source detection

---

## 🎉 Success Criteria

✅ **You're fully set up when:**
- All required APIs are configured
- Job scanner returns results from multiple sources
- Email job alerts are parsed automatically
- All features work without errors
- You can scan for jobs and see results

---

## 📞 Need Help?

**Resources:**
- **[Complete API Setup Guide](./API_SETUP.md)** - Detailed instructions
- **[API Integration Documentation](../api/api-integration-guide.md)** - Technical details
- **[Training Program](../training/training-program.md)** - Comprehensive learning
- **[Community Discussions](https://github.com/GRCJP/Resume-Builder-Public/discussions)** - Get help

---

**🚀 Once you complete this checklist, you'll have a fully functional GRC Resume Builder with ALL features working!**
