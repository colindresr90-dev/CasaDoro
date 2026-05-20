import { Routes, Route } from 'react-router-dom'
import AdminShell from '../components/admin/AdminShell'
import AdminDashboard from './AdminDashboard'
import AdminReservaciones from './AdminReservaciones'
import AdminReservacion from './AdminReservacion'
import AdminSuites from '../components/admin/AdminSuites'
import AdminCalendario from '../components/admin/AdminCalendario'
import AdminHuespedes from './AdminHuespedes'

export default function Admin() {
  return (
    <>
      <style>{`
        body {
          background-color: #f5f3f0 !important;
          color: #1A1A1A !important;
          --font-display: 'Inter', system-ui, -apple-system, sans-serif !important;
          --font-smallcaps: 'Inter', system-ui, -apple-system, sans-serif !important;
          --font-body: 'Inter', system-ui, -apple-system, sans-serif !important;
        }
        select, input, textarea, button, option {
          --font-display: 'Inter', system-ui, -apple-system, sans-serif !important;
          --font-smallcaps: 'Inter', system-ui, -apple-system, sans-serif !important;
          --font-body: 'Inter', system-ui, -apple-system, sans-serif !important;
          font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
        }
        #root {
          background-color: #f5f3f0 !important;
        }
      `}</style>
      <Routes>
        <Route element={<AdminShell />}>
          <Route index element={<AdminDashboard />} />
          <Route path="reservaciones" element={<AdminReservaciones />} />
          <Route path="reservaciones/:id" element={<AdminReservacion />} />
          <Route path="suites" element={<AdminSuites />} />
          <Route path="huespedes" element={<AdminHuespedes />} />
          <Route path="calendario" element={<AdminCalendario />} />
          {/* Fallback internal routes could go here */}
        </Route>
      </Routes>
    </>
  )
}
