import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styles from './PaymentStatus.module.css';
import { getApiUrl } from '../lib/supabase';

export default function Success() {
  const [searchParams] = useSearchParams();

  const roomName = searchParams.get('roomName') || "The Planter's Loft";
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const totalPrice = searchParams.get('totalPrice') || '0';
  const email = searchParams.get('email') || '';
  const sessionId = searchParams.get('session_id') || '';

  // Format dates elegantly
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    document.title = "¡Reserva Confirmada! | Casa d'Oro";

    const reservacionId = searchParams.get('reservacion_id');
    const sessionId = searchParams.get('session_id');
    if (reservacionId && sessionId) {
      const getConfirmApiUrl = () => {
        return getApiUrl('/api/confirm-payment');
      };

      fetch(getConfirmApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId, reservacionId })
      })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Reservation confirmed via API:', data);
      })
      .catch((error) => {
        console.error('Error confirming reservation via API:', error);
      });
    }
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <div className={styles.glow} />
      
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <svg className={styles.icon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"></path>
          </svg>
        </div>

        <span className={styles.eyebrow}>PAGO CONFIRMADO CON ÉXITO</span>
        <h2 className={styles.title}>¡Estancia Confirmada!</h2>
        <p className={styles.description}>
          Agradecemos su reserva. Hemos enviado un correo electrónico de confirmación con los detalles de su conserjería exclusiva y su código de acceso concierge a:
          <span className={styles.emailHighlight}>{email}</span>
        </p>

        {/* Booking Details Table */}
        <div className={styles.table}>
          <div className={styles.row}>
            <span className={styles.label}>Suite</span>
            <span className={styles.value}>{roomName}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Llegada (Check-in)</span>
            <span className={styles.value}>{formatDate(checkIn)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Salida (Check-out)</span>
            <span className={styles.value}>{formatDate(checkOut)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Monto Pagado</span>
            <span className={styles.valueGold}>USD {parseFloat(totalPrice).toLocaleString()}</span>
          </div>
          {sessionId && (
            <div className={`${styles.row} ${styles.transactionRow}`}>
              <span className={styles.label}>ID Transacción</span>
              <span className={styles.transactionId}>{sessionId}</span>
            </div>
          )}
        </div>

        <Link to="/" className={styles.btnOutline}>
          Volver a Casa d'Oro
        </Link>
      </div>
    </div>
  );
}
