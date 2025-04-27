// components/Banner.tsx
import Image from 'next/image';
import styles from './Banner.module.css';

export default function Banner() {
  return (
    <div className={styles.wrapper}>
      <Image
        src="/banner.png"
        alt="Banner"
        width={1024}
        height={312}
        className={styles.image}
      />
    </div>
  );
}
