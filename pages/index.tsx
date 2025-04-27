import Navbar from '@/components/Navbar'
import Banner from '@/components/Banner'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, GetStaticPropsContext } from 'next';

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

export const getStaticProps: GetStaticProps = async (
  context: GetStaticPropsContext
) => {
  const { locale = 'ru' } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};