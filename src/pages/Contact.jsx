import { useState, useEffect } from 'react';
import styles from './Contact.module.css';
import { useScrollCinema } from '../hooks/useScrollCinema';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';

const Contact = () => {
  useScrollCinema();
  const { t, language, translations } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    arrival: '',
    departure: '',
    suite: "Planter's Loft",
    requests: ''
  });

  useEffect(() => {
    document.title = t('seoTitle', 'contact');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', t('seoDesc', 'contact'));
    }
  }, [language, t]);

  useEffect(() => {
    // Hero title animation
    const chars = document.querySelectorAll(`.${styles.char}`);
    if (chars.length > 0) {
      gsap.fromTo(chars, {
        opacity: 0,
        y: 30,
        rotateX: 20,
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
        stagger: 0.04,
        delay: 0.2
      });
    }

    // Stagger reveal on surroundings cards
    gsap.fromTo(`.${styles.surroundCard}`, 
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.15,
        scrollTrigger: { trigger: `.${styles.surroundings}`, start: 'top 85%' } }
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    alert(t('formSuccess', 'contact'));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const heroTitleText = t('heroTitle', 'contact');

  return (
    <div className={styles.page}>
      <section className={`${styles.hero} parallax-slow`}>
        <div className={styles.filmGrain} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            {heroTitleText.split('').map((char, index) => (
              <span key={index} className={styles.char}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
          <p className={styles.heroSub}>
            {t('heroSub', 'contact')}
          </p>
        </div>
      </section>

      <div className="container">
        <section className={styles.formSection}>
          <div className={`${styles.formContainer} reveal-left`}>
            <h2 className="reveal-headline">{t('formTitle', 'contact')}</h2>
            <form className={`${styles.form} reveal-stagger`} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>{t('formName', 'contact')}</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Adriano Celentano" 
                  required 
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label>{t('formEmail', 'contact')}</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="adriano@riviera.it" 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className={styles.inputGroup}>
                  <label>{t('formArrival', 'contact')}</label>
                  <input 
                    type="date" 
                    name="arrival" 
                    value={formData.arrival} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>{t('formDeparture', 'contact')}</label>
                  <input 
                    type="date" 
                    name="departure" 
                    value={formData.departure} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>{t('formSuite', 'contact')}</label>
                <select name="suite" value={formData.suite} onChange={handleChange}>
                  <option value="Planter's Loft">{translations.suites?.suiteData?.['planter-loft']?.nombre || "Planter's Loft"}</option>
                  <option value="Reef Sanctuary">{translations.suites?.suiteData?.['reef-sanctuary']?.nombre || "Reef Sanctuary"}</option>
                  <option value="Pacific Vault">{translations.suites?.suiteData?.['pacific-vault']?.nombre || "Pacific Vault"}</option>
                  <option value="Casa d'Oro Master">{translations.suites?.suiteData?.['master-suite']?.nombre || "Casa d'Oro Master"}</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>{t('formRequests', 'contact')}</label>
                <textarea 
                  name="requests" 
                  rows="4" 
                  value={formData.requests} 
                  onChange={handleChange} 
                  placeholder={t('formRequestsPlaceholder', 'contact')}
                ></textarea>
              </div>

              <button type="submit" className={`${styles.submitBtn} hover-trigger`}>
                {t('formSubmit', 'contact')}
              </button>
            </form>
          </div>

          <div className={`${styles.infoContainer} reveal-right`}>
            <div className={`${styles.infoItem} reveal-up`}>
              <h4>{t('infoAddress', 'contact')}</h4>
              <p>Km 42.5 Lote 17, El Tunco, La Libertad</p>
            </div>
            <div className={`${styles.infoItem} reveal-up`}>
              <h4>{t('infoWhatsapp', 'contact')}</h4>
              <p>+503 7788 9900</p>
            </div>
            <div className={`${styles.infoItem} reveal-up`}>
              <h4>{t('infoQueries', 'contact')}</h4>
              <p>ciao@casadoro.sv</p>
            </div>
            
            <div className={`${styles.transferCard} reveal-scale`}>
              <p className={styles.transferQuote}>
                {t('transferQuote', 'contact')}
              </p>
              <p className={styles.transferText}>
                {t('transferText', 'contact')}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className={styles.surroundings}>
        <div className="container">
          <h2 className={`${styles.surroundTitle} reveal-headline`}>{t('surroundTitle', 'contact')}</h2>
          <div className={`${styles.surroundingsGrid} reveal-stagger`}>
            <div className={styles.surroundCard}>
              <span className={styles.distance}>{t('surroundCard1Distance', 'contact')}</span>
              <h5>{t('surroundCard1Title', 'contact')}</h5>
              <p>{t('surroundCard1Text', 'contact')}</p>
            </div>
            <div className={styles.surroundCard}>
              <span className={styles.distance}>{t('surroundCard2Distance', 'contact')}</span>
              <h5>{t('surroundCard2Title', 'contact')}</h5>
              <p>{t('surroundCard2Text', 'contact')}</p>
            </div>
            <div className={styles.surroundCard}>
              <span className={styles.distance}>{t('surroundCard3Distance', 'contact')}</span>
              <h5>{t('surroundCard3Title', 'contact')}</h5>
              <p>{t('surroundCard3Text', 'contact')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
