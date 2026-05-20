import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import styles from '../styles/SSOCallback.module.css'

export default function SSOCallback() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <span className={styles.logo}>Casa d'Oro</span>
        <div className={styles.loader}>
          <div className={styles.loaderLine} />
        </div>
        <span className={styles.text}>
          Verificando acceso...
        </span>
      </div>
      <AuthenticateWithRedirectCallback 
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
    </div>
  )
}
