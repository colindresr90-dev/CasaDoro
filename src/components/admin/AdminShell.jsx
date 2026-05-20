import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import styles from '../../styles/AdminLayout.module.css'

export default function AdminShell() {
  const location = useLocation()
  const isFullBleed = location.pathname.includes('/habitaciones') || location.pathname.includes('/suites')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className={styles.shell}>
      {/* Backdrop overlay for mobile menu closure */}
      <div 
        className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.sidebarOverlayVisible : ''}`}
        onClick={closeSidebar}
      />
      <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className={styles.mainArea}>
        <AdminHeader onMenuClick={toggleSidebar} />
        <main className={isFullBleed ? styles.contentFull : styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
