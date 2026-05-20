import { useState, useEffect } from 'react'
import { useSignIn, useAuth, useClerk } from '@clerk/clerk-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import styles from '../styles/Login.module.css'

export default function Login() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { isSignedIn } = useAuth()

  useEffect(() => {
    if (isSignedIn) {
      navigate(redirectUrl)
    }
  }, [isSignedIn, navigate, redirectUrl])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setError('')

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        navigate(redirectUrl)
      }
    } catch (err) {
      setError(
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        'Error al iniciar sesión. Verifica tus datos.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = (strategy) => {
    if (!isLoaded) return
    signIn.authenticateWithRedirect({
      strategy,
      fallbackRedirectUrl: window.location.origin + '/sso-callback',
      redirectUrl: window.location.origin + '/sso-callback',
      redirectUrlComplete: window.location.origin + redirectUrl,
    }).catch(async (err) => {
      console.error("OAuth Error:", err)
      // Recuperación automática de sesión fantasma
      if (err.errors?.[0]?.code === 'session_exists' || err.message?.includes('already signed in')) {
        await signOut()
        window.location.reload()
      }
    })
  }

  return (
    <div className={styles.page}>

      {/* ── Panel visual izquierdo — idéntico al registro ── */}
      <div className={styles.visual}>
        <div className={styles.visualBg} />
        <div className={styles.visualOverlay} />

        <div className={styles.visualScene}>
          <div className={styles.horizon} />
          <div className={styles.sunReflection} />
          <svg className={styles.palm} 
            viewBox="0 0 100 280" fill="none">
            <path d="M50 280 C50 280 44 220 47 165 C49 130 43 90 40 50"
              stroke="rgba(10,6,3,0.7)" strokeWidth="3.5"
              fill="none" strokeLinecap="round"/>
            <path d="M40 50 C40 50 5 32 0 12 C18 22 38 40 40 50Z"
              fill="rgba(10,6,3,0.55)"/>
            <path d="M40 50 C40 50 25 18 28 0 C36 18 41 38 40 50Z"
              fill="rgba(10,6,3,0.5)"/>
            <path d="M40 50 C40 50 62 18 76 10 C62 26 46 44 40 50Z"
              fill="rgba(10,6,3,0.55)"/>
            <path d="M40 50 C40 50 78 36 92 32 C74 42 50 50 40 50Z"
              fill="rgba(10,6,3,0.45)"/>
            <path d="M40 50 C40 50 15 56 2 64 C18 54 38 50 40 50Z"
              fill="rgba(10,6,3,0.4)"/>
          </svg>
          <svg className={styles.arch}
            viewBox="0 0 180 240" fill="none">
            <path d="M15 240 L15 108 C15 52 165 52 165 108 L165 240"
              stroke="rgba(201,169,110,0.18)" strokeWidth="1"
              fill="rgba(201,169,110,0.02)"/>
            <line x1="15" y1="240" x2="165" y2="240"
              stroke="rgba(201,169,110,0.12)" strokeWidth="1"/>
            <rect x="72" y="130" width="36" height="50"
              stroke="rgba(201,169,110,0.12)" strokeWidth="1"
              fill="rgba(201,169,110,0.03)"/>
            <path d="M72 130 C72 115 108 115 108 130"
              stroke="rgba(201,169,110,0.12)" strokeWidth="1"
              fill="none"/>
          </svg>
        </div>

        <Link to="/" className={styles.floatingLogo}>
          <span className={styles.floatingLogoMain}>
            Casa d'Oro
          </span>
          <span className={styles.floatingLogoSub}>
            El Tunco · Est. 1952
          </span>
        </Link>

        <div className={styles.floatingQuote}>
          <div className={styles.quoteEyebrow}>
            <span className={styles.qLine} />
            <span className={styles.qLabel}>El Legado</span>
          </div>
          <blockquote className={styles.qText}>
            "Bienvenido de regreso a la hacienda."
          </blockquote>
          <p className={styles.qSub}>
            Casa d'Oro · El Tunco · Est. 1952
          </p>
        </div>
      </div>

      {/* ── Panel formulario ── */}
      <div className={styles.formPanel}>
        <div className={styles.glassCard}>
          
          {/* Borde superior dorado decorativo */}
          <div className={styles.cardTopBorder} />

          {/* Header */}
          <div className={styles.cardHeader}>
            <span className={styles.cardEyebrow}>
              Acceso privado
            </span>
            <h1 className={styles.cardTitle}>
              Inicia sesión
            </h1>
            <p className={styles.cardSubtitle}>
              ¿Prefieres reservar sin cuenta?{' '}
              <Link to="/contact" className={styles.cardLink}>
                Continúa como invitado
              </Link>
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={styles.fieldInput}
                placeholder="tu@correo.com"
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={styles.fieldInput}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className={styles.errorMsg}>{error}</p>
            )}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.divLine} />
            <span className={styles.divLabel}>o</span>
            <span className={styles.divLine} />
          </div>

          {/* OAuth — 3 botones en grid */}
          <div className={styles.oauthGrid}>
            
            <button className={styles.oauthBtn}
              onClick={() => handleOAuth('oauth_google')}
              type="button">
              <svg width="16" height="16" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              <span>Google</span>
            </button>

            <button className={styles.oauthBtn}
              onClick={() => handleOAuth('oauth_apple')}
              type="button">
              <svg width="14" height="16" viewBox="0 0 814 1000">
                <path fill="rgba(250,246,238,0.9)" 
                  d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.4-150.3-96.8c-52.3-62-96.2-157.7-96.2-248.3 0-236.4 154.4-360.9 305.8-360.9 79.7 0 146.1 52.5 195.5 52.5 47.4 0 121.9-55.5 209.2-55.5zm-105.4-154.9c4.8-45.1 38.8-88.8 71.3-116.7 35.6-30.2 93.9-53.8 136.1-53.8 1.3 0 2.6.1 3.8.2 2.8 45.8-14.1 91.8-47.3 124.7-28.3 29-75.8 53.7-114.8 53.7-1.5 0-3-.1-4.5-.2z"/>
              </svg>
              <span>Apple</span>
            </button>

            <button className={styles.oauthBtn}
              onClick={() => handleOAuth('oauth_microsoft')}
              type="button">
              <svg width="16" height="16" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
              </svg>
              <span>Microsoft</span>
            </button>

          </div>


        {/* Footer */}
        <div className={styles.cardFooter}>
          <p className={styles.registerPrompt}>
            ¿Primera visita?{' '}
            <Link to="/registro" className={styles.cardLink}>
              Crea tu cuenta
            </Link>
          </p>
          <Link to="/" className={styles.backLink}>
            ← Volver al inicio
          </Link>
        </div>

      </div>
      {/* fin glassCard */}

    </div>
  </div>
)
}
