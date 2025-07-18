import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { formatNumber } from '@/lib/card-utils'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/auth/AuthGuard'
import EditUserModal, { User, UserUpdates } from '@/components/EditUserModal'
import styles from './admin.module.css'

interface AdminStats {
  totalUsers: number
  totalCards: number
  totalTransactions: number
  totalRevenue: number
  activeUsers: number
  cardsToday: number
  revenueToday: number
  avgRating: number
}


interface Transaction {
  id: string
  userId: string
  type: string
  amount: number
  description: string
  createdAt: string
}

interface Activity {
  id: string
  type: 'user_registered' | 'card_generated' | 'purchase' | 'login'
  userId: string
  username: string
  description: string
  timestamp: string
}

export default function AdminPage(): JSX.Element {
  const router = useRouter()
  const { tab } = router.query
  
  // Initialize activeTab from URL query parameter, default to 'overview'
  const initialTab = (tab as string) || 'overview'
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'system'>(
    initialTab as 'overview' | 'users' | 'transactions' | 'system'
  )
  
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [userFilter, setUserFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [generatingCards, setGeneratingCards] = useState(false)
  const [generationResult, setGenerationResult] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  // Sync activeTab with URL query parameter
  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab as 'overview' | 'users' | 'transactions' | 'system')
    }
  }, [tab, activeTab])

  // Handle tab change - update URL without page reload
  const handleTabChange = (newTab: 'overview' | 'users' | 'transactions' | 'system') => {
    setActiveTab(newTab)
    router.push(`/admin?tab=${newTab}`, undefined, { shallow: true })
  }

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true)
      // Fetching admin data
      
      const [statsRes, usersRes, transactionsRes, activityRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/transactions'),
        fetch('/api/admin/activity')
      ])

      // API responses received

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        // Stats data loaded
        setStats(statsData)
      } else {
        console.error('Stats API error:', await statsRes.text())
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        // Users data loaded
        setUsers(usersData)
      } else {
        console.error('Users API error:', await usersRes.text())
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        // Transactions data loaded
        setTransactions(transactionsData)
      } else {
        console.error('Transactions API error:', await transactionsRes.text())
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json()
        // Activity data loaded
        setRecentActivity(activityData)
      } else {
        console.error('Activity API error:', await activityRes.text())
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAllCards = async (): Promise<void> => {
    setGeneratingCards(true)
    setGenerationResult(null)
    
    try {
      const response = await fetch('/api/admin/generate-all-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setGenerationResult(`Success! ${data.newCardsAdded} new cards added. Total cards: ${data.totalCards}`)
        // Refresh the stats to show updated numbers
        fetchData()
      } else {
        setGenerationResult(`Error: ${data.message}`)
      }
    } catch (error) {
      setGenerationResult(`Error: Failed to generate cards - ${error}`)
    } finally {
      setGeneratingCards(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = userFilter === 'all' || user.role === userFilter
    return matchesSearch && matchesFilter
  })

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setSelectedUser(user)
      setEditModalOpen(true)
    }
  }

  const handleSaveUser = async (userId: string, updates: UserUpdates) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      alert(data.message || 'User updated successfully!')
      fetchData() // Refresh the data
    } catch (error) {
      console.error('Error updating user:', error)
      alert(`Error: Failed to update user - ${error}`)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      const confirmed = confirm(`Are you sure you want to delete user ${user.username}? This action cannot be undone.`)
      
      if (confirmed) {
        const doubleConfirm = confirm('This will permanently delete all user data including cards and transactions. Are you absolutely sure?')
        
        if (doubleConfirm) {
          try {
            const response = await fetch(`/api/admin/users/${userId}`, {
              method: 'DELETE',
            })
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()
            alert(data.message || 'User deleted successfully!')
            fetchData() // Refresh the data
          } catch (error) {
            console.error('Error deleting user:', error)
            alert(`Error: Failed to delete user - ${error}`)
          }
        }
      }
    }
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'user_registered':
        return (
          <svg className={`${styles.activityIcon} ${styles.activityIconSuccess}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
        )
      case 'card_generated':
        return (
          <svg className={`${styles.activityIcon} ${styles.activityIconPrimary}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v8h10V6H5z" />
          </svg>
        )
      case 'purchase':
        return (
          <svg className={`${styles.activityIcon} ${styles.activityIconWarning}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.447.894L10 15.118l-4.553 1.776A1 1 0 014 16V4z" />
          </svg>
        )
      case 'login':
        return (
          <svg className={`${styles.activityIcon} ${styles.activityIconInfo}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <AuthGuard requireAuth requireAdmin>
        <Navbar />
        <div className={styles.adminPage}>
          <div className={styles.adminContainer}>
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner} />
              <h2>Loading Admin Dashboard...</h2>
              <p>Gathering system data and analytics</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth requireAdmin>
      <Navbar />
      <div className={styles.adminPage}>
        <div className={styles.adminContainer}>
          {/* Header */}
          <header className={styles.adminHeader}>
            <div className={styles.adminHeaderContent}>
              <div className={styles.adminHeaderTitle}>
                <h1>Admin Dashboard</h1>
                <div className={styles.adminBadge}>
                  <svg className={styles.adminBadgeIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  Administrator
                </div>
              </div>
              <div className={styles.adminHeaderActions}>
                <button 
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                  onClick={fetchData}
                >
                  <svg className={styles.btnIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
                  </svg>
                  Refresh Data
                </button>
              </div>
            </div>
          </header>

          {/* Navigation Tabs */}
          <nav className={styles.adminNav}>
            <button 
              className={`${styles.adminNavTab} ${activeTab === 'overview' ? styles.adminNavTabActive : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              <svg className={styles.adminNavIcon} viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Overview
            </button>
            <button 
              className={`${styles.adminNavTab} ${activeTab === 'users' ? styles.adminNavTabActive : ''}`}
              onClick={() => handleTabChange('users')}
            >
              <svg className={styles.adminNavIcon} viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Users
            </button>
            <button 
              className={`${styles.adminNavTab} ${activeTab === 'transactions' ? styles.adminNavTabActive : ''}`}
              onClick={() => handleTabChange('transactions')}
            >
              <svg className={styles.adminNavIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              Transactions
            </button>
            <button 
              className={`${styles.adminNavTab} ${activeTab === 'system' ? styles.adminNavTabActive : ''}`}
              onClick={() => handleTabChange('system')}
            >
              <svg className={styles.adminNavIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
              System
            </button>
          </nav>

          {/* Tab Content */}
          <main className={styles.adminMain}>
            {activeTab === 'overview' && (
              <div className={styles.adminOverview}>
                {/* Stats Grid */}
                {stats && (
                  <section className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${styles.statCardPrimary}`}>
                      <div className={styles.statCardIcon}>
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      </div>
                      <div className={styles.statCardContent}>
                        <div className={styles.statCardValue}>{formatNumber(stats.totalUsers)}</div>
                        <div className={styles.statCardLabel}>Total Users</div>
                        <div className={`${styles.statCardChange} ${styles.statCardChangeUp}`}>
                          +{stats.activeUsers} active today
                        </div>
                      </div>
                    </div>

                    <div className={`${styles.statCard} ${styles.statCardSuccess}`}>
                      <div className={styles.statCardIcon}>
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v8h10V6H5z" />
                        </svg>
                      </div>
                      <div className={styles.statCardContent}>
                        <div className={styles.statCardValue}>{formatNumber(stats.totalCards)}</div>
                        <div className={styles.statCardLabel}>Cards Generated</div>
                        <div className={`${styles.statCardChange} ${styles.statCardChangeUp}`}>
                          +{stats.cardsToday} today
                        </div>
                      </div>
                    </div>

                    <div className={`${styles.statCard} ${styles.statCardWarning}`}>
                      <div className={styles.statCardIcon}>
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </div>
                      <div className={styles.statCardContent}>
                        <div className={styles.statCardValue}>${(stats.totalRevenue || 0).toFixed(2)}</div>
                        <div className={styles.statCardLabel}>Total Revenue</div>
                        <div className={`${styles.statCardChange} ${styles.statCardChangeUp}`}>
                          +${(stats.revenueToday || 0).toFixed(2)} today
                        </div>
                      </div>
                    </div>

                    <div className={`${styles.statCard} ${styles.statCardInfo}`}>
                      <div className={styles.statCardIcon}>
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                        </svg>
                      </div>
                      <div className={styles.statCardContent}>
                        <div className={styles.statCardValue}>{(stats.avgRating || 0).toFixed(1)}</div>
                        <div className={styles.statCardLabel}>Avg Rating</div>
                        <div className={`${styles.statCardChange} ${styles.statCardChangeNeutral}`}>
                          Quality Score
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Recent Activity */}
                <section className={styles.recentActivity}>
                  <div className={styles.sectionHeader}>
                    <h2>Recent Activity</h2>
                    <p>Live system events and user actions</p>
                  </div>
                  <div className={styles.activityFeed}>
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className={styles.activityItem}>
                        {getActivityIcon(activity.type)}
                        <div className={styles.activityContent}>
                          <div className={styles.activityDescription}>{activity.description}</div>
                          <div className={styles.activityMeta}>
                            <span className={styles.activityUser}>{activity.username}</span>
                            <span className={styles.activityTime}>{new Date(activity.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'users' && (
              <div className={styles.adminUsers}>
                <div className={styles.sectionHeader}>
                  <h2>User Management</h2>
                  <p>View and manage user accounts</p>
                </div>

                {/* Filters */}
                <div className={styles.filters}>
                  <div className={styles.filterGroup}>
                    <input 
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>
                  <div className={styles.filterGroup}>
                    <select 
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value as 'all' | 'admin' | 'user')}
                      className={styles.filterSelect}
                    >
                      <option value="all">All Users</option>
                      <option value="admin">Admins</option>
                      <option value="user">Regular Users</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className={styles.dataTable}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Cards</th>
                        <th>Balance</th>
                        <th>Joined</th>
                        <th>Last Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className={styles.userInfo}>
                              <div className={styles.userAvatar}>{user.username.charAt(0).toUpperCase()}</div>
                              <div>
                                <div className={styles.userName}>{user.username}</div>
                                <div className={styles.userEmail}>{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`${styles.roleBadge} ${styles[`roleBadge${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`]}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>{user.totalCards}</td>
                          <td>{user.coinBalance} coins</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>{new Date(user.lastActive).toLocaleDateString()}</td>
                          <td>
                            <div className={styles.tableActions}>
                              <button 
                                className={`${styles.btn} ${styles.btnSm} ${styles.btnSecondary}`}
                                onClick={() => handleEditUser(user.id)}
                              >
                                Edit
                              </button>
                              <button 
                                className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className={styles.adminTransactions}>
                <div className={styles.sectionHeader}>
                  <h2>Transaction History</h2>
                  <p>Financial transactions and coin purchases</p>
                </div>

                <div className={styles.dataTable}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>User</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <code className={styles.transactionId}>{transaction.id.slice(0, 8)}...</code>
                          </td>
                          <td>{transaction.userId}</td>
                          <td>
                            <span className={`${styles.transactionType} ${styles[`transactionType${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}`]}`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className={transaction.amount > 0 ? styles.amountPositive : styles.amountNegative}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </td>
                          <td>{transaction.description}</td>
                          <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className={styles.adminSystem}>
                <div className={styles.sectionHeader}>
                  <h2>System Management</h2>
                  <p>Server health and maintenance tools</p>
                </div>

                <div className={styles.systemTools}>
                  <div className={styles.toolCard}>
                    <h3>Admin Card Collection</h3>
                    <p>Generate all 190 cards for admin account for testing and demonstration</p>
                    <div className={styles.toolActions}>
                      <button 
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={handleGenerateAllCards}
                        disabled={generatingCards}
                      >
                        {generatingCards ? 'Generating...' : 'Generate All Cards'}
                      </button>
                    </div>
                    {generationResult && (
                      <div className={`${styles.generationResult} ${generationResult.includes('Success') ? styles.success : styles.error}`}>
                        {generationResult}
                      </div>
                    )}
                  </div>

                  <div className={styles.toolCard}>
                    <h3>Database</h3>
                    <p>Manage database operations and backups</p>
                    <div className={styles.toolActions}>
                      <button className={`${styles.btn} ${styles.btnPrimary}`}>Create Backup</button>
                      <button className={`${styles.btn} ${styles.btnSecondary}`}>View Logs</button>
                    </div>
                  </div>

                  <div className={styles.toolCard}>
                    <h3>Cache Management</h3>
                    <p>Clear application cache and optimize performance</p>
                    <div className={styles.toolActions}>
                      <button className={`${styles.btn} ${styles.btnWarning}`}>Clear Cache</button>
                      <button className={`${styles.btn} ${styles.btnSecondary}`}>View Stats</button>
                    </div>
                  </div>

                  <div className={styles.toolCard}>
                    <h3>API Health</h3>
                    <p>Monitor external API integrations and status</p>
                    <div className={styles.toolActions}>
                      <button className={`${styles.btn} ${styles.btnSuccess}`}>Health Check</button>
                      <button className={`${styles.btn} ${styles.btnSecondary}`}>View Reports</button>
                    </div>
                  </div>

                  <div className={`${styles.toolCard} ${styles.toolCardDanger}`}>
                    <h3>Emergency Controls</h3>
                    <p>Critical system controls and maintenance mode</p>
                    <div className={styles.toolActions}>
                      <button className={`${styles.btn} ${styles.btnDanger}`}>Maintenance Mode</button>
                      <button className={`${styles.btn} ${styles.btnDanger}`}>Emergency Stop</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <EditUserModal
        user={selectedUser}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedUser(null)
        }}
        onSave={handleSaveUser}
      />
    </AuthGuard>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};