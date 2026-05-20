import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.logo}>
            <h3>Casa d'Oro</h3>
            <p>El Tunco · Est. 1932</p>
          </div>
          
          <div className={styles.nav}>
            <Link to="/suites">Las Suites</Link>
            <Link to="/dining">Gastronomía</Link>
            <Link to="/wellness">Bienestar & Surf</Link>
          </div>
          
          <div className={styles.social}>
            <a href="#" className="hover-trigger">Instagram</a>
            <a href="mailto:reservas@casadoro.com" style={{ marginLeft: '20px' }}>reservas@casadoro.com</a>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p>El Tunco, La Libertad, El Salvador</p>
          <p>© 2024 Casa d'Oro. Todos los derechos reservados. Reservas: reservas@casadoro.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
