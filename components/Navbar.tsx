import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>FailCase Tickets</div>
      <div className={styles.links}>
        <Link href="/">Главная</Link>
        <Link href="/login">Вход</Link>
      </div>
    </nav>
  );
}
