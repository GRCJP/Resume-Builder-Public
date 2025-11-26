## 🎯 Description
Brief description of your changes and why they're needed.

### 🔄 Type of Change
- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update (documentation only changes)
- [ ] 🎨 UI/UX improvement (visual or user experience changes)
- [ ] 🔧 Refactoring (code quality improvements without changing functionality)
- [ ] 🧪 Testing (add or improve tests)
- [ ] 🔒 Security (security-related changes)

## 🧪 Testing

### 🔌 API Setup for Testing
- [ ] I set up USAJobs API key (required for federal job testing)
- [ ] I set up Gmail OAuth (required for email parsing)
- [ ] I set up Adzuna/SerpApi/JSearch (required for job board testing)
- [ ] I tested without APIs (core features only)
- [ ] I tested with full API setup (complete functionality)

### 🧪 Testing Checklist
**Core Features (No APIs Required):**
- [ ] 📤 Resume upload works (PDF, DOCX, TXT)
- [ ] 📊 ATS scoring displays correctly
- [ ] 🎨 Resume tailoring generates suggestions
- [ ] 📋 Application tracking saves data locally
- [ ] 🏗️ No build errors: `npm run build`
- [ ] 📱 UI looks good on different screen sizes

**API Features (APIs Required - if applicable):**
- [ ] 🇺🇸 USAJobs returns federal GRC positions
- [ ] 🔍 Job scanner shows results from configured APIs
- [ ] 📧 Gmail integration parses job alerts
- [ ] 📄 Resume download maintains proper formatting
- [ ] 🔌 All API endpoints return data without errors

**Quality Assurance:**
- [ ] 🧪 Unit tests pass: `npm run test:unit`
- [ ] 🔗 Integration tests pass: `npm run test:integration`
- [ ] 🔍 Code passes linting: `npm run lint`
- [ ] 📝 TypeScript compiles without errors
- [ ] 📊 Coverage meets requirements (if applicable)

### 📱 Screenshots
**If UI changes:**
- [ ] 📸 Before screenshots included
- [ ] 📸 After screenshots included
- [ ] 🎨 Design system compliance verified

**If API changes:**
- [ ] 📊 API response examples included
- [ ] 🔍 Error handling demonstrated
- [ ] 📝 API documentation updated

## 📋 Documentation

### 📚 Documentation Updates
- [ ] 📝 README.md updated (if needed)
- [ ] 📚 CONTRIBUTING.md updated (if needed)
- [ ] 🔧 API documentation updated (if applicable)
- [ ] 🎯 Feature documentation added (if new feature)
- [ ] 🐛 Bug fix documentation added (if applicable)

### 📖 Examples and Guides
- [ ] 📝 Usage examples provided
- [ ] 🎯 Setup instructions updated
- [ ] 📚 Troubleshooting guide updated
- [ ] 🔄 Migration guide (if breaking change)

## 🔗 Related Issues

### 🎯 Issue Resolution
- [ ] 🐛 Fixes #123 (replace with issue number)
- [ ] ✨ Implements #456 (replace with issue number)
- [ ] 📚 Addresses #789 (replace with issue number)

### 🔗 Related Issues
- [ ] Related to #111 (replace with issue number)
- [ ] Depends on #222 (replace with issue number)
- [ ] Blocks #333 (replace with issue number)

## 🚀 Breaking Changes (if applicable)

### 💥 Breaking Changes
- [ ] ⚠️ This change contains breaking changes
- [ ] 📝 Migration guide provided
- [ ] 🔄 Backward compatibility considered
- [ ] 📊 Impact assessment completed

### 🔄 Migration Path
```bash
# If breaking changes, provide migration steps
# Example:
# 1. Update environment variables
# 2. Run migration script
# 3. Update configuration files
```

## 🎯 Performance Impact

### 📊 Performance Considerations
- [ ] 🚀 Performance improvements made
- [ ] 📉 Performance regression tested
- [ ] 📊 Benchmarks run (if applicable)
- [ ] 📈 Memory usage considered

### 🧪 Performance Testing
- [ ] ⚡ Load testing completed
- [ ] 📊 Response times measured
- [ ] 📈 Resource usage monitored
- [ ] 🔄 Scalability considered

## 🔒 Security Considerations

### 🛡️ Security Review
- [ ] 🔒 No sensitive data exposed
- [ ] 🔐 API keys properly secured
- [ ] 🛡️ Input validation implemented
- [ ] 🔍 Security testing completed

### 📋 Security Checklist
- [ ] 🔍 Dependencies scanned for vulnerabilities
- [ ] 🔒 No hardcoded secrets
- [ ] 🛡️ Proper error handling (no information leakage)
- [ ] 🔐 Authentication/authorization considered

## 📊 Impact Assessment

### 🎯 User Impact
- [ ] 👥 Affected user groups identified
- [ ] 📈 User experience improved
- [ ] 🎯 Feature adoption expected
- [ ] 📚 Documentation sufficient

### 🔄 Migration Impact
- [ ] ⚠️ Breaking changes documented
- [ ] 🔄 Migration path clear
- [ ] 📚 Support resources available
- [ ] 🎯 Rollback plan prepared

## 📝 Additional Context

### 🎯 Rationale
Explain the reasoning behind this change. Why was this approach chosen over alternatives?

### 🧪 Testing Strategy
Describe how you tested this change and why this testing approach was chosen.

### 📚 References
Link to any relevant documentation, issues, or discussions that provide context.

### 🎯 Future Considerations
Any future work or considerations that this change enables or requires.

## ✅ Pre-Merge Checklist

### 🧪 Final Verification
- [ ] 🏗️ Code builds successfully
- [ ] 🧪 All tests pass
- [ ] 🔍 Code reviewed by at least one maintainer
- [ ] 📝 Documentation is up to date
- [ ] 🎯 Breaking changes are documented (if applicable)

### 🚀 Release Preparation
- [ ] 📋 CHANGELOG.md updated
- [ ] 🏷️ Version bump considered
- [ ] 📦 Release notes prepared
- [ ] 🎯 Migration guide ready (if needed)

### 🤝 Community Impact
- [ ] 👥 Community notified (if breaking change)
- [ ] 📚 Support resources updated
- [ ] 🎯 Training materials updated (if needed)
- [ ] 🔄 Backward compatibility maintained

---

## 🎉 Thank You! 🎉

### 🌟 Contribution Recognition
This contribution helps the GRC community by:
- Improving the resume builder experience
- Making GRC job searching more effective
- Demonstrating community collaboration
- Building valuable open source skills

### 🚀 Next Steps
1. **Review:** Maintainers will review your changes
2. **Feedback:** Address any feedback or questions
3. **Merge:** Once approved, your changes will be merged
4. **Release:** Included in next release
5. **Recognition:** Your contribution will be acknowledged

### 🎯 Community Impact
Your contribution helps GRC professionals:
- Find better job opportunities
- Improve their resume quality
- Streamline their job search process
- Learn new technical skills

---

**Thank you for contributing to the GRC Resume Builder!** 🚀

*Every contribution makes a difference in someone's job search journey.* 🎯
