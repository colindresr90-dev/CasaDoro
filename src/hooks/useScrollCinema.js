import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollCinema() {
  useEffect(() => {

    // ── 1. FADE UP REVEAL — párrafos y bloques de texto ──
    // Eliminado filter:blur — fuerza recomposición de toda la página en cada frame
    gsap.utils.toArray('.reveal-up').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // ── 2. FADE IN LATERAL — imágenes y paneles visuales ──
    gsap.utils.toArray('.reveal-left').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: -60 },
        {
          opacity: 1, x: 0,
          duration: 1.4, ease: 'expo.out',
          scrollTrigger: {
            trigger: el, start: 'top 82%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    gsap.utils.toArray('.reveal-right').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: 60 },
        {
          opacity: 1, x: 0,
          duration: 1.4, ease: 'expo.out',
          scrollTrigger: {
            trigger: el, start: 'top 82%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // ── 3. SCALE REVEAL — cards de suites y gastronomía ──
    gsap.utils.toArray('.reveal-scale').forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, scale: 0.94 },
        {
          opacity: 1, scale: 1,
          duration: 1.2,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el, start: 'top 86%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // ── 4. HEADLINE REVEAL — títulos H2 ──
    // NO manipulamos el DOM (no creamos wrappers) para evitar layout shifts
    // que rompían las mediciones de ScrollTrigger y causaban saltos en el scroll.
    gsap.utils.toArray('.reveal-headline').forEach(el => {
      gsap.fromTo(el,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 1.4,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // ── 5. STAGGER GROUP — listas, grids, stats ──
    gsap.utils.toArray('.reveal-stagger').forEach(container => {
      const children = container.children;
      gsap.fromTo(children,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 1.0,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 84%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // ── 6. PARALLAX — fondos y elementos decorativos ──
    // Valores de scrub bajos para máxima responsividad
    gsap.utils.toArray('.parallax-slow').forEach(el => {
      gsap.to(el, {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5
        }
      });
    });

    gsap.utils.toArray('.parallax-fast').forEach(el => {
      gsap.to(el, {
        yPercent: -35,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.3
        }
      });
    });

    // ── 7. GOLD LINE DRAW — divisores horizontales y verticales ──
    gsap.utils.toArray('.draw-line-h').forEach(el => {
      gsap.fromTo(el,
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1,
          duration: 1.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el, start: 'top 90%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    gsap.utils.toArray('.draw-line-v').forEach(el => {
      gsap.fromTo(el,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          duration: 2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el, start: 'top 82%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // ── 8. Philosophy section words (if exists) ──
    const philSection = document.querySelector('.philosophy-section');
    if (philSection) {
      const words = philSection.querySelectorAll('.quote-word');
      gsap.fromTo(words,
        { opacity: 0.08, y: 15 },
        {
          opacity: 1, y: 0,
          stagger: 0.07,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: philSection,
            start: 'top 60%',
            end: 'bottom 80%',
            scrub: 0.5,
            toggleActions: 'play none none none'
          }
        }
      );
    }

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);
}
