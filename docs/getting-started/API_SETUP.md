# 🛠️ Complete API Setup Guide

Comprehensive configuration for ALL API integrations including job boards, email parsing, and OAuth setup.

---

## 🎯 Overview

This guide helps you set up the complete GRC Resume Builder with ALL API integrations for full functionality testing and development.

---

## 🔌 Complete API Setup List

### **🇺🇸 USAJobs API (FREE - Federal Jobs)**
### **📧 Gmail OAuth (FREE - Email Parsing)**
### **🔍 JSearch API (FREE tier - Job Board)**
### **🔍 Adzuna API (FREE tier - Job Board)**
### **🔍 SerpApi (FREE tier - Google Jobs)**
### **📧 LinkedIn Email Alerts (FREE - Email Integration)**
### **📧 Indeed Email Alerts (FREE - Email Integration)**
### **📧 Lensa Email Alerts (FREE - Email Integration)**

---

## 🇺🇸 USAJobs API (FREE - Required for Federal Jobs)

**Setup Time: 5 minutes**

1. **Register for API Key**
   - Visit [USAJobs Developer Portal](https://developer.usajobs.gov/)
   - Click "Get Started" and create an account
   - Fill out the API application form (use "Educational/Non-commercial" for free access)

2. **Add to `.env.local`**
   ```env
   USAJOBS_API_KEY=your_api_key_here
   USAJOBS_USER_AGENT=your_email@example.com
   ```

---

## 📧 Gmail OAuth (FREE - Required for Email Parsing)

**Setup Time: 10 minutes**

1. **Create Google Cloud Project**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project: "GRC Resume Builder Dev"

2. **Enable Gmail API**
   - Go to "APIs & Services" → "Library"
   - Search and enable "Gmail API"

3. **Create OAuth2 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Select "Web application"
   - Add authorized redirect URI: `http://localhost:3000/api/gmail-callback`

4. **Add to `.env.local`**
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail-callback
   GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here
   ```

5. **Get Refresh Token**
   - Start the app: `npm run dev`
   - Visit `http://localhost:3000/api/gmail-auth`
   - Complete OAuth flow and copy the refresh token

---

## 🔍 JSearch API (FREE tier - Comprehensive Job Database)

**Setup Time: 5 minutes**

1. **Register at RapidAPI**
   - Visit [RapidAPI](https://rapidapi.com/hub)
   - Create free account
   - Search for "JSearch API"

2. **Subscribe to JSearch API**
   - Click "Subscribe to Test" (FREE tier)
   - Review pricing and limits (100 requests/month free)

3. **Get API Key**
   - Your RapidAPI key will work for all APIs
   - Copy your "X-RapidAPI-Key"

4. **Add to `.env.local`**
   ```env
   JSEARCH_RAPIDAPI_KEY=your_rapidapi_key_here
   ```

---

## 🔍 Adzuna API (FREE tier - Job Board)

**Setup Time: 3 minutes**

1. **Register for Adzuna API**
   - Visit [Adzuna Developer Portal](https://developer.adzuna.com/)
   - Click "Get Started" and create account
   - Fill out application form (individual/educational use)

2. **Get App ID and Key**
   - After approval, you'll receive:
     - **App ID** (short alphanumeric)
     - **API Key** (long alphanumeric string)

3. **Add to `.env.local`**
   ```env
   ADZUNA_APP_ID=your_adzuna_app_id_here
   ADZUNA_API_KEY=your_adzuna_api_key_here
   ```

---

## 🔍 SerpApi (FREE tier - Google Jobs)

**Setup Time: 3 minutes**

1. **Register for SerpApi**
   - Visit [SerpApi](https://serpapi.com/)
   - Create free account
   - Verify email address

2. **Get API Key**
   - Dashboard will show your API key
   - Copy the key (long alphanumeric string)

3. **Add to `.env.local`**
   ```env
   SERPAPI_KEY=your_serpapi_key_here
   ```

---

## 📧 LinkedIn Email Alerts Setup (FREE)

**Setup Time: 5 minutes**

1. **Create LinkedIn Job Alerts**
   - Visit [LinkedIn Jobs](https://www.linkedin.com/jobs/)
   - Search for GRC-related jobs (e.g., "GRC Analyst", "Risk Manager")
   - Create job alert with email notifications
   - Set frequency to "Daily" or "Weekly"

2. **Configure Gmail Integration**
   - Ensure Gmail OAuth is set up (see above)
   - LinkedIn emails will be automatically parsed
   - No additional API keys needed

3. **Test Integration**
   - Wait for LinkedIn email alert
   - Check if jobs appear in "Email Jobs" section
   - Verify job data is parsed correctly

---

## 📧 Indeed Email Alerts Setup (FREE)

**Setup Time: 5 minutes**

1. **Create Indeed Job Alerts**
   - Visit [Indeed](https://www.indeed.com/)
   - Search for GRC positions
   - Click "Get new jobs emailed to me"
   - Set up alert with relevant keywords

2. **Configure Gmail Integration**
   - Ensure Gmail OAuth is working
   - Indeed emails will be parsed automatically
   - Jobs will appear in "Email Jobs" section

3. **Verify Email Source**
   - Indeed emails come from `indeed@indeed.com`
   - System will automatically detect source
   - Jobs will be categorized as "Indeed Email"

---

## 📧 Lensa Email Alerts Setup (FREE)

**Setup Time: 5 minutes**

1. **Create Lensa Job Alerts**
   - Visit [Lensa](https://lensa.ai/)
   - Search for GRC positions
   - Set up email job alerts
   - Choose alert frequency

2. **Configure Gmail Integration**
   - Gmail OAuth will handle Lensa emails
   - Emails from `lensa@lensa.ai` will be parsed
   - Jobs appear in "Email Jobs" section

3. **Test Parsing**
   - Wait for Lensa email alert
   - Verify job extraction works
   - Check job data accuracy

---

## 🚀 Complete Environment Setup

### **1. Clone and Install**
```bash
git clone https://github.com/GRCJP/Resume-Builder-Public.git
cd Resume-Builder-Public
npm install
```

### **2. Environment Configuration**
```bash
# Copy the template
cp .env.example .env.local

# Edit with your API keys
nano .env.local
```

### **3. Complete `.env.local` Example**
```env
# USAJobs API (FREE - Required for federal jobs)
USAJOBS_API_KEY=your_usajobs_api_key
USAJOBS_USER_AGENT=your_email@example.com

# Gmail OAuth (FREE - Required for email parsing)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail-callback
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# Job Board APIs (Choose ONE or ALL)

# JSearch API (FREE tier - 100 requests/month)
JSEARCH_RAPIDAPI_KEY=your_jsearch_rapidapi_key

# Adzuna API (FREE tier - 1000 requests/month)
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_API_KEY=your_adzuna_api_key

# SerpApi (FREE tier - 100 searches/month)
SERPAPI_KEY=your_serpapi_key

# Optional: Additional APIs for expanded functionality
# (These are optional and not required for basic functionality)
```

### **4. Start Development**
```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🧪 Testing Your Setup

### **Basic Tests (No APIs Required)**
- [ ] Resume upload works
- [ ] ATS scoring displays
- [ ] UI loads correctly

### **API Tests (APIs Required)**
- [ ] USAJobs shows federal positions
- [ ] Job scanner returns results from configured APIs
- [ ] Gmail integration parses emails from LinkedIn/Indeed/Lensa
- [ ] All job board APIs return data

### **Email Integration Tests**
- [ ] LinkedIn email alerts are parsed
- [ ] Indeed email alerts are parsed
- [ ] Lensa email alerts are parsed
- [ ] Jobs appear in "Email Jobs" section

### **Quick Test Commands**
```bash
# Test the app
npm run dev

# Test build
npm run build

# Check for errors
npm run lint
```

---

## 🔧 Troubleshooting

### **Common Issues**

**USAJobs Not Working**
- Check API key is correct
- Verify email matches your USAJobs account
- Ensure `USAJOBS_USER_AGENT` is set

**Gmail OAuth Failing**
- Verify redirect URI matches exactly
- Check OAuth consent screen is configured
- Ensure refresh token is valid

**JSearch API Issues**
- Verify RapidAPI key is active
- Check subscription status
- Ensure correct endpoint usage

**Adzuna API Issues**
- Verify App ID and API Key
- Check application approval status
- Ensure correct region codes

**SerpApi Issues**
- Verify API key is active
- Check rate limits
- Ensure correct search parameters

**Email Parsing Issues**
- Check Gmail OAuth is working
- Verify email alerts are set up
- Check email source detection

---

## 🎉 Success!

You now have a fully functional GRC Resume Builder with ALL API integrations!

### **What You Get:**
- ✅ **Federal Jobs** - USAJobs integration
- ✅ **Private Sector Jobs** - JSearch, Adzuna, SerpApi
- ✅ **Email Job Alerts** - LinkedIn, Indeed, Lensa
- ✅ **Complete Functionality** - All features working

### **Next Steps**
- Read the [Quick Start Guide](../../QUICK_START.md)
- Review [Development Guide](../development/development-setup.md)
- Join our [Community Discussions](https://github.com/GRCJP/Resume-Builder-Public/discussions)

---

**🚀 Your GRC Resume Builder is now fully configured with all APIs!**
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail-callback
   GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here
   ```

---

### **🔍 Job Board APIs (Choose ONE)**

#### **Option A: Adzuna (FREE Tier - 1000 requests/month)**
```env
ADZUNA_APP_ID=your_adzuna_app_id_here
ADZUNA_API_KEY=your_adzuna_api_key_here
```

#### **Option B: SerpApi (FREE Tier - 100 searches/month)**
```env
SERPAPI_KEY=your_serpapi_key_here
```

#### **Option C: JSearch (FREE Tier Available)**
```env
JSEARCH_RAPIDAPI_KEY=your_jsearch_rapidapi_key_here
```

---

## 🚀 Complete Setup

### **1. Environment Configuration**
```bash
# Copy the template
cp .env.example .env.local

# Edit with your API keys
nano .env.local
```

### **2. Complete `.env.local` Example**
```env
# USAJobs API (FREE - Required for federal jobs)
USAJOBS_API_KEY=your_usajobs_api_key
USAJOBS_USER_AGENT=your_email@example.com

# Gmail OAuth (FREE - Required for email parsing)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail-callback
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# Job Board API (Choose ONE)
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_API_KEY=your_adzuna_api_key

# OR
SERPAPI_KEY=your_serpapi_key

# OR
JSEARCH_RAPIDAPI_KEY=your_jsearch_key
```

### **3. Start Development**
```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🧪 Testing Your Setup

### **Basic Tests (No APIs Required)**
- [ ] Resume upload works
- [ ] ATS scoring displays
- [ ] UI loads correctly

### **API Tests (APIs Required)**
- [ ] USAJobs shows federal positions
- [ ] Job scanner returns results
- [ ] Gmail integration parses emails

### **Quick Test Commands**
```bash
# Test the app
npm run dev

# Test build
npm run build

# Check for errors
npm run lint
```

---

## 🔧 Troubleshooting

### **Common Issues**

**USAJobs Not Working**
- Check API key is correct
- Verify email matches your USAJobs account
- Ensure `USAJOBS_USER_AGENT` is set

**Gmail OAuth Failing**
- Verify redirect URI matches exactly
- Check OAuth consent screen is configured
- Ensure refresh token is valid

**Job Board API Issues**
- Verify API key is active
- Check rate limits
- Ensure correct API endpoint

---

## 🎉 Success!

You now have a fully functional GRC Resume Builder development environment.

### **Next Steps**
- Read the [Quick Start Guide](../QUICK_START.md)
- Review [Development Guide](./development/development-setup.md)
- Join our [Community Discussions](https://github.com/GRCJP/Resume-Builder-Public/discussions)
