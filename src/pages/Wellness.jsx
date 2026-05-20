import { useEffect } from 'react';
import styles from './Wellness.module.css';
import { useScrollCinema } from '../hooks/useScrollCinema';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import surfImg   from '../assets/images/wellness/surf_v2.png';
import spaImg    from '../assets/images/wellness/spa_v2.png';
import detailImg from '../assets/images/wellness/detail_v2.png';
import spaStones from '../assets/images/wellness/spa-stones.png';

const EXPERIENCES = [
  {
    id: 1,
    category: 'Surf · Olas del Pacífico',
    tag: 'Temporada Todo el año',
    name: 'El Point Break de El Tunco',
    image: surfImg,
    desc: 'El Tunco no es una ubicación; es un latido ancestral. Acceso directo a las olas más legendarias del Pacífico, con coaching profesional al amanecer antes que el resto del mundo despierte.',
    tags: ['Coaching Profesional', 'Equipo Premium', 'Fotografía en agua', 'Sunzal Sessions'],
    detail: 'Mareas · Pacífico Central · Offshore permanente',
  },
  {
    id: 2,
    category: 'Spa · Ritual Volcánico',
    tag: 'Reserva previa',
    name: 'Sanctuary Spa',
    image: spaImg,
    desc: 'Rituales inspirados en la geología volcánica y la botánica nativa de El Salvador. Piedras calientes de obsidiana, aceites prensados en frío y el sonido constante del océano como fondo.',
    tags: ['Piedras Volcánicas', 'Botánica Nativa', 'Aromaterapia', 'Masaje Profundo'],
    detail: 'Duración: 90 min · Solo bajo reserva',
  },
  {
    id: 3,
    category: 'Meditación · Atardecer',
    tag: 'Diario · 18:00',
    name: 'Ritual del Horizonte',
    image: detailImg,
    desc: 'Sesión guiada de meditación y respiración mientras el cielo del Pacífico se incendia en tonos dorados. Un ritual colectivo de silencio y reconexión frente al horizonte infinito.',
    tags: ['Meditación Guiada', 'Pranayama', 'Sunset View', 'Grupos Pequeños'],
    detail: 'Todos los días · Terraza principal',
  },
];


