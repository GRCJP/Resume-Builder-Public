# 📁 Project Structure

Complete overview of the GRC Resume Builder codebase organization.

---

## 🏗️ Directory Structure

```
grc-resume-builder/
├── 📁 app/                           # Next.js App Router
│   ├── 📁 api/                      # API endpoints
│   │   ├── 📄 usajobs.ts           # USAJobs integration
│   │   ├── 📄 adzuna.ts           # Adzuna integration
│   │   ├── 📄 serpapi.ts          # SerpApi integration
│   │   ├── 📄 jsearch.ts           # JSearch integration
│   │   ├── 📄 gmail-*.ts          # Gmail OAuth & parsing
│   │   └── 📄 [other-apis].ts     # Additional integrations
│   ├── 📄 globals.css              # Global TailwindCSS styles
│   ├── 📄 layout.tsx               # Root layout component
│   └── 📄 page.tsx                 # Main application page
├── 📁 components/                    # React Components
│   ├── 🎨 Resume Components:
│   │   ├── 📄 ResumeUploader.tsx   # Resume file upload
│   │   ├── 📄 ResumeManager.tsx   # Resume management
│   │   ├── 📄 ResumeEditor.tsx     # Resume editing
│   │   ├── 📄 ResumePreview.tsx    # Resume preview
│   │   ├── 📄 ResumeTailor.tsx     # Resume customization
│   │   └── 📄 ResumeForm.tsx       # Resume form inputs
│   ├── 📊 Job Discovery:
│   │   ├── 📄 JobDiscoveryDashboard.tsx # Main job interface
│   │   ├── 📄 JobScanner.tsx      # Job scanning logic
│   │   ├── 📄 JobDescriptionAnalyzer.tsx # Job analysis
│   │   ├── 📄 USAJobsDashboard.tsx # Federal jobs
│   │   └── 📄 EmailJobsDashboard.tsx # Email job parsing
│   ├── 📈 Application Tracking:
│   │   ├── 📄 ApplicationTracker.tsx # Application management
│   │   └── 📄 ATSChecker.tsx      # ATS scoring
│   ├── 🎨 UI Components:
│   │   ├── 📄 Logo.tsx             # Application logo
│   │   └── 📄 ErrorBoundary.tsx    # Error handling
│   └── 📄 [other-components].tsx   # Additional components
├── 📁 lib/                          # Core Business Logic
│   ├── 🔍 Job Board Integrations:
│   │   ├── 📄 jobScanner.ts        # Main job scanning logic
│   │   ├── 📄 jobBoardIntegrations.ts # Board-specific logic
│   │   ├── 📄 usajobsAPI.ts        # USAJobs API client
│   │   ├── 📄 adzunaAPI.ts         # Adzuna API client
│   │   ├── 📄 serpapiAPI.ts        # SerpApi API client
│   │   ├── 📄 jsearchAPI.ts         # JSearch API client
│   │   └── 📄 [other-apis].ts      # Additional API clients
│   ├── 📧 Email Processing:
│   │   ├── 📄 gmailFetcher.ts      # Gmail API integration
│   │   ├── 📄 emailJobParser.ts    # Email parsing logic
│   │   └── 📄 [email-utils].ts     # Email utilities
│   ├── 📄 Resume Processing:
│   │   ├── 📄 resumeParser.ts      # Resume file parsing
│   │   ├── 📄 resumeScorer.ts      # ATS scoring logic
│   │   ├── 📄 resumeTailor.ts      # Resume customization
│   │   └── 📄 [resume-utils].ts    # Resume utilities
│   ├── 🔧 Utilities:
│   │   ├── 📄 linkVerifier.ts      # URL verification
│   │   ├── 📄 cleanPipeline.ts     # Data processing
│   │   └── 📄 [utilities].ts       # General utilities
│   └── 📄 [other-libraries].ts     # Additional libraries
├── 📁 types/                         # TypeScript Definitions
│   ├── 📄 resume.ts                # Resume-related types
│   ├── 📄 job.ts                   # Job-related types
│   ├── 📄 api.ts                   # API response types
│   ├── 📄 user.ts                  # User-related types
│   └── 📄 [other-types].ts         # Additional type definitions
├── 📁 docs/                          # Documentation
│   ├── 📄 README.md                # Documentation hub
│   ├── 📁 getting-started/         # New user guides
│   │   ├── 📄 API_SETUP.md         # API configuration
│   │   └── 📄 [getting-started].md # Additional guides
│   ├── 📁 development/             # Developer resources
│   │   ├── 📄 development-setup.md # Environment setup
│   │   ├── 📄 contributing-guide.md # Contribution guidelines
│   │   ├── 📄 project-structure.md # This file
│   │   └── 📄 [development].md    # Additional dev docs
│   ├── 📁 api/                     # API documentation
│   │   ├── 📄 usajobs.md           # USAJobs API docs
│   │   ├── 📄 gmail.md             # Gmail API docs
│   │   └── 📄 [api-docs].md        # Additional API docs
│   └── 📁 community/               # Community resources
│       ├── 📄 guidelines.md        # Community guidelines
│       ├── 📄 showcase.md          # Success stories
│       └── 📄 [community].md       # Additional community docs
├── 📁 documentation/                  # Legacy Documentation
│   ├── 📄 resume-guidance.md       # Resume best practices
│   ├── 📄 action-plan.md          # Project action plans
│   ├── 📄 showcase-strategy.md     # Project promotion
│   └── 📄 [legacy-docs].md        # Additional legacy docs
├── 📁 public/                        # Static Assets
│   ├── 📄 favicon.ico              # Site favicon
│   ├── 📄 logo.png                 # Application logo
│   └── 📄 [static-assets]/         # Additional static files
├── 📄 .env.example                  # Environment variables template
├── 📄 .gitignore                    # Git ignore rules
├── 📄 package.json                  # Dependencies and scripts
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 tailwind.config.js            # TailwindCSS configuration
├── 📄 next.config.js                # Next.js configuration
├── 📄 next-env.d.ts                 # Next.js TypeScript types
├── 📄 postcss.config.js             # PostCSS configuration
└── 📄 README.md                     # Main project README
```

