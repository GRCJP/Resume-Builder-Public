# 🚀 Community Setup Guide
## GRC Resume Builder - Personal Configuration

This guide helps you configure the resume builder with your own API keys and email integration for personalized job scanning and resume optimization.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [API Configuration](#api-configuration)
3. [Email Integration Setup](#email-integration-setup)
4. [Environment Variables](#environment-variables)
5. [Troubleshooting](#troubleshooting)
6. [Contributing](#contributing)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Basic Setup
```bash
# Clone the repository
git clone https://github.com/GRCJP/Resume-Builder-Public.git
cd Resume-Builder-Public

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

> **Note:** The resume builder works immediately for resume upload and analysis. Job scanning and email features require API setup below.

---

## 🔑 API Configuration

### Overview
The resume builder integrates with multiple job boards and APIs to provide comprehensive job scanning. You can configure any or all of these services:

| Service | Cost | Setup Difficulty | Job Quality |
|---------|------|------------------|-------------|
| **USAJobs** | Free | Easy | ⭐⭐⭐⭐⭐ (Federal) |
| **Adzuna** | Free tier | Easy | ⭐⭐⭐⭐ |
| **SerpApi** | Free tier | Easy | ⭐⭐⭐⭐ |
| **JSearch** | Free tier | Easy | ⭐⭐⭐⭐ |
| **LinkedIn** | Free | Hard | ⭐⭐⭐⭐⭐ |
| **Indeed** | Paid | Hard | ⭐⭐⭐⭐ |

### Recommended Setup for Beginners
Start with the **free APIs** (USAJobs, Adzuna, SerpApi, JSearch) for the best experience:

1. **USAJobs API** (Required for federal GRC jobs)
2. **Adzuna API** (Good job coverage)
3. **SerpApi** (Google job search results)

---

## 📧 Email Integration Setup

### Gmail Job Alert Parser
The resume builder can automatically parse job alerts from your Gmail inbox, extracting opportunities from:
- LinkedIn Job Alerts
- Indeed Job Alerts  
- Lensa Job Alerts
- Other job board notifications

### Gmail OAuth2 Setup

#### Step 1: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Gmail API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

#### Step 2: Create OAuth2 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select **Web application**
4. Add authorized redirect URI: `http://localhost:3000/api/gmail-callback`
5. Click "Create"

#### Step 3: Configure Environment
Add to your `.env.local`:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail-callback
```

#### Step 4: Generate Refresh Token
1. Visit: `http://localhost:3000/api/gmail-auth`
2. Click the authorization link
3. Grant permissions to your Gmail
4. Copy the `refresh_token` from the URL
5. Add to `.env.local`:
```env
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

---

## 🔧 Environment Variables

Create a `.env.local` file in the project root:

```env
# ===========================================
# CORE APPLICATION (No setup required)
# ===========================================
NEXT_PUBLIC_APP_NAME=GRC Resume Builder
NEXT_PUBLIC_APP_VERSION=1.0.0

# ===========================================
# JOB BOARD APIS (Configure any or all)
# ===========================================

# USAJobs API (FREE - Recommended for federal jobs)
USAJOBS_API_KEY=your_usajobs_api_key_here
# Get key from: https://developer.usajobs.gov/

# Adzuna API (FREE tier available)
ADZUNA_APP_ID=your_adzuna_app_id_here
ADZUNA_API_KEY=your_adzuna_api_key_here
# Get keys from: https://developer.adzuna.com/

# SerpApi (FREE tier available)
SERPAPI_API_KEY=your_serpapi_key_here
# Get key from: https://serpapi.com/

# JSearch API (FREE tier available)
JSEARCH_API_KEY=your_jsearch_api_key_here
# Get key from: https://rapidapi.com/jayeshvasand/api/jsearch

# ===========================================
# EMAIL INTEGRATION (Optional but powerful)
# ===========================================

# Gmail OAuth2 (For job alert parsing)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail-callback
GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here

# ===========================================
# ADVANCED FEATURES (Optional)
# ===========================================

# Email notifications (when jobs are found)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here

# Custom job board URLs (comma separated)
CUSTOM_JOB_SOURCES=https://example.com/jobs,https://another-site.com/careers
```

---

## 📖 API Key Setup Guides

### USAJobs API (FREE - Highly Recommended)
1. Visit [USAJobs Developer Portal](https://developer.usajobs.gov/)
2. Sign in with your USAJOBS account (or create one)
3. Go to "API Keys" → "Request an API Key"
4. Fill out the form:
   - Organization: Your name or "Personal"
   - Email: Your email
   - Description: "GRC Job Search Tool"
   - Website: `http://localhost:3000`
5. Copy your API key to `.env.local`

### Adzuna API (FREE tier - 1000 requests/month)
1. Visit [Adzuna Developer Portal](https://developer.adzuna.com/)
2. Sign up for free account
3. Go to "Account" → "Your API Keys"
4. Copy App ID and API Key to `.env.local`

### SerpApi (FREE tier - 100 searches/month)
1. Visit [SerpApi Dashboard](https://serpapi.com/)
2. Sign up for free account
3. Go to "Dashboard" → "API Key"
4. Copy API key to `.env.local`

### JSearch API (FREE tier available)
1. Visit [RapidAPI](https://rapidapi.com/)
2. Search for "JSearch" by jayeshvasand
3. Click "Subscribe to Test" (Basic plan is free)
4. Copy your RapidAPI key to `.env.local`

---

## 🧪 Testing Your Setup

### Test API Connections
Visit these URLs to test your API setup:

```bash
# Test USAJobs
http://localhost:3000/api/usajobs?keyword=cybersecurity&location=Remote

# Test Adzuna
http://localhost:3000/api/adzuna?keyword=compliance&location=Washington%20DC

# Test SerpApi
http://localhost:3000/api/serpapi?keyword=GRC%20Analyst

# Test Email Integration
http://localhost:3000/api/gmail-test
```

### Test Job Scanner
1. Upload a resume to the application
2. Go to "Job Discovery" tab
3. Click "Scan Now"
4. Check the browser console for detailed logs

### Test Email Parsing
1. Configure Gmail OAuth2 (see above)
2. Visit: `http://localhost:3000/api/email-debug`
3. Check for parsed job alerts

---

## 🔧 Troubleshooting

### Common Issues

#### "No jobs found" in scanner
**Solutions:**
1. Check API keys are correct in `.env.local`
2. Verify API keys aren't expired
3. Try different keywords (e.g., "cybersecurity", "compliance")
4. Check browser console for error messages

#### Gmail authentication failed
**Solutions:**
1. Ensure redirect URI matches exactly: `http://localhost:3000/api/gmail-callback`
2. Re-generate refresh token if expired
3. Check Google Cloud Console has Gmail API enabled

#### Build errors
**Solutions:**
1. Run `npm install` to update dependencies
2. Delete `node_modules` and `package-lock.json`, then reinstall
3. Check Node.js version (18+ required)

#### API rate limits
**Solutions:**
1. Most free APIs have monthly limits
2. Upgrade to paid plans for heavy usage
3. Use multiple API keys for different services

### Debug Mode
Enable detailed logging by adding to `.env.local`:
```env
DEBUG=true
NODE_ENV=development
```

### Getting Help
1. Check the [Issues Page](https://github.com/GRCJP/Resume-Builder-Public/issues)
2. Search existing issues before creating new ones
3. Provide detailed error messages and steps to reproduce

---

## 🤝 Contributing

We welcome community contributions! Here's how you can help:

### Reporting Issues
- Use the [GitHub Issues](https://github.com/GRCJP/Resume-Builder-Public/issues) page
- Include:
  - Detailed description of the problem
  - Steps to reproduce
  - Your environment (OS, Node version, browser)
  - Relevant error messages

### Submitting Improvements
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Submit a pull request with:
  - Clear description of changes
  - Testing performed
  - Any breaking changes

### Areas for Contribution
- **API Integrations:** Add new job board APIs
- **Resume Templates:** Create better DOCX formatting
- **UI/UX Improvements:** Better user interface
- **Documentation:** Improve guides and examples
- **Bug Fixes:** Help resolve reported issues
- **Testing:** Add automated tests

### Code Style
- Use TypeScript for new code
- Follow existing code patterns
- Add comments for complex logic
- Test with different resume formats

---

## 📚 Additional Resources

### GRC Career Resources
- [USAJobs Federal Careers](https://www.usajobs.gov/)
- [GRC Certifications Guide](https://www.isaca.org/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### API Documentation
- [USAJobs API Docs](https://developer.usajobs.gov/API-Reference)
- [Adzuna API Docs](https://developer.adzuna.com/docs)
- [SerpApi Documentation](https://serpapi.com/blog/google-jobs-api/)

### Community
- [Discord Server](https://discord.gg/) (Coming soon)
- [Reddit r/GRC](https://www.reddit.com/r/GRC/)
- [LinkedIn GRC Groups](https://www.linkedin.com/groups/)

---

## 🎯 Next Steps

1. **Start Simple:** Configure USAJobs API first (free and high-quality federal jobs)
2. **Add More APIs:** Gradually add Adzuna, SerpApi, etc.
3. **Set Up Email:** Configure Gmail for automatic job alert parsing
4. **Customize:** Adjust keywords and preferences for your field
5. **Contribute:** Help improve the tool for the community

---

**Happy job hunting! 🚀**

If you run into issues, remember this is a community project - we're all working together to make GRC job searching easier for everyone.
