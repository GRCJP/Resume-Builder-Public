# 🚀 Development Guide

## 🎯 Overview

This guide helps you understand how to contribute to the GRC Resume Builder, from setting up your development environment to understanding our workflows and best practices.

## 🏗️ Project Architecture

### 📁 Directory Structure
```
grc-resume-builder/
├── 📁 app/                    # Next.js app router
│   ├── 📁 api/               # API routes
│   │   ├── 📄 usajobs.ts     # USAJobs integration
│   │   ├── 📄 adzuna.ts     # Adzuna integration
│   │   ├── 📄 serpapi.ts    # SerpApi integration
│   │   ├── 📄 jsearch.ts    # JSearch integration
│   │   └── 📄 gmail-*.ts    # Gmail integration
│   ├── 📁 globals.css       # Global styles
│   └── 📄 layout.tsx        # Root layout
├── 📁 components/            # React components
│   ├── 📄 ResumeManager.tsx # Resume upload/analysis
│   ├── 📄 JobScanner.tsx    # Job discovery
│   ├── 📄 ApplicationTracker.tsx # Application tracking
│   └── 📄 [other-components].tsx
├── 📁 lib/                   # Utility libraries
│   ├── 📄 jobScanner.ts      # Job board integrations
│   ├── 📄 smartMatcher.ts    # Resume matching logic
│   ├── 📄 emailJobParser.ts  # Email parsing
│   ├── 📄 gmailFetcher.ts    # Gmail integration
│   └── 📄 [other-libraries].ts
├── 📁 types/                 # TypeScript definitions
├── 📁 documentation/         # Project docs
├── 📁 .github/              # GitHub workflows
│   ├── 📁 workflows/         # CI/CD pipelines
│   ├── 📁 ISSUE_TEMPLATE/   # Issue templates
│   └── 📄 pull_request_template.md
├── 📄 package.json          # Dependencies and scripts
├── 📄 tsconfig.json         # TypeScript configuration
├── 📄 tailwind.config.js    # TailwindCSS configuration
├── 📄 next.config.js        # Next.js configuration
└── 📄 .env.example          # Environment template
```

### 🎯 Core Technologies

#### **Frontend Stack**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Lucide Icons** - Icon library
- **React Hook Form** - Form handling
- **Zustand** - State management

#### **Backend & APIs**
- **Next.js API Routes** - Server-side endpoints
- **Gmail OAuth2** - Email integration
- **Job Board APIs** - USAJobs, Adzuna, SerpApi, JSearch
- **DOCX.js** - Resume generation
- **Mammoth.js** - DOCX parsing

#### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Jest** - Testing framework
- **GitHub Actions** - CI/CD pipeline

---

## 🛠️ Development Setup

### 📋 Prerequisites
- **Node.js 18+** - Runtime environment
- **npm or yarn** - Package manager
- **Git** - Version control
- **VS Code** (recommended) - Code editor

### 🚀 Quick Setup

#### **1. Fork and Clone**
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/Resume-Builder-Public.git
cd Resume-Builder-Public

# Add upstream repository
git remote add upstream https://github.com/GRCJP/Resume-Builder-Public.git
```

#### **2. Install Dependencies**
```bash
# Install dependencies
npm install

# Verify installation
npm run --version  # Should show npm version
npm run dev        # Should start development server
```

#### **3. Environment Configuration**
```bash
# Copy environment template
cp .env.example .env.local

# Configure your API keys (see API Setup section)
# Edit .env.local with your credentials
```

#### **4. Start Development**
```bash
# Start development server
npm run dev

# Open http://localhost:3000
# You should see the GRC Resume Builder running
```

### 🔌 API Setup for Development

#### **🎯 Required APIs for Full Testing**
To test all features, configure these APIs:

**1. USAJobs API (FREE - 5 minutes)**
```bash
# Get key: https://developer.usajobs.gov/
# Required for federal GRC job testing
USAJOBS_API_KEY=your_usajobs_api_key_here
USAJOBS_USER_AGENT=your_email@example.com
```

**2. Gmail OAuth (FREE - 10 minutes)**
```bash
# Setup: See COMMUNITY_SETUP.md# Gmail OAuth2 Setup
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail-callback
GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here
```

**3. Job Board API (Pick ONE)**
```bash
# Option A: Adzuna (FREE tier - 1000 requests/month)
ADZUNA_APP_ID=your_adzuna_app_id_here
ADZUNA_APP_KEY=your_adzuna_app_key_here

