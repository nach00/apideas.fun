import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, ReactNode } from 'react'
import { logAuth } from '@/lib/logger'
import styles from './AuthGuard.module.css'

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
}

export default function AuthGuard({ 
  children, 
  requireAuth = false, 
  requireAdmin = false 
}: AuthGuardProps): JSX.Element {
  const { data: session, status } = useSession()
  const router = useRouter()

  // AuthGuard component rendering

  useEffect(() => {
    // AuthGuard useEffect triggered
    
    if (status === 'loading') {
      // Status is loading, returning early
      return; // Still loading
    }

    // Only redirect if router is ready to avoid SSG issues
    if (!router.isReady) {
      // Router not ready, returning early
      return;
    }

    if (requireAuth && !session) {
      // Auth required but no session, redirecting to login
      logAuth("Redirecting unauthenticated user", { from: router.asPath });
      router.push('/login');
      return;
    }

    if (requireAdmin && (!session || session.user.role !== 'admin')) {
      // Admin required but user is not admin, redirecting to dashboard
      logAuth("Redirecting non-admin user", { 
        role: session?.user.role, 
        from: router.asPath 
      });
      router.push('/dashboard');
      return;
    }
    
    if (requireAuth && session) {
      // Auth required and session exists, allowing access
    }
  }, [session, status, router, requireAuth, requireAdmin])


  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingWrapper}>
            <div className={styles.loadingContent}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (requireAuth && !session) {
    return <div></div> // Will redirect
  }

  if (requireAdmin && (!session || session.user.role !== 'admin')) {
    return <div></div> // Will redirect
  }

  return <>{children}</>
}