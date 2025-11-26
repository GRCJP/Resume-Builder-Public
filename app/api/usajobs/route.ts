import { NextResponse } from "next/server"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing env var: ${name}`)
  }
  return value
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get("keyword") || "cybersecurity"
    const location = searchParams.get("location") || "Remote"
    const page = searchParams.get("page") || "1"

    // Validate USAJobs credentials - fail fast
    const apiKey = requireEnv("USAJOBS_API_KEY")
    const email = requireEnv("USAJOBS_EMAIL")

    console.log("📡 USAJOBS REQUEST:", { 
      keyword, 
      location, 
      page,
      hasKey: !!apiKey, 
      hasEmail: !!email,
      keyLength: apiKey?.length || 0,
      email: email || 'none'
    })

    const qs = new URLSearchParams({
      Keyword: keyword,
      LocationName: location,
      ResultsPerPage: "50",
      Page: page
    })

    const finalUrl = `https://data.usajobs.gov/api/search?${qs.toString()}`
    console.log("🌐 USAJOBS FINAL URL:", finalUrl)

    const res = await fetch(finalUrl, {
      headers: {
        Host: "data.usajobs.gov",
        "User-Agent": email,
        "Authorization-Key": apiKey
      }
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`❌ USAJobs API error: ${res.status} ${res.statusText}`, errorText)
      return NextResponse.json({ 
        error: `USAJobs API error: ${res.status}`, 
        details: errorText 
      }, { status: 500 })
    }

    const data = await res.json()
    
    console.log("📊 USAJOBS RESPONSE:", {
      hasResults: !!data.SearchResult?.SearchResultItems,
      resultCount: data.SearchResult?.SearchResultItems?.length || 0,
      hasError: !!data.error
    })

    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ USAJOBS ROUTE ERROR:', error)
    
    if (error instanceof Error && error.message.includes('Missing env var')) {
      return NextResponse.json({ 
        error: error.message,
        help: "Add USAJOBS_API_KEY and USAJOBS_EMAIL to .env.local"
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: "USAJobs route failed", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
