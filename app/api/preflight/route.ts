import { NextResponse } from "next/server"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing env var: ${name}`)
  }
  return value
}

export async function GET(req: Request) {
  const errors: string[] = []
  const warnings: string[] = []
  
  console.log("🔍 PREFLIGHT: Checking all API credentials...")
  
  // Check Adzuna credentials
  try {
    const adzunaAppId = requireEnv("ADZUNA_APP_ID")
    const adzunaAppKey = requireEnv("ADZUNA_APP_KEY")
    console.log("✅ Adzuna credentials OK")
  } catch (error) {
    const msg = "Adzuna: Add ADZUNA_APP_ID and ADZUNA_APP_KEY to .env.local"
    errors.push(msg)
    console.error("❌ " + msg)
  }
  
  // Check USAJobs credentials
  try {
    const usajobsApiKey = requireEnv("USAJOBS_API_KEY")
    const usajobsEmail = requireEnv("USAJOBS_EMAIL")
    console.log("✅ USAJobs credentials OK")
  } catch (error) {
    const msg = "USAJobs: Add USAJOBS_API_KEY and USAJOBS_EMAIL to .env.local"
    errors.push(msg)
    console.error("❌ " + msg)
  }
  
  // Check SerpApi credentials
  try {
    const serpapiKey = requireEnv("SERPAPI_API_KEY")
    console.log("✅ SerpApi credentials OK")
  } catch (error) {
    const msg = "SerpApi: Add SERPAPI_API_KEY to .env.local"
    errors.push(msg)
    console.error("❌ " + msg)
  }
  
  // Check JSearch credentials
  try {
    const jsearchKey = requireEnv("JSEARCH_RAPIDAPI_KEY")
    console.log("✅ JSearch credentials OK")
  } catch (error) {
    const msg = "JSearch: Add JSEARCH_RAPIDAPI_KEY to .env.local"
    errors.push(msg)
    console.error("❌ " + msg)
  }
  
  // Quick connectivity test (optional - just check if routes exist)
  const routes = [
    "/api/adzuna",
    "/api/usajobs", 
    "/api/serpapi",
    "/api/jsearch"
  ]
  
  for (const route of routes) {
    try {
      // Just check if route responds (even with error, means it exists)
      const testUrl = new URL(route, req.url)
      const testRes = await fetch(testUrl.toString(), { 
        method: "GET",
        headers: { "Range": "bytes=0-0" } // Minimal request
      })
      console.log(`✅ Route ${route} responds (${testRes.status})`)
    } catch (error) {
      warnings.push(`Route ${route} not accessible: ${error}`)
      console.warn(`⚠️ Route ${route} issue:`, error)
    }
  }
  
  const result = {
    ok: errors.length === 0,
    errors,
    warnings,
    timestamp: new Date().toISOString(),
    summary: errors.length === 0 
      ? "All credentials present - ready to scan!" 
      : `Missing ${errors.length} credential sets - scan will fail`
  }
  
  console.log("🎯 PREFLIGHT RESULT:", result.summary)
  
  return NextResponse.json(result, { 
    status: errors.length === 0 ? 200 : 400 
  })
}
