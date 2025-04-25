import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <h1>Добро пожаловать в FailCase Tickets</h1>
        <p>Это демо-платформа для тестировщиков ПО.</p>
      </main>
    </>
  );
}
