# 🔌 API Integration Guide

Complete documentation for all API integrations in the GRC Resume Builder.

---

## 🎯 Overview

The GRC Resume Builder integrates with multiple job board APIs and email services to provide comprehensive job discovery and resume optimization capabilities.

---

## 🇺🇸 USAJobs API

### **Purpose**
Federal government job board integration for GRC professionals seeking federal positions.

### **API Details**
- **Base URL**: `https://data.usajobs.gov/api/search`
- **Authentication**: API Key + Email (User-Agent)
- **Rate Limit**: 1,000 requests/hour
- **Cost**: FREE

### **Setup Instructions**
1. **Register at [USAJobs Developer Portal](https://developer.usajobs.gov/)**
2. **Create API Key** (5-minute process)
3. **Configure Environment Variables**:
   ```env
   USAJOBS_API_KEY=your_api_key_here
   USAJOBS_USER_AGENT=your_email@example.com
   ```

### **API Endpoints**
```typescript
// Main search endpoint
GET https://data.usajobs.gov/api/search
```

### **Query Parameters**
```typescript
interface USAJobsSearchParams {
  Keyword?: string;           // Job keywords (e.g., "GRC Analyst")
  Location?: string;          // Location (e.g., "Washington DC")
  Remote?: boolean;           // Remote positions only
  Page?: number;              // Page number (1-100)
  ResultsPerPage?: number;    // Results per page (1-100)
}
```

### **Response Structure**
```typescript
interface USAJob {
  id: string;
  title: string;
  organization: string;
  location: string;
  description: string;
  url: string;
  salary: {
    min: number;
    max: number;
  };
  posted: string;
  closes: string;
  clearance?: string;
  remote: boolean;
}
```

### **Integration Code**
```typescript
// lib/usajobsAPI.ts
export async function searchUSAJobs(params: USAJobsSearchParams): Promise<USAJob[]> {
  const apiKey = process.env.USAJOBS_API_KEY;
  const userAgent = process.env.USAJOBS_USER_AGENT;
  
  const response = await fetch('https://data.usajobs.gov/api/search', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'User-Agent': userAgent,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.JobData || [];
}
```

### **Usage Examples**
```typescript
// Search for GRC federal jobs
const jobs = await searchUSAJobs({
  Keyword: "GRC Analyst OR Risk Management OR Compliance",
  Location: "Washington DC",
  Remote: false,
  ResultsPerPage: 50
});
```

---

## 📧 Gmail API Integration

### **Purpose**
Parse job alert emails from various job boards to extract job postings automatically.

### **API Details**
- **Base URL**: `https://gmail.googleapis.com/gmail/v1`
- **Authentication**: OAuth 2.0
- **Rate Limit**: 250 requests/day (quota-based)
- **Cost**: FREE (with Google Cloud account)

### **Setup Instructions**
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

4. **Configure Environment Variables**:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail-callback
   GOOGLE_REFRESH_TOKEN=your_google_refresh_token
   ```

### **OAuth Flow**
```typescript
// app/api/gmail-auth/route.ts
export async function GET() {
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', process.env.GOOGLE_REDIRECT_URI!);
  authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/gmail.readonly');
  authUrl.searchParams.set('response_type', 'code');
  
  return Response.redirect(authUrl);
}
```

### **Email Parsing**
```typescript
// lib/emailJobParser.ts
export async function parseJobEmails(emails: GmailMessage[]): Promise<JobPosting[]> {
  const jobs: JobPosting[] = [];
  
  for (const email of emails) {
    const content = await getEmailContent(email.id);
    const job = extractJobFromEmail(content);
    
    if (job) {
      jobs.push({
        ...job,
        source: detectJobBoard(email),
        postedDate: email.internalDate,
        scannedAt: new Date().toISOString()
      });
    }
  }
  
  return jobs;
}
```

### **Supported Email Sources**
- **LinkedIn Job Alerts** - `jobs-listings@linkedin.com`
- **Indeed Job Alerts** - `indeed@indeed.com`
- **Lensa Job Alerts** - `lensa@lensa.ai`
- **Dice Job Alerts** - `dice@dice.com`

---

## 🔍 Adzuna API

### **Purpose**
Comprehensive job board API with extensive job listings across multiple industries.

### **API Details**
- **Base URL**: `https://api.adzuna.com/v1/api/jobs`
- **Authentication**: App ID + API Key
- **Rate Limit**: 1,000 requests/month (free tier)
- **Cost**: FREE tier available, paid tiers for higher limits

### **Setup Instructions**
1. **Register at [Adzuna Developer Portal](https://developer.adzuna.com/)**
2. **Create Application** (3-minute process)
3. **Configure Environment Variables**:
   ```env
   ADZUNA_APP_ID=your_adzuna_app_id
   ADZUNA_API_KEY=your_adzuna_api_key
   ```

### **API Endpoints**
```typescript
// Search jobs
GET https://api.adzuna.com/v1/api/jobs/{country}/search/{page}

// Get job details
GET https://api.adzuna.com/v1/api/jobs/{country}/jobs/{job_id}
```

### **Query Parameters**
```typescript
interface AdzunaSearchParams {
  what?: string;           // Job keywords
  where?: string;          // Location
  salary_min?: number;     // Minimum salary
  salary_max?: number;     // Maximum salary
  full_time?: boolean;     // Full-time only
  part_time?: boolean;     // Part-time only
  permanent?: boolean;     // Permanent only
  contract?: boolean;      // Contract only
  distance?: number;       // Search radius (miles)
}
```

### **Integration Code**
```typescript
// lib/adzunaAPI.ts
export async function searchAdzunaJobs(params: AdzunaSearchParams): Promise<Partial<JobPosting>[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_API_KEY;
  
  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${appKey}&${new URLSearchParams(params)}`
  );
  
  const data = await response.json();
  return data.results || [];
}
```

---

## 🔍 SerpApi (Google Jobs)

### **Purpose**
Access Google Jobs search results for comprehensive job listings.

### **API Details**
- **Base URL**: `https://serpapi.com/search`
- **Authentication**: API Key
- **Rate Limit**: 100 searches/month (free tier)
- **Cost**: FREE tier available, paid tiers for higher limits

