import { useEffect } from 'react';
import styles from './Wellness.module.css';
import { useScrollCinema } from '../hooks/useScrollCinema';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';

import surfImg   from '../assets/images/wellness/surf_v2.png';
import spaImg    from '../assets/images/wellness/spa_v2.png';
import detailImg from '../assets/images/wellness/detail_v2.png';
import spaStones from '../assets/images/wellness/spa-stones.png';

const EXPERIENCES = [
  { id: 1, image: surfImg },
  { id: 2, image: spaImg },
  { id: 3, image: detailImg }
];

const Wellness = () => {
  useScrollCinema();
  const { t, language, translations } = useLanguage();

  useEffect(() => {
    document.title = t('seoTitle', 'wellness');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('seoDesc', 'wellness'));
  }, [language, t]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Hero
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
    .fromTo(`.${styles.heroSub}`,    { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, '-=0.8')
    .fromTo(`.${styles.heroStars}`,  { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, '-=1.0')
    .fromTo(`.${styles.pillar}`,     { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }, '-=0.8');

    // Experiencias (alternadas)
    document.querySelectorAll(`.${styles.expRow}`).forEach(row => {
      const visual = row.querySelector(`.${styles.expVisual}`);
      const text   = row.querySelector(`.${styles.expText}`);
      const img    = row.querySelector(`.${styles.expVisual} img`);
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

    setTimeout(() => ScrollTrigger.refresh(), 300);
    setTimeout(() => ScrollTrigger.refresh(), 900);

    // Statement quote word-by-word
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

    // Count-up stats
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

    // Philosophy section
    gsap.fromTo(`.${styles.philosophyTitle}`,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: `.${styles.philosophy}`, start: 'top 80%' } }
    );
    gsap.fromTo(`.${styles.philosophyCol}`,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.18,
        scrollTrigger: { trigger: `.${styles.philosophy}`, start: 'top 78%' } }
    );

    // CTA
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

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  // Map experiences to translations
  const localizedExperiences = EXPERIENCES.map(exp => {
    const key = `exp${exp.id}`;
    const localExp = translations?.wellness?.experiences?.[key] || {};
    return {
      ...exp,
      category: localExp.category || '',
      tag: localExp.tag || '',
      name: localExp.name || '',
      desc: localExp.desc || '',
      tags: localExp.tags || [],
      detail: localExp.detail || ''
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
            <span className={styles.starText}>{t('starText', 'wellness')}</span>
            <span className={styles.starLine} />
          </div>
          <h1 className={styles.heroTitle}>
            {t('heroTitle1', 'wellness').split('').map((char, index) => (
              <span key={index} className={styles.char}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
            <br />
            <em className={styles.goldGradientText}>
              {t('heroTitle2', 'wellness').split('').map((char, index) => (
                <span key={index} className={styles.char}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </em>
          </h1>
          <p className={styles.heroSub}>
            {t('heroSub', 'wellness').split('\n').map((line, index) => (
              <span key={index}>
                {line}
                {index < t('heroSub', 'wellness').split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
          <div className={styles.heroPillars}>
            <div className={styles.pillar}>
              <span className={styles.pillarIcon}>◈</span>
              <span className={styles.pillarText}>{t('pillar1', 'wellness')}</span>
            </div>
            <span className={styles.pillarDiv} />
            <div className={styles.pillar}>
              <span className={styles.pillarIcon}>◈</span>
              <span className={styles.pillarText}>{t('pillar2', 'wellness')}</span>
            </div>
            <span className={styles.pillarDiv} />
            <div className={styles.pillar}>
              <span className={styles.pillarIcon}>◈</span>
              <span className={styles.pillarText}>{t('pillar3', 'wellness')}</span>
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
              "{t('statementQuote', 'wellness')}"
            </blockquote>
            <p className={styles.statementBody}>
              {t('statementBody', 'wellness')}
            </p>
          </div>
          <div className={styles.statementCreds}>
            <div className={styles.cred}>
              <span className={styles.credNum}>70</span>
              <span className={styles.credLabel}>
                {t('statLabel1', 'wellness').split('\n').map((l, i) => (
                  <span key={i}>{l}{i === 0 && <br />}</span>
                ))}
              </span>
            </div>
            <div className={styles.credLine} />
            <div className={styles.cred}>
              <span className={styles.credNum}>100%</span>
              <span className={styles.credLabel}>
                {t('statLabel2', 'wellness').split('\n').map((l, i) => (
                  <span key={i}>{l}{i === 0 && <br />}</span>
                ))}
              </span>
            </div>
            <div className={styles.credLine} />
            <div className={styles.cred}>
              <span className={styles.credNum}>∞</span>
              <span className={styles.credLabel}>
                {t('statLabel3', 'wellness').split('\n').map((l, i) => (
                  <span key={i}>{l}{i === 0 && <br />}</span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXPERIENCIAS */}
      <section className={styles.menu} id="experiencias">
        <div className={styles.menuHeader}>
          <div className={styles.menuHeaderContent}>
            <span className={styles.menuEyebrow}>{t('menuEyebrow', 'wellness')}</span>
            <h2 className={styles.menuTitle}>
              {language === 'es' ? (
                <>Las Experiencias <em>Insignia</em></>
              ) : (
                <>{t('menuTitle', 'wellness')} <em>{t('menuSubtitle', 'wellness')}</em></>
              )}
            </h2>
          </div>
          <div className={styles.menuHeaderRight}>
            <p className={styles.menuNote}>
              {t('menuNote', 'wellness')}
            </p>
            <div className={styles.menuSeasonBadge}>
              <span className={styles.seasonDot} />
              <span>{t('menuSeason', 'wellness')}</span>
            </div>
          </div>
        </div>

        {localizedExperiences.map((exp, i) => (
          <div
            key={exp.id}
            className={`${styles.expRow} ${i % 2 !== 0 ? styles.expRowReverse : ''}`}
          >
            <div className={styles.expVisual}>
              <img src={exp.image} alt={exp.name} />
              <span className={styles.expNumeral}>{['I','II','III'][i]}</span>
            </div>
            <div className={styles.expText}>
              <div className={styles.expMeta}>
                <span className={styles.expCourse}>{exp.category}</span>
                <span className={styles.expSeason}>{exp.tag}</span>
              </div>
              <h3 className={styles.expName}>{exp.name}</h3>
              <p className={styles.expDesc}>{exp.desc}</p>
              <div className={styles.expTagList}>
                {exp.tags.map(t => (
                  <span key={t} className={`${styles.expTag} glass-subtle`}>{t}</span>
                ))}
              </div>
              <div className={`${styles.expDetail} glass-gold`}>
                <span className={styles.detailLabel}>
                  {language === 'es' ? 'Detalle' : 'Detail'}
                </span>
                <span className={styles.detailValue}>{exp.detail}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 4. RITUAL DIARIO */}
      <section className={styles.ritual} id="ritual">

        <div className={styles.ritualHero}>
          <div className={styles.ritualPhotoWrap}>
            <img src={spaStones} alt="Spa ritual volcánico Casa d'Oro El Tunco" className={styles.ritualPhoto} />
            <div className={styles.ritualPhotoFade} />
            <div className={styles.ritualPhotoBadge}>
              <span className={styles.badgeLine} />
              <span className={styles.badgeText}>{t('ritualBadge', 'wellness')}</span>
              <span className={styles.badgeLine} />
            </div>
          </div>

          <div className={styles.ritualHeroContent}>
            <span className={styles.ritualEyebrow}>{t('ritualEyebrow', 'wellness')}</span>
            <div className={styles.ritualNameWrap}>
              <h2 className={styles.ritualFirstName}>
                {language === 'es' ? 'Ritual' : 'Daily'}
              </h2>
              <h2 className={styles.ritualLastName}>
                <em>{language === 'es' ? 'Diario' : 'Ritual'}</em>
              </h2>
            </div>
            <p className={styles.ritualRole}>
              {language === 'es' ? 'Un ciclo completo de 24 horas' : 'A complete 24-hour cycle'}
            </p>
            <div className={styles.ritualDivider} />
            <p className={styles.ritualBio}>
              {language === 'es'
                ? "Cada jornada en Casa d'Oro sigue un ritmo cuidadosamente diseñado en armonía con las mareas, la luz natural y los ciclos del Pacífico. Desde el amanecer en el break hasta la cena consciente bajo las estrellas."
                : "Each day at Casa d'Oro follows a carefully designed rhythm in harmony with the tides, natural light, and the cycles of the Pacific. From dawn at the break to mindful dining under the stars."
              }
            </p>
            <div className={styles.ritualStatsRow}>
              <div className={styles.ritualStat}>
                <span className={styles.ritualStatN}>6</span>
                <span className={styles.ritualStatL}>
                  {language === 'es' ? 'Momentos Clave' : 'Key Moments'}
                </span>
              </div>
              <div className={styles.ritualStatDiv} />
              <div className={styles.ritualStat}>
                <span className={styles.ritualStatN}>24h</span>
                <span className={styles.ritualStatL}>
                  {language === 'es' ? 'Ciclo Completo' : 'Full Cycle'}
                </span>
              </div>
              <div className={styles.ritualStatDiv} />
              <div className={styles.ritualStat}>
                <span className={styles.ritualStatN}>∞</span>
                <span className={styles.ritualStatL}>
                  {language === 'es' ? 'Bienestar' : 'Wellness'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Philosophy Block */}
        <div className={styles.philosophy} id="filosofia">
          <div className={styles.philosophyBg} />
          <div className={styles.philosophyInner}>
            <div className={styles.philosophyContent}>
              <span className={styles.philosophyEyebrow}>
                {language === 'es' ? 'La Experiencia Definitiva' : 'The Ultimate Experience'}
              </span>
              <h2 className={styles.philosophyTitle}>
                {language === 'es' ? (
                  <>El océano<br /><em>como medicina.</em></>
                ) : (
                  <>The ocean<br /><em>as medicine.</em></>
                )}
              </h2>
              <p className={styles.philosophyDesc}>
                {language === 'es'
                  ? "Tres ritmos. Una hacienda. El Pacífico como constante. Sin agenda, sin urgencia, sin prisa. Solo el flujo natural del lugar que lleva décadas curando a quienes se permiten escuchar."
                  : "Three rhythms. One estate. The Pacific as a constant. No agenda, no urgency, no rush. Only the natural flow of the place that has been healing those who allow themselves to listen for decades."
                }
              </p>
              <div className={styles.philosophyStats}>
                {[
                  { n: '70+', l: language === 'es' ? 'Rituales' : 'Rituals' },
                  { n: '5★', l: 'Rating' },
                  { n: '3h', l: language === 'es' ? 'Spa sesión' : 'Spa session' },
                  { n: '∞', l: language === 'es' ? 'Pacífico' : 'Pacific' },
                ].map(s => (
                  <div key={s.l} className={styles.philosophyStat}>
                    <span className={styles.philosophyStatN}>{s.n}</span>
                    <span className={styles.philosophyStatL}>{s.l}</span>
                  </div>
                ))}
              </div>
              <div className={styles.philosophyActions}>
                <a href="/contacto" className={styles.philosophyCta}>
                  {language === 'es' ? 'Solicitar programa' : 'Request Program'}
                  <span className={styles.philosophyCtaArrow}>→</span>
                </a>
                <p className={styles.philosophyNote}>
                  {language === 'es' ? 'Personalizado · Solo bajo reserva previa' : 'Customized · Only upon prior reservation'}
                </p>
              </div>
            </div>
            <div className={styles.philosophySide}>
              <p className={styles.philosophyQuote}>
                {language === 'es' ? (
                  <>"Limpia el espíritu<br />y nos devuelve al flujo<br />natural de la existencia."</>
                ) : (
                  <>"Cleanses the spirit<br />and returns us to the natural<br />flow of existence."</>
                )}
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* 5. CTA */}
      <section className={styles.cta}>
        <div className="container">
          <h2 className={styles.resTitle}>
            {language === 'es' ? <>Empieza tu <em>flujo vital</em></> : <>Begin your <em>vital flow</em></>}
          </h2>
          <p className={styles.resSub}>
            {language === 'es'
              ? "Disponibilidad limitada. Reserva con antelación para experiencias personalizadas de bienestar."
              : "Limited availability. Book in advance for personalized wellness experiences."
            }
          </p>
          <div className={styles.btnGroup}>
            <a href="https://wa.me/50312345678" className={styles.btnPrimary} target="_blank" rel="noopener noreferrer">
              {t('resBtn', 'wellness')}
            </a>
            <a href="/menu-completo.pdf" className={styles.btnSecondary} target="_blank">
              {language === 'es' ? 'Ver Programa Completo' : 'View Full Program'}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Wellness;
