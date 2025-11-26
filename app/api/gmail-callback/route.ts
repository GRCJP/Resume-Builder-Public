import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    
    if (error) {
      console.error('❌ GMAIL CALLBACK: OAuth error:', error)
      return NextResponse.json({
        error: 'OAuth authorization failed',
        details: error,
        message: 'Please try the authorization process again'
      }, { status: 400 })
    }
    
    if (!code) {
      console.error('❌ GMAIL CALLBACK: No authorization code received')
      return NextResponse.json({
        error: 'No authorization code',
        message: 'Authorization code is required'
      }, { status: 400 })
    }
    
    console.warn('✅ GMAIL CALLBACK: Received authorization code')
    
    // Show the authorization code to the user
    const html = `
      <html>
        <head><title>Gmail Authorization Successful</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
          <h2 style="color: #10b981;">✅ Gmail Authorization Successful!</h2>
          <p><strong>Authorization Code:</strong></p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; word-break: break-all; font-family: monospace; margin: 20px 0;">
            ${code}
          </div>
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Copy the authorization code above</li>
            <li>Go back to your terminal</li>
            <li>Run: <code>curl "http://localhost:3000/api/gmail-auth?action=callback&code=YOUR_CODE"</code></li>
            <li>Replace YOUR_CODE with the code you just copied</li>
          </ol>
          <p style="color: #6b7280; font-size: 14px;">You can close this window and return to your terminal.</p>
        </body>
      </html>
    `
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    })
    
  } catch (error) {
    console.error('❌ GMAIL CALLBACK ERROR:', error)
    return NextResponse.json({
      error: 'Callback processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
