import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    
    if (error) {
      console.error('❌ Gmail OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=gmail_oauth_failed&reason=${error}`
      )
    }
    
    if (!code) {
      console.error('❌ Gmail OAuth: No authorization code received')
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=gmail_oauth_failed&reason=no_code`
      )
    }
    
    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForToken(code)
    
    if (!tokenResponse.access_token) {
      console.error('❌ Gmail OAuth: Failed to get access token')
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=gmail_oauth_failed&reason=token_exchange_failed`
      )
    }
    
    // Store tokens securely (in production, use a database)
    // For now, we'll return them to the client to store in localStorage
    const redirectUrl = new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000')
    redirectUrl.searchParams.set('gmail_success', 'true')
    redirectUrl.searchParams.set('access_token', tokenResponse.access_token)
    redirectUrl.searchParams.set('refresh_token', tokenResponse.refresh_token || '')
    
    console.log('✅ Gmail OAuth successful')
    return NextResponse.redirect(redirectUrl.toString())
    
  } catch (error) {
    console.error('❌ Gmail OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=gmail_oauth_failed&reason=callback_error`
    )
  }
}

async function exchangeCodeForToken(code: string) {
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const redirectUri = process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/api/gmail-callback'
  
  if (!clientId || !clientSecret) {
    throw new Error('Gmail OAuth credentials not configured')
  }
  
  const tokenUrl = 'https://oauth2.googleapis.com/token'
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    })
  })
  
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Token exchange failed: ${response.status} - ${errorData}`)
  }
  
  return await response.json()
}
