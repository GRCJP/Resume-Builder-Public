# 🤝 Contributing to GRC Resume Builder

Thank you for your interest in contributing to the GRC Resume Builder! This community project aims to help GRC professionals optimize their job search process.

---

## 🎯 Our Mission

To provide a free, open-source resume optimization and job discovery platform specifically designed for GRC (Governance, Risk, and Compliance) professionals.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [How to Contribute](#how-to-contribute)
4. [Code Guidelines](#code-guidelines)
5. [Testing](#testing)
6. [Submitting Changes](#submitting-changes)
7. [Community Guidelines](#community-guidelines)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- Basic knowledge of TypeScript/React

### Quick Setup
```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/Resume-Builder-Public.git
cd Resume-Builder-Public

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- Basic knowledge of TypeScript/React

### 🔌 API Setup for Testing

#### **Required for Full Testing:**
To properly test your contributions and ensure they work in real scenarios, set up these APIs:

**1. USAJobs API (FREE - 5 minutes)**
```bash
# Get your key: https://developer.usajobs.gov/
# Required for federal GRC job testing
USAJOBS_API_KEY=your_usajobs_api_key_here
USAJOBS_USER_AGENT=your_email@example.com
```

**2. Gmail OAuth (FREE - 10 minutes)**
```bash
# Setup guide: https://github.com/GRCJP/Resume-Builder-Public/blob/main/COMMUNITY_SETUP.md#gmail-oauth2-setup
# Required for email job alert parsing
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail-callback
GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here
```

**3. Job Board API (Pick ONE - FREE tiers available)**
```bash
# Option A: Adzuna (FREE tier - 1000 requests/month)
ADZUNA_APP_ID=your_adzuna_app_id_here
ADZUNA_APP_KEY=your_adzuna_app_key_here

# Option B: SerpApi (FREE tier - 100 searches/month)
SERPAPI_API_KEY=your_serpapi_key_here

# Option C: JSearch (FREE tier available)
JSEARCH_RAPIDAPI_KEY=your_jsearch_rapidapi_key_here
```

#### **What You Can Test Without APIs:**
- ✅ Resume upload and parsing
- ✅ ATS scoring and optimization
- ✅ UI/UX improvements
- ✅ Application tracking
- ✅ Documentation changes

#### **What Requires APIs for Testing:**
- 🔧 Job scanner improvements
- 🔧 Email parsing enhancements
- 🔧 New job board integrations
- 🔧 Resume download formatting

### 🧪 Testing Checklist

#### **Before Submitting PR:**

**Core Features (No APIs Required):**
- [ ] Resume upload works (PDF, DOCX, TXT)
- [ ] ATS scoring displays correctly
- [ ] Resume tailoring generates suggestions
- [ ] Application tracking saves data locally
- [ ] No build errors: `npm run build`
- [ ] UI looks good on different screen sizes

**API Features (APIs Required):**
- [ ] USAJobs returns federal GRC positions
- [ ] Job scanner shows results from configured APIs
- [ ] Gmail integration parses job alerts
- [ ] Resume download maintains proper formatting
- [ ] All API endpoints return data without errors

**Quick Test Commands:**
```bash
# Test core functionality
npm run dev

# Test build process
npm run build

# Run automated tests
npm test

# Check code quality
npm run lint
```

### Environment Configuration
1. Copy `.env.example` to `.env.local`
2. Configure API keys (see [COMMUNITY_SETUP.md](./COMMUNITY_SETUP.md))
3. Start development server: `npm run dev`

### Project Structure
```
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ResumeManager.tsx  # Resume upload/analysis
│   ├── JobScanner.tsx     # Job discovery
│   └── ApplicationTracker.tsx
├── lib/                   # Utility libraries
│   ├── jobScanner.ts      # Job board integrations
│   ├── smartMatcher.ts    # Resume matching logic
│   └── emailJobParser.ts  # Email parsing
├── types/                 # TypeScript definitions
└── documentation/         # Project docs
```

### Key Technologies
- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** TailwindCSS
- **Job APIs:** USAJobs, Adzuna, SerpApi, JSearch
- **Email:** Gmail OAuth2 integration
- **Resume Processing:** DOCX generation, PDF parsing

---

### 🎯 How to Contribute

### 1. Report Issues
- Use [GitHub Issues](https://github.com/GRCJP/Resume-Builder-Public/issues)
- Search existing issues first
- Include:
  - Clear description
  - Steps to reproduce
  - Environment details
  - Error messages

### 2. Suggest Features
- Open an issue with "Feature Request" label
- Describe the problem you're solving
- Explain why it would help GRC professionals
- Consider implementation complexity

### 3. Submit Code Changes

#### 🎯 Contribution Types & API Requirements

**📝 Low-Effort Contributions (APIs NOT Required)**
- Fix typos in documentation or UI text
- Improve error messages for better user feedback
- Add logging for better debugging
- Create examples for resume templates
- Test UI and report issues

**🔧 Medium-Effort Contributions (APIs Recommended)**
- Fix UI/UX issues and improve layouts
- Add better error handling
- Improve ATS scoring algorithms
- Enhance resume tailoring logic
- Add new resume analysis features

**🚀 High-Impact Contributions (APIs REQUIRED)**
- Fix job scanner API integrations
- Improve email parsing reliability
- Add new job board integrations
- Fix resume download formatting
- Enhance API error handling

#### 🔧 Starting Points for Beginners
1. **Fix typos** in documentation or UI text
2. **Improve error messages** for better user feedback
3. **Add logging** for better debugging
4. **Create examples** for resume templates
5. **Test API integrations** and report issues

#### 🧪 Testing Your Changes

**For Documentation/UI Changes:**
```bash
# Quick test - no APIs needed
npm run dev
# Test the UI changes
# Check for typos
# Verify links work
```

**For Core Feature Changes:**
```bash
# Full testing - APIs recommended
npm run dev
# Test with sample resume
# Verify ATS scoring
# Test application tracking
```

**For API-Related Changes:**
```bash
# Complete testing - APIs REQUIRED
npm run dev
# Set up APIs (see above)
# Test job scanner
# Test email parsing
# Verify all API endpoints
```

---

## 📝 Code Guidelines

### TypeScript Standards
```typescript
// Use interfaces for type definitions
interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  // ... other properties
}

// Use proper error handling
async function fetchJobs(): Promise<JobPosting[]> {
  try {
    const response = await apiCall()
    return response.data
  } catch (error) {
    console.error('Failed to fetch jobs:', error)
    return []
  }
}
```

### React Component Patterns
```tsx
// Use proper TypeScript props
interface ResumeManagerProps {
  resumes: Resume[]
  setResumes: (resumes: Resume[]) => void
}

export default function ResumeManager({ 
  resumes, 
  setResumes 
}: ResumeManagerProps) {
  // Component logic
}
```

### API Route Structure
```typescript
// app/api/example/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // API logic here
    return NextResponse.json({ data: result })
  } catch (error) {
    return NextResponse.json(
      { error: 'Request failed' }, 
      { status: 500 }
    )
  }
}
```

### Code Style
- Use **TypeScript** for all new code
- Follow existing **naming conventions**
- Add **JSDoc comments** for complex functions
- Use **descriptive variable names**
- Keep functions **small and focused**
- Handle errors **gracefully**

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Resume upload works for PDF, DOCX, TXT
- [ ] Job scanner returns results with configured APIs
- [ ] Email parsing extracts jobs from Gmail
- [ ] Resume download maintains formatting
- [ ] ATS scoring provides meaningful feedback
- [ ] Application tracking saves data locally

### API Testing
```bash
# Test individual API endpoints
curl http://localhost:3000/api/usajobs?keyword=cybersecurity
curl http://localhost:3000/api/adzuna?keyword=compliance
curl http://localhost:3000/api/email-debug
```

### Browser Console Testing
Open browser console to check for:
- API key validation errors
- Network request failures
- Job parsing issues
- Email authentication problems

---

## 📤 Submitting Changes

### 1. Create Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### 2. Make Changes
- Follow code guidelines
- Test thoroughly
- Update documentation if needed
- Keep changes focused and minimal

### 3. Commit Changes
```bash
git add .
git commit -m "feat: add new job board integration

- Added support for Example Jobs API
- Improved error handling for API failures
- Updated documentation with setup steps

Fixes #123"
```

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### 4. Submit Pull Request
1. Push to your fork: `git push origin feature/your-feature-name`
2. Open PR on GitHub
3. Fill out PR template below:
4. Wait for maintainer review

### 📋 Pull Request Template

```markdown
## Description
Brief description of your changes and why they're needed

## 🔌 API Setup for Testing
- [ ] I set up USAJobs API key (required for federal job testing)
- [ ] I set up Gmail OAuth (required for email parsing)
- [ ] I set up Adzuna/SerpApi/JSearch (required for job board testing)
- [ ] I tested without APIs (core features only)

## 🧪 Testing Checklist
**Core Features (No APIs Required):**
- [ ] Resume upload works (PDF, DOCX, TXT)
- [ ] ATS scoring displays correctly
- [ ] Resume tailoring generates suggestions
- [ ] Application tracking saves data locally
- [ ] No build errors: `npm run build`
- [ ] UI looks good on different screen sizes

**API Features (APIs Required - if applicable):**
- [ ] USAJobs returns federal GRC positions
- [ ] Job scanner shows results from configured APIs
- [ ] Gmail integration parses job alerts
- [ ] Resume download maintains proper formatting
- [ ] All API endpoints return data without errors

## 📱 Screenshots
[Attach screenshots if UI changes]

## 🔗 Related Issues
Closes #123 (if applicable)

## 📝 Additional Notes
Any additional context for reviewers
```

### 5. Code Review Process
- Maintainers will review your PR within 48 hours
- Address feedback promptly
- PR must pass all automated checks
- Maintain responsive communication

---

## 🌟 Recognition

### Contributor Recognition
- **GitHub Contributors** list in README
- **Release notes** mentioning contributors
- **Special badges** for significant contributions
- **Community spotlight** in documentation

### Contribution Types
- **💻 Code:** Pull requests and bug fixes
- **📖 Documentation:** Guides, examples, tutorials
- **🐛 Bug Reports:** Issue reporting and triage
- **💡 Ideas:** Feature suggestions and feedback
- **🎯 Testing:** Quality assurance and testing
- **📢 Promotion:** Sharing with the community

---

## 🤝 Community Guidelines

### Be Respectful
- Treat everyone with respect and kindness
- Welcome newcomers and help them learn
- Assume good intent in all interactions
- Focus on what is best for the community

### Be Constructive
- Provide helpful, specific feedback
- Suggest improvements rather than just criticizing
- Acknowledge good work and contributions
- Learn from different perspectives

### Be Inclusive
- Welcome contributions from all skill levels
- Create a safe space for questions and learning
- Use inclusive language in all communications
- Consider diverse user needs in design decisions

### Communication Channels
- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** General questions and ideas
- **Pull Requests:** Code contributions and reviews
- **Documentation:** Guides and examples

---

## 🎯 Priority Areas

We're currently focusing on:

### High Priority
1. **Resume Formatting** - Better DOCX templates and layouts
2. **API Reliability** - Better error handling and fallbacks
3. **Email Parsing** - Support more job alert formats
4. **User Experience** - Simplified setup and onboarding

### Medium Priority
1. **Mobile Responsiveness** - Better mobile experience
2. **Additional Job Boards** - More API integrations
3. **Resume Templates** - Industry-specific templates
4. **Analytics** - Job market insights and trends

### Future Enhancements
1. **AI-Powered Suggestions** - Smarter resume recommendations
2. **Interview Preparation** - Common GRC interview questions
3. **Salary Insights** - Compensation data and benchmarks
4. **Community Features** - Sharing and collaboration tools

---

## 📞 Get Help

### Questions?
- Check [existing issues](https://github.com/GRCJP/Resume-Builder-Public/issues)
- Start a [GitHub Discussion](https://github.com/GRCJP/Resume-Builder-Public/discussions)
- Review [setup documentation](./COMMUNITY_SETUP.md)

### Need Support?
- Tag maintainers in issues for urgent matters
- Join our community discussions
- Check the troubleshooting guide

---

## 📜 License

By contributing to this project, you agree that your contributions will be licensed under the same [MIT License](./LICENSE) as the project.

---

**Thank you for contributing to the GRC community! 🚀**

Together, we're making GRC job searching easier and more effective for professionals worldwide.
