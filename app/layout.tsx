import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GRC Resume Builder - Specialized for GRC Analysts & Engineers',
  description: 'Build an ATS-optimized resume tailored for GRC, Governance, Risk, and Compliance roles',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress Web3/Ethereum extension errors
              if (typeof window !== 'undefined') {
                const originalError = console.error;
                console.error = (...args) => {
                  if (args[0]?.toString().includes('ethereum')) return;
                  originalError.apply(console, args);
                };
              }
            `,
          }}
        />
        {children}
      </body>
    </html>
  )
}
