export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin: string
  portfolio: string
}

export interface Experience {
  id: string
  jobTitle: string
  company: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  achievements: string[]
}

export interface Education {
  id: string
  degree: string
  major: string
  university: string
  graduationYear: string
  gpa?: string
  honors?: string
}

export interface Skills {
  technical: string[]
  languages: string[]
  certifications: string[]
}

export interface ResumeData {
  personalInfo: PersonalInfo
  summary: string
  experience: Experience[]
  education: Education[]
  skills: Skills
}
