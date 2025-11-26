# 🤝 Contributing Guidelines

How to contribute effectively to the GRC Resume Builder project.

---

## 🎯 Our Mission

To provide a free, open-source resume optimization and job discovery platform specifically designed for GRC (Governance, Risk, and Compliance) professionals.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [How to Contribute](#how-to-contribute)
3. [Code Guidelines](#code-guidelines)
4. [Testing](#testing)
5. [Submitting Changes](#submitting-changes)
6. [Community Guidelines](#community-guidelines)

---

## 🚀 Getting Started

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

# Start development server
npm run dev
```

---

## 🛠️ How to Contribute

### **🎨 Frontend Contributions (No APIs Needed)**
Perfect for immediate contributions:
- UI/UX improvements
- Component enhancements
- Styling fixes
- Accessibility improvements
- Documentation updates

**Files to focus on:**
- `components/` - React components
- `app/globals.css` - Global styles
- `README.md` - Documentation

### **⚙️ Backend Contributions (APIs Needed)**
Advanced contributions requiring API setup:
- New job board integrations
- Email parsing improvements
- Resume scoring algorithms
- API endpoint development

**Files to focus on:**
- `lib/` - Business logic
- `app/api/` - API routes
- `types/` - TypeScript definitions

### **📚 Documentation Contributions**
Always needed and appreciated:
- API documentation
- User guides
- Development tutorials
- Code examples

---

## 📋 Code Guidelines

### **TypeScript Standards**
```typescript
// ✅ Good: Use proper interfaces
interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
}

// ❌ Avoid: Use of 'any' type
const job: any = { /* ... */ };
```

### **React Best Practices**
```typescript
// ✅ Good: Functional component with hooks
const JobCard = ({ job }: { job: JobPosting }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="job-card">
      {/* Component content */}
    </div>
  );
};

// ❌ Avoid: Class components (unless necessary)
class JobCard extends React.Component {
  // ...
}
```

### **CSS/Styling**
```typescript
// ✅ Good: TailwindCSS utility classes
<div className="bg-white rounded-lg shadow-md p-4">

// ❌ Avoid: Inline styles
<div style={{ backgroundColor: 'white', borderRadius: '8px' }}>
```

---

## 🧪 Testing

### **Before Submitting PR**

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

### **Quick Test Commands**
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

---

## 📤 Submitting Changes

### **1. Create Branch**
```bash
git checkout -b feature/your-feature-name
```

### **2. Make Changes**
- Follow code guidelines
- Add tests if needed
- Update documentation

### **3. Test Your Changes**
```bash
npm run build
npm run dev
# Manual testing
```

### **4. Commit Changes**
```bash
git add .
git commit -m "feat: add your feature description"
```

### **5. Submit Pull Request**
```bash
git push origin feature/your-feature-name
```

### **Pull Request Template**
```markdown
## Description
Brief description of your changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code quality improvement

## Testing
- [ ] Tested locally
- [ ] Build succeeds
- [ ] Added tests (if applicable)

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Notes
Any additional information about the changes.
```

---

## 👥 Community Guidelines

### **🤝 Be Respectful**
- Treat everyone with respect and kindness
- Welcome newcomers and help them learn
- Be patient with questions and different skill levels

### **💬 Communication**
- Use clear and descriptive titles for issues and PRs
- Provide context and details in descriptions
- Be constructive in feedback and suggestions

### **🎯 Focus on the Mission**
- Remember our goal: helping GRC professionals
- Prioritize features that benefit the community
- Consider accessibility and usability

### **📚 Learning and Growth**
- Share knowledge and help others learn
- Be open to feedback and suggestions
- Continuously improve your skills

---

## 🆘 Getting Help

### **Need Assistance?**
- **📖 Documentation** - Check the [docs](../README.md) folder
- **💬 Discussions** - [GitHub Discussions](https://github.com/GRCJP/Resume-Builder-Public/discussions)
- **🐛 Issues** - [GitHub Issues](https://github.com/GRCJP/Resume-Builder-Public/issues)
- **📧 Email** - For urgent matters

### **Common Questions**
- **How do I set up APIs?** See [API Setup Guide](../getting-started/API_SETUP.md)
- **How do I test my changes?** See [Testing Guide](./testing.md)
- **What should I work on?** Check [Issues](https://github.com/GRCJP/Resume-Builder-Public/issues) and [Discussions](https://github.com/GRCJP/Resume-Builder-Public/discussions)

---

## 🎉 Recognition

Contributors are recognized in:
- **README.md** - Core contributors section
- **Release Notes** - Feature contributions
- **Community Showcase** - Outstanding contributions
- **Annual Highlights** - Top contributors

---

## 🚀 Ready to Contribute!

Thank you for your interest in contributing to the GRC Resume Builder. Your contributions help GRC professionals find better jobs and advance their careers.

### **First Steps**
1. Set up your development environment
2. Choose a contribution area
3. Make your first contribution
4. Join our community discussions

**Together, we're making job searching better for GRC professionals!** 🚀
