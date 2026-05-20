import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { getSuites } from '../lib/supabase';
import styles from './Suites.module.css';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const PriceTicker = ({ value }) => {
  const digits = value.toString().split('');
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const columns = containerRef.current.querySelectorAll(`.${styles.tickerColumn}`);
    
    // Kill previous animations for this component if any
    gsap.killTweensOf(columns);

    const section = containerRef.current.closest('section') || containerRef.current;

    gsap.fromTo(columns, 
      { y: 0 },
      {
        y: (i, target) => {
          const digit = parseInt(target.getAttribute('data-digit'));
          return `-${digit * 44}px`; // Sincronizado con el nuevo alto de 44px en CSS
        },
        duration: 1.5,
        delay: 0.2,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: section,
          start: "top 95%",
        }
      }
    );
  }, [value]);

  return (
    <div className={styles.priceAmount} ref={containerRef}>
      {digits.map((digit, i) => (
        <div key={i} className={styles.tickerColumn} data-digit={digit}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <span key={num} className={styles.tickerDigit}>{num}</span>
          ))}
        </div>
      ))}
    </div>
  );
};

const AMENITIES_FALLBACK = {
  "planter": ["Vista al jardín", "Cama King", "Techo alto", "AC", "WiFi"],
  "reef": ["Vista al arrecife", "Terraza privada", "Cama King", "AC", "WiFi"],
  "vault": ["Piscina privada", "Piedra volcánica", "Cama King", "AC", "WiFi"],
  "master": ["Vista 180° al mar", "Piscina", "Sala", "Servicio dedicado", "WiFi"]
};

