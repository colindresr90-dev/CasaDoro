import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Suites from './pages/Suites';
import Dining from './pages/Dining';
import Wellness from './pages/Wellness';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Registro from './pages/Registro';
import MiCuenta from './pages/MiCuenta';
import ProtectedRoute from './components/ProtectedRoute';
import SSOCallback from './pages/SSOCallback';
import Reservar from './pages/Reservar';
import AdminRoute from './components/AdminRoute';
import Admin from './pages/Admin';
import SuiteDetail from './pages/SuiteDetail';
import Success from './pages/Success';
import Cancel from './pages/Cancel';

function App() {
  const location = useLocation();
  
  // Rutas donde NO queremos mostrar Navigation ni Footer (públicos)
  const isExcluded = [
    '/login', 
    '/registro', 
    '/sso-callback', 
    '/reservar', 
    '/admin',
    '/success',
    '/cancel'
  ].some(path => location.pathname === path || location.pathname.startsWith(path + '/'));

  return (
    <>
      <ScrollToTop />
      {!isExcluded && <Navigation />}
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/suites" element={<PageTransition><Suites /></PageTransition>} />
          <Route path="/suites/:slug" element={<PageTransition><SuiteDetail /></PageTransition>} />
          <Route path="/dining" element={<PageTransition><Dining /></PageTransition>} />
          <Route path="/wellness" element={<PageTransition><Wellness /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/registro" element={<PageTransition><Registro /></PageTransition>} />
          
          <Route path="/mi-cuenta" element={
            <ProtectedRoute>
              <PageTransition><MiCuenta /></PageTransition>
            </ProtectedRoute>
          } />
          
          <Route path="/mis-reservaciones" element={
            <ProtectedRoute>
              <PageTransition><MiCuenta /></PageTransition>
            </ProtectedRoute>
          } />
          
          <Route path="/sso-callback" element={<SSOCallback />} />
          <Route path="/reservar/:slug" element={<PageTransition><Reservar /></PageTransition>} />
          <Route path="/success" element={<PageTransition><Success /></PageTransition>} />
          <Route path="/cancel" element={<PageTransition><Cancel /></PageTransition>} />
          
          <Route path="/admin/*" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
        </Routes>
      </AnimatePresence>

      {!isExcluded && <Footer />}
    </>
  );
}

export default App;
