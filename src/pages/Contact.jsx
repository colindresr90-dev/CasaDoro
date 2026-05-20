import { useState, useEffect } from 'react';
import styles from './Contact.module.css';
import { useScrollCinema } from '../hooks/useScrollCinema';
import gsap from 'gsap';

const Contact = () => {
  useScrollCinema();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    arrival: '',
    departure: '',
    suite: 'Planter\'s Loft',
    requests: ''
  });

  useEffect(() => {
    document.title = "Contacto | Casa d'Oro – El Tunco, El Salvador";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', "Comienza tu estancia en Casa d'Oro en El Tunco. Reserva suites de lujo, planea tu retiro o solicita nuestro conserje privado.");
    }

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
    alert('Gracias por su solicitud. Nuestro conserje se pondrá en contacto con usted a la brevedad.');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.page}>
      <section className={`${styles.hero} parallax-slow`}>
        <div className={styles.filmGrain} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            {"Encuéntranos".split('').map((char, index) => (
              <span key={index} className={styles.char}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
          <p className={styles.heroSub}>
            El Tunco · La Libertad · El Salvador
          </p>
        </div>
      </section>

      <div className="container">
        <section className={styles.formSection}>
          <div className={`${styles.formContainer} reveal-left`}>
            <h2 className="reveal-headline">Comienza tu Estancia</h2>
            <form className={`${styles.form} reveal-stagger`} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>Nombre Completo</label>
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
                <label>Correo electrónico</label>
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
                  <label>Fecha de llegada</label>
                  <input 
                    type="date" 
                    name="arrival" 
                    value={formData.arrival} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Fecha de salida</label>
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
                <label>Tipo de suite</label>
                <select name="suite" value={formData.suite} onChange={handleChange}>
                  <option>Planter's Loft</option>
                  <option>Reef Sanctuary</option>
                  <option>Pacific Vault</option>
                  <option>Casa d'Oro Master</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Solicitudes especiales</label>
                <textarea 
                  name="requests" 
                  rows="4" 
                  value={formData.requests} 
                  onChange={handleChange} 
                  placeholder="Preferencias de lino, requisitos dietéticos..."
                ></textarea>
              </div>

              <button type="submit" className={`${styles.submitBtn} hover-trigger`}>
                Enviar solicitud
              </button>
            </form>
          </div>

          <div className={`${styles.infoContainer} reveal-right`}>
            <div className={`${styles.infoItem} reveal-up`}>
              <h4>Dirección</h4>
              <p>Km 42.5 Lote 17, El Tunco, La Libertad</p>
            </div>
            <div className={`${styles.infoItem} reveal-up`}>
              <h4>Conserjería WhatsApp</h4>
              <p>+503 7788 9900</p>
            </div>
            <div className={`${styles.infoItem} reveal-up`}>
              <h4>Consultas Generales</h4>
              <p>ciao@casadoro.sv</p>
            </div>
            
            <div className={`${styles.transferCard} reveal-scale`}>
              <p className={styles.transferQuote}>
                "El viaje es tan silencioso como el destino."
              </p>
              <p className={styles.transferText}>
                Traslados privados desde el aeropuerto de San Salvador (SAL) disponibles bajo petición. 
                Tiempo promedio de viaje: 45 minutos.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className={styles.surroundings}>
        <div className="container">
          <h2 className={`${styles.surroundTitle} reveal-headline`}>Los Alrededores</h2>
          <div className={`${styles.surroundingsGrid} reveal-stagger`}>
            <div className={styles.surroundCard}>
              <span className={styles.distance}>a solo 2 min</span>
              <h5>El Tunco Village</h5>
              <p>Cultura surf vibrante, mercados artesanales y el pulso de la costa salvadoreña.</p>
            </div>
            <div className={styles.surroundCard}>
              <span className={styles.distance}>a solo 15 min</span>
              <h5>El Zonte</h5>
              <p>Conocida mundialmente como Bitcoin Beach, un centro de innovación y olas de clase mundial.</p>
            </div>
            <div className={styles.surroundCard}>
              <span className={styles.distance}>a solo 20 min</span>
              <h5>Mercado de La Libertad</h5>
              <p>El corazón auténtico del comercio costero. Pesca fresca y artesanías locales.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
