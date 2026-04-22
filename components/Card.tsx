import styles from "./Card.module.css";

export default function Card({ children }: any) {
  return <div className={styles.card}>{children}</div>;
}