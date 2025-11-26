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

    const query = searchParams.get("query") || "cybersecurity remote"
    const page = searchParams.get("page") || "1"
    const num_pages = searchParams.get("num_pages") || "1"
    const country = searchParams.get("country") || "us" // Explicitly default to US

    // Validate JSEARCH_RAPIDAPI_KEY - fail fast
    const apiKey = requireEnv("JSEARCH_RAPIDAPI_KEY")
    
    console.log("📡 JSEARCH (RapidAPI) REQUEST:", { 
      query, 
      page, 
      num_pages,
      country, // Explicitly log country
      hasKey: !!apiKey, 
      keyLength: apiKey?.length || 0,
      keyStart: apiKey?.substring(0, 8) + "..." || "none"
    })

    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
      }
    }

    const qs = new URLSearchParams({
      query,
      page,
      num_pages,
      country
    })

    const finalUrl = `https://jsearch.p.rapidapi.com/search?${qs.toString()}`
    console.log("🌐 JSEARCH FINAL URL:", finalUrl)

    const response = await fetch(finalUrl, options)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ JSearch API error:', { status: response.status, statusText: response.statusText, errorText })
      return NextResponse.json({ 
        error: `JSearch API error: ${response.status}`, 
        details: errorText 
      }, { status: 500 })
    }

    const data = await response.json()
    
    console.log("📊 JSEARCH RESPONSE:", {
      hasData: !!data.data,
      resultCount: data.data?.length || 0,
      hasError: !!data.error
    })

    if (data.error) {
      console.error(`❌ JSearch API returned error object:`, data.error)
      return NextResponse.json({ 
        error: `JSearch error: ${JSON.stringify(data.error)}`,
        apiError: data.error
      }, { status: 400 })
    }

    const jobCount = data.data?.length || 0
    console.log(`✅ JSearch API SUCCESS: ${jobCount} jobs returned (page ${page})`)
    
    // Log first 1-2 items for debugging
    if (data.data && data.data.length > 0) {
      console.log('📋 Sample jobs:', data.data.slice(0, 2).map((job: any) => ({
        title: job.job_title,
        company: job.employer_name,
        location: job.job_city || job.job_country,
        url: job.job_apply_link
      })))
    }
    
    return NextResponse.json(data)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ JSearch API fetch exception:', errorMsg)
    console.error('❌ Stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json({ 
      error: "JSearch API fetch failed", 
      details: errorMsg 
    }, { status: 500 })
  }
}
