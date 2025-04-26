import Navbar from '@/components/Navbar'
import Banner from '@/components/Banner'

export default function Home() {
  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem', maxWidth: '1024px', margin: '0 auto' }}>
        <Banner />

        <h1>Добро пожаловать в FailCase Tickets</h1>
        <p>Это демо-платформа для тестировщиков ПО.</p>
      </main>
    </>
  )
}
