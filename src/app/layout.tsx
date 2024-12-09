import { Providers } from './providers'
import { LayoutClient } from './LayoutClient'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryProvider } from "@/providers/QueryProvider";

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
            <QueryProvider>
              <LayoutClient>
                {children}
              </LayoutClient>
            </QueryProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
