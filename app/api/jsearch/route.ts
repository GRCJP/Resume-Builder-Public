import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const query = searchParams.get("query") || "cybersecurity remote"
  const page = searchParams.get("page") || "1"
  const num_pages = searchParams.get("num_pages") || "1"
  const country = searchParams.get("country") || "us" // Explicitly default to US

  const apiKey = process.env.OPENWEB_JSEARCH_KEY
  
  console.log("📡 JSEARCH (OpenWeb Ninja) REQUEST:", { 
    query, 
    page, 
    num_pages,
    country, // Explicitly log country
    hasKey: !!apiKey, 
    keyLength: apiKey?.length || 0,
    keyStart: apiKey?.substring(0, 8) + "..." || "none"
  })
  
  if (!apiKey) {
    console.error('❌ OpenWeb Ninja JSearch credentials missing - need OPENWEB_JSEARCH_KEY in .env.local')
    return NextResponse.json({ error: "JSearch key missing - add OPENWEB_JSEARCH_KEY to .env.local" }, { status: 500 })
  }

  // OpenWeb Ninja JSearch endpoint (explicitly include country=us)
  const url = `https://api.openwebninja.com/v1/jsearch/search?query=${encodeURIComponent(query)}&page=${page}&num_pages=${num_pages}&country=${country}`
  
  console.log(`🌐 JSEARCH URL: ${url}`)

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,  // OpenWeb Ninja uses X-API-Key header
        'Content-Type': 'application/json'
      }
    })

    console.log(`📊 JSEARCH RESPONSE: Status ${res.status} ${res.statusText}`)

    if (!res.ok) {
      const text = await res.text()
      console.error(`❌ JSearch API HTTP ${res.status}:`, text)
      console.error(`❌ Request was: ${url}`)
      
      // Check for subscription/auth issues
      if (res.status === 401 || res.status === 403) {
        console.error('❌ OpenWeb Ninja JSearch authentication failed - check API key')
        return NextResponse.json({ 
          error: "JSearch API authentication failed - check OPENWEB_JSEARCH_KEY", 
          authRequired: true,
          status: res.status,
          body: text
        }, { status: 401 })
      }
      
      return NextResponse.json({ 
        error: `JSearch API error: ${res.status} - ${text}`,
        status: res.status,
        body: text
      }, { status: res.status })
    }

    const data = await res.json()
    
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
