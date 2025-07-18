import { useState, useEffect } from 'react'
import styles from './EditUserModal.module.css'

export interface User {
  id: string
  username: string
  email: string
  role: string
  coinBalance: number
  totalCards: number
  createdAt: string
  lastActive: string
}

interface EditUserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (userId: string, updates: UserUpdates) => Promise<void>
}

export interface UserUpdates {
  username?: string
  coinBalance?: number
  role?: 'user' | 'admin'
  resetPassword?: boolean
}

export default function EditUserModal({ user, isOpen, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    coinBalance: 0,
    role: 'user' as 'user' | 'admin',
    resetPassword: false
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        coinBalance: user.coinBalance,
        role: user.role as 'user' | 'admin',
        resetPassword: false
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const updates: UserUpdates = {}
      
      if (formData.username !== user.username) {
        updates.username = formData.username
      }
      
      if (formData.coinBalance !== user.coinBalance) {
        updates.coinBalance = formData.coinBalance
      }
      
      if (formData.role !== user.role) {
        updates.role = formData.role
      }
      
      if (formData.resetPassword) {
        updates.resetPassword = true
      }

      await onSave(user.id, updates)
      onClose()
    } catch (error) {
      console.error('Error saving user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !user) {
    return null
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Edit User: {user.username}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              minLength={3}
              maxLength={20}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="coinBalance">Coin Balance</label>
            <input
              type="number"
              id="coinBalance"
              value={formData.coinBalance}
              onChange={(e) => setFormData({ ...formData, coinBalance: parseInt(e.target.value) || 0 })}
              min={0}
              max={999999}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.resetPassword}
                onChange={(e) => setFormData({ ...formData, resetPassword: e.target.checked })}
              />
              Reset password to "password123"
            </label>
          </div>

          <div className={styles.userInfo}>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Total Cards:</strong> {user.totalCards}</p>
            <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            <p><strong>Last Active:</strong> {new Date(user.lastActive).toLocaleDateString()}</p>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}