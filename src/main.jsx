import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'
import './styles/global.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Falta VITE_CLERK_PUBLISHABLE_KEY en .env')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      signInUrl="/login"
      signUpUrl="/registro"
      appearance={{
        variables: {
          colorPrimary: '#C9A96E',
          colorBackground: '#FAF6EE',
          colorText: '#1A1A1A',
          colorInputBackground: 'transparent',
          colorInputText: '#1A1A1A',
          borderRadius: '0px',
          fontFamily: 'Jost, system-ui, sans-serif',
        },
        elements: {
          footer: { display: 'none' },
          card: { boxShadow: 'none', border: 'none' }
        }
      }}
    >
      <App />
    </ClerkProvider>
  </BrowserRouter>
)
