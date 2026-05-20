import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import styles from '../styles/SectionArrow.module.css'

gsap.registerPlugin(ScrollToPlugin)

export default function SectionArrow({ targetId, variant = 'dark' }) {
  
  const handleClick = () => {
    gsap.to(window, {
      scrollTo: `#${targetId}`,
      duration: 1.2,
      ease: 'power3.inOut'
    })
  }

  return (
    <button 
      className={`${styles.arrow} ${variant === 'light' ? styles.arrowLight : ''}`}
      onClick={handleClick}
      aria-label="Siguiente sección"
    >
      <svg 
        className={styles.chevron}
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={variant === 'light' ? '#8B4A2F' : '#c9a84c'} 
        strokeWidth="1"
      >
        <polyline points="6,9 12,15 18,9" />
      </svg>
    </button>
  )
}
