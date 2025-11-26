# 🇺🇸 USAJobs API Documentation

Complete integration guide for the USAJobs federal job board API.

---

## 🎯 Overview

USAJobs is the official job board for the United States federal government, providing access to thousands of federal positions including many GRC-related roles.

---

## 📋 API Specifications

### **Base Information**
- **Base URL**: `https://data.usajobs.gov/api/search`
- **API Version**: v1
- **Authentication**: Bearer Token + User-Agent
- **Data Format**: JSON
- **HTTP Methods**: GET

### **Authentication**
```typescript
// Required headers
const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'User-Agent': USER_AGENT_EMAIL,
  'Host': 'data.usajobs.gov',
  'Content-Type': 'application/json'
};
```

### **Rate Limits**
- **Standard Plan**: 1,000 requests/hour
- **Premium Plan**: 10,000 requests/hour
- **Quota Reset**: Every hour
- **Burst Limit**: 10 requests/second

---

## 🔧 Setup Instructions

### **Step 1: Register for API Access**
1. Visit [USAJobs Developer Portal](https://developer.usajobs.gov/)
2. Click "Get Started"
3. Create account with email
4. Fill out application form:
   - **Organization**: Individual/Educational
   - **Purpose**: Educational/Non-commercial
   - **Expected Usage**: 100-1000 requests/month
   - **Description**: "GRC job search platform for educational purposes"

### **Step 2: Get API Credentials**
1. After approval, check your email
2. Note your **API Key** (long alphanumeric string)
3. Your registered email becomes your **User-Agent**

### **Step 3: Configure Environment**
```env
# .env.local
USAJOBS_API_KEY=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
USAJOBS_USER_AGENT=your.email@example.com
```

### **Step 4: Test Connection**
```bash
# Test API connection
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "User-Agent: your.email@example.com" \
     "https://data.usajobs.gov/api/search?Keyword=GRC"
```

---

## 📡 API Endpoints

### **Main Search Endpoint**
```typescript
GET https://data.usajobs.gov/api/search
```

### **Query Parameters**
```typescript
interface USAJobsSearchParams {
  // Search Parameters
  Keyword?: string;              // Job keywords (e.g., "GRC Analyst")
  Location?: string;             // Location (e.g., "Washington DC")
  PositionTitle?: string;        // Exact title match
  
  // Geographic Filters
  LocationName?: string;         // City/State name
  LatLon?: string;              // Latitude,Longitude (e.g., "38.9072,-77.0369")
  Radius?: number;              // Search radius in miles
  
  // Job Filters
  PaygradeLow?: string;          // Minimum paygrade (e.g., "GS-09")
  PaygradeHigh?: string;         // Maximum paygrade (e.g., "GS-14")
  Series?: string;              // Job series (e.g., "2210" for IT)
  SecurityClearance?: string;    // Clearance level
  
  // Employment Type
  RemunerationMinimum?: number;  // Minimum salary
  RemunerationMaximum?: number;  // Maximum salary
  FullTime?: boolean;           // Full-time only
  PartTime?: boolean;           // Part-time only
  Temporary?: boolean;          // Temporary only
  Permanent?: boolean;          // Permanent only
  
  // Pagination
  Page?: number;                // Page number (1-100)
  ResultsPerPage?: number;      // Results per page (1-100)
  SortBy?: string;              // Sort field ("Title", "Location", "Salary")
  Order?: string;               // Sort order ("Asc", "Desc")
  
  // Additional Filters
  Organization?: string;         // Specific agency
  Department?: string;          // Federal department
  TravelPercentage?: number;     // Travel requirement percentage
  RemoteIndicator?: string;      // Remote work ("All", "Some", "None")
}
```

### **Example Requests**
```typescript
// Basic GRC job search
const basicSearch = {
  Keyword: "GRC Analyst OR Risk Management OR Compliance",
  Location: "Washington DC",
  ResultsPerPage: 50
};

// Advanced federal GRC search
const advancedSearch = {
  Keyword: "Governance Risk Compliance",
  LocationName: "Washington, DC",
  Series: "2210,0340,0511",      // IT, Audit, Accounting
  PaygradeLow: "GS-09",
  PaygradeHigh: "GS-14",
  FullTime: true,
  Permanent: true,
  SecurityClearance: "Secret",
  ResultsPerPage: 100,
  Page: 1
};

// Remote federal jobs
const remoteSearch = {
  Keyword: "GRC",
  RemoteIndicator: "All",
  FullTime: true,
  ResultsPerPage: 50
};
```

---

## 📊 Response Structure

### **Main Response Format**
```typescript
interface USAJobsResponse {
  // Search metadata
  SearchParameters: USAJobsSearchParams;
  SearchResultCount: number;
  SearchResultAllCount: number;
  SearchResultSet: {
    SearchRequest: {
      SearchRequestID: string;
      SearchRequestDateTime: string;
    };
    SearchResults: {
      SearchResultCount: number;
      SearchResultStart: number;
      SearchResultEnd: number;
    };
  };
  
  // Job listings
  JobData: USAJob[];
  
  // Navigation
  NavigationLinks: {
    Next?: string;
    Previous?: string;
    First?: string;
    Last?: string;
  };
}
```

### **Job Object Structure**
```typescript
interface USAJob {
  // Basic Information
  ID: string;                    // Unique job identifier
  PositionTitle: string;        // Job title
  PositionURI: string;          // Job detail URL
  PositionLocation: {
    CountryCode: string;
    CountrySubDivisionCode: string;
    CityName: string;
    State: string;
    Longitude: number;
    Latitude: number;
  };
  
  // Organization
  OrganizationName: string;      // Agency name
  DepartmentName: string;        // Federal department
  JobCategory: string[];         // Job categories
  
  // Job Details
  PositionSchedule: {
    Code: string;                // FT (Full-time), PT (Part-time)
    Name: string;
  };
  PositionAppointmentType: {
    Code: string;                // PE (Permanent), TE (Temporary)
    Name: string;
  };
  PositionOfferingType: {
    Code: string;
    Name: string;
  };
  
  // Compensation
  PositionRemuneration: {
    MinimumRange: number;
    MaximumRange: number;
    RateIntervalCode: string;    // "Per Year", "Per Hour"
  };
  
  // Requirements
  QualificationSummary?: string; // Qualification requirements
  EvaluationMethod?: string;     // Evaluation criteria
  
  // Application
  ApplicationURI: string;         // Application URL
  ApplyOnlineURI?: string;       // Direct apply link
  
  // Dates
  PositionStartDate?: string;     // Start date
  PositionEndDate?: string;       // End date (if temporary)
  PublishDate: number;           // Publication timestamp
  StartDate: number;             // Application open date
  EndDate: number;               // Application close date
  
  // Additional Info
  UserArea: {
    Location: string;
    Description: string;
  };
  JobSummary: string;            // Job description
  PositionSeries: string;        // Job series code
  PositionGrade: string;         // Grade level (GS-09, etc.)
  PositionOccupationalSeries: string;
  
  // Security & Travel
  SecurityClearanceRequired?: string;
  TravelPercentage?: number;
  RemoteIndicator?: string;      // "All", "Some", "None"
  
  // Contact
  ContactInfo?: {
    Name: string;
    Email?: string;
    Phone?: string;
  };
}
```

---

## 🔧 Integration Code

### **API Client Implementation**
```typescript
// lib/usajobsAPI.ts
import { USAJob, USAJobsSearchParams, USAJobsResponse } from './types';

export class USAJobsAPI {
  private apiKey: string;
  private userAgent: string;
  private baseUrl = 'https://data.usajobs.gov/api/search';

  constructor() {
    this.apiKey = process.env.USAJOBS_API_KEY!;
    this.userAgent = process.env.USAJOBS_USER_AGENT!;
    
    if (!this.apiKey || !this.userAgent) {
      throw new Error('USAJobs API credentials not configured');
    }
  }

  async searchJobs(params: USAJobsSearchParams): Promise<USAJob[]> {
    const url = new URL(this.baseUrl);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    console.log(`🔍 USAJobs API Request: ${url.toString()}`);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': this.userAgent,
          'Host': 'data.usajobs.gov',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log(`📊 USAJobs Response: Status ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`USAJobs API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: USAJobsResponse = await response.json();
      
      console.log(`✅ USAJobs: Found ${data.JobData.length} jobs`);
      return data.JobData || [];

    } catch (error) {
      console.error('❌ USAJobs API error:', error);
      throw error;
    }
  }

  async getJobDetails(jobId: string): Promise<USAJob | null> {
    // USAJobs doesn't have a direct job detail endpoint
    // We need to search by ID
    const results = await this.searchJobs({ 
      PositionTitle: jobId,
      ResultsPerPage: 1 
    });
    
    return results.length > 0 ? results[0] : null;
  }

  // Helper methods for GRC-specific searches
  async searchGRCJobs(location?: string): Promise<USAJob[]> {
    const grcKeywords = [
      "GRC Analyst",
      "Risk Management",
      "Compliance Officer",
      "Governance Analyst",
      "Security Analyst",
      "Audit Manager",
      "IT Auditor",
      "Cybersecurity Analyst",
      "Information Security",
      "Privacy Officer"
    ];

    const params: USAJobsSearchParams = {
      Keyword: grcKeywords.join(" OR "),
      ResultsPerPage: 100,
      FullTime: true,
      Permanent: true
    };

    if (location) {
      params.Location = location;
    }

    return this.searchJobs(params);
  }

  async searchFederalITJobs(location?: string): Promise<USAJob[]> {
    const params: USAJobsSearchParams = {
      Series: "2210", // IT Series
      Keyword: "Security OR Cybersecurity OR Information Assurance",
      ResultsPerPage: 100,
      FullTime: true,
      Permanent: true
    };

    if (location) {
      params.Location = location;
    }

    return this.searchJobs(params);
  }

  async searchRemoteGRCJobs(): Promise<USAJob[]> {
    return this.searchJobs({
      Keyword: "GRC OR Risk OR Compliance OR Governance",
      RemoteIndicator: "All",
      FullTime: true,
      Permanent: true,
      ResultsPerPage: 100
    });
  }
}

// Export singleton instance
export const usajobsAPI = new USAJobsAPI();
```

### **Data Normalization**
```typescript
// lib/usajobsNormalizer.ts
import { USAJob } from './usajobsAPI';
import { JobPosting } from './types';

export function normalizeUSAJob(job: USAJob): JobPosting {
  return {
    id: job.ID,
    title: job.PositionTitle,
    company: job.OrganizationName,
    location: `${job.PositionLocation.CityName}, ${job.PositionLocation.State}`,
    description: job.JobSummary || job.QualificationSummary || '',
    url: job.PositionURI,
    source: 'usajobs',
    postedDate: new Date(job.PublishDate).toISOString(),
    closesDate: new Date(job.EndDate).toISOString(),
    
    // Compensation
    salary: {
      min: job.PositionRemuneration?.MinimumRange || 0,
      max: job.PositionRemuneration?.MaximumRange || 0,
      currency: 'USD',
      period: job.PositionRemuneration?.RateIntervalCode === 'Per Year' ? 'yearly' : 'hourly'
    },
    
    // Job details
    type: job.PositionSchedule?.Code === 'FT' ? 'full-time' : 'part-time',
    remote: job.RemoteIndicator === 'All' ? 'fully-remote' : 
            job.RemoteIndicator === 'Some' ? 'hybrid' : 'on-site',
    
    // Federal-specific
    federal: true,
    agency: job.OrganizationName,
    department: job.DepartmentName,
    grade: job.PositionGrade,
    series: job.PositionSeries,
    securityClearance: job.SecurityClearanceRequired,
    travelPercentage: job.TravelPercentage,
    
    // Application
    applyUrl: job.ApplicationURI,
    applicationDeadline: new Date(job.EndDate).toISOString(),
    
    // Metadata
    scrapedAt: new Date().toISOString(),
    matchScore: 0, // Will be calculated by resume matcher
    status: 'active'
  };
}
```

---

## 🧪 Testing Implementation

### **Unit Tests**
```typescript
// __tests__/usajobsAPI.test.ts
import { USAJobsAPI } from '../lib/usajobsAPI';

describe('USAJobsAPI', () => {
  let api: USAJobsAPI;

  beforeEach(() => {
    api = new USAJobsAPI();
  });

  test('searchJobs returns valid results', async () => {
    const results = await api.searchJobs({
      Keyword: 'GRC',
      ResultsPerPage: 10
    });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThanOrEqual(0);
    
    if (results.length > 0) {
      const job = results[0];
      expect(job).toHaveProperty('ID');
      expect(job).toHaveProperty('PositionTitle');
      expect(job).toHaveProperty('OrganizationName');
    }
  });

  test('searchGRCJobs filters correctly', async () => {
    const results = await api.searchGRCJobs('Washington DC');
    
    expect(Array.isArray(results)).toBe(true);
    
    // Verify results contain GRC-related keywords
    const grcKeywords = ['GRC', 'Risk', 'Compliance', 'Governance'];
    const hasGRCKeywords = results.some(job => 
      grcKeywords.some(keyword => 
        job.PositionTitle.includes(keyword) || 
        job.JobSummary?.includes(keyword)
      )
    );
    
    expect(hasGRCKeywords).toBe(true);
  });
});
```

### **Integration Tests**
```typescript
// __tests__/usajobs-integration.test.ts
import { usajobsAPI } from '../lib/usajobsAPI';

describe('USAJobs Integration', () => {
  test('API connection works', async () => {
    try {
      const results = await usajobsAPI.searchJobs({ 
        Keyword: 'Test',
        ResultsPerPage: 1 
      });
      expect(Array.isArray(results)).toBe(true);
    } catch (error) {
      fail(`API connection failed: ${error}`);
    }
  });

  test('rate limiting is respected', async () => {
    const promises = Array.from({ length: 5 }, () => 
      usajobsAPI.searchJobs({ Keyword: 'Test', ResultsPerPage: 1 })
    );

    const results = await Promise.allSettled(promises);
    const failures = results.filter(r => r.status === 'rejected');
    
    // Should handle multiple requests gracefully
    expect(failures.length).toBeLessThan(promises.length);
  });
});
```

---

## 🔧 Troubleshooting

### **Common Issues**

#### **401 Unauthorized**
```bash
# Check API key
echo $USAJOBS_API_KEY

# Test with curl
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "User-Agent: your.email@example.com" \
     "https://data.usajobs.gov/api/search?Keyword=test"
```

**Solutions**:
- Verify API key is correct
- Check User-Agent matches registered email
- Ensure API key is active

#### **429 Too Many Requests**
```typescript
// Implement rate limiting
class RateLimitedUSAJobsAPI extends USAJobsAPI {
  private lastRequest = 0;
  private minInterval = 1000; // 1 second between requests

  async searchJobs(params: USAJobsSearchParams) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequest = Date.now();
    return super.searchJobs(params);
  }
}
```

#### **Empty Results**
```typescript
// Debug search parameters
function debugSearchParams(params: USAJobsSearchParams) {
  console.log('Search Parameters:', {
    keyword: params.Keyword,
    location: params.Location,
    series: params.Series,
    grade: `${params.PaygradeLow}-${params.PaygradeHigh}`,
    fullTime: params.FullTime,
    permanent: params.Permanent
  });
}
```

### **Performance Optimization**

#### **Caching Implementation**
```typescript
// lib/usajobsCache.ts
const cache = new Map<string, { data: USAJob[]; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export async function cachedUSAJobsSearch(params: USAJobsSearchParams) {
  const cacheKey = JSON.stringify(params);
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await usajobsAPI.searchJobs(params);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}
```

#### **Batch Processing**
```typescript
// lib/usajobsBatch.ts
export async function searchMultipleLocations(
  baseParams: USAJobsSearchParams,
  locations: string[]
): Promise<USAJob[]> {
  const allJobs: USAJob[] = [];
  
  for (const location of locations) {
    try {
      const jobs = await usajobsAPI.searchJobs({
        ...baseParams,
        Location: location
      });
      
      allJobs.push(...jobs);
      
      // Respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error searching ${location}:`, error);
    }
  }
  
  return allJobs;
}
```

---

## 📈 Best Practices

### **Query Optimization**
- Use specific keywords for better results
- Limit geographic scope for faster responses
- Use appropriate pagination (max 100 results per page)
- Implement caching for frequent searches

### **Error Handling**
- Always wrap API calls in try-catch
- Implement retry logic for transient errors
- Provide meaningful error messages to users
- Log errors for debugging

### **Data Management**
- Normalize data consistently
- Store only relevant fields
- Implement data validation
- Handle missing or malformed data gracefully

### **Security**
- Never expose API keys in client code
- Use environment variables for credentials
- Implement request validation
- Monitor API usage for anomalies

---

This comprehensive USAJobs API documentation provides everything needed to successfully integrate federal job listings into the GRC Resume Builder platform.
