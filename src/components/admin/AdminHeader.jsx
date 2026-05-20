import { Link, useLocation } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import styles from '../../styles/AdminLayout.module.css'

const CRUMBS = {
  '/admin': ['Dashboard'],
  '/admin/reservaciones': ['Reservaciones'],
  '/admin/suites': ['Habitaciones'],
  '/admin/huespedes': ['Huéspedes'],
  '/admin/mensajes': ['Mensajes'],
  '/admin/calendario': ['Calendario'],
  '/admin/finanzas': ['Finanzas'],
}

export default function AdminHeader({ onMenuClick }) {
  const { user } = useUser()
  const location = useLocation()
  
  // Determinar breadcrumb
  const path = location.pathname
  let crumbs = CRUMBS[path] || ['Dashboard']
  
  // Caso especial para detalle de reservación
  if (path.startsWith('/admin/reservaciones/') && path !== '/admin/reservaciones') {
    crumbs = ['Reservaciones', 'Guest Profile']
  }

  return (
    <header className={styles.header}>
      
      {/* Breadcrumb izquierda */}
      <div className={styles.headerLeft}>
        <button
          className={styles.menuToggleBtn}
          onClick={onMenuClick}
          aria-label="Abrir panel"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <Link 
          to="/"
          className={styles.backBtn}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 12 L6 8 L10 4"/></svg>
        </Link>
        <div className={styles.breadcrumb}>
          <Link to="/admin" className={styles.bcLink}>Admin</Link>
          {crumbs.map((crumb, i) => (
            <span key={i} className={styles.bcItem}>
              <span className={styles.bcSep}>/</span>
              <span className={i === crumbs.length - 1 ? styles.bcCurrent : ''}>{crumb}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Derecha: search, notif, avatar */}
      <div className={styles.headerRight}>
        
        {/* Search */}
        <div className={styles.headerSearch}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar reservas, huéspedes..."
            className={styles.headerSearchInput}
          />
        </div>

        {/* Settings */}
        <Link to="/admin/configuracion" className={styles.headerBtn}>
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="0.8" width="16" height="16">
            <circle cx="7" cy="7" r="2"/>
            <path d="M7 1 L7 3 M7 11 L7 13 M1 7 L3 7 M11 7 L13 7 M2.5 2.5 L4 4 M10 10 L11.5 11.5 M11.5 2.5 L10 4 M4 10 L2.5 11.5"/>
          </svg>
        </Link>

        {/* Avatar */}
        <div className={styles.headerUser}>
          <div className={styles.headerUserAvatar}>
            {user?.firstName?.[0] || 'A'}
          </div>
        </div>

      </div>
    </header>
  )
}