### **Setup Instructions**
1. **Register at [SerpApi](https://serpapi.com/)**
2. **Get API Key** (2-minute process)
3. **Configure Environment Variables**:
   ```env
   SERPAPI_KEY=your_serpapi_key
   ```

### **API Endpoints**
```typescript
// Search Google Jobs
GET https://serpapi.com/search?engine=google_jobs
```

### **Query Parameters**
```typescript
interface SerpApiParams {
  q?: string;              // Search query
  location?: string;       // Location
  lrad?: number;           // Location radius (miles)
  chdl?: string;          // Company filter
  hl?: string;            // Language (en)
  gl?: string;            // Country (us)
}
```

### **Integration Code**
```typescript
// lib/serpapiAPI.ts
export async function searchSerpApiJobs(params: SerpApiParams): Promise<Partial<JobPosting>[]> {
  const apiKey = process.env.SERPAPI_KEY;
  
  const response = await fetch(
    `https://serpapi.com/search?engine=google_jobs&api_key=${apiKey}&${new URLSearchParams(params)}`
  );
  
  const data = await response.json();
  return data.jobs_results || [];
}
```

---

## 🔍 JSearch API

### **Purpose**
Comprehensive job database with extensive filtering options.

### **API Details**
- **Base URL**: `https://jsearch.p.rapidapi.com`
- **Authentication**: RapidAPI Key
- **Rate Limit**: Varies by plan
- **Cost**: FREE tier available

