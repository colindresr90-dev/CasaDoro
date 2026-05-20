import { useState } from 'react'
import { 
  NavLink, Routes, Route, Link 
} from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import styles from '../styles/AdminLayout.module.css'

// Vistas del admin
import AdminDashboard from '../components/admin/AdminDashboard'
import AdminReservaciones from '../components/admin/AdminReservaciones'
import AdminHabitacionesEditor from '../components/admin/AdminSuites'
import AdminCalendario from '../components/admin/AdminCalendario'

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/admin',
    end: true,
    icon: (
      <svg viewBox="0 0 14 14" fill="none"
        stroke="currentColor" strokeWidth="1"
        className={styles.navIcon}>
        <rect x="1" y="1" width="5" height="5"/>
        <rect x="8" y="1" width="5" height="5"/>
        <rect x="1" y="8" width="5" height="5"/>
        <rect x="8" y="8" width="5" height="5"/>
      </svg>
    )
  },
  {
    label: 'Reservaciones',
    path: '/admin/reservaciones',
    icon: (
      <svg viewBox="0 0 14 14" fill="none"
        stroke="currentColor" strokeWidth="1"
        className={styles.navIcon}>
        <rect x="1" y="2" width="12" height="11"/>
        <path d="M1 6 L13 6"/>
        <path d="M5 1 L5 4"/>
        <path d="M9 1 L9 4"/>
      </svg>
    ),
    badge: 'pendientes'
  },
  {
    label: 'Habitaciones',
    path: '/admin/habitaciones',
    icon: (
      <svg viewBox="0 0 14 14" fill="none"
        stroke="currentColor" strokeWidth="1"
        className={styles.navIcon}>
        <path d="M1 10 L1 5 C1 3 3 2 7 2 
          C11 2 13 3 13 5 L13 10"/>
        <path d="M1 10 L13 10"/>
        <rect x="4" y="6" width="6" height="4"/>
      </svg>
    )
  },
  {
    label: 'Calendario',
    path: '/admin/calendario',
    icon: (
      <svg viewBox="0 0 14 14" fill="none"
        stroke="currentColor" strokeWidth="1"
        className={styles.navIcon}>
        <rect x="1" y="2" width="12" height="11"/>
        <path d="M1 6 L13 6"/>
        <path d="M5 1 L5 4"/>
        <path d="M9 1 L9 4"/>
        <circle cx="4.5" cy="9.5" r="0.8" 
          fill="currentColor"/>
        <circle cx="7" cy="9.5" r="0.8" 
          fill="currentColor"/>
        <circle cx="9.5" cy="9.5" r="0.8" 
          fill="currentColor"/>
      </svg>
    )
  },
]

export default function AdminLayout() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [pendientes] = useState(0)

  return (
    <div className={styles.adminApp}>
      <div className={styles.layout}>

        {/* ── HEADER ── */}
        <header className={styles.header}>
          
          {/* Logo */}
          <div className={styles.headerLeft}>
            <Link to="/" className={styles.headerLogo}>
              Casa d'Oro
              <span className={styles.headerLogoSub}>
                Panel de administración
              </span>
            </Link>
          </div>

          {/* Breadcrumb */}
          <div className={styles.headerCenter}>
            <div className={styles.headerBreadcrumb}>
              <span>Admin</span>
              <span className={styles.headerBreadcrumbSep}>
                /
              </span>
              <span className={styles.headerBreadcrumbCurrent}>
                Casa d'Oro
              </span>
            </div>
          </div>

          {/* Right */}
          <div className={styles.headerRight}>
            <div className={styles.headerSearch}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" placeholder="Buscar reservas, huéspedes..." className={styles.headerSearchInput} />
            </div>
            
            <Link to="/admin/configuracion" className={styles.headerBtn}>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="0.8" width="16" height="16">
                <circle cx="7" cy="7" r="2"/>
                <path d="M7 1 L7 3 M7 11 L7 13 M1 7 L3 7 M11 7 L13 7 M2.5 2.5 L4 4 M10 10 L11.5 11.5 M11.5 2.5 L10 4 M4 10 L2.5 11.5"/>
              </svg>
            </Link>
            
            <div className={styles.headerUser}>
              <div className={styles.headerUserAvatar}>
                {user?.firstName?.[0] || 'A'}
              </div>
            </div>
          </div>

        </header>

        {/* ── SIDEBAR ── */}
        <aside className={styles.sidebar}>
          
          {/* Nav principal */}
          <div className={styles.sidebarSection}>
            <span className={styles.sidebarSectionLabel}>
              General
            </span>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `${styles.navItem} 
                   ${isActive ? styles.navItemActive : ''}`
                }
              >
                {item.icon}
                {item.label}
                {item.badge === 'pendientes' && 
                  pendientes > 0 && (
                  <span className={styles.navBadge}>
                    {pendientes}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <div className={styles.sidebarDivider} />

          {/* Nav secundario */}
          <div className={styles.sidebarSection}>
            <span className={styles.sidebarSectionLabel}>
              Configuración
            </span>
            <NavLink
              to="/admin/configuracion"
              className={({ isActive }) =>
                `${styles.navItem} 
                 ${isActive ? styles.navItemActive : ''}`
              }
            >
              <svg viewBox="0 0 14 14" fill="none"
                stroke="currentColor" strokeWidth="1"
                className={styles.navIcon}>
                <circle cx="7" cy="7" r="2"/>
                <path d="M7 1 L7 3 M7 11 L7 13 
                  M1 7 L3 7 M11 7 L13 7
                  M2.5 2.5 L4 4 M10 10 L11.5 11.5
                  M11.5 2.5 L10 4 M4 10 L2.5 11.5"/>
              </svg>
              Configuración
            </NavLink>
          </div>

          {/* Footer del sidebar */}
          <div className={styles.sidebarFooter}>
            <div className={styles.sidebarUser}>
              <div className={styles.sidebarUserAvatar}>
                {user?.firstName?.[0] || 'A'}
              </div>
              <div className={styles.sidebarUserInfo}>
                <span className={styles.sidebarUserName}>
                  {user?.firstName} {user?.lastName}
                </span>
                <span className={styles.sidebarUserRole}>
                  ✦ Admin
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className={styles.navItem}
              style={{ 
                marginTop: 8, 
                color: 'rgba(240,235,224,0.25)'
              }}
            >
              <svg viewBox="0 0 14 14" fill="none"
                stroke="currentColor" strokeWidth="1"
                className={styles.navIcon}>
                <path d="M9 2 L13 7 L9 12"/>
                <path d="M13 7 L5 7"/>
                <path d="M5 1 L1 1 L1 13 L5 13"/>
              </svg>
              Cerrar sesión
            </button>
          </div>

        </aside>

        {/* ── MAIN ── */}
        <main className={styles.main}>
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="reservaciones" 
              element={<AdminReservaciones />} />
            <Route path="habitaciones" 
              element={<AdminHabitacionesEditor />} />
            <Route path="calendario" 
              element={<AdminCalendario />} />
          </Routes>
        </main>

      </div>
    </div>
  )
}