const Wellness = () => {
  useScrollCinema();

  useEffect(() => {
    document.title = "Bienestar & Surf | Casa d'Oro – El Tunco, El Salvador";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', "Descubre el santuario de bienestar y surf de Casa d'Oro en El Tunco. Rituales volcánicos, coaching profesional de surf y meditación al atardecer frente al Pacífico.");

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

  return (
    <div className={styles.page}>

      {/* 1. HERO */}
      <section className={styles.hero} id="home">
        <div className={styles.filmGrain} />
        <div className={styles.heroContent}>
          <div className={styles.heroStars}>
            <span className={styles.starLine} />
            <span className={styles.starText}>✦ Bienestar & Surf · El Tunco ✦</span>
            <span className={styles.starLine} />
          </div>
          <h1 className={styles.heroTitle}>
            {"El Flujo".split('').map((char, index) => (
              <span key={index} className={styles.char}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
            <br />
            <em className={styles.goldGradientText}>
              {"del Pacífico".split('').map((char, index) => (
                <span key={index} className={styles.char}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </em>
          </h1>
          <p className={styles.heroSub}>
            Donde el océano marca el ritmo<br />y el cuerpo recuerda su naturaleza.
          </p>
          <div className={styles.heroPillars}>
            <div className={styles.pillar}>
              <span className={styles.pillarIcon}>◈</span>
              <span className={styles.pillarText}>Surf Culture</span>
            </div>
            <span className={styles.pillarDiv} />
            <div className={styles.pillar}>
              <span className={styles.pillarIcon}>◈</span>
              <span className={styles.pillarText}>Sanctuary Spa</span>
            </div>
            <span className={styles.pillarDiv} />
            <div className={styles.pillar}>
              <span className={styles.pillarIcon}>◈</span>
              <span className={styles.pillarText}>Ritual Atardecer</span>
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
              "El mar no simplemente te rodea; te calibra."
            </blockquote>
            <p className={styles.statementBody}>
              En Casa d'Oro, el bienestar no es un servicio —es la esencia misma del lugar. El sonido constante del Pacífico, el ritual matutino del surf, las piedras volcánicas calientes y el silencio del atardecer crean un ecosistema de recuperación profunda que ningún spa urbano puede replicar.
            </p>
          </div>
          <div className={styles.statementCreds}>
            <div className={styles.cred}>
              <span className={styles.credNum}>70</span>
              <span className={styles.credLabel}>Rituales<br />disponibles</span>
            </div>
            <div className={styles.credLine} />
            <div className={styles.cred}>
              <span className={styles.credNum}>100%</span>
              <span className={styles.credLabel}>Productos<br />orgánicos</span>
            </div>
            <div className={styles.credLine} />
            <div className={styles.cred}>
              <span className={styles.credNum}>∞</span>
              <span className={styles.credLabel}>Vistas<br />al Pacífico</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXPERIENCIAS */}
      <section className={styles.menu} id="experiencias">
        <div className={styles.menuHeader}>
          <div className={styles.menuHeaderContent}>
            <span className={styles.menuEyebrow}>Programa de Bienestar</span>
            <h2 className={styles.menuTitle}>Las Experiencias <em>Insignia</em></h2>
          </div>
          <div className={styles.menuHeaderRight}>
            <p className={styles.menuNote}>
              Cada experiencia está diseñada para reconectar el cuerpo con el entorno natural de El Tunco, El Salvador.
            </p>
            <div className={styles.menuSeasonBadge}>
              <span className={styles.seasonDot} />
              <span>Disponible todo el año · Bajo reserva</span>
            </div>
          </div>
        </div>

        {EXPERIENCES.map((exp, i) => (
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
                <span className={styles.detailLabel}>Detalle</span>
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
              <span className={styles.badgeText}>El Ritmo Vital</span>
              <span className={styles.badgeLine} />
            </div>
          </div>

          <div className={styles.ritualHeroContent}>
            <span className={styles.ritualEyebrow}>El Día Perfecto</span>
            <div className={styles.ritualNameWrap}>
              <h2 className={styles.ritualFirstName}>Ritual</h2>
              <h2 className={styles.ritualLastName}><em>Diario</em></h2>
            </div>
            <p className={styles.ritualRole}>Un ciclo completo de 24 horas</p>
            <div className={styles.ritualDivider} />
            <p className={styles.ritualBio}>
              Cada jornada en Casa d'Oro sigue un ritmo cuidadosamente diseñado en armonía con las mareas, la luz natural y los ciclos del Pacífico. Desde el amanecer en el break hasta la cena consciente bajo las estrellas.
            </p>
            <div className={styles.ritualStatsRow}>
              <div className={styles.ritualStat}>
                <span className={styles.ritualStatN}>6</span>
                <span className={styles.ritualStatL}>Momentos Clave</span>
              </div>
              <div className={styles.ritualStatDiv} />
              <div className={styles.ritualStat}>
                <span className={styles.ritualStatN}>24h</span>
                <span className={styles.ritualStatL}>Ciclo Completo</span>
              </div>
              <div className={styles.ritualStatDiv} />
              <div className={styles.ritualStat}>
                <span className={styles.ritualStatN}>∞</span>
                <span className={styles.ritualStatL}>Bienestar</span>
              </div>
            </div>
          </div>
        </div>


        {/* Philosophy Block */}
        <div className={styles.philosophy} id="filosofia">
          <div className={styles.philosophyBg} />
          <div className={styles.philosophyInner}>
            <div className={styles.philosophyContent}>
              <span className={styles.philosophyEyebrow}>La Experiencia Definitiva</span>
              <h2 className={styles.philosophyTitle}>
                El océano<br />
                <em>como medicina.</em>
              </h2>
              <p className={styles.philosophyDesc}>
                Tres ritmos. Una hacienda. El Pacífico como constante. Sin agenda, sin urgencia, sin prisa. Solo el flujo natural del lugar que lleva décadas curando a quienes se permiten escuchar.
              </p>
              <div className={styles.philosophyStats}>
                {[
                  { n: '70+', l: 'Rituales' },
                  { n: '5★', l: 'Rating' },
                  { n: '3h', l: 'Spa sesión' },
                  { n: '∞', l: 'Pacífico' },
                ].map(s => (
                  <div key={s.l} className={styles.philosophyStat}>
                    <span className={styles.philosophyStatN}>{s.n}</span>
                    <span className={styles.philosophyStatL}>{s.l}</span>
                  </div>
                ))}
              </div>
              <div className={styles.philosophyActions}>
                <a href="/contacto" className={styles.philosophyCta}>
                  Solicitar programa
                  <span className={styles.philosophyCtaArrow}>→</span>
                </a>
                <p className={styles.philosophyNote}>Personalizado · Solo bajo reserva previa</p>
              </div>
            </div>
            <div className={styles.philosophySide}>
              <p className={styles.philosophyQuote}>
                "Limpia el espíritu<br />y nos devuelve al flujo<br />natural de la existencia."
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* 5. CTA */}
      <section className={styles.cta}>
        <div className="container">
          <h2 className={styles.resTitle}>
            Empieza tu <em>flujo vital</em>
          </h2>
          <p className={styles.resSub}>
            Disponibilidad limitada. Reserva con antelación para experiencias personalizadas de bienestar.
          </p>
          <div className={styles.btnGroup}>
            <a href="https://wa.me/50312345678" className={styles.btnPrimary} target="_blank" rel="noopener noreferrer">
              Reservar Experiencia
            </a>
            <a href="/menu-completo.pdf" className={styles.btnSecondary} target="_blank">
              Ver Programa Completo
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Wellness;