# Option B: SerpApi (FREE tier - 100 searches/month)
SERPAPI_API_KEY=your_serpapi_key_here

# Option C: JSearch (FREE tier available)
JSEARCH_RAPIDAPI_KEY=your_jsearch_rapidapi_key_here
```

#### **🧪 Testing Without APIs**
You can test core features without APIs:
- ✅ Resume upload and parsing
- ✅ ATS scoring and optimization
- ✅ UI/UX improvements
- ✅ Application tracking
- ✅ Documentation changes

---

## 🌳 Branch Strategy

### **🏛️ Protected Branches**
```bash
main        # 🚀 Stable releases (protected)
develop     # 🔄 Integration branch (protected)
```

### **🚀 Development Branches**
```bash
feature/*   # 🆕 New features
bugfix/*    # 🐛 Bug fixes
hotfix/*    # 🔥 Emergency fixes
docs/*      # 📚 Documentation updates
```

### **🔄 Workflow Example**
```bash
# 1. Create feature branch from develop
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name

# 2. Make changes
# ...code changes...

# 3. Commit changes
git add .
git commit -m "feat: add your feature description"

# 4. Push to your fork
git push origin feature/your-feature-name

# 5. Create Pull Request to develop
# 6. Address feedback
# 7. Merge to develop
# 8. Release to main
```

### **🔒 Branch Protection Rules**
- **main branch**: Requires 2 maintainer reviews, all checks must pass
- **develop branch**: Requires 1 maintainer review, most checks must pass
- **feature branches**: No protection (open for contributors)

---

## 🧪 Testing Strategy

### **🎯 Testing Levels**

#### **🧪 Unit Tests**
```bash
# Run unit tests
npm run test:unit

# Run with coverage
npm run test:unit -- --coverage

# Watch mode
npm run test:unit -- --watch
```

#### **🔗 Integration Tests**
```bash
# Run integration tests
npm run test:integration

# Test specific integration
npm run test:integration -- --testNamePattern="API"
```

#### **🎭 End-to-End Tests**
```bash
# Run E2E tests
npm run test:e2e

# Test specific features
npm run test:e2e -- --spec="resume-upload"
```

#### **🏗️ Build Tests**
```bash
# Test production build
npm run build

# Test build output
npm run build:test
```

### **📊 Testing Coverage**
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### **🧪 Testing by Feature Type**

#### **📝 Documentation/UI Changes**
```bash
# Quick test - no APIs needed
npm run dev
# Test the UI changes
# Check for typos
# Verify links work
```

#### **🔧 Core Feature Changes**
```bash
# Full testing - APIs recommended
npm run dev
# Test with sample resume
# Verify ATS scoring
# Test application tracking
```

#### **🚀 API-Related Changes**
```bash
# Complete testing - APIs REQUIRED
npm run dev
# Set up APIs
# Test job scanner
# Test email parsing
# Verify all API endpoints
```

---

## 📝 Code Guidelines

### **🎨 TypeScript Standards**

#### **Interface Definitions**
```typescript
// Use interfaces for type definitions
interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  source: JobSource
  postedDate: string
  matchScore: number
  salary?: string
  remote?: boolean
  scannedAt: string
}

// Use union types for specific values
type JobSource = 
  | 'indeed' 
  | 'linkedin' 
  | 'dice' 
  | 'ziprecruiter' 
  | 'glassdoor'
  | 'usajobs'
  | 'emailAlerts'
```

#### **Function Signatures**
```typescript
// Use proper TypeScript for functions
async function searchJobs(
  keywords: string[], 
  location: string, 
  config: ScanConfig
): Promise<Partial<JobPosting>[]> {
  // Implementation
}

// Use generics for reusable functions
function createApiResponse<T>(
  data: T, 
  status: number = 200
): NextResponse<T> {
  return NextResponse.json(data, { status });
}
```

#### **Error Handling**
```typescript
// Use proper error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('API call failed:', error);
  throw new Error(`Failed to fetch jobs: ${error.message}`);
}

// Use Result pattern for operations
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function safeApiCall(): Promise<Result<JobPosting[]>> {
  try {
    const data = await apiCall();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

### **🎯 React Component Patterns**

#### **Component Structure**
```tsx
// Use proper TypeScript props
interface ResumeManagerProps {
  resumes: Resume[];
  setResumes: (resumes: Resume[]) => void;
  selectedResumeId: string | null;
  setSelectedResumeId: (id: string | null) => void;
  jobDescription?: string;
}

export default function ResumeManager({ 
  resumes, 
  setResumes, 
  selectedResumeId, 
  setSelectedResumeId,
  jobDescription
}: ResumeManagerProps) {
  // Component logic
}
```

#### **State Management**
```tsx
// Use React hooks for local state
const [uploading, setUploading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Use useCallback for performance
const handleFileUpload = useCallback(async (file: File) => {
  setUploading(true);
  setError(null);
  
  try {
    const result = await processFile(file);
    // Handle result
  } catch (err) {
    setError(err.message);
  } finally {
    setUploading(false);
  }
}, []);
```

#### **Error Boundaries**
```tsx
// Use error boundaries for component trees
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<
  PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-800 font-semibold">Something went wrong</h2>
          <p className="text-red-600">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### **🔧 API Route Patterns**

#### **Route Structure**
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const location = searchParams.get('location');

    // Validate inputs
    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword parameter is required' },
        { status: 400 }
      );
    }

    // Process request
    const results = await searchJobs({ keyword, location });

    // Return response
    return NextResponse.json({ 
      success: true, 
      data: results,
      count: results.length 
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### **Error Handling**
```typescript
// Use consistent error responses
interface ApiError {
  error: string;
  details?: string;
  code?: string;
}

function createErrorResponse(
  message: string, 
  status: number = 500,
  details?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    { 
      error: message,
      details,
      code: status.toString()
    }, 
    { status }
  );
}
```

---

## 🔄 Development Workflow

### **📋 Daily Development**

#### **1. Start Work**
```bash
# Sync with upstream
git checkout develop
git pull upstream develop

# Create feature branch
git checkout -b feature/your-feature-name

# Start development server
npm run dev
```

#### **2. Make Changes**
```bash
# Make code changes
# Test frequently
npm run test:unit
npm run lint
npm run type-check
```

#### **3. Commit Changes**
```bash
# Stage changes
git add .

# Commit with conventional commits
git commit -m "feat: add resume download formatting

- Add professional DOCX templates
- Improve header and section formatting
- Fix margin and spacing issues

Closes #123"
```

#### **4. Submit for Review**
```bash
# Push to fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# Fill out PR template
# Wait for review
```

### **🔄 Code Review Process**

#### **👀 Review Checklist**
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Breaking changes are documented
- [ ] Security considerations are addressed
- [ ] Performance impact is considered

#### **💬 Review Guidelines**
- Be constructive and specific
- Explain the "why" behind suggestions
- Offer solutions, not just problems
- Respect the contributor's effort
- Help maintain code quality

### **🚀 Release Process**

#### **📋 Pre-Release Checklist**
```bash
# Ensure all tests pass
npm run test

# Ensure build succeeds
npm run build

# Update version
npm version patch  # or minor/major

# Update changelog
npm run changelog:update

# Create release
git push origin main --tags
```

#### **🏷️ Release Types**
- **Patch** (1.0.1): Bug fixes, documentation updates
- **Minor** (1.1.0): New features, improvements
- **Major** (2.0.0): Breaking changes, major redesigns

---

## 🎯 Learning Resources

### **📚 Internal Documentation**
- [COMMUNITY_SETUP.md](./COMMUNITY_SETUP.md) - API configuration guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [README_COMMUNITY.md](./README_COMMUNITY.md) - Project overview

### **🔗 External Resources**
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### **🎯 Best Practices**
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows)
- [Code Review Guidelines](https://google.github.io/eng-practices/review/)

---

## 🤝 Getting Help

### **💬 Community Support**
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Pull Requests** - Code contributions and reviews

### **📞 Direct Help**
- **Maintainers** - For complex issues and guidance
- **Community** - For general questions and support
- **Documentation** - For self-service help

### **🎯 Contributing Back**
- **Fix bugs** you encounter
- **Improve documentation** you use
- **Help others** in discussions
- **Share knowledge** you gain

---

## 🎉 Conclusion

This guide should help you get started with contributing to the GRC Resume Builder. Remember:

- **Start small** - Fix a typo or improve documentation
- **Test thoroughly** - Ensure your changes work
- **Ask for help** - The community is here to support you
- **Learn continuously** - Every contribution teaches you something new

**Happy coding!** 🚀

---

*This guide is a living document. Please suggest improvements by creating an issue or pull request.* 🎯
