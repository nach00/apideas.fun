import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import styles from './login.module.css'

export default function LoginPage(): JSX.Element {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (showLogin) {
        // Login
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError('Invalid email or password')
        } else {
          router.push('/dashboard')
        }
      } else {
        // Register
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password }),
        })

        const data = await response.json()

        if (response.ok) {
          // Auto-login after registration
          await signIn('credentials', {
            email,
            password,
            redirect: false,
          })
          router.push('/dashboard')
        } else {
          setError(data.message || 'Registration failed')
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string): Promise<void> => {
    await signIn(provider, { callbackUrl: '/dashboard' })
  }

  // Handle redirect for authenticated users
  useEffect(() => {
    if (status === 'authenticated' && session && router.isReady) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  // Show loading state while checking auth or redirecting
  if (status === 'loading') {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner} />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Show redirect screen for authenticated users
  if (session) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner} />
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
          <div className={styles.loginHeader}>
            <Link href="/" className={styles.backLink}>
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
              </svg>
              Back to home
            </Link>
            
            <div className={styles.loginBrand}>
              <h1 className={styles.loginTitle}>
                {showLogin ? 'Welcome back' : 'Join APIdeas'}
              </h1>
              <p className={styles.loginSubtitle}>
                {showLogin 
                  ? 'Continue your innovation journey'
                  : 'Start building million-dollar ideas'
                }
              </p>
            </div>
          </div>

          <div className={styles.loginMain}>
            <div className={styles.authTabs}>
              <button 
                className={`${styles.authTab} ${showLogin ? styles.authTabActive : ''}`}
                onClick={() => setShowLogin(true)}
              >
                Sign In
              </button>
              <button 
                className={`${styles.authTab} ${!showLogin ? styles.authTabActive : ''}`}
                onClick={() => setShowLogin(false)}
              >
                Sign Up
              </button>
            </div>

            {/* Demo Accounts - Show for login */}
            {showLogin && (
              <div className={styles.demoAccountsSection}>
                <div className={styles.demoQuickAccess}>
                  <span className={styles.demoLabel}>🚀 Quick Demo Access - Click to auto-fill</span>
                  <div className={styles.demoButtons}>
                    <button 
                      className={`${styles.demoBtn} ${styles.demoBtnUser}`}
                      onClick={() => {
                        setEmail('test@example.com');
                        setPassword('test123');
                      }}
                    >
                      👤 User Demo
                      <small>test@example.com</small>
                    </button>
                    <button 
                      className={`${styles.demoBtn} ${styles.demoBtnRich}`}
                      onClick={() => {
                        setEmail('rich@apideas.com');
                        setPassword('rich123');
                      }}
                    >
                      💰 Rich User
                      <small>1M coins • rich@apideas.com</small>
                    </button>
                    <button 
                      className={`${styles.demoBtn} ${styles.demoBtnAdmin}`}
                      onClick={() => {
                        setEmail('admin@apideas.com');
                        setPassword('admin123');
                      }}
                    >
                      👑 Admin Demo
                      <small>admin@apideas.com</small>
                    </button>
                  </div>
                  <div className={styles.demoNote}>
                    <span>💡 Demo credentials are automatically filled. Just click a button above, then &quot;Access Dashboard&quot;</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className={`${styles.alert} ${styles.alertError}`}>
                <svg className={styles.alertIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.authFormModern} noValidate>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <input
                    id="email"
                    type="email"
                    className={styles.formInputModern}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                  />
                </div>

                {!showLogin && (
                  <div className={styles.formGroup}>
                    <input
                      id="username"
                      type="text"
                      className={styles.formInputModern}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      required
                      minLength={3}
                      maxLength={20}
                    />
                  </div>
                )}

                <div className={styles.formGroup}>
                  <input
                    id="password"
                    type="password"
                    className={styles.formInputModern}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`${styles.authSubmitBtn} ${loading ? styles.authSubmitBtnLoading : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className={styles.loadingSpinner} />
                    <span>Getting you in...</span>
                  </>
                ) : (
                  <>
                    <span>{showLogin ? 'Access Dashboard' : 'Start Free Trial'}</span>
                    <svg className={styles.submitIcon} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className={styles.authDividerModern}>
              <span>or continue with</span>
            </div>

            <div className={styles.oauthButtonsModern}>
              <button
                onClick={() => handleOAuthSignIn('github')}
                className={`${styles.oauthBtnModern} ${styles.oauthBtnGithub}`}
                type="button"
              >
                <svg className={styles.oauthIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
              <button
                onClick={() => handleOAuthSignIn('google')}
                className={`${styles.oauthBtnModern} ${styles.oauthBtnGoogle}`}
                type="button"
              >
                <svg className={styles.oauthIcon} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>

            <div className={styles.authTrustSignals}>
              <div className={styles.trustItem}>
                <svg className={styles.trustIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>SOC 2 Compliant</span>
              </div>
              <div className={styles.trustItem}>
                <svg className={styles.trustIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>GDPR Ready</span>
              </div>
              <div className={styles.trustItem}>
                <svg className={styles.trustIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>99.9% Uptime</span>
              </div>
            </div>

            <div className={styles.loginFooter}>
              <p className={styles.loginFooterText}>
                {showLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setShowLogin(!showLogin)}
                  className={styles.loginFooterLink}
                >
                  {showLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};