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

    const what = searchParams.get("what") || "cybersecurity"
    const where = searchParams.get("where") // OPTIONAL for data dump
    const page = Number(searchParams.get("page") || "1")

    // Validate Adzuna credentials - fail fast
    const app_id = requireEnv("ADZUNA_APP_ID")
    const app_key = requireEnv("ADZUNA_APP_KEY")

    // PHASE 1 DATA DUMP - No location filtering unless explicitly provided
    console.warn("🚨 PHASE 1 ADZUNA API: PURE DATA DUMP MODE")
    console.warn("📡 DATA DUMP REQUEST:", { what, where: where || 'ALL LOCATIONS', page, country: 'US' })
    console.warn("🔑 ADZUNA CREDS:", { hasId: !!app_id, hasKey: !!app_key, idLength: app_id?.length, keyLength: app_key?.length })

    const qs = new URLSearchParams({
      app_id,
      app_key,
      what,
      results_per_page: "50",
      sort_by: "date"
    })

    // Only add location if explicitly provided (Phase 1 data dump)
    if (where) {
      qs.append("where", where)
    }

    const url = `https://api.adzuna.com/v1/api/jobs/us/search/${page}?${qs.toString()}`
    console.warn("🌐 ADZUNA DATA DUMP URL:", url.replace(app_key, 'KEY_REDACTED'))

    const res = await fetch(url)

    console.log(`📊 ADZUNA RESPONSE: Status ${res.status} ${res.statusText}`)

    if (!res.ok) {
      const text = await res.text()
      console.error(`❌ Adzuna API HTTP ${res.status}:`, text)
      console.error(`❌ Request was: ${url.replace(app_key, 'KEY_REDACTED')}`)
      return NextResponse.json({ 
        error: `Adzuna API error: ${res.status} - ${text}`,
        status: res.status,
        body: text 
      }, { status: res.status })
    }

    const data = await res.json()
    
    if (data.error) {
      console.error(`❌ Adzuna API returned error object:`, data.error)
      return NextResponse.json({ 
        error: `Adzuna error: ${JSON.stringify(data.error)}`,
        apiError: data.error 
      }, { status: 400 })
    }

    const jobCount = data.results?.length || 0
    console.log(`✅ Adzuna API SUCCESS: ${jobCount} jobs returned (page ${page})`)
    
    if (jobCount > 0) {
      console.log(`📋 Sample job titles:`, data.results.slice(0, 3).map((j: any) => j.title))
    }
    
    return NextResponse.json(data)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Adzuna API fetch exception:', errorMsg)
    console.error('❌ Stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json({ 
      error: "Adzuna API fetch failed", 
      details: errorMsg 
    }, { status: 500 })
  }
}
