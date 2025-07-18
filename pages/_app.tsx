import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import type { Session } from 'next-auth'
import Head from 'next/head'
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
      <Head>
        <title>APIdeas - Creative API Combination Card Game</title>
        <meta name="description" content="Generate creative app ideas by combining APIs in a Pokemon-style card game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SessionProvider session={pageProps.session}>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
}