import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div>&copy; {new Date().getFullYear()} FailCase Ticket Store</div>
      </div>
    </footer>
  );
}
