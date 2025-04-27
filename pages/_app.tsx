// pages/_app.tsx
import { appWithTranslation } from 'next-i18next'
import '@/styles/globals.css'
import { ThemeProvider } from 'next-themes'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import Footer from '@/components/Footer'
import type { AppProps } from 'next/app';

NProgress.configure({ showSpinner: false, trickleSpeed: 200 })

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <div className="app-wrapper">
        <main className="app-content">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default appWithTranslation(MyApp)
