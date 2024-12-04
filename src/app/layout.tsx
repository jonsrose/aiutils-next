import { Providers } from './providers'
import { LayoutClient } from './LayoutClient'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <LayoutClient>
              {children}
            </LayoutClient>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
