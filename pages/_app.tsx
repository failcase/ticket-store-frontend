import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import Router from 'next/router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import Footer from '@/components/Footer'

NProgress.configure({ showSpinner: false, trickleSpeed: 200 })
Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    // подключаем next-themes с классом на html
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
