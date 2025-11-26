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
    const action = searchParams.get('action')
    
    if (action === 'start') {
      // Start OAuth flow - redirect to Google
      const clientId = requireEnv('GOOGLE_CLIENT_ID')
      const redirectUri = requireEnv('GOOGLE_REDIRECT_URI')
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=https://www.googleapis.com/auth/gmail.readonly&` +
        `access_type=offline&` +
        `prompt=consent`
      
      console.warn('🔐 GMAIL AUTH: Starting OAuth flow...')
      
      return NextResponse.json({
        status: 'auth_required',
        authUrl,
        message: 'Visit this URL to authorize Gmail access'
      })
    }
    
    if (action === 'callback') {
      // Handle OAuth callback
      const code = searchParams.get('code')
      
      if (!code) {
        throw new Error('No authorization code received')
      }
      
      console.warn('🔐 GMAIL AUTH: Received authorization code')
      
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: requireEnv('GOOGLE_CLIENT_ID'),
          client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: requireEnv('GOOGLE_REDIRECT_URI')
        })
      })
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        throw new Error(`Token exchange failed: ${errorText}`)
      }
      
      const tokenData = await tokenResponse.json()
      
      console.warn('✅ GMAIL AUTH: Got tokens', {
        hasAccessToken: !!tokenData.access_token,
        hasRefreshToken: !!tokenData.refresh_token,
        expiresIn: tokenData.expires_in
      })
      
      return NextResponse.json({
        status: 'success',
        message: 'Gmail authorization successful',
        refreshToken: tokenData.refresh_token,
        instructions: [
          'Add this to your .env.local:',
          `GOOGLE_REFRESH_TOKEN=${tokenData.refresh_token}`,
          'Then restart your development server'
        ]
      })
    }
    
    return NextResponse.json({
      status: 'error',
      message: 'Missing action parameter. Use ?action=start or ?action=callback'
    })
    
  } catch (error) {
    console.error('❌ GMAIL AUTH ERROR:', error)
    
    if (error instanceof Error && error.message.includes('Missing env var')) {
      return NextResponse.json({
        status: 'setup_required',
        error: error.message,
        message: 'Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local first'
      }, { status: 400 })
    }
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
