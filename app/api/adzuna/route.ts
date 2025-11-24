import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const what = searchParams.get("what") || "cybersecurity"
  const where = searchParams.get("where") || "remote"
  const page = Number(searchParams.get("page") || "1")

  const app_id = process.env.ADZUNA_APP_ID
  const app_key = process.env.ADZUNA_APP_KEY

  // LOUD LOGGING FOR DEBUGGING
  console.log("📡 ADZUNA API REQUEST:", { what, where, page, country: 'US' })
  console.log("🔑 ADZUNA CREDS:", { hasId: !!app_id, hasKey: !!app_key, idLength: app_id?.length, keyLength: app_key?.length })

  if (!app_id || !app_key) {
    console.error('❌ Adzuna credentials missing - check .env.local for ADZUNA_APP_ID and ADZUNA_APP_KEY')
    return NextResponse.json({ error: "Adzuna credentials missing" }, { status: 500 })
  }

  const qs = new URLSearchParams({
    app_id,
    app_key,
    what,
    where,
    results_per_page: "50",
    sort_by: "date"
  })

  // Explicitly use US country
  const url = `https://api.adzuna.com/v1/api/jobs/us/search/${page}?${qs.toString()}`
  
  console.log("🌐 ADZUNA URL:", url.replace(app_key, 'KEY_REDACTED'))

  try {
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
