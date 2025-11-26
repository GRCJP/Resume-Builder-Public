# 🛠️ Development Setup

Complete development environment setup and contribution guidelines.

---

## 🎯 Overview

This guide helps you understand how to contribute to the GRC Resume Builder, from setting up your development environment to understanding our workflows and best practices.

---

## 🏗️ Project Architecture

### **📁 Directory Structure**
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
├── 📁 docs/                  # Documentation
├── 📄 package.json          # Dependencies and scripts
├── 📄 tsconfig.json         # TypeScript configuration
├── 📄 tailwind.config.js    # TailwindCSS configuration
├── 📄 next.config.js        # Next.js configuration
└── 📄 .env.example          # Environment template
```

---

## 🎯 Core Technologies

### **Frontend Stack**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### **Backend & APIs**
- **Node.js** - Runtime environment
- **Next.js API Routes** - Server-side API endpoints
- **Multiple Job Board APIs** - USAJobs, Adzuna, SerpApi, JSearch
- **Gmail API** - Email parsing integration

### **Data & Storage**
- **LocalStorage** - Client-side data persistence
- **TypeScript Interfaces** - Type-safe data structures
- **React State Management** - Component state handling

---

## 🚀 Development Setup

### **Prerequisites**
- Node.js 18 or higher
- npm or yarn
- Git
- Basic knowledge of TypeScript/React

### **Quick Setup**
```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/Resume-Builder-Public.git
cd Resume-Builder-Public

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure API keys (see API_SETUP.md)
# Add your API keys to .env.local

# Start development server
npm run dev
```

### **Development Commands**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm test         # Run tests
```

---

## 🧪 Testing

### **Testing Strategy**
- **Unit Tests** - Component and function testing
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Full user workflow testing
- **Manual Testing** - Visual and functionality testing

### **Testing Checklist**
```bash
# Before submitting PR:
npm run build    # Ensure build succeeds
npm run lint     # Check code quality
npm test         # Run automated tests

# Manual testing checklist:
- [ ] App starts without errors
- [ ] Resume upload works
- [ ] Job scanner returns results
- [ ] UI looks good on mobile
- [ ] All links work properly
```

---

## 📋 Code Standards

### **TypeScript Guidelines**
- Use strict TypeScript mode
- Define interfaces for all data structures
- Use proper type annotations
- Avoid `any` type when possible

### **React Best Practices**
- Use functional components with hooks
- Implement proper error boundaries
- Use TypeScript for props typing
- Follow React naming conventions

### **CSS/Styling**
- Use TailwindCSS utility classes
- Implement responsive design
- Follow consistent color scheme
- Use semantic HTML elements

---

## 🔄 Development Workflow

### **1. Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

### **2. Make Changes**
- Follow code standards
- Add tests if needed
- Update documentation

### **3. Test Your Changes**
```bash
npm run build
npm run dev
# Test manually
```

### **4. Submit Pull Request**
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
# Create PR on GitHub
```

---

## 🎯 Contribution Areas

### **🎨 Frontend Contributions**
- UI/UX improvements
- Component development
- Styling enhancements
- Accessibility improvements

### **⚙️ Backend Contributions**
- API integrations
- New job board sources
- Email parsing improvements
- Performance optimizations

### **📚 Documentation**
- API documentation
- User guides
- Development guides
- Code comments

---

## 🔧 Troubleshooting

### **Common Development Issues**
- **Build errors** - Check TypeScript types
- **API errors** - Verify API keys and endpoints
- **Style issues** - Check TailwindCSS classes
- **Environment issues** - Verify `.env.local` setup

### **Get Help**
- Check [Issues](https://github.com/GRCJP/Resume-Builder-Public/issues)
- Start [Discussion](https://github.com/GRCJP/Resume-Builder-Public/discussions)
- Review [Documentation](../README.md)

---

## 🎉 Ready to Contribute!

You're all set to start contributing to the GRC Resume Builder. Thank you for helping GRC professionals find better jobs!

### **Next Steps**
1. Choose a contribution area
2. Set up your development environment
3. Make your first contribution
4. Join our community discussions

**Happy coding!** 🚀
