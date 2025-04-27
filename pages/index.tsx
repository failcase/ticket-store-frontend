import Navbar from '@/components/Navbar'
import Banner from '@/components/Banner'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function Home() {
  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem', maxWidth: '1024px', margin: '0 auto' }}>
        <Banner />
      </main>
    </>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}
