import { NavLink } from 'react-router-dom'
import styles from '../../styles/AdminLayout.module.css'

const NAV = [
  { path: '/admin', label: 'Dashboard', icon: 'grid' },
  { path: '/admin/reservaciones', label: 'Reservaciones', icon: 'calendar', badge: true },
  { path: '/admin/suites', label: 'Habitaciones', icon: 'bed' },
  { path: '/admin/huespedes', label: 'Huéspedes', icon: 'users' },
  { path: '/admin/calendario', label: 'Calendario', icon: 'calendar-clock' },
  { path: '/admin/finanzas', label: 'Finanzas', icon: 'chart' },
]

export default function AdminSidebar({ isOpen, onClose }) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      
      {/* Logo */}
      <div className={styles.sidebarBrand}>
        <div className={styles.brandMark}>
          <span className={styles.brandIcon}>✦</span>
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Casa d'Oro</span>
          <span className={styles.brandSub}>Admin</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className={styles.sidebarNav}>
        <span className={styles.navLabel}>Principal</span>
        {NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navActive : ''}`
            }
            onClick={onClose}
          >
            <span className={styles.navIcon}>
              {renderIcon(item.icon)}
            </span>
            <span className={styles.navLabelText}>
              {item.label}
            </span>
            {item.count && (
              <span className={styles.navBadge}>
                {item.count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer sidebar */}
      <div className={styles.sidebarFooter}>
        <div className={styles.sidebarUser}>
          <div className={styles.sidebarUserAvatar}>A</div>
          <div>
            <div className={styles.sidebarUserName}>Admin</div>
            <div className={styles.sidebarUserRole}>Manager</div>
          </div>
        </div>
      </div>

    </aside>
  )
}

function renderIcon(name) {
  // SVG inline icons finos, stroke 1.5
  const icons = {
    grid: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="5.5" height="5.5"/><rect x="10.5" y="2" width="5.5" height="5.5"/><rect x="2" y="10.5" width="5.5" height="5.5"/><rect x="10.5" y="10.5" width="5.5" height="5.5"/></svg>,
    calendar: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="14" height="13"/><path d="M2 7 L16 7"/><path d="M6 1 L6 5"/><path d="M12 1 L12 5"/></svg>,
    bed: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 14 L2 8 C2 6 4 5 7 5 L11 5 C14 5 16 6 16 8 L16 14"/><path d="M2 14 L16 14"/><rect x="4" y="10" width="5" height="4"/></svg>,
    users: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="6" r="3"/><path d="M3 15 C3 12 5 10 9 10 C13 10 15 12 15 15"/></svg>,
    message: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4 L2 14 L5 14 L9 16 L9 14 L16 14 L16 4 Z"/></svg>,
    'calendar-clock': <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="14" height="13"/><path d="M2 7 L16 7"/><circle cx="12" cy="11" r="1.5" fill="currentColor" stroke="none"/></svg>,
    chart: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 14 L6 10 L10 12 L16 6"/><path d="M2 3 L2 15 L16 15"/></svg>,
  }
  return icons[name] || null
}
