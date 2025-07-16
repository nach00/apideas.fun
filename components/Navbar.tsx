import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { formatNumber } from '@/lib/card-utils'
import styles from './Navbar.module.css'

interface NavLink {
  href: string
  label: string
  icon: JSX.Element
  requiresAuth?: boolean
}

export default function Navbar(): JSX.Element {
  const { data: session } = useSession()
  const router = useRouter()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Navigation links configuration
  const navLinks: NavLink[] = []

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    if (router.isReady) {
      setIsMobileMenuOpen(false)
    }
  }, [router.pathname, router.isReady])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    if (router.isReady) {
      router.push('/')
    }
  }

  const isActiveRoute = (href: string) => {
    if (!router.isReady) return false
    if (href === '/') return router.pathname === href
    return router.pathname.startsWith(href)
  }

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`} role="navigation" aria-label="Main navigation">
      <div className={styles.navbarContainer}>
        {/* Logo */}
        <Link href="/" className={styles.navbarLogo}>
          <svg className={styles.navbarLogoIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" />
            <path d="M2 17L12 22L22 17" strokeWidth="0" />
            <path d="M2 12L12 17L22 12" strokeWidth="0" />
          </svg>
          <span className={styles.navbarLogoText}>APIdeas</span>
        </Link>

        {/* Desktop Navigation */}
        {session ? (
          <>
            <nav className={styles.navbarLinks} aria-label="Primary navigation">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navbarLink} ${isActiveRoute(link.href) ? styles.navbarLinkActive : ''}`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className={styles.navbarActions}>
              {/* Coin Balance */}
              <Link href="/shop" className={styles.navbarCoins}>
                <svg className={styles.coinIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" />
                </svg>
                <span className={styles.coinBalance}>{formatNumber(session.user?.coinBalance || 0)}</span>
              </Link>

              {/* User Menu */}
              <div className={styles.navbarUser} ref={dropdownRef}>
                <button
                  className={styles.navbarUserButton}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className={styles.userAvatar}>
                    {session.user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className={styles.userName}>{session.user?.username || 'User'}</span>
                  <svg className={`${styles.dropdownIcon} ${isUserMenuOpen ? styles.dropdownIconOpen : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className={styles.navbarDropdown} role="menu">
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownEmail}>{session.user?.email}</div>
                    </div>
                    
                    <Link href="/settings" className={styles.dropdownItem} role="menuitem" onClick={() => setIsUserMenuOpen(false)}>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
                      </svg>
                      <span>Settings</span>
                    </Link>

                    {session.user?.role === 'admin' && (
                      <Link href="/admin" className={`${styles.dropdownItem} ${styles.dropdownItemAdmin}`} role="menuitem" onClick={() => setIsUserMenuOpen(false)}>
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zM10 8a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 0110 8z" />
                        </svg>
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    
                    <div className={styles.dropdownDivider} />
                    
                    <button onClick={handleSignOut} className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} role="menuitem">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className={`${styles.navbarMobileToggle} ${isMobileMenuOpen ? styles.navbarMobileToggleActive : ''}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <span className={styles.toggleLine}></span>
                <span className={styles.toggleLine}></span>
                <span className={styles.toggleLine}></span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Auth Links */}
            <div className={styles.navbarAuth}>
              <Link href="/api/auth/signin" className={styles.navbarSignup}>
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Toggle (Non-auth) */}
            <button
              className={`navbar-mobile-toggle ${isMobileMenuOpen ? 'navbar-mobile-toggle--active' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <span className={styles.toggleLine}></span>
              <span className={styles.toggleLine}></span>
              <span className={styles.toggleLine}></span>
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.navbarMobile} ${isMobileMenuOpen ? styles.navbarMobileOpen : ''}`} ref={mobileMenuRef}>
        <div className={styles.navbarMobileContent}>
          {session ? (
            <>
              <div className={styles.mobileUserInfo}>
                <div className={styles.mobileAvatar}>
                  {session.user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className={styles.mobileUserDetails}>
                  <div className={styles.mobileUsername}>{session.user?.username || 'User'}</div>
                  <div className={styles.mobileEmail}>{session.user?.email}</div>
                </div>
              </div>

              <nav className={styles.mobileNav}>
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${styles.mobileNavLink} ${isActiveRoute(link.href) ? styles.mobileNavLinkActive : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
                
                <Link 
                  href="/shop" 
                  className={styles.mobileNavLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className={styles.navIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" />
                  </svg>
                  <span>Shop ({formatNumber(session.user?.coinBalance || 0)} coins)</span>
                </Link>
                
                <Link 
                  href="/settings" 
                  className={styles.mobileNavLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className={styles.navIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                  <span>Settings</span>
                </Link>
                
                {session.user?.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className={`${styles.mobileNavLink} ${styles.mobileNavLinkAdmin}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className={styles.navIcon} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zM10 8a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 0110 8z" />
                    </svg>
                    <span>Admin Panel</span>
                  </Link>
                )}
              </nav>

              <div className={styles.mobileActions}>
                <button onClick={handleSignOut} className={styles.mobileSignout}>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className={styles.mobileAuth}>
              <Link href="/api/auth/signin" className={styles.mobileSignup} onClick={() => setIsMobileMenuOpen(false)}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}