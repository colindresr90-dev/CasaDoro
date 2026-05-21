import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Navigation.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import { useAdmin } from '../hooks/useAdmin';
import { useLanguage } from '../context/LanguageContext';


const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const navRef = useRef(null);
  const location = useLocation();

  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { isAdmin } = useAdmin();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Scrolled threshold for blur
      setIsScrolled(currentScrollY > 80);
      setAtTop(currentScrollY === 0);

      // Visibility logic (hide on scroll down, show on scroll up)
      if (currentScrollY > lastScrollY.current && currentScrollY > 200) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true); // Scrolling up
      }
      
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  useEffect(() => {
    Promise.resolve().then(() => setIsMenuOpen(false));
  }, [location]);

  const navLinks = [
    { name: t('suites', 'nav'), path: '/suites' },
    { name: t('dining', 'nav'), path: '/dining' },
    { name: t('wellness', 'nav'), path: '/wellness' },
    { name: t('contact', 'nav'), path: '/contact' },
  ];

  return (
    <nav 
      ref={navRef}
      className={`
        ${styles.nav} 
        ${isScrolled ? styles.scrolled : ''} 
        ${atTop ? styles.navTransparent : ''} 
        ${!isVisible ? styles.hidden : ''}
      `}
    >
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.wordmark}>Casa d'Oro</span>
          <span className={styles.est}>El Tunco · Est. 1932</span>
        </Link>

        <div className={styles.desktopLinks}>
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className={styles.link}>
              {link.name}
            </Link>
          ))}
          
          {/* Selector de idioma ES | EN */}
          <div className={styles.langSelector}>
            <button 
              className={`${styles.langBtn} ${language === 'es' ? styles.langActive : ''}`} 
              onClick={() => setLanguage('es')}
            >
              ES
            </button>
            <span className={styles.langDivider}>|</span>
            <button 
              className={`${styles.langBtn} ${language === 'en' ? styles.langActive : ''}`} 
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
          </div>

          {/* Área de auth — reemplaza el botón RESERVAR */}
          <div className={styles.navAuthArea}>
            {!isLoaded ? (
              // Mientras Clerk carga — placeholder invisible
              <div className={styles.navAuthPlaceholder} />
            ) : isSignedIn ? (
              // Usuario autenticado
              <div className={styles.userMenu}>
                
                {/* Avatar botón */}
                <button
                  className={styles.userAvatar}
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Menú de usuario"
                >
                  {/* Inicial del usuario */}
                  <span className={styles.avatarInitial}>
                    {user?.firstName?.[0] || 
                     user?.emailAddresses?.[0]
                       ?.emailAddress?.[0]?.toUpperCase()}
                  </span>
                  {/* Indicador admin */}
                  {isAdmin && (
                    <span className={styles.adminBadge} />
                  )}
                </button>

                {/* Dropdown menú */}
                {menuOpen && (
                  <>
                    {/* Backdrop para cerrar */}
                    <div 
                      className={styles.menuBackdrop}
                      onClick={() => setMenuOpen(false)}
                    />
                    
                    <div className={styles.dropdown}>
                      
                      {/* Header del menú */}
                      <div className={styles.dropdownHeader}>
                        <span className={styles.dropdownName}>
                          {user?.firstName} {user?.lastName}
                        </span>
                        <span className={styles.dropdownEmail}>
                          {user?.primaryEmailAddress
                            ?.emailAddress}
                        </span>
                        {isAdmin && (
                          <span className={styles.dropdownRole}>
                            ✦ Administrador
                          </span>
                        )}
                      </div>

                      {/* Opciones de huésped */}
                      <Link
                        to="/mi-cuenta"
                        className={styles.dropdownItem}
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg width="18" height="18" 
                          viewBox="0 0 14 14" fill="none"
                          stroke="currentColor" strokeWidth="0.5">
                          <circle cx="7" cy="5" r="3"/>
                          <path d="M1 13 C1 10 4 8 7 8 
                            C10 8 13 10 13 13"/>
                        </svg>
                        {t('myAccount', 'nav')}
                      </Link>

                      <Link
                        to="/mis-reservaciones"
                        className={styles.dropdownItem}
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg width="18" height="18"
                          viewBox="0 0 14 14" fill="none"
                          stroke="currentColor" strokeWidth="0.5">
                          <rect x="1" y="2" width="12" height="11"/>
                          <path d="M1 6 L13 6"/>
                          <path d="M5 1 L5 4"/>
                          <path d="M9 1 L9 4"/>
                        </svg>
                        {t('myReservations', 'nav')}
                      </Link>

                      {/* Opciones de admin — solo si isAdmin */}
                      {isAdmin && (
                        <>
                          <span className={styles.dropdownSection}>
                            {t('adminHeader', 'nav')}
                          </span>

                          <Link
                            to="/admin"
                            className={styles.dropdownItem}
                            onClick={() => setMenuOpen(false)}
                          >
                            <svg width="18" height="18"
                              viewBox="0 0 14 14" fill="none"
                              stroke="currentColor" strokeWidth="0.5">
                              <rect x="1" y="1" 
                                width="5" height="5"/>
                              <rect x="8" y="1" 
                                width="5" height="5"/>
                              <rect x="1" y="8" 
                                width="5" height="5"/>
                              <rect x="8" y="8" 
                                width="5" height="5"/>
                            </svg>
                            Dashboard
                          </Link>
                        </>
                      )}

                      {/* Cerrar sesión */}
                      <button
                        className={`${styles.dropdownItem} 
                          ${styles.dropdownItemDanger}`}
                        onClick={() => {
                          signOut()
                          navigate('/')
                          setMenuOpen(false)
                        }}
                      >
                        <svg width="18" height="18"
                          viewBox="0 0 14 14" fill="none"
                          stroke="currentColor" strokeWidth="0.5">
                          <path d="M9 2 L13 7 L9 12"/>
                          <path d="M13 7 L5 7"/>
                          <path d="M5 1 L1 1 L1 13 L5 13"/>
                        </svg>
                        {t('logout', 'nav')}
                      </button>

                    </div>
                  </>
                )}
              </div>
            ) : (
              // Usuario no autenticado — botón RESERVAR actual
              <Link to="/login" className={styles.cta}>
                {t('login', 'nav')}
              </Link>
            )}
          </div>

        </div>

        <button 
          className={`${styles.menuToggle} ${isMenuOpen ? styles.open : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className={styles.mobileMenu}
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', width: '100%', padding: '0 2rem' }}>
               {navLinks.map((link) => (
                <Link key={link.path} to={link.path} style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: '#1A1A1A', textDecoration: 'none' }}>
                  {link.name}
                </Link>
              ))}
              
              {/* Selector de idioma en móvil */}
              <div className={styles.mobileLangSelector}>
                <button 
                  className={`${styles.mobileLangBtn} ${language === 'es' ? styles.mobileLangActive : ''}`} 
                  onClick={() => setLanguage('es')}
                >
                  ESPAÑOL
                </button>
                <span className={styles.mobileLangDivider}>·</span>
                <button 
                  className={`${styles.mobileLangBtn} ${language === 'en' ? styles.mobileLangActive : ''}`} 
                  onClick={() => setLanguage('en')}
                >
                  ENGLISH
                </button>
              </div>
              
              {isLoaded && (
                isSignedIn ? (
                  <>
                    <div className={styles.mobileUserInfo}>
                      <span className={styles.mobileUserName}>{user?.firstName} {user?.lastName}</span>
                      <span className={styles.mobileUserEmail}>{user?.primaryEmailAddress?.emailAddress}</span>
                    </div>
                    
                    <Link to="/mi-cuenta" className={styles.mobileUserLink}>
                      {t('myAccount', 'nav')}
                    </Link>
                    
                    <Link to="/mis-reservaciones" className={styles.mobileUserLink}>
                      {t('myReservations', 'nav')}
                    </Link>
                    
                    {isAdmin && (
                      <Link to="/admin" className={styles.mobileUserLink} style={{ color: 'var(--color-gold)', fontWeight: 500 }}>
                        {t('adminPanel', 'nav')}
                      </Link>
                    )}
                    
                    <button
                      className={styles.mobileLogoutBtn}
                      onClick={() => {
                        signOut();
                        navigate('/');
                        setIsMenuOpen(false);
                      }}
                    >
                      {t('logout', 'nav')}
                    </button>
                  </>
                ) : (
                  <Link to="/login" className={styles.mobileLoginLink}>
                    {t('login', 'nav')}
                  </Link>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
