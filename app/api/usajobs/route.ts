import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get("keyword") || "cybersecurity"
  const location = searchParams.get("location") || "Remote"
  const page = searchParams.get("page") || "1"

  const apiKey = process.env.USAJOBS_API_KEY
  const email = process.env.USAJOBS_EMAIL

  // Debug: Check if credentials are present
  console.log("USAJobs server creds present?", { 
    hasKey: !!apiKey, 
    hasEmail: !!email,
    keyLength: apiKey?.length || 0,
    email: email || 'none'
  })

  if (!apiKey || !email) {
    console.error('❌ USAJobs API credentials not configured on server')
    return NextResponse.json({ error: "USAJobs credentials missing" }, { status: 500 })
  }

  try {
    const qs = new URLSearchParams({
      Keyword: keyword,
      LocationName: location,
      ResultsPerPage: "50",
      Page: page
    })

    console.log(`🔍 USAJobs API Request: https://data.usajobs.gov/api/search?${qs.toString()}`)

    const res = await fetch(`https://data.usajobs.gov/api/search?${qs.toString()}`, {
      headers: {
        Host: "data.usajobs.gov",
        "User-Agent": email,
        "Authorization-Key": apiKey
      }
    })

    if (!res.ok) {
      console.error(`❌ USAJobs API error: ${res.status} ${res.statusText}`)
      const errorText = await res.text()
      console.error('Error response:', errorText)
      return NextResponse.json({ error: `USAJobs API error: ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    console.log(`✅ USAJobs API returned ${data.SearchResult?.SearchResultCount || 0} jobs`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ USAJobs API fetch error:', error)
    return NextResponse.json({ error: "USAJobs API fetch failed" }, { status: 500 })
  }
}
