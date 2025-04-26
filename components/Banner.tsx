import styles from './Banner.module.css'

export default function Banner() {
  return (
    <div className={styles.wrapper}>
      <img
        src="/banner.png"
        alt="Banner"
        className={styles.image}
      />
    </div>
  )
}
