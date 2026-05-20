import styles from '../../styles/AdminLayout.module.css'

export default function AdminCalendario() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <span className={styles.pageEyebrow}>Disponibilidad</span>
          <h1 className={styles.pageTitle}>Calendario</h1>
        </div>
      </div>

      <div className={styles.card} style={{ padding: '80px', textAlign: 'center' }}>
        <p className={styles.tdMain}>Calendario interactivo en desarrollo</p>
        <p className={styles.tdText} style={{ marginTop: '16px' }}>
          Próximamente podrá gestionar las fechas bloqueadas y visualizar la ocupación de todas las suites en una vista de tiempo real.
        </p>
      </div>
    </>
  )
}

