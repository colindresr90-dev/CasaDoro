import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useScrollReveal = (selector = '.reveal') => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const elements = containerRef.current?.querySelectorAll(selector);
    if (!elements || elements.length === 0) return;
    
    elements.forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
    
    // Cleanup function to kill specific triggers if needed
    // return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [selector]);
  
  return containerRef;
};
