import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    console.warn("🧪 TEST: Testing LinkedIn parser directly...")
    
    // Import the parser
    const { parseJobEmails } = await import('../../../lib/emailJobParser')
    
    // Create a mock LinkedIn email based on the debug output
    const mockEmail = {
      subject: "Cyber Security Consultant: Cyber Focus AI - cyber security specialist and more",
      from: "LinkedIn Job Alerts <jobalerts-noreply@linkedin.com>",
      date: "Mon, 24 Nov 2025 15:51:44 +0000 (UTC)",
      body: `Your job alert for Cyber Security Consultant in United States
New jobs match your preferences.
            
cyber security specialist
Cyber Focus AI
United States
View job: https://www.linkedin.com/comm/jobs/view/4324263998/?trackingId=TMk6elKPeL2dp0Ih6qBX2A%3D%3D

---------------------------------------------------------

            
Cyber security analyst
Cyber Focus AI
United States
View job: https://www.linkedin.com/comm/jobs/view/4324174098/?trackingId=mdLdI6WiQCWDSsH91b22mw%3D%3D

---------------------------------------------------------

            
Cybersecurity Analyst
OVA.Work
Alpharetta, GA
View job: https://www.linkedin.com/comm/jobs/view/4338455531/?trackingId=2vmiKHqRpF7QNrmLnd8SJw%3D%3D`
    }
    
    console.warn('🧪 TEST: Parsing mock LinkedIn email...')
    
    // Test the parsing with detailed logging
    const parsedJobs = await parseJobEmails([mockEmail])
    
    console.warn(`🧪 TEST: Parsed ${parsedJobs.length} jobs from mock email`)
    
    return NextResponse.json({
      status: "parser_test_complete",
      mockEmail: {
        subject: mockEmail.subject,
        from: mockEmail.from,
        bodyLength: mockEmail.body.length
      },
      parsedJobsCount: Array.isArray(parsedJobs) ? parsedJobs.length : 0,
      parsedJobs: parsedJobs,
      message: "LinkedIn parser test complete"
    })
    
  } catch (error) {
    console.error("🧪 TEST: Parser test failed:", error)
    return NextResponse.json({
      status: "parser_test_failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
