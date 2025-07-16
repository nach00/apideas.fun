import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import type { Session } from 'next-auth'
import { ThemeProvider } from '@/lib/theme-context'
import ErrorBoundary from '@/components/ErrorBoundary'
import '@/styles/globals.css'

interface CustomAppProps extends AppProps {
  pageProps: {
    session?: Session
  } & AppProps['pageProps']
}

export default function App({ Component, pageProps }: CustomAppProps): JSX.Element {
  return (
    <ErrorBoundary>
      <SessionProvider session={pageProps.session}>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
}