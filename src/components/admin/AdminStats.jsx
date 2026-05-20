import { useState, useEffect } from 'react'
import styles from '../../pages/Admin.module.css'

export default function AdminStats() {
  const [stats, setStats] = useState({
    pendientes: 0,
    ingresos_mes: 0,
    ocupacion: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real scenario, this would use getDashboardStats
    // For now we'll simulate the data
    setTimeout(() => {
      setStats({
        pendientes: 3,
        ingresos_mes: 12500,
        ocupacion: 85
      })
      setLoading(false)
    }, 500)
  }, [])

  if (loading) return <div>Cargando stats...</div>

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Nuevas (Pendientes)</span>
        <span className={styles.statValue}>{stats.pendientes}</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Ingresos (Mes)</span>
        <span className={styles.statValue}>${stats.ingresos_mes.toLocaleString()}</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Ocupación</span>
        <span className={styles.statValue}>{stats.ocupacion}%</span>
      </div>
    </div>
  )
}
