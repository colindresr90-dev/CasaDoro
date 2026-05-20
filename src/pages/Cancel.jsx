import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styles from './PaymentStatus.module.css';

export default function Cancel() {
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get('roomName') || "The Planter's Loft";

  useEffect(() => {
    document.title = "Pago Cancelado | Casa d'Oro";
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.glow} />
      
      <div className={styles.card}>
        <div className={styles.iconWrapperCancel}>
          <svg className={styles.iconCancel} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>

        <span className={styles.eyebrow} style={{ color: '#c0573a' }}>PROCESO INTERRUMPIDO</span>
        <h2 className={styles.title}>Pago Cancelado</h2>
        <p className={styles.description}>
          Su pago para la suite <span className={styles.valueGold}>{roomName}</span> no fue completado y su reserva sigue abierta. No se ha realizado ningún cargo en su tarjeta.
        </p>

        <Link to="/suites" className={styles.btnGold}>
          Intentar de Nuevo
        </Link>
        <Link to="/" className={styles.btnOutline}>
          Volver a las Suites
        </Link>
      </div>
    </div>
  );
}