---

## 🎯 Component Categories

### **📝 Resume Components**
Handle all resume-related functionality:
- **Upload & Parsing** - File upload and content extraction
- **Editing & Management** - Resume modification and organization
- **Scoring & Optimization** - ATS analysis and improvement suggestions
- **Tailoring & Customization** - Job-specific resume adjustments

### **🔍 Job Discovery Components**
Manage job search and discovery:
- **Multi-Board Search** - Integration with multiple job boards
- **Job Analysis** - Job description parsing and matching
- **Email Integration** - Job alert email parsing
- **Federal Jobs** - USAJobs specific functionality

### **📊 Application Tracking**
Track and manage job applications:
- **Application Management** - Kanban-style workflow
- **Status Tracking** - Application progress monitoring
- **Analytics** - Success metrics and insights

### **🎨 UI Components**
Shared user interface elements:
- **Common Elements** - Logo, error boundaries, etc.
- **Layout Components** - Page structure and navigation
- **Interactive Elements** - Buttons, forms, modals

---

## 🔌 API Integration Architecture

### **📡 API Routes (`app/api/`)**
Server-side API endpoints for:
- **Job Board APIs** - External job board integrations
- **Email Processing** - Gmail OAuth and parsing
- **Resume Processing** - File upload and analysis
- **Data Management** - CRUD operations

### **🔧 Client Libraries (`lib/`)**
Client-side utilities for:
- **API Communication** - HTTP clients and error handling
- **Data Processing** - Parsing, scoring, and matching
- **Local Storage** - Client-side data persistence
- **Utility Functions** - Helper functions and common logic

---

## 🗂️ Data Flow Architecture

```
📱 User Interface (components/)
    ↓
🔧 Business Logic (lib/)
    ↓
📡 API Routes (app/api/)
    ↓
🌐 External APIs (Job Boards, Gmail, etc.)
```

### **Data Persistence**
- **LocalStorage** - User preferences, application data
- **Session Storage** - Temporary state and caching
- **External APIs** - Real-time job data and email processing

---

## 🎯 Development Guidelines

### **File Organization**
- **Group by functionality** - Related files in same directory
- **Clear naming** - Descriptive file and component names
- **Separate concerns** - UI, logic, and data in separate files
- **Consistent structure** - Follow established patterns

### **Component Structure**
```typescript
// Component file structure
interface ComponentProps {
  // Props interface
}

const Component = ({ prop }: ComponentProps) => {
  // Hooks and state
  // Event handlers
  // Render logic
  
  return (
    // JSX content
  );
};

export default Component;
```

### **API Route Structure**
```typescript
// API route structure
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // API logic
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  // POST logic
  return NextResponse.json(data);
}
```

---

## 🚀 Getting Started with the Codebase

### **1. Understand the Architecture**
- Review [Development Setup](./development-setup.md)
- Study the component categories above
- Examine the data flow architecture

### **2. Explore Key Files**
- `app/page.tsx` - Main application entry point
- `components/JobDiscoveryDashboard.tsx` - Core job search interface
- `lib/jobScanner.ts` - Job scanning logic
- `types/` - TypeScript definitions

### **3. Set Up Development Environment**
- Follow the [Quick Start Guide](../../QUICK_START.md)
- Configure API keys using [API Setup](../getting-started/API_SETUP.md)
- Start the development server

### **4. Make Your First Contribution**
- Choose a component category to work on
- Follow the [Contributing Guide](./contributing-guide.md)
- Submit your first pull request

---

## 🎉 Conclusion

This project structure is designed for:
- **Scalability** - Easy to add new features and integrations
- **Maintainability** - Clear organization and separation of concerns
- **Collaboration** - Easy for new contributors to understand
- **Performance** - Optimized for Next.js and modern web development

**Welcome to the GRC Resume Builder codebase!** 🚀
