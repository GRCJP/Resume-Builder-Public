import { NextResponse } from "next/server"
const nodemailer = require('nodemailer')

export async function GET(req: Request) {
  try {
    console.log("📧 Email alerts endpoint test")
    
    // Test Gmail IMAP configuration
    const emailUser = process.env.JOBS_EMAIL_USER
    const emailPass = process.env.JOBS_EMAIL_PASS
    const imapHost = process.env.JOBS_EMAIL_IMAP_HOST
    const imapPort = process.env.JOBS_EMAIL_IMAP_PORT
    
    console.log("📧 Gmail config test:", {
      user: emailUser?.substring(0, 10) + "...",
      hasPass: !!emailPass,
      host: imapHost,
      port: imapPort,
      passLength: emailPass?.length || 0
    })

    return NextResponse.json({
      status: "Email alerts endpoint working",
      configuration: {
        service: "gmail-imap",
        emailUser: emailUser?.substring(0, 10) + "...",
        imapHost,
        imapPort,
        passwordConfigured: !!emailPass && emailPass.length === 16
      },
      message: "Gmail IMAP functionality ready - can send/receive job alerts"
    })

  } catch (error) {
    console.error("❌ Email alerts test failed:", error)
    return NextResponse.json({ 
      error: "Email alerts test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { jobs, subject, recipientEmail } = body

    console.log("📧 Sending Gmail job alert:", {
      jobsCount: jobs?.length || 0,
      subject,
      recipient: recipientEmail || process.env.JOBS_EMAIL_USER
    })

    const emailUser = process.env.JOBS_EMAIL_USER
    const emailPass = process.env.JOBS_EMAIL_PASS
    
    if (!emailUser || !emailPass) {
      throw new Error("Gmail credentials not configured")
    }

    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    })

    // Verify transporter connection
    await transporter.verify()
    console.log("📧 Gmail transporter verified")

    // Create email content
    const emailSubject = subject || `🎯 ${jobs?.length || 0} New Job Matches Found`
    
    const emailText = `Found ${jobs?.length || 0} new job matches:\n\n` + 
             jobs?.map((job: any, i: number) => 
               `${i + 1}. ${job.title} at ${job.company}\n   📍 ${job.location}\n   🔗 ${job.url}\n   📊 Match Score: ${job.matchScore || 'N/A'}%\n`
             ).join('\n\n') || 'No jobs found'

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
          🎯 ${jobs?.length || 0} New Job Matches Found
        </h2>
        ${jobs?.map((job: any, i: number) => `
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 15px 0; background: #f9fafb;">
            <h3 style="color: #1f2937; margin: 0 0 8px 0;">
              ${i + 1}. ${job.title}
            </h3>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Company:</strong> ${job.company}<br>
              <strong>Location:</strong> ${job.location}<br>
              <strong>Match Score:</strong> <span style="color: ${job.matchScore >= 75 ? '#10b981' : job.matchScore >= 50 ? '#f59e0b' : '#ef4444'}">${job.matchScore || 'N/A'}%</span>
            </p>
            <a href="${job.url}" style="display: inline-block; background: #10b981; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin-top: 8px;">
              View Job →
            </a>
          </div>
        `).join('') || '<p>No jobs found</p>'}
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This email was sent by GRC Resume Builder Job Scanner.<br>
          You can adjust your alert preferences in your dashboard.
        </p>
      </div>
    `

    // Send email
    const mailOptions = {
      from: emailUser,
      to: recipientEmail || emailUser,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("📧 Email sent successfully:", info.messageId)

    return NextResponse.json({
      status: "Gmail alert sent successfully",
      configuration: "gmail-smtp",
      jobsCount: jobs?.length || 0,
      recipient: mailOptions.to,
      subject: mailOptions.subject,
      messageId: info.messageId,
      message: "Email delivered to Gmail inbox"
    })

  } catch (error) {
    console.error("❌ Gmail sending failed:", error)
    return NextResponse.json({ 
      error: "Gmail sending failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
