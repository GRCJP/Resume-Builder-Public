import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const q = searchParams.get("q") || "cybersecurity remote"
  const location = searchParams.get("location") || "United States"
  const start = searchParams.get("start") || "0" // pagination offset
  const hl = searchParams.get("hl") || "en"
  const gl = searchParams.get("gl") || "us"

  const apiKey = process.env.SERPAPI_API_KEY
  if (!apiKey) {
    console.error('❌ SerpApi credentials missing')
    return NextResponse.json({ error: "SerpApi key missing" }, { status: 500 })
  }

  const qs = new URLSearchParams({
    engine: "google_jobs",
    q,
    location,
    hl,
    gl,
    api_key: apiKey
  })

  const url = `https://serpapi.com/search.json?${qs.toString()}`
  
  console.log(`🔍 SerpApi API: ${url}`)

  try {
    const res = await fetch(url)

    if (!res.ok) {
      const text = await res.text()
      console.error(`❌ SerpApi API error: ${res.status} - ${text}`)
      return NextResponse.json({ error: text }, { status: res.status })
    }

    const data = await res.json()
    
    if (data.error) {
      console.error(`❌ SerpApi API returned error:`, data.error)
      return NextResponse.json({ error: data.error }, { status: 400 })
    }

    console.log(`✅ SerpApi API: ${data.jobs_results?.length || 0} jobs returned`)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ SerpApi API fetch error:', error)
    return NextResponse.json({ error: "SerpApi API fetch failed" }, { status: 500 })
  }
}
