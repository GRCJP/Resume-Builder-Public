# Resume Upload & Job Matching Guide

## What Changed

The GRC Resume Builder has been streamlined to focus on what you need most: **matching your existing resumes against job descriptions**.

### ❌ Removed
- Manual resume entry form
- Live preview component
- Individual field editing

### ✅ Added
- **Resume upload** (PDF, DOCX, TXT)
- **Storage for up to 5 resumes**
- **Quick resume selection**
- **Instant job matching**
- **Version comparison**

---

## How to Use

### **Step 1: Upload Your Resumes**

1. Open http://localhost:3000
2. Click "Upload Resume" on the left side
3. Select your resume file (PDF, DOCX, or TXT)
4. Repeat for up to 5 different versions

**Recommended versions to upload:**
- ✅ **Jonathan_Perez_GRC_Resume_FINAL.docx** (your optimized version)
- ✅ Federal-focused version (if you have one)
- ✅ Commercial-focused version (if you have one)
- ✅ Engineering-heavy version (if you have one)
- ✅ Traditional GRC version (if you have one)

### **Step 2: Select a Resume**

- Click on any resume card to select it
- The selected resume will be highlighted in blue
- You'll see "✓ This resume will be used for job matching"

### **Step 3: Analyze Against Jobs**

1. Find a GRC job on LinkedIn or Indeed
2. Copy the entire job description
3. Paste it into the "Job Description" box on the right
4. Click "Analyze Job Match"

### **Step 4: Review Results**

You'll see:
- **Match Score** (aim for 80%+)
- **Key Requirements Found** (green badges)
- **Missing Keywords** (orange badges)
- **Tailored Recommendations** (specific suggestions)

### **Step 5: Compare Versions**

1. Note the match score for Resume A
2. Select Resume B
3. Click "Analyze Job Match" again
4. Compare scores to see which performs better

---

## Storage & Persistence

### **Where Are Resumes Stored?**
- Resumes are stored in your browser's localStorage
- They persist between sessions
- No data is sent to any server
- Everything stays on your computer

### **Maximum Limit**
- **5 resumes maximum**
- Delete old versions to add new ones
- Click the trash icon to remove a resume

### **File Types Supported**
- ✅ PDF (.pdf)
- ✅ Word Document (.docx)
- ✅ Plain Text (.txt)

**Note:** PDF and DOCX parsing is basic. For best results, also save your resume as .txt for more accurate text extraction.

---

## Workflow Examples

### **Example 1: Testing Your Final Resume**

1. Upload `Jonathan_Perez_GRC_Resume_FINAL.docx`
2. Find 5 GRC Engineer jobs on LinkedIn
3. Test your resume against each job
4. Note which jobs give 80%+ match scores
5. Apply to those jobs first

### **Example 2: Comparing Versions**

**Scenario:** You have a federal-focused and commercial-focused resume

1. Upload both versions
2. Find a federal GRC job
3. Test federal version → 92% match
4. Test commercial version → 78% match
5. **Use federal version for this application**

### **Example 3: Iterative Improvement**

1. Upload your current resume → 75% match
2. Review missing keywords
3. Update resume with suggestions
4. Upload updated version
5. Re-test → 88% match
6. Delete old version, keep new one

---

## Tips for Best Results

### **Upload Strategy**

**DO:**
- ✅ Upload your best 2-3 versions
- ✅ Name files clearly (e.g., "Jonathan_GRC_Federal.docx")
- ✅ Keep versions that perform well
- ✅ Update and re-upload as you improve

**DON'T:**
- ❌ Upload 5 nearly identical versions
- ❌ Keep outdated versions
- ❌ Upload versions you won't actually use

### **Job Matching Strategy**

**For Each Application:**
1. Upload/select your best resume
2. Paste the job description
3. Review match score
4. If <80%, check missing keywords
5. If you have those skills, update resume
6. If not, try a different resume version

### **Version Management**

**Keep these versions:**
- **Primary version** (your FINAL resume)
- **Federal-focused** (if targeting government)
- **Engineering-focused** (if targeting GRC Engineer roles)
- **Analyst-focused** (if targeting GRC Analyst roles)

**Delete these versions:**
- Old drafts
- Versions that consistently score low
- Duplicates

---

## Troubleshooting

### **"Maximum resumes reached"**
- You have 5 resumes uploaded
- Delete one using the trash icon
- Then upload your new version

### **"Failed to read file"**
- File might be corrupted
- Try saving as .txt instead
- Ensure file is actually PDF/DOCX/TXT

### **Match score seems wrong**
- Make sure you uploaded the right resume
- Check that the resume is selected (blue highlight)
- Verify the job description pasted completely

### **Resume disappeared**
- Check if you're in the same browser
- localStorage is browser-specific
- Re-upload if needed

### **Can't upload PDF**
- PDF text extraction is basic
- For best results, save resume as .txt
- Or copy/paste resume text into a .txt file

---

## Advanced Usage

### **A/B Testing Resumes**

Test which resume performs better:

```
Job: GRC Engineer at Tech Company

Resume A (Engineering-focused):
- Match: 92%
- Missing: 2 keywords
- Suggestions: 3

Resume B (Traditional GRC):
- Match: 78%
- Missing: 8 keywords
- Suggestions: 6

Winner: Resume A → Use for application
```

### **Tracking Performance**

Create a spreadsheet:

| Job Title | Company | Resume Used | Match Score | Applied | Response |
|-----------|---------|-------------|-------------|---------|----------|
| GRC Engineer | TechCorp | Final v1 | 92% | Yes | Interview |
| GRC Analyst | FinServ | Final v1 | 78% | Yes | No |
| GRC Engineer | CloudCo | Final v1 | 88% | Yes | Interview |

**Insight:** Final v1 gets 66% interview rate for 85%+ matches

### **Continuous Improvement**

1. **Week 1:** Upload current resume, test 10 jobs
2. **Week 2:** Note common missing keywords
3. **Week 3:** Update resume with those keywords
4. **Week 4:** Upload v2, compare scores
5. **Week 5:** Keep best version, delete old

---

## Quick Reference

### **Upload Limits**
- Maximum: 5 resumes
- File types: PDF, DOCX, TXT
- Storage: Browser localStorage
- Persistence: Yes (same browser)

### **Match Score Targets**
- **90%+** → Excellent match, apply immediately
- **80-89%** → Good match, apply with confidence
- **70-79%** → Fair match, consider customizing
- **60-69%** → Weak match, try different version
- **<60%** → Poor match, probably not a fit

### **When to Update Resume**
- Same keywords missing across multiple jobs
- Consistently scoring <80%
- New certification earned
- Major project completed
- VP or mentor provides feedback

---

## Next Steps

1. **Upload your final resume** (`Jonathan_Perez_GRC_Resume_FINAL.docx`)
2. **Find 3 target jobs** on LinkedIn
3. **Test match scores** for each
4. **Apply to 80%+ matches** this week
5. **Track results** to see what works

**You now have a streamlined tool for matching your resume to jobs. Use it before every application!** 🚀
