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

    const q = searchParams.get("q") || "cybersecurity remote"
    const location = searchParams.get("location") || "United States"
    const start = searchParams.get("start") || "0" // pagination offset
    const hl = searchParams.get("hl") || "en"
    const gl = searchParams.get("gl") || "us"

    // Validate SERPAPI_API_KEY - fail fast
    const apiKey = requireEnv("SERPAPI_API_KEY")
    
    console.log("📡 SERPAPI REQUEST:", { 
      q, 
      location, 
      start, 
      hl, 
      gl,
      hasKey: !!apiKey, 
      keyLength: apiKey?.length || 0
    })

    const qs = new URLSearchParams({
      engine: "google_jobs",
      q,
      location,
      hl,
      gl,
      api_key: apiKey
    })

    const finalUrl = `https://serpapi.com/search?${qs.toString()}`
    console.log("🌐 SERPAPI FINAL URL:", finalUrl.replace(apiKey, "***REDACTED***"))

    const res = await fetch(finalUrl)

    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ SerpApi API error:', { status: res.status, statusText: res.statusText, errorText })
      return NextResponse.json({ 
        error: `SerpApi API error: ${res.status}`, 
        details: errorText 
      }, { status: 500 })
    }

    const data = await res.json()
    
    console.log("📊 SERPAPI RESPONSE:", {
      hasResults: !!data.jobs_results,
      resultCount: data.jobs_results?.length || 0,
      hasError: !!data.error
    })

    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ SERPAPI ROUTE ERROR:', error)
    
    if (error instanceof Error && error.message.includes('Missing env var')) {
      return NextResponse.json({ 
        error: error.message,
        help: "Add SERPAPI_API_KEY to .env.local"
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: "SerpApi route failed", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
