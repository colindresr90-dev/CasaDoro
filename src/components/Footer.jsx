import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.logo}>
            <h3>Casa d'Oro</h3>
            <p>El Tunco · Est. 1932</p>
          </div>
          
          <div className={styles.nav}>
            <Link to="/suites">{t('suites', 'footer')}</Link>
            <Link to="/dining">{t('dining', 'footer')}</Link>
            <Link to="/wellness">{t('wellness', 'footer')}</Link>
          </div>
          
          <div className={styles.social}>
            <a href="#" className="hover-trigger">Instagram</a>
            <a href="mailto:reservas@casadoro.com" style={{ marginLeft: '20px' }}>reservas@casadoro.com</a>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p>{t('address', 'footer')}</p>
          <p>{t('copyright', 'footer')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