export default function Suites() {
  const [suites, setSuites] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const heroRef = useRef(null);
  const sectionRefs = useRef([]);

  const scrollToNext = (index) => {
    const nextIndex = (index + 1) % suites.length;
    gsap.to(window, {
      duration: 0.8,
      scrollTo: sectionRefs.current[nextIndex],
      ease: "power4.out"
    });
  };

  useEffect(() => {
    const fetchSuites = async () => {
      try {
        const data = await getSuites();
        setSuites(data || []);
      } catch (err) {
        console.error("Error fetching suites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuites();
  }, []);

  useEffect(() => {
    if (loading || suites.length === 0) return;

    const ctx = gsap.context(() => {
      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReducedMotion) return;

      sectionRefs.current.forEach((section) => {
        if (!section) return;

        const watermark = section.querySelector(`.${styles.suiteWatermark}`);
        const name = section.querySelector(`.${styles.suiteName}`);
        const card = section.querySelector(`.${styles.floatingContent}`);
        const image = section.querySelector(`.${styles.suiteImage}`);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 95%",
          }
        });

        if (watermark) tl.from(watermark, { opacity: 0, x: -30, duration: 1, ease: "power2.out" });
        if (name) tl.from(name, { opacity: 0, y: 20, duration: 0.8, ease: "power3.out" }, "-=0.8");
        if (card) tl.from(card, { opacity: 0, y: 15, duration: 0.8, ease: "power3.out" }, "-=0.6");

        gsap.to(image, {
          y: "10%",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      });
    }, scrollRef);

    return () => ctx.revert();
  }, [loading, suites]);

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      const titleLas = heroRef.current?.querySelector(`.${styles.titleLas}`);
      const titleSuites = heroRef.current?.querySelector(`.${styles.titleSuites}`);
      const subtitle = heroRef.current?.querySelector(`.${styles.heroSubtitle}`);
      const separator = heroRef.current?.querySelector(`.${styles.heroSeparator}`);
      const scrollInd = heroRef.current?.querySelector(`.${styles.heroScrollIndicator}`);

      const ease = "power2.out"; // Close to cubic-bezier(0.25, 0.46, 0.45, 0.94)

      tl.fromTo(titleLas, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 1, ease }, 0)
        .fromTo(titleSuites, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 1, ease }, 0.2)
        .fromTo(subtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease }, 0.5)
        .fromTo(separator, { scaleX: 0 }, { scaleX: 1, duration: 1, ease }, 0.8)
        .fromTo(scrollInd, { opacity: 0 }, { opacity: 1, duration: 1, ease }, 1.2);

    }, heroRef);

    return () => ctx.revert();
  }, [loading]);

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loader}></div>
        <span>Cargando santuarios...</span>
      </div>
    );
  }

  if (suites.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>Próximamente</h2>
        <p>Nuestras suites están siendo preparadas para su llegada.</p>
        <Link to="/" className={styles.btnBack}>Volver al inicio</Link>
      </div>
    );
  }

  return (
    <main className={styles.page} ref={scrollRef}>
      {/* HERO SECTION */}
      <section className={styles.heroSection} ref={heroRef}>
        <img src="/Suites-hero.png" alt="Casa d'Oro Suites" className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.titleLas}>Las</span>
            <span className={styles.titleSuites}>Suites</span>
          </h1>
          
          <p className={styles.heroSubtitle}>
            Cuatro refugios privados frente al Pacífico
          </p>
        </div>

        <div className={styles.heroScrollIndicator} onClick={() => scrollToNext(-1)}>
          <span className={styles.scrollText}>DESCUBRIR LAS SUITES</span>
          <svg className={styles.scrollArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 13l5 5 5-5M12 6v12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {suites.map((suite, index) => {
        // Amenities Logic with fallback
        let amenidades;
        try {
          amenidades = typeof suite.amenidades === 'string' 
            ? JSON.parse(suite.amenidades) 
            : (suite.amenidades || []);
        } catch {
          amenidades = [];
        }

        if (!amenidades || amenidades.length === 0) {
          const suiteNameLower = suite.nombre.toLowerCase();
          const key = Object.keys(AMENITIES_FALLBACK).find(k => suiteNameLower.includes(k)) || "planter";
          amenidades = AMENITIES_FALLBACK[key];
        }

        return (
          <section 
            key={suite.id} 
            ref={el => sectionRefs.current[index] = el} 
            className={styles.suite}
          >
            <div className={styles.imageWrapper}>
              <img src={suite.imagen_hero_url} alt={suite.nombre} className={styles.suiteImage} />
              <div className={styles.imageOverlay} />
            </div>

            <div className={styles.suiteContainer}>
              {/* Left Info Zone (Bottom Aligned) */}
              <div className={styles.infoZone}>
                <div className={styles.suiteWatermark}>0{index + 1}</div>
                <h2 className={styles.suiteName}>{suite.nombre}</h2>
              </div>

              {/* Right Content Zone (Floating Content) */}
              <div className={styles.cardZone}>
                <div className={styles.floatingContent}>
                  
                  {/* BLOQUE 3: PRECIO INTEGRADO */}
                  <div className={styles.priceIntegrated}>
                    <span className={styles.priceCurrency}>USD</span>
                    <PriceTicker value={Math.round(suite.precio_por_noche || 0)} />
                    <span className={styles.priceNoche}>/ noche</span>
                  </div>

                  {/* BLOQUE 1: DESCRIPCIÓN */}
                  <div className={styles.descriptionWrapper}>
                    <p className={styles.suiteDesc}>{suite.descripcion}</p>
                    {suite.vibe && <em className={styles.moodTag}>"{suite.vibe}"</em>}
                  </div>
                  
                  {/* BLOQUE 2: AMENIDADES */}

                  <div className={styles.amenitiesGrid}>
                    {amenidades.slice(0, 4).map((amenity, i) => (
                      <div key={i} className={styles.amenityCell}>
                        <svg className={styles.amenityIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 8v8M8 12h8" />
                        </svg>
                        <span className={styles.amenityText}>{amenity}</span>
                      </div>
                    ))}
                  </div>

                  {/* BLOQUE 4: BOTONES */}
                  <div className={styles.actionZone}>
                    <Link to={`/reservar/${suite.slug}`} className={styles.btnPrimary}>
                      Reservar esta suite
                    </Link>
                    
                    <Link to={`/suites/${suite.slug}`} className={styles.textLink}>
                      <span>Ver detalles</span>
                      <svg className={styles.linkArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </section>
        );
      })}
    </main>
  );
}
