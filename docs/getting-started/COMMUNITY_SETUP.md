# 🛠️ Community Setup Guide

Complete setup instructions for all API integrations and development environment configuration.

---

## 🎯 Overview

This guide helps you set up the complete GRC Resume Builder with all API integrations for testing and development.

---

## 🔌 API Integration Setup

### 🇺🇸 USAJobs API (Recommended - FREE)

**Setup Time: 5 minutes**

1. **Register for API Key**
   - Visit [USAJobs Developer Portal](https://developer.usajobs.gov/)
   - Click "Get Started" and create an account
   - Fill out the API application form (use "Educational/Non-commercial" for free access)

2. **Get Your Credentials**
   ```bash
   USAJOBS_API_KEY=your_api_key_here
   USAJOBS_USER_AGENT=your_email@example.com
   ```

3. **Add to `.env.local`**
   ```env
   USAJOBS_API_KEY=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
   USAJOBS_USER_AGENT=your_email@example.com
   ```

---

### 📧 Gmail OAuth2 Setup (Recommended - FREE)

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

4. **Get Your Credentials**
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail-callback
   ```

5. **Get Refresh Token**
   - Start the app: `npm run dev`
   - Visit `http://localhost:3000/api/gmail-auth`
   - Complete OAuth flow and copy the refresh token

6. **Add to `.env.local`**
   ```env
   GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here
   ```

---

### 🔍 Job Board APIs (Choose ONE)

#### Option A: Adzuna (FREE Tier - 1000 requests/month)

**Setup Time: 3 minutes**

1. **Register**
   - Visit [Adzuna API](https://developer.adzuna.com/overview)
   - Sign up for free account

2. **Get App ID and Key**
   ```env
   ADZUNA_APP_ID=your_adzuna_app_id_here
   ADZUNA_API_KEY=your_adzuna_api_key_here
   ```

#### Option B: SerpApi (FREE Tier - 100 searches/month)

**Setup Time: 3 minutes**

1. **Register**
   - Visit [SerpApi](https://serpapi.com/)
   - Sign up for free account

2. **Get API Key**
   ```env
   SERPAPI_API_KEY=your_serpapi_key_here
   ```

#### Option C: JSearch (FREE Tier Available)

**Setup Time: 5 minutes**

1. **Register**
   - Visit [RapidAPI](https://rapidapi.com/hub)
   - Search for "JSearch" API
   - Subscribe to free tier

2. **Get API Key**
   ```env
   JSEARCH_RAPIDAPI_KEY=your_jsearch_rapidapi_key_here
   ```

---

## 🚀 Complete Environment Setup

### 1. Clone and Install
```bash
git clone https://github.com/GRCJP/Resume-Builder-Public.git
cd Resume-Builder-Public
npm install
```

### 2. Environment Configuration
```bash
# Copy the template
cp .env.example .env.local

# Edit with your API keys
nano .env.local
```

### 3. Complete `.env.local` Example
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

### 4. Start Development
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

### **Get Help**
- [Open an Issue](https://github.com/GRCJP/Resume-Builder-Public/issues)
- [Check Discussions](https://github.com/GRCJP/Resume-Builder-Public/discussions)
- [Review Contributing Guide](./CONTRIBUTING.md)

---

## 🎉 Success!

You now have a fully functional GRC Resume Builder development environment. Start contributing to help GRC professionals find better jobs!

### **Next Steps**
- Read the [Development Guide](./DEVELOPMENT.md)
- Review [Contributing Guidelines](./CONTRIBUTING.md)
- Join our [Community Discussions](https://github.com/GRCJP/Resume-Builder-Public/discussions)
