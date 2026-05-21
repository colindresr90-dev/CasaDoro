import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import styles from './Home.module.css';
import { useScrollCinema } from '../hooks/useScrollCinema';
import { useSuites } from '../hooks/useSuites';
import SectionArrow from '../components/SectionArrow';
import { useLanguage } from '../context/LanguageContext';

const FALLBACK_SUITES = [
  {
    slug: 'planter-loft',
    nombre: 'Planter Loft',
    tipo: 'Santuario de Jardín',
    disponible: true,
  },
  {
    slug: 'reef-sanctuary',
    nombre: 'Reef Sanctuary',
    tipo: 'Santuario Frente al Mar',
    disponible: true,
  },
  {
    slug: 'pacific-vault',
    nombre: 'Pacific Vault',
    tipo: 'Suite Master',
    disponible: true,
  },
  {
    slug: 'master-suite',
    nombre: 'Casa Presidencial',
    tipo: 'Suite Signature',
    disponible: true,
  }
];

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const Home = () => {
  useScrollCinema();
  const { suites = [] } = useSuites();
  const { t, language, translations } = useLanguage();
  const displaySuites = suites && suites.length > 0 ? suites : FALLBACK_SUITES;
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const wordmarkRef = useRef(null);
  const taglineRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const preloaderRef = useRef(null);
  const preloaderLogoRef = useRef(null);
  const preloaderLineRef = useRef(null);

  const handleVideoLoad = () => {
    gsap.to(videoRef.current, {
      opacity: 1,
      duration: 1.5,
      ease: 'power2.out'
    });
  };

  useEffect(() => {
    document.title = t('seoTitle', 'home');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', t('seoDesc', 'home'));
    }
  }, [language, t]);

  useEffect(() => {
    // Forzar scroll al inicio y prevenir restauración automática del navegador
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    let ctx = gsap.context(() => {
      // 1. Hero Entrance Timeline
      const tl = gsap.timeline();
      
      const hasSeenPreloader = sessionStorage.getItem('hasSeenPreloader');

      if (!hasSeenPreloader) {
        sessionStorage.setItem('hasSeenPreloader', 'true');
        
        // Preloader Animation
        tl.to(preloaderLineRef.current, {
          left: '0%',
          duration: 1.2,
          ease: 'power3.inOut'
        })
        .to(preloaderLineRef.current, {
          left: '100%',
          duration: 0.8,
          ease: 'power3.inOut',
          delay: 0.2
        })
        .to(preloaderLogoRef.current, {
          opacity: 0,
          y: -10,
          duration: 0.6,
          ease: 'power2.inOut'
        }, '-=0.4')
        .to(preloaderRef.current, {
          opacity: 0,
          duration: 1,
          ease: 'power2.inOut',
          onComplete: () => {
            if (preloaderRef.current) {
              preloaderRef.current.style.display = 'none';
            }
          }
        }, '-=0.2')
        
        // Hero content reveals
        const chars = wordmarkRef.current.querySelectorAll(`.${styles.char}`);
        const taglineLines = taglineRef.current.querySelectorAll('.tagline-line');
        const taglineText = taglineRef.current.querySelector('.tagline-text');

        tl.fromTo(chars, {
          opacity: 0,
          y: 40,
          rotateX: 30,
          scale: 0.95,
          filter: 'blur(4px)'
        }, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.5,
          ease: 'power3.out',
          stagger: 0.05
        }, '-=0.1')
        .fromTo(taglineLines, {
          scaleX: 0
        }, {
          scaleX: 1,
          duration: 0.8,
          ease: 'power3.inOut'
        }, '-=1.2')
        .fromTo(taglineText, {
          opacity: 0,
          y: 15,
          letterSpacing: '0.55em'
        }, {
          opacity: 1,
          y: 0,
          letterSpacing: '0.35em',
          duration: 0.9,
          ease: 'power3.out'
        }, '-=1.0')
        .to(scrollIndicatorRef.current, {
          opacity: 1,
          duration: 0.8
        }, '-=0.6');
      } else {
        // Skip preloader
        gsap.set(preloaderRef.current, { display: 'none' });
        
        const chars = wordmarkRef.current.querySelectorAll(`.${styles.char}`);
        const taglineLines = taglineRef.current.querySelectorAll('.tagline-line');
        const taglineText = taglineRef.current.querySelector('.tagline-text');

        tl.fromTo(chars, {
          opacity: 0,
          y: 40,
          rotateX: 30,
          scale: 0.95,
          filter: 'blur(4px)'
        }, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.5,
          ease: 'power3.out',
          stagger: 0.05,
          delay: 0.3
        })
        .fromTo(taglineLines, {
          scaleX: 0
        }, {
          scaleX: 1,
          duration: 0.8,
          ease: 'power3.inOut'
        }, '-=1.2')
        .fromTo(taglineText, {
          opacity: 0,
          y: 15,
          letterSpacing: '0.55em'
        }, {
          opacity: 1,
          y: 0,
          letterSpacing: '0.35em',
          duration: 0.9,
          ease: 'power3.out'
        }, '-=1.0')
        .to(scrollIndicatorRef.current, {
          opacity: 1,
          duration: 0.8
        }, '-=0.6');
      }

      // 2. Section Dividers scaleX animation
      const dividers = document.querySelectorAll(`.${styles.sectionDivider}`);
      dividers.forEach(divider => {
        gsap.to(divider, {
          scaleX: 1,
          duration: 1.5,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: divider,
            start: 'top 90%',
          }
        });
      });

      // 3. Icons: draw stroke from 0
      document.querySelectorAll(`.${styles.colIcon}, .${styles.statIcon}`).forEach(icon => {
        const paths = icon.querySelectorAll('path, line, circle');
        paths.forEach(path => {
          const len = path.getTotalLength?.() || 100;
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: icon, start: 'top 85%' }
          });
        });
      });
    });

    return () => ctx.revert();
  }, [t]);

  return (
    <div ref={containerRef}>
      <h1 className={styles.srOnly}>
        {t('seoTitle', 'home')}
      </h1>

      {/* PRELOADER */}
      <div className={styles.preloader} ref={preloaderRef}>
        <div className={styles.preloaderLogo} ref={preloaderLogoRef}>
          Casa d'Oro
        </div>
        <div className={styles.preloaderLineContainer}>
          <div className={styles.preloaderLine} ref={preloaderLineRef} />
        </div>
      </div>

      {/* HERO SECTION */}
      <section 
        id="hero"
        className={styles.hero} 
        ref={heroRef}
        aria-label="Vista aérea de la piscina del hotel de lujo Casa d'Oro, El Tunco, El Salvador"
      >
        <div className={styles.heroBg}>
          <video
            ref={videoRef}
            className={styles.heroVideo}
            autoPlay
            muted
            loop
            playsInline
            poster="/Home-Hero.jpg"
            onLoadedData={handleVideoLoad}
          >
            <source src="/Hero-video.mp4" type="video/mp4" />
          </video>
          <div className={styles.heroOverlay} />
          <div className={styles.filmGrain} />
        </div>
        
        <div className={styles.heroContent}>
          <div className={styles.wordmark} ref={wordmarkRef}>
            {"Casa d'Oro".split("").map((char, index) => (
              <span 
                key={index} 
                className={`${styles.char}${char === ' ' ? ` ${styles.charSpace}` : ''}`}
              >
                {char}
              </span>
            ))}
          </div>
          
          <div className={styles.heroTagline} ref={taglineRef}>
            <span className={`${styles.taglineLine} tagline-line`} />
            <span className={`${styles.taglineText} tagline-text`}>EL TUNCO · EST. 1952</span>
            <span className={`${styles.taglineLine} tagline-line`} />
          </div>

          <button 
            className={styles.heroScrollCta} 
            ref={scrollIndicatorRef}
            onClick={() => {
              gsap.to(window, {
                scrollTo: '#legado',
                duration: 1.2,
                ease: 'power3.inOut'
              });
            }}
            aria-label="Ir a la siguiente sección"
          >
            <span className={styles.scrollText}>{t('discoverMore', 'home')}</span>
            <div className={styles.scrollLine}>
              <div className={styles.scrollLineInner} />
            </div>
          </button>
        </div>
      </section>

      {/* STORY SECTION */}
      <section id="legado" className={styles.storySection}>
        <div className={styles.sectionEyebrow}>
          <span className={styles.eyebrowLine} />
          <span className={styles.eyebrowLabel}>{t('theLegacy', 'home')}</span>
        </div>


        <div className={styles.storyGrid}>
          {/* Column 1: Pull Quote */}
          <div className={styles.storyQuoteCol}>
            <blockquote className={`${styles.storyQuote} reveal-up`}>
              {t('storyQuote', 'home')}
            </blockquote>
            <div className={styles.quoteAttribution}>
              <span className={styles.attrLine} />
              <span className={styles.attrText}>CASA D'ORO</span>
            </div>
          </div>

          {/* Vertical gold divider */}
          <div className={`${styles.storyDivider} draw-line-v`} aria-hidden="true" />

          {/* Column 2 */}
          <div className={`${styles.storyTextCol} reveal-up`}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" 
              stroke="#C9A96E" strokeWidth="1" className={styles.colIcon}>
              <path d="M14 24 C14 24 6 18 6 11 C6 7 9.5 4 14 4 C18.5 4 22 7 22 11 C22 18 14 24 14 24Z"/>
              <path d="M14 4 C14 4 17 8 17 11"/>
              <path d="M14 24 L14 28"/>
              <path d="M10 26 L18 26"/>
            </svg>
            <h3 className={styles.colEyebrow}>{t('originsTitle', 'home')}</h3>
            <p>
              {t('originsText', 'home')}
            </p>
          </div>

          {/* Column 3 */}
          <div className={`${styles.storyTextCol} reveal-up`}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" 
              stroke="#C9A96E" strokeWidth="1" className={styles.colIcon}>
              <path d="M6 24 L6 14 C6 9 9.5 5 14 5 C18.5 5 22 9 22 14 L22 24"/>
              <line x1="3" y1="24" x2="25" y2="24"/>
              <line x1="6" y1="18" x2="22" y2="18"/>
            </svg>
            <h3 className={styles.colEyebrow}>{t('restorationTitle', 'home')}</h3>
            <p>
              {t('restorationText', 'home')}
            </p>
          </div>
        </div>


        <div className={`${styles.sectionDivider} draw-line-h`} />
        <SectionArrow targetId="suites" variant="light" />
      </section>

      {/* SUITES PREVIEW */}
      <section id="suites" className={styles.suitesPreview}>
        <div className="container">
          <h2 className="reveal-headline" style={{ color: 'var(--text-light)', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '1.25rem', fontWeight: 300, marginBottom: '32px' }}>
            {t('suitesHeading', 'home')}
          </h2>
          <div className={styles.previewGrid}>
            {displaySuites.map((suite) => {
              const imageFallback = suite.slug === 'planter-loft' ? '/suites/planters-loft.png' : `/suites/${suite.slug}.png`;
              const imageUrl = suite.imagen_hero_url || imageFallback;
              const suiteTrans = translations?.suites?.suiteData?.[suite.slug];
              const suiteName = suiteTrans?.nombre || suite.nombre;
              const suiteType = suiteTrans?.tipo || suite.tipo;

              return (
                <div key={suite.slug} className={`${styles.cardGlowWrapper} reveal-scale`}>
                  <div 
                    className={styles.suiteCard}
                    aria-label={`${suiteName} — suite privada en Casa d'Oro, El Tunco`}
                  >
                    <img 
                      src={imageUrl} 
                      alt={suiteName} 
                      className={styles.suiteImage} 
                    />
                    <div className={styles.cardDarken} />
                    <div className={styles.cardOverlay}>
                      <p style={{ fontFamily: 'var(--font-smallcaps)', fontSize: '0.8rem', fontWeight: 500, color: '#C9A96E', letterSpacing: '0.25em', marginBottom: '8px' }}>
                        {suiteType}
                      </p>
                      <h3 className={styles.suiteTitle}>{suiteName}</h3>
                      <Link to={`/reservar/${suite.slug}`} className={styles.suiteDesc} style={{ textDecoration: 'none' }}>
                        {t('exploreSantuario', 'home')}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="reveal-up" style={{ marginTop: '60px', textAlign: 'center' }}>
            <Link to="/suites" className="hover-trigger" style={{ color: '#C9A96E', textTransform: 'uppercase', letterSpacing: '0.25em', fontSize: '0.95rem', fontWeight: 500, fontFamily: 'var(--font-smallcaps)', textDecoration: 'none' }}>
              {t('exploreAllSuites', 'home')}
            </Link>
          </div>
        </div>
        <div className={styles.sectionDivider} />
        <SectionArrow targetId="filosofia" variant="dark" />
      </section>

      {/* PHILOSOPHY & HUB */}
      <section id="filosofia" className={styles.philosophy}>

        {/* ── QUOTE PRINCIPAL — mantener existente ── */}
        <div className={styles.quoteBlock}>
          <span className={styles.quoteEyebrow}>
            <span className={styles.eyebrowLine} />
            <span className={styles.eyebrowText}>{t('ourPhilosophy', 'home')}</span>
            <span className={styles.eyebrowLine} />
          </span>
          <blockquote className={`${styles.quoteMain} ${styles.goldGradientText}`}>
            {t('philosophyQuote', 'home')}
          </blockquote>
          <p className={styles.quoteSub}>
            Casa d'Oro — El Tunco, El Salvador
          </p>
        </div>

        {/* ── DIVIDER DORADO ── */}
        <div className={styles.sectionDivider} />

        {/* ── GRID DE INFORMACIÓN ── */}
        <div className={styles.infoGrid}>

          {/* Columna 1 — Contacto */}
          <div className={styles.infoCol}>
            <span className={styles.infoEyebrow}>{t('contact', 'nav')}</span>
            <ul className={styles.infoList}>
              <li className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <svg width="12" height="12" viewBox="0 0 12 12" 
                    fill="none" stroke="#C9A96E" strokeWidth="1">
                    <path d="M6 1 C3.2 1 1 3.2 1 6 C1 8.8 3.2 11 6 11 
                      C8.8 11 11 8.8 11 6 C11 3.2 8.8 1 6 1Z"/>
                    <path d="M6 3.5 L6 6 L8 7.5"/>
                  </svg>
                </span>
                <span>{t('checkIn', 'home')}</span>
              </li>
              <li className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <svg width="12" height="12" viewBox="0 0 12 12" 
                    fill="none" stroke="#C9A96E" strokeWidth="1">
                    <path d="M6 1 C3.2 1 1 3.2 1 6 C1 8.8 3.2 11 6 11 
                      C8.8 11 11 8.8 11 6 C11 3.2 8.8 1 6 1Z"/>
                    <path d="M6 3.5 L6 6 L8 7.5"/>
                  </svg>
                </span>
                <span>{t('checkOut', 'home')}</span>
              </li>
              <li className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <svg width="12" height="12" viewBox="0 0 12 12"
                    fill="none" stroke="#C9A96E" strokeWidth="1">
                    <path d="M2 2 C2 2 3 1 4 2 L5.5 4 C5.5 4 6 4.5 
                      5 5.5 C4 6.5 5.5 8 6.5 9 C7.5 10 9 11.5 
                      10 10.5 C11 9.5 11.5 10 11.5 10 L10 11.5 
                      C9 12.5 5 10 3 8 C1 6 -0.5 2 0.5 1 Z"/>
                  </svg>
                </span>
                <span>+503 7000 0000</span>
              </li>
              <li className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <svg width="12" height="12" viewBox="0 0 12 12"
                    fill="none" stroke="#C9A96E" strokeWidth="1">
                    <rect x="1" y="2.5" width="10" height="7" 
                      rx="0" ry="0"/>
                    <path d="M1 3 L6 7 L11 3"/>
                  </svg>
                </span>
                <span>reservas@casadoro.com</span>
              </li>
            </ul>
          </div>

          {/* Columna 2 — Ubicación */}
          <div className={styles.infoCol}>
            <span className={styles.infoEyebrow}>{language === 'es' ? 'Ubicación' : 'Location'}</span>
            <ul className={styles.infoList}>
              <li className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <svg width="12" height="12" viewBox="0 0 12 12"
                    fill="none" stroke="#C9A96E" strokeWidth="1">
                    <path d="M6 1 C3.8 1 2 2.8 2 5 C2 8 6 11 6 11 
                      C6 11 10 8 10 5 C10 2.8 8.2 1 6 1Z"/>
                    <circle cx="6" cy="5" r="1.5"/>
                  </svg>
                </span>
                <span>El Tunco, La Libertad</span>
              </li>
              <li className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <svg width="12" height="12" viewBox="0 0 12 12"
                    fill="none" stroke="#C9A96E" strokeWidth="1">
                    <path d="M6 1 C3.8 1 2 2.8 2 5 C2 8 6 11 6 11 
                      C6 11 10 8 10 5 C10 2.8 8.2 1 6 1Z"/>
                    <circle cx="6" cy="5" r="1.5"/>
                  </svg>
                </span>
                <span>El Salvador, C.A.</span>
              </li>
              <li className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <svg width="12" height="12" viewBox="0 0 12 12"
                    fill="none" stroke="#C9A96E" strokeWidth="1">
                    <rect x="1" y="1" width="10" height="10"/>
                    <path d="M1 5 L11 5"/>
                    <path d="M6 1 L6 11"/>
                  </svg>
                </span>
                <span>FJV8+76 Tamanique</span>
              </li>
              <li className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <svg width="12" height="12" viewBox="0 0 12 12"
                    fill="none" stroke="#C9A96E" strokeWidth="1">
                    <path d="M1 6 L4 3 L8 9 L10 7 L11 8"/>
                  </svg>
                </span>
                <span>{t('hourFrom', 'home')}</span>
              </li>
            </ul>
          </div>

          {/* Columna 3 — Links rápidos */}
          <div className={styles.infoCol}>
            <span className={styles.infoEyebrow}>{t('exploreTitle', 'home')}</span>
            <ul className={styles.infoList}>
              <li className={styles.infoItem}>
                <Link to="/suites" className={styles.infoLink}>
                  {t('suites', 'nav')} →
                </Link>
              </li>
              <li className={styles.infoItem}>
                <Link to="/dining" className={styles.infoLink}>
                  {t('dining', 'nav')} →
                </Link>
              </li>
              <li className={styles.infoItem}>
                <Link to="/wellness" className={styles.infoLink}>
                  {t('wellness', 'nav')} →
                </Link>
              </li>
              <li className={styles.infoItem}>
                <Link to="/contact" className={styles.infoLink}>
                  {t('contact', 'nav')} →
                </Link>
              </li>
              <li className={styles.infoItem}>
                <Link to="/login" className={styles.infoLink}>
                  {t('login', 'nav')} →
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ── GOOGLE MAPS EMBED ── */}
        <div className={`${styles.mapWrapper} relative w-full`}>
          <div className={styles.mapContainer}>
            <div className={styles.mapHeader}>
              <span className={styles.mapHeaderLeft}>{t('howToGetThere', 'home')}</span>
              <span className={styles.mapHeaderRight}>El Tunco, La Libertad, El Salvador</span>
            </div>
            <iframe
              className={styles.mapIframe}
              title="Casa d'Oro — El Tunco, El Salvador"
              src="https://maps.google.com/maps?q=FJV8%2B76+Tamanique,+El+Salvador&t=m&z=15&ie=UTF8&iwloc=&output=embed"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a 
            href="https://goo.gl/maps/YourActualLinkGoesHere"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapCta}
          >
            {t('openGoogleMaps', 'home')}
          </a>
        </div>

        {/* ── FOOTER MINIMAL ── */}
        <div className={styles.footer}>
          <div className={styles.footerDivider} />
          <div className={styles.footerContent}>
            <span className={styles.footerLogo}>Casa d'Oro</span>
            <span className={styles.footerMeta}>
              © 2024 · {t('address', 'footer')}
            </span>
            <span className={styles.footerMeta}>
              Est. 1952
            </span>
          </div>
        </div>

      </section>
    </div>
  );
};

export default Home;
