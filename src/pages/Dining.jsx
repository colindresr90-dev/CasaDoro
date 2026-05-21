import { useEffect } from 'react';
import styles from './Dining.module.css';
import { useScrollCinema } from '../hooks/useScrollCinema';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';

import dish1 from '../assets/images/dining/dish1.png';
import dish2 from '../assets/images/dining/dish2.png';
import dish3 from '../assets/images/dining/dish3.png';
import dish4 from '../assets/images/dining/dish4.png';
import dish5 from '../assets/images/dining/dish5.png';
import dish6 from '../assets/images/dining/dish6.png';

const DISHES_EDITORIAL = [
  { id: 1, image: dish1 },
  { id: 2, image: dish2 },
  { id: 3, image: dish3 },
  { id: 4, image: dish4 },
  { id: 5, image: dish5 },
  { id: 6, image: dish6 }
];

const Dining = () => {
  useScrollCinema();
  const { t, language, translations } = useLanguage();

  // Handle page title and SEO description updates when language changes
  useEffect(() => {
    document.title = t('seoTitle', 'dining');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('seoDesc', 'dining'));
    }
  }, [language, t]);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: "Restaurante Casa d'Oro",
        image: 'https://casadoro.com/images/dining/hero.png',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Km 42 Carretera El Litoral',
          addressLocality: 'El Tunco',
          addressRegion: 'La Libertad',
          addressCountry: 'SV'
        },
        servesCuisine: 'Alta Cocina del Mar, Michelin-inspired',
        priceRange: '$$$$',
        openingHours: 'Mo-Su 18:00-23:00'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Matteo Solís',
        jobTitle: 'Chef Ejecutivo',
        description: "Chef de alta cocina del mar en Casa d'Oro, El Tunco, El Salvador. Formado en restaurants Michelin de Italia y Francia.",
        worksFor: {
          '@type': 'Restaurant',
          name: "Casa d'Oro"
        },
        image: 'https://casadoro.com/Chef.png'
      }
    ]);
    document.head.appendChild(script);

    gsap.registerPlugin(ScrollTrigger);

    // 1. Hero
    const tl = gsap.timeline();
    const chars = document.querySelectorAll(`.${styles.char}`);
    
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
      duration: 1.2,
      ease: 'power3.out',
      stagger: 0.03,
      delay: 0.3
    })
    .fromTo(`.${styles.heroSub}`,   { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, '-=0.8')
    .fromTo(`.${styles.heroStars}`, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, '-=1.0')
    .fromTo(`.${styles.pillar}`,    { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }, '-=0.8');

    // 2. Platos
    document.querySelectorAll(`.${styles.dishRow}`).forEach((row) => {
      const visual = row.querySelector(`.${styles.dishVisual}`);
      const text   = row.querySelector(`.${styles.dishText}`);
      const img    = row.querySelector(`.${styles.dishVisual} img`);
      gsap.set([visual, text], { opacity: 0, y: 50 });
      gsap.set(img, { scale: 1.1, filter: 'blur(10px)' });
      ScrollTrigger.create({
        trigger: row,
        start: 'top bottom-=100px',
        onEnter: () => {
          gsap.to(visual, { opacity: 1, y: 0, duration: 1.4, ease: 'power4.out' });
          gsap.to(text,   { opacity: 1, y: 0, duration: 1.4, ease: 'power4.out', delay: 0.2 });
          gsap.to(img,    { scale: 1,   filter: 'blur(0px)', duration: 2, ease: 'expo.out' });
        }
      });
      row.addEventListener('mouseenter', () => gsap.to(img, { scale: 1.05, duration: 1, ease: 'power2.out', overwrite: 'auto' }));
      row.addEventListener('mouseleave', () => gsap.to(img, { scale: 1,    duration: 1, ease: 'power2.out', overwrite: 'auto' }));
    });

    // Refresh doble: uno al principio y otro cuando framer-motion termina su animación
    setTimeout(() => ScrollTrigger.refresh(), 300);
    setTimeout(() => ScrollTrigger.refresh(), 900);

    // 3. Chef hero photo
    gsap.fromTo(`.${styles.chefPhotoWrap}`,
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.6, ease: 'expo.out',
        scrollTrigger: { trigger: '#el-chef', start: 'top 80%' } }
    );
    gsap.fromTo(`.${styles.chefFirstName}`,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out', delay: 0.2,
        scrollTrigger: { trigger: '#el-chef', start: 'top 75%' } }
    );
    gsap.fromTo(`.${styles.chefLastName}`,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out', delay: 0.35,
        scrollTrigger: { trigger: '#el-chef', start: 'top 75%' } }
    );
    gsap.fromTo(`.${styles.chefEyebrow}`,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5,
        scrollTrigger: { trigger: '#el-chef', start: 'top 75%' } }
    );
    gsap.fromTo([`.${styles.chefBio}`, `.${styles.chefQuote}`, `.${styles.chefStatsRow}`],
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.15,
        scrollTrigger: { trigger: `.${styles.chefHeroContent}`, start: 'top 78%' } }
    );
    gsap.fromTo(`.${styles.chefStory}`,
      { opacity: 0 },
      { opacity: 1, duration: 1.5,
        scrollTrigger: { trigger: `.${styles.chefStory}`, start: 'top 85%' } }
    );
    gsap.fromTo(`.${styles.storyEyebrow}`,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: `.${styles.chefStory}`, start: 'top 80%' } }
    );
    gsap.fromTo(`.${styles.storyCol}`,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.18,
        scrollTrigger: { trigger: `.${styles.chefStory}`, start: 'top 80%' } }
    );
    gsap.fromTo(`.${styles.tableTitle}`,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: '#chef-table', start: 'top 80%' } }
    );
    gsap.fromTo([`.${styles.tableDesc}`, `.${styles.tableStats}`, `.${styles.tableCta}`],
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.15,
        scrollTrigger: { trigger: '#chef-table', start: 'top 78%' } }
    );

    // Statement quote
    const quote = document.querySelector(`.${styles.statementQuote}`);
    if (quote) {
      const words = quote.innerText.trim().split(/\s+/);
      quote.innerHTML = words.map(w => `<span>${w}</span>`).join(' ');
      gsap.fromTo(quote.querySelectorAll('span'),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: quote, start: 'top 85%', toggleActions: 'play none none none' } }
      );
    }

    // Count-up
    document.querySelectorAll(`.${styles.credNum}`).forEach(el => {
      const raw = el.innerText;
      const target = parseFloat(raw);
      if (!isNaN(target)) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 2.5, ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
          onUpdate: () => { el.innerText = Math.round(obj.val) + (raw.includes('%') ? '%' : ''); }
        });
      }
    });

    // 4. CTA (Reservaciones)
    gsap.fromTo(`.${styles.resTitle}`,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.4, ease: 'power4.out',
        scrollTrigger: { trigger: `.${styles.cta}`, start: 'top 85%' } }
    );
    gsap.fromTo([`.${styles.resSub}`, `.${styles.btnGroup}`],
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.2,
        scrollTrigger: { trigger: `.${styles.cta}`, start: 'top 80%' } }
    );

    return () => {
      document.head.removeChild(script);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  // Map dishes to translations
  const localizedDishes = DISHES_EDITORIAL.map(dish => {
    const key = `dish${dish.id}`;
    const localDish = translations?.dining?.dishes?.[key] || {};
    return {
      ...dish,
      course: localDish.course || '',
      season: localDish.season || '',
      name: localDish.name || '',
      desc: localDish.desc || '',
      ingredients: localDish.ingredients || [],
      pairing: localDish.pairing || ''
    };
  });

  return (
    <div className={styles.page}>

      {/* 1. HERO */}
      <section className={styles.hero} id="home">
        <div className={styles.filmGrain} />
        <div className={styles.heroContent}>
          <div className={styles.heroStars}>
            <span className={styles.starLine} />
            <span className={styles.starText}>{t('starText', 'dining')}</span>
            <span className={styles.starLine} />
          </div>
          <h1 className={styles.heroTitle}>
            {t('heroTitle1', 'dining').split('').map((char, index) => (
              <span key={index} className={styles.char}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
            <br />
            <em className={styles.goldGradientText}>
              {t('heroTitle2', 'dining').split('').map((char, index) => (
                <span key={index} className={styles.char}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </em>
          </h1>
          <p className={styles.heroSub}>
            {t('heroSub', 'dining').split('\n').map((line, index) => (
              <span key={index}>
                {line}
                {index < t('heroSub', 'dining').split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
          <div className={styles.heroPillars}>
            <div className={styles.pillar}>
              <span className={styles.pillarIcon}>◈</span>
              <span className={styles.pillarText}>{t('pillar1', 'dining')}</span>
            </div>
            <span className={styles.pillarDiv} />
            <div className={styles.pillar}>
              <span className={styles.pillarIcon}>◈</span>
              <span className={styles.pillarText}>{t('pillar2', 'dining')}</span>
            </div>
            <span className={styles.pillarDiv} />
            <div className={styles.pillar}>
              <span className={styles.pillarIcon}>◈</span>
              <span className={styles.pillarText}>{t('pillar3', 'dining')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATEMENT */}
      <section className={styles.statement}>
        <div className={styles.statementInner}>
          <span className={styles.statementNum}>01</span>
          <div className={styles.statementContent}>
            <blockquote className={styles.statementQuote}>
              "{t('statementQuote', 'dining')}"
            </blockquote>
            <p className={styles.statementBody}>
              {t('statementBody', 'dining')}
            </p>
          </div>
          <div className={styles.statementCreds}>
            <div className={styles.cred}>
              <span className={styles.credNum}>9</span>
              <span className={styles.credLabel}>
                {(language === 'es' ? 'Tiempos\ndegustación' : 'Tasting\ncourses').split('\n').map((l, i) => (
                  <span key={i}>{l}{i === 0 && <br />}</span>
                ))}
              </span>
            </div>
            <div className={styles.credLine} />
            <div className={styles.cred}>
              <span className={styles.credNum}>100%</span>
              <span className={styles.credLabel}>
                {(language === 'es' ? 'Ingredientes\nde origen local' : 'Locally\nsourced ingredients').split('\n').map((l, i) => (
                  <span key={i}>{l}{i === 0 && <br />}</span>
                ))}
              </span>
            </div>
            <div className={styles.credLine} />
            <div className={styles.cred}>
              <span className={styles.credNum}>∞</span>
              <span className={styles.credLabel}>
                {(language === 'es' ? 'Vistas\nal Pacífico' : 'Pacific\nocean views').split('\n').map((l, i) => (
                  <span key={i}>{l}{i === 0 && <br />}</span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MENÚ */}
      <section className={styles.menu} id="menu">
        <div className={styles.menuHeader}>
          <div className={styles.menuHeaderContent}>
            <span className={styles.menuEyebrow}>{t('menuEyebrow', 'dining')}</span>
            <h2 className={styles.menuTitle}>
              {language === 'es' ? (
                <>Los Platos <em>Insignia</em></>
              ) : (
                <>{t('menuTitle', 'dining')} <em>{t('menuSubtitle', 'dining')}</em></>
              )}
            </h2>
          </div>
          <div className={styles.menuHeaderRight}>
            <p className={styles.menuNote}>
              {t('menuNote', 'dining')}
            </p>
            <div className={styles.menuSeasonBadge}>
              <span className={styles.seasonDot} />
              <span>{t('menuSeason', 'dining')}</span>
            </div>
          </div>
        </div>

        {localizedDishes.map((dish, i) => (
          <div
            key={dish.id}
            className={`${styles.dishRow} ${i % 2 !== 0 ? styles.dishRowReverse : ''}`}
          >
            <div className={`${styles.dishVisual} ${styles[`dishVisual${i + 1}`]}`}>
              <img src={dish.image} alt={dish.name} />
              <span className={styles.dishNumeral}>
                {['I','II','III','IV','V','VI'][i]}
              </span>
            </div>
            <div className={styles.dishText}>
              <div className={styles.dishMeta}>
                <span className={styles.dishCourse}>{dish.course}</span>
                <span className={styles.dishSeason}>{dish.season}</span>
              </div>
              <h3 className={styles.dishName}>{dish.name}</h3>
              <p className={styles.dishDesc}>{dish.desc}</p>
              <div className={styles.dishIngList}>
                {dish.ingredients.map(ing => (
                  <span key={ing} className={styles.dishIng}>{ing}</span>
                ))}
              </div>
              <div className={styles.dishPairing}>
                <span className={styles.pairingLabel}>
                  {language === 'es' ? 'Maridaje sugerido' : 'Suggested pairing'}
                </span>
                <span className={styles.pairingValue}>{dish.pairing}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 4. CHEF */}
      <section className={styles.chef} id="el-chef">

        {/* PARTE 1: HERO */}
        <div className={styles.chefHero}>

          <div className={styles.chefPhotoWrap}>
            <img
              src="/Chef.png"
              alt="Matteo Solís, Chef Ejecutivo Casa d'Oro El Tunco El Salvador"
              className={styles.chefPhoto}
            />
            <div className={styles.chefPhotoFade} />
            <div className={styles.chefPhotoBadge}>
              <span className={styles.badgeLine} />
              <span className={styles.badgeText}>
                {language === 'es' ? 'Alta Cocina Descalza' : 'Barefoot Haute Cuisine'}
              </span>
              <span className={styles.badgeLine} />
            </div>
          </div>

          <div className={styles.chefHeroContent}>
            <span className={styles.chefEyebrow}>{t('chefEyebrow', 'dining')}</span>

            <div className={styles.chefNameWrap}>
              <h2 className={styles.chefFirstName}>{t('chefFirstName', 'dining')}</h2>
              <h2 className={styles.chefLastName}><em>{t('chefLastName', 'dining')}</em></h2>
            </div>

            <p className={styles.chefRole}>
              {language === 'es' ? 'El Arquitecto del Sabor Tropical' : 'The Architect of Tropical Flavor'}
            </p>
            <div className={styles.chefDivider} />

            <p className={styles.chefBio}>
              {t('chefBio', 'dining')}
            </p>

            <blockquote className={styles.chefQuote}>
              {t('chefQuote', 'dining')}
            </blockquote>

            <div className={styles.chefStatsRow}>
              <div className={styles.chefStat}>
                <span className={styles.chefStatN}>10+</span>
                <span className={styles.chefStatL}>{t('chefStatsLabel1', 'dining')}</span>
              </div>
              <div className={styles.chefStatDiv} />
              <div className={styles.chefStat}>
                <span className={styles.chefStatN}>2</span>
                <span className={styles.chefStatL}>{t('chefStatsLabel2', 'dining')}</span>
              </div>
              <div className={styles.chefStatDiv} />
              <div className={styles.chefStat}>
                <span className={styles.chefStatN}>∞</span>
                <span className={styles.chefStatL}>{t('chefStatsLabel3', 'dining')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PARTE 2: HISTORIA — 2 cols fondo oscuro */}
        <div className={styles.chefStory}>
          <div className={styles.chefStoryHeader}>
            <span className={styles.storyEyebrow}>
              <span className={styles.storyEyebrowLine} />
              {t('chefStoryEyebrow', 'dining')}
              <span className={styles.storyEyebrowLine} />
            </span>
          </div>

          <div className={styles.chefStoryGrid}>
            <div className={styles.storyCol}>
              <span className={styles.storyColNum}>01</span>
              <h3 className={styles.storyColTitle}>{t('chefStoryCol1Title', 'dining')}</h3>
              <p className={styles.storyColText}>{t('chefStoryCol1Text', 'dining')}</p>
            </div>

            <div className={styles.storyColLine} />

            <div className={styles.storyCol}>
              <span className={styles.storyColNum}>02</span>
              <h3 className={styles.storyColTitle}>{t('chefStoryCol2Title', 'dining')}</h3>
              <p className={styles.storyColText}>{t('chefStoryCol2Text', 'dining')}</p>
            </div>
          </div>
        </div>

        {/* PARTE 3: MESA DEL CHEF — cinematográfico */}
        <div className={styles.chefTable} id="chef-table">
          <div className={styles.chefTableBg} />

          <div className={styles.chefTableInner}>
            <div className={styles.chefTableContent}>
              <span className={styles.tableEyebrow}>
                {language === 'es' ? 'La Experiencia Definitiva' : 'The Ultimate Experience'}
              </span>
              
              <h2 className={styles.tableTitle}>
                {language === 'es' ? (
                  <>9 tiempos.<br /><em>Un chef. El Pacífico.</em></>
                ) : (
                  <>9 courses.<br /><em>One chef. The Pacific.</em></>
                )}
              </h2>

              <p className={styles.tableDesc}>
                {t('tableDesc', 'dining')}
              </p>

              <div className={styles.tableStats}>
                {[
                  { n: t('tableStatValue1', 'dining'), l: t('tableStatLabel1', 'dining') },
                  { n: t('tableStatValue2', 'dining'), l: t('tableStatLabel2', 'dining') },
                  { n: t('tableStatValue3', 'dining'), l: t('tableStatLabel3', 'dining') },
                ].map((s, idx) => (
                  <div key={idx} className={styles.tableStat}>
                    <span className={styles.tableStatN}>{s.n}</span>
                    <span className={styles.tableStatL}>{s.l}</span>
                  </div>
                ))}
              </div>

              <div className={styles.tableActions}>
                <a href="/contacto" className={styles.tableCta}>
                  {t('tableCta', 'dining')}
                  <span className={styles.tableCtaArrow}>→</span>
                </a>
                <p className={styles.tableNote}>
                  {language === 'es' ? 'Disponibilidad limitada · Solo bajo reserva previa' : 'Limited availability · Only upon prior reservation'}
                </p>
              </div>
            </div>

            <div className={styles.chefTableSide}>
              <p className={styles.tableQuote}>
                {language === 'es' ? (
                  <>"Cocinamos con el ritmo de las mareas<br />y el alma de nuestra tierra."</>
                ) : (
                  <>"We cook with the rhythm of the tides<br />and the soul of our land."</>
                )}
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* 5. RESERVACIONES */}
      <section className={styles.cta}>
        <div className="container">
          <h2 className={styles.resTitle}>
            {t('resTitle', 'dining')}
          </h2>
          <p className={styles.resSub}>
            {t('resSub', 'dining')}
          </p>
          <div className={styles.btnGroup}>
            <a href="https://wa.me/50312345678" className={styles.btnPrimary} target="_blank" rel="noopener noreferrer">
              {t('resBtn', 'dining')}
            </a>
            <a href="/menu-completo.pdf" className={styles.btnSecondary} target="_blank">
              {language === 'es' ? 'Ver Menú Completo' : 'View Full Menu'}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Dining;

