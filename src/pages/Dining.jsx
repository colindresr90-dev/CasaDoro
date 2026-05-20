import { useEffect } from 'react';
import styles from './Dining.module.css';
import { useScrollCinema } from '../hooks/useScrollCinema';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import dish1 from '../assets/images/dining/dish1.png';
import dish2 from '../assets/images/dining/dish2.png';
import dish3 from '../assets/images/dining/dish3.png';
import dish4 from '../assets/images/dining/dish4.png';
import dish5 from '../assets/images/dining/dish5.png';
import dish6 from '../assets/images/dining/dish6.png';

const DISHES_EDITORIAL = [
  {
    id: 1,
    course: 'Primer tiempo · El Inicio',
    season: 'Temporada Seca',
    name: 'Crudo de Atún Aleta Amarilla',
    image: dish1,
    desc: 'Atún capturado artesanalmente frente a nuestras costas, marinado en una emulsión de cítricos de la hacienda, aguacate criollo tatemado y pétalos de flores silvestres. Una oda a la frescura del Pacífico.',
    ingredients: ['Atún aleta amarilla', 'Cítricos locales', 'Aguacate criollo', 'Sal de mar', 'Rábanos'],
    pairing: 'Chablis · Domaine William Fèvre · France'
  },
  {
    id: 2,
    course: 'Segundo tiempo · La Tierra',
    season: 'Todo el año',
    name: 'Risotto de Langosta del Pacífico',
    image: dish2,
    desc: 'Arroz Acquerello envejecido 7 años, mantecado con bisque de langosta roja y azafrán español, coronado con medallones de langosta escalfados en mantequilla clarificada de vaca local. Textura sedosa y sabor profundo.',
    ingredients: ['Langosta roja', 'Arroz Acquerello', 'Azafrán', 'Mantequilla local', 'Brotes'],
    pairing: 'Chardonnay · Far Niente · Napa Valley'
  },
  {
    id: 3,
    course: 'Tercer tiempo · El Fuego',
    season: 'Pesca del día',
    name: 'Pargo a la Leña',
    image: dish3,
    desc: 'Filete de pargo rojo cocinado a fuego abierto con madera de cafeto, servido sobre una base de puré de plátano macho ahumado y reducción de tamarindo. El sabor de las brasas salvadoreñas.',
    ingredients: ['Pargo rojo', 'Plátano macho', 'Madera de cafeto', 'Tamarindo', 'Cebollines'],
    pairing: 'Pinot Noir · Erath · Oregon'
  },
  {
    id: 4,
    course: 'Cuarto tiempo · Refrescante',
    season: 'Verano Eterno',
    name: 'Tiradito de Pulpo y Mango',
    image: dish4,
    desc: 'Láminas de pulpo de roca de La Libertad maceradas en leche de tigre de mango verde y ají limo, con crujiente de yuca y aceite de cilantro. Un contraste vibrante entre la acidez y el dulzor tropical.',
    ingredients: ['Pulpo de roca', 'Mango verde', 'Ají limo', 'Yuca', 'Aceite de cilantro'],
    pairing: 'Sauvignon Blanc · Cloudy Bay · NZ'
  },
  {
    id: 5,
    course: 'Quinto tiempo · El Huerto',
    season: 'Cosecha Local',
    name: 'Carpaccio de Remolacha Asada',
    image: dish5,
    desc: 'Remolachas orgánicas de nuestra hacienda asadas en costra de sal, servidas con queso de cabra artesanal, nueces garrapiñadas en piloncillo y reducción de balsámico añejo. Un plato de tierra con alma de mar.',
    ingredients: ['Remolacha hacienda', 'Queso de cabra', 'Nueces', 'Piloncillo', 'Flores'],
    pairing: 'Nebbiolo · G.D. Vajra · Langhe'
  },
  {
    id: 6,
    course: 'Petit four del mar',
    season: 'Todo el año',
    name: 'Sorbet de Coco y Sal de Mar',
    image: dish6,
    desc: 'Postre refrescante elaborado con leche de coco recién extraída de los cocoteros de la hacienda, cristales de sal marina artesanal y ralladura de lima kaffir. Limpieza perfecta del paladar.',
    ingredients: ['Coco hacienda', 'Sal artesanal', 'Lima kaffir', 'Miel de abeja', 'Menta fresca'],
    pairing: "Moscato d'Asti · G.D. Vajra · Piemonte"
  }
];