### **Setup Instructions**
1. **Register at [RapidAPI](https://rapidapi.com/hub)**
2. **Subscribe to JSearch API**
3. **Configure Environment Variables**:
   ```env
   JSEARCH_RAPIDAPI_KEY=your_jsearch_rapidapi_key
   ```

### **API Endpoints**
```typescript
// Search jobs
GET https://jsearch.p.rapidapi.com/search

// Get job details
GET https://jsearch.p.rapidapi.com/job-details
```

### **Query Parameters**
```typescript
interface JSearchParams {
  query?: string;          // Job keywords
  location?: string;      // Location
  page?: number;          // Page number
  num_pages?: number;     // Number of pages
  employment_types?: string; // FULLTIME, PARTTIME, CONTRACT
  job_requirements?: string; // ON_SITE, REMOTE, HYBRID
}
```

### **Integration Code**
```typescript
// lib/jsearchAPI.ts
export async function searchJSearchJobs(params: JSearchParams): Promise<Partial<JobPosting>[]> {
  const apiKey = process.env.JSEARCH_RAPIDAPI_KEY;
  
  const response = await fetch('https://jsearch.p.rapidapi.com/search', {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  });
  
  const data = await response.json();
  return data.data || [];
}
```

---

## 🛠️ API Integration Architecture

### **Data Flow**
```
📱 User Interface
    ↓
🔧 Job Scanner (lib/jobScanner.ts)
    ↓
📡 API Routes (app/api/*.ts)
    ↓
🌐 External APIs (USAJobs, Gmail, Adzuna, etc.)
    ↓
📊 Processed Job Data
    ↓
📱 User Interface (Results)
```

### **Error Handling**
```typescript
// lib/jobScanner.ts
async function scanAPI(apiName: string, params: any): Promise<JobPosting[]> {
  try {
    const jobs = await callAPI(apiName, params);
    return jobs.map(job => normalizeJobData(job, apiName));
  } catch (error) {
    console.error(`❌ ${apiName} API error:`, error);
    return []; // Graceful fallback
  }
}
```

### **Rate Limiting**
```typescript
// lib/rateLimiter.ts
const apiLimits = {
  usajobs: { requests: 1000, window: 3600000 }, // 1 hour
  gmail: { requests: 250, window: 86400000 },    // 1 day
  adzuna: { requests: 1000, window: 2592000000 }, // 30 days
  serpapi: { requests: 100, window: 2592000000 }, // 30 days
};
```

---

## 🧪 API Testing

### **Test Environment Setup**
```bash
# Set up test environment variables
cp .env.example .env.test
# Add test API keys (use free tiers for testing)
```

### **Test Scripts**
```typescript
// tests/api.test.ts
describe('API Integrations', () => {
  test('USAJobs API returns federal jobs', async () => {
    const jobs = await searchUSAJobs({ Keyword: 'GRC' });
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0]).toHaveProperty('title');
    expect(jobs[0]).toHaveProperty('organization');
  });
  
  test('Gmail API parses job emails', async () => {
    const emails = await getJobEmails();
    const jobs = await parseJobEmails(emails);
    expect(jobs.length).toBeGreaterThan(0);
  });
});
```

### **Manual Testing**
```bash
# Test individual APIs
npm run test:usajobs
npm run test:gmail
npm run test:adzuna
npm run test:serpapi
npm run test:jsearch
```

---

## 🔧 Troubleshooting

### **Common Issues**

**USAJobs API**
- **401 Unauthorized**: Check API key and email
- **429 Too Many Requests**: Respect rate limits
- **No Results**: Check keyword formatting

**Gmail API**
- **401 Unauthorized**: Check OAuth credentials
- **403 Forbidden**: Verify OAuth consent screen
- **No Emails**: Check Gmail filters and labels

**Job Board APIs**
- **401 Unauthorized**: Verify API keys
- **429 Too Many Requests**: Check rate limits
- **Invalid Response**: Check API endpoints

### **Debug Tools**
```typescript
// lib/apiDebugger.ts
export function logAPICall(apiName: string, params: any, response: any) {
  console.log(`🔍 ${apiName} API Call:`, {
    params,
    responseLength: response.length,
    timestamp: new Date().toISOString()
  });
}
```

---

## 📈 Performance Optimization

### **Caching Strategy**
```typescript
// lib/apiCache.ts
const cache = new Map<string, { data: any; timestamp: number }>();

export async function cachedAPICall(key: string, apiCall: () => Promise<any>, ttl: number = 300000) {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = await apiCall();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### **Batch Processing**
```typescript
// lib/batchProcessor.ts
export async function batchAPICalls(calls: Array<() => Promise<any>>, batchSize: number = 5) {
  const results = [];
  
  for (let i = 0; i < calls.length; i += batchSize) {
    const batch = calls.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(call => call()));
    results.push(...batchResults);
    
    // Delay between batches to respect rate limits
    if (i + batchSize < calls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}
```

---

## 🎯 Best Practices

### **API Key Security**
- Never commit API keys to repository
- Use environment variables for all keys
- Rotate keys regularly
- Monitor API usage

### **Error Handling**
- Always wrap API calls in try-catch
- Provide meaningful error messages
- Implement graceful fallbacks
- Log errors for debugging

### **Performance**
- Implement caching for expensive calls
- Respect rate limits
- Use pagination for large datasets
- Optimize query parameters

### **Data Quality**
- Normalize data from different APIs
- Validate API responses
- Handle missing or malformed data
- Maintain data consistency

---

## 🚀 Advanced Features

### **Webhook Integration**
```typescript
// app/api/webhooks/job-alerts/route.ts
export async function POST(request: NextRequest) {
  const jobData = await request.json();
  
  // Process webhook data
  await processNewJobAlert(jobData);
  
  return Response.json({ success: true });
}
```

### **Real-time Updates**
```typescript
// lib/realTimeUpdates.ts
export function subscribeToJobUpdates(callback: (jobs: JobPosting[]) => void) {
  // Set up Server-Sent Events or WebSocket
  // Push new jobs to clients in real-time
}
```

### **Analytics Integration**
```typescript
// lib/apiAnalytics.ts
export function trackAPIUsage(apiName: string, success: boolean, responseTime: number) {
  // Track API performance and usage
  // Monitor success rates and response times
}
```

---

This comprehensive API documentation provides everything needed to understand, set up, and maintain all API integrations in the GRC Resume Builder.
