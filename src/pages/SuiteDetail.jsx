import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSuiteBySlug, getSuites } from '../lib/supabase';
import styles from './SuiteDetail.module.css';
import gsap from 'gsap';

const GoldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.goldIcon}>
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
  </svg>
);

const AmenityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.2">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const SuiteDetail = () => {
  const { slug } = useParams();
  const [suite, setSuite] = useState(null);
  const [otherSuites, setOtherSuites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const FEATURE_FALLBACKS = [
    "Cama King con dosel de teca",
    "Ventanal de piso a techo",
    "Baño en caliza",
    "Desayuno buffet incluido"
  ];

  const AMENITY_FALLBACKS = [
    "WiFi",
    "Aire acondicionado",
    "Caja fuerte",
    "Minibar",
    "Escritorio de época",
    "Mosquitera de lino"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [suiteData, allSuites] = await Promise.all([
          getSuiteBySlug(slug),
          getSuites()
        ]);
        
        setSuite(suiteData);
        if (allSuites) {
          setOtherSuites(allSuites.filter(s => s.slug !== slug).slice(0, 3));
        }

        // Set document metadata dynamically
        if (suiteData) {
          document.title = `${suiteData.nombre} | Casa d'Oro – El Tunco, El Salvador`;
          const meta = document.querySelector('meta[name="description"]');
          if (meta) {
            meta.setAttribute('content', `${suiteData.nombre}: ${suiteData.descripcion || suiteData.vibe || "Suite de lujo en Casa d'Oro en El Tunco, El Salvador."}`);
          }
        }
      } catch (err) {
        console.error('Error loading suite data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!loading && suite) {
      const chars = document.querySelectorAll(`.${styles.char}`);
      if (chars.length > 0) {
        gsap.fromTo(chars, {
          opacity: 0,
          y: 40,
          rotateX: 25,
          scale: 0.95,
          filter: 'blur(3px)'
        }, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'power3.out',
          stagger: 0.03,
          delay: 0.2
        });
      }
    }
  }, [loading, suite]);

  if (loading) return <div className={styles.loading}>SANTUARIO CARGANDO...</div>;
  if (!suite) return <div className={styles.error}>SUITE NO ENCONTRADA. <Link to="/suites">VOLVER</Link></div>;

  // Parse JSON fields
  const parseJSON = (field, fallback) => {
    if (!field) return fallback;
    if (Array.isArray(field)) return field.length > 0 ? field : fallback;
    try {
      const parsed = typeof field === 'string' ? JSON.parse(field) : field;
      return parsed && parsed.length > 0 ? parsed : fallback;
    } catch {
      return fallback;
    }
  };

  const caracteristicas = parseJSON(suite.caracteristicas, FEATURE_FALLBACKS);
  const amenidades = parseJSON(suite.amenidades, AMENITY_FALLBACKS);
  const imagenes = parseJSON(suite.imagenes, []);

  return (
    <div className={styles.container}>
      {/* PART 1 — LA FOTO PRINCIPAL */}
      <section className={styles.hero}>
        <div className={styles.filmGrain} />
        <img src={suite.imagen_hero_url} alt={suite.nombre} className={styles.heroImage} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <span className={styles.suiteType}>{suite.tipo}</span>
            <h1 className={styles.suiteTitle}>
              {suite.nombre.split('').map((char, index) => (
                <span key={index} className={styles.char}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>
            <span className={styles.heroPrice}>Desde ${suite.precio_por_noche} USD / noche</span>
            {suite.vibe && <p className={styles.heroVibe}>"{suite.vibe}"</p>}
          </div>
          <Link to={`/reservar/${suite.slug}`} className={styles.heroBtn}>
            RESERVAR ESTA SUITE
          </Link>
        </div>
      </section>

      {/* PART 2 — LA DESCRIPCIÓN */}
      <section className={styles.section}>
        <div className={styles.descriptionGrid}>
          <div className={styles.descText}>
            <p>{suite.descripcion_larga || suite.descripcion}</p>
          </div>
          <div className={`${styles.infoCard} glass-gold`}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>TIPO</span>
              <span className={styles.infoValue}>{suite.tipo}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>TAMAÑO</span>
              <span className={styles.infoValue}>{suite.metros_cuadrados} m²</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>HUÉSPEDES</span>
              <span className={styles.infoValue}>{suite.capacidad_adultos + (suite.capacidad_ninos || 0)} Personas</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>CHECK-IN</span>
              <span className={styles.infoValue}>15:00 PM</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>CHECK-OUT</span>
              <span className={styles.infoValue}>11:00 AM</span>
            </div>
            <div className={styles.infoRow} style={{ border: 'none', marginTop: '10px' }}>
              <span className={styles.infoLabel}>PRECIO</span>
              <span className={`${styles.infoValue} ${styles.infoPrice}`}>${suite.precio_por_noche}</span>
            </div>
          </div>
        </div>
      </section>

      {/* PART 3 — LO QUE LA HACE ESPECIAL */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>DETALLES EXCLUSIVOS</h2>
        <div className={styles.featuresGrid}>
          {caracteristicas.map((feat, i) => (
            <div key={i} className={`${styles.featureItem} glass-subtle`} style={{ padding: '30px', borderRadius: '4px' }}>
              <GoldIcon />
              <span className={styles.featureText}>{feat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PART 4 — LO QUE INCLUYE */}
      <section className={styles.amenitiesSection}>
        <h2 className={styles.sectionTitle}>AMENIDADES & SERVICIOS</h2>
        <div className={styles.amenitiesGrid}>
          {amenidades.map((amenity, i) => (
            <div key={i} className={styles.amenityItem}>
              <AmenityIcon />
              <span className={styles.amenityText}>{amenity}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PART 5 — FOTOS DE LA SUITE */}
      <section className={styles.gallerySection}>
        <div className={styles.galleryGrid}>
          {imagenes.map((img, i) => (
            <img 
              key={i} 
              src={img.url || img} 
              alt={`${suite.nombre} - ${i + 1}`} 
              className={styles.galleryImage}
              onClick={() => setSelectedImage(img.url || img)}
            />
          ))}
        </div>
      </section>

      {/* PART 6 — RESERVAR */}
      <section className={styles.ctaSection}>
        <span className={styles.ctaPrice}>USD {suite.precio_por_noche} / noche</span>
        <Link to={`/reservar/${suite.slug}`} className={styles.heroBtn} style={{ fontSize: '16px', padding: '24px 60px' }}>
          RESERVAR ESTA SUITE
        </Link>
      </section>

      {/* PART 7 — OTRAS SUITES */}
      {otherSuites.length > 0 && (
        <section className={styles.othersSection}>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'left', marginBottom: '40px' }}>EXPLORE OTROS SANTUARIOS</h2>
          <div className={styles.othersGrid}>
            {otherSuites.map((s) => (
              <Link key={s.id} to={`/suites/${s.slug}`} className={`${styles.otherCard} glass-subtle`} style={{ padding: '20px', borderRadius: '4px' }}>
                <img src={s.imagen_hero_url} alt={s.nombre} className={styles.otherThumb} />
                <span className={styles.otherName}>{s.nombre}</span>
                <span className={styles.otherPrice}>DESDE ${s.precio_por_noche} USD</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div className={styles.lightbox} onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Large view" className={styles.lightboxImg} />
        </div>
      )}
    </div>
  );
};

export default SuiteDetail;