const Dining = () => {
  useScrollCinema();

  useEffect(() => {
    document.title = "Gastronomía | Casa d'Oro - Alta Cocina del Mar";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', "Descubra la experiencia gastronómica de Casa d'Oro. Alta cocina del mar inspirada en Michelin, ingredientes locales y un ambiente de lujo relajado frente al Pacífico.");
    }

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
        description: "Chef de alta cocina del mar en Casa d'Oro, El Tunco, El Salvador. Formado en restaurantes Michelin de Italia y Francia.",
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

  return (
    <div className={styles.page}>

      {/* 1. HERO */}
      <section className={styles.hero} id="home">
        <div className={styles.filmGrain} />
        <div className={styles.heroContent}>
          <div className={styles.heroStars}>
            <span className={styles.starLine} />
            <span className={styles.starText}>✦ Alta Cocina del Mar ✦</span>
            <span className={styles.starLine} />
          </div>
          <h1 className={styles.heroTitle}>
            {"La Experiencia".split('').map((char, index) => (
              <span key={index} className={styles.char}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
            <br />
            <em className={styles.goldGradientText}>
              {"Gastronómica".split('').map((char, index) => (
                <span key={index} className={styles.char}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </em>
          </h1>
          <p className={styles.heroSub}>
            Donde el Pacífico dicta el menú<br />y el tiempo se mide en mareas.
          </p>
          <div className={styles.heroPillars}>
            <div className={styles.pillar}>
              <span className={styles.pillarIcon}>◈</span>
              <span className={styles.pillarText}>Ingrediente Local</span>
            </div>
            <span className={styles.pillarDiv} />
            <div className={styles.pillar}>
              <span className={styles.pillarIcon}>◈</span>
              <span className={styles.pillarText}>Técnica Michelin</span>
            </div>
            <span className={styles.pillarDiv} />
            <div className={styles.pillar}>
              <span className={styles.pillarIcon}>◈</span>
              <span className={styles.pillarText}>Vista al Pacífico</span>
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
              "Cocinamos con el ritmo de las mareas y el alma de la tierra salvadoreña."
            </blockquote>
            <p className={styles.statementBody}>
              En Casa d'Oro, la gastronomía es un diálogo entre el Pacífico y los huertos orgánicos de nuestra hacienda. Cada plato es una obra de arte efímera que celebra la pureza del ingrediente y la sofisticación de la técnica. Trabajamos con los mejores productores locales de La Libertad: pescadores artesanales, agricultores volcánicos y cafetaleros de linaje centenario.
            </p>
          </div>
          <div className={styles.statementCreds}>
            <div className={styles.cred}>
              <span className={styles.credNum}>9</span>
              <span className={styles.credLabel}>Tiempos<br />degustación</span>
            </div>
            <div className={styles.credLine} />
            <div className={styles.cred}>
              <span className={styles.credNum}>100%</span>
              <span className={styles.credLabel}>Ingredientes<br />de origen local</span>
            </div>
            <div className={styles.credLine} />
            <div className={styles.cred}>
              <span className={styles.credNum}>∞</span>
              <span className={styles.credLabel}>Vistas<br />al Pacífico</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MENÚ */}
      <section className={styles.menu} id="menu">
        <div className={styles.menuHeader}>
          <div className={styles.menuHeaderContent}>
            <span className={styles.menuEyebrow}>Menú de Temporada</span>
            <h2 className={styles.menuTitle}>Los Platos <em>Insignia</em></h2>
          </div>
          <div className={styles.menuHeaderRight}>
            <p className={styles.menuNote}>
              Menú sujeto a disponibilidad de pesca y temporada. Todos los ingredientes son de origen local y trazable.
            </p>
            <div className={styles.menuSeasonBadge}>
              <span className={styles.seasonDot} />
              <span>Menú actual · Temporada del Pacífico</span>
            </div>
          </div>
        </div>

        {DISHES_EDITORIAL.map((dish, i) => (
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
                <span className={styles.pairingLabel}>Maridaje sugerido</span>
                <span className={styles.pairingValue}>{dish.pairing}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 4. CHEF — Rediseño editorial completo */}
      <section className={styles.chef} id="el-chef">

        {/* PARTE 1: HERO — foto full-height izq + contenido dcha */}
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
              <span className={styles.badgeText}>Alta Cocina Descalza</span>
              <span className={styles.badgeLine} />
            </div>
          </div>

          <div className={styles.chefHeroContent}>
            <span className={styles.chefEyebrow}>El Alma de la Cocina</span>

            <div className={styles.chefNameWrap}>
              <h2 className={styles.chefFirstName}>Matteo</h2>
              <h2 className={styles.chefLastName}><em>Solís</em></h2>
            </div>

            <p className={styles.chefRole}>El Arquitecto del Sabor Tropical</p>
            <div className={styles.chefDivider} />

            <p className={styles.chefBio}>
              Perfeccionista por naturaleza, Matteo define su cocina como{' '}
              <em>"Alta Cocina Descalza"</em>.
              No cocina para impresionar — cocina para conectar. Cada ingrediente
              es recolectado a mano en los jardines de la hacienda o traído
              directamente del arrecife de El Tunco.
            </p>

            <blockquote className={styles.chefQuote}>
              "El emplatado es un acto de meditación.
              Cada plato cuenta una historia de la costa."
            </blockquote>

            <div className={styles.chefStatsRow}>
              <div className={styles.chefStat}>
                <span className={styles.chefStatN}>10+</span>
                <span className={styles.chefStatL}>Años Michelin</span>
              </div>
              <div className={styles.chefStatDiv} />
              <div className={styles.chefStat}>
                <span className={styles.chefStatN}>2</span>
                <span className={styles.chefStatL}>Países Europa</span>
              </div>
              <div className={styles.chefStatDiv} />
              <div className={styles.chefStat}>
                <span className={styles.chefStatN}>∞</span>
                <span className={styles.chefStatL}>Recetas Pacífico</span>
              </div>
            </div>
          </div>
        </div>

        {/* PARTE 2: HISTORIA — 3 cols fondo oscuro */}
        <div className={styles.chefStory}>
          <div className={styles.chefStoryHeader}>
            <span className={styles.storyEyebrow}>
              <span className={styles.storyEyebrowLine} />
              Un Regreso al Origen
              <span className={styles.storyEyebrowLine} />
            </span>
          </div>

          <div className={styles.chefStoryGrid}>

            <div className={styles.storyCol}>
              <span className={styles.storyColNum}>01</span>
              <h3 className={styles.storyColTitle}>El Origen</h3>
              <p className={styles.storyColText}>
                Nacido a pocos kilómetros de El Tunco, Matteo creció entre el aroma
                del café de las fincas de su familia y el aire salado del Pacífico.
                De linaje cafetalero, su verdadera pasión siempre fue el mar.
              </p>
            </div>

            <div className={styles.storyColLine} />

            <div className={styles.storyCol}>
              <span className={styles.storyColNum}>02</span>
              <h3 className={styles.storyColTitle}>La Formación Europea</h3>
              <p className={styles.storyColText}>
                A los 20 años partió a Europa. Años formativos en cocinas Michelin
                en la costa de Amalfi, Italia, y en la Provenza, Francia. Dominó la
                técnica europea sin perder el alma salvadoreña.
              </p>
              <div className={styles.storyTags}>
                <span className={styles.storyTag}>Amalfi · Italia</span>
                <span className={styles.storyTag}>Provenza · Francia</span>
              </div>
            </div>

            <div className={styles.storyColLine} />

            <div className={styles.storyCol}>
              <span className={styles.storyColNum}>03</span>
              <h3 className={styles.storyColTitle}>El Regreso</h3>
              <p className={styles.storyColText}>
                En Casa d'Oro, Matteo no solo alimenta — reconecta a los huéspedes
                con la tierra y el mar de El Salvador. Un ceviche en piedra volcánica.
                Un ron añejo local. La alta cocina de la herencia costera.
              </p>
            </div>

          </div>
        </div>

        {/* PARTE 3: MESA DEL CHEF — cinematográfico */}
        <div className={styles.chefTable} id="chef-table">
          <div className={styles.chefTableBg} />

          <div className={styles.chefTableInner}>
            <div className={styles.chefTableContent}>
              <span className={styles.tableEyebrow}>La Experiencia Definitiva</span>
              
              <h2 className={styles.tableTitle}>
                9 tiempos.<br />
                <em>Un chef. El Pacífico.</em>
              </h2>

              <p className={styles.tableDesc}>
                Ocho sillas. Un chef. El Pacífico como telón de fondo. 
                Una narrativa culinaria que celebra la pureza del producto salvadoreño 
                a través de la técnica Michelin. No hay carta. No hay prisa.
              </p>

              <div className={styles.tableStats}>
                {[
                  { n: '9',  l: 'Tiempos' },
                  { n: '8',  l: 'Sillas' },
                  { n: '3h', l: 'Inmersión' },
                  { n: '7d', l: 'Pre-reserva' },
                ].map(s => (
                  <div key={s.l} className={styles.tableStat}>
                    <span className={styles.tableStatN}>{s.n}</span>
                    <span className={styles.tableStatL}>{s.l}</span>
                  </div>
                ))}
              </div>

              <div className={styles.tableActions}>
                <a href="/contacto" className={styles.tableCta}>
                  Solicitar reservación
                  <span className={styles.tableCtaArrow}>→</span>
                </a>
                <p className={styles.tableNote}>Disponibilidad limitada · Solo bajo reserva previa</p>
              </div>
            </div>

            <div className={styles.chefTableSide}>
              <p className={styles.tableQuote}>
                "Cocinamos con el ritmo de las mareas<br />
                y el alma de nuestra tierra."
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* 5. RESERVACIONES */}
      <section className={styles.cta}>
        <div className="container">
          <h2 className={styles.resTitle}>
            Asegure su lugar <em>en el paraíso</em>
          </h2>
          <p className={styles.resSub}>
            Disponibilidad limitada. Se recomienda reservar con antelación para experiencias personalizadas.
          </p>
          <div className={styles.btnGroup}>
            <a href="https://wa.me/50312345678" className={styles.btnPrimary} target="_blank" rel="noopener noreferrer">
              Reservar Mesa
            </a>
            <a href="/menu-completo.pdf" className={styles.btnSecondary} target="_blank">
              Ver Menú Completo
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Dining;
