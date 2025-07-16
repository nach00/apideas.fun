import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'custom'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  customColors: CustomColors
  setCustomColors: (colors: CustomColors) => void
}

interface CustomColors {
  primary: string
  background: string
  surface: string
  text: string
  accent: string
}

const defaultCustomColors: CustomColors = {
  primary: '#2563EB',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: '#0F172A',
  accent: '#8B5CF6'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [customColors, setCustomColors] = useState<CustomColors>(defaultCustomColors)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    const savedCustomColors = localStorage.getItem('customColors')
    
    if (savedTheme) {
      setTheme(savedTheme)
    }
    
    if (savedCustomColors) {
      setCustomColors(JSON.parse(savedCustomColors))
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-custom')
    
    // Add current theme class
    root.classList.add(`theme-${theme}`)
    
    // Save to localStorage
    localStorage.setItem('theme', theme)
    
    // Apply custom colors if custom theme
    if (theme === 'custom') {
      root.style.setProperty('--color-primary', customColors.primary)
      root.style.setProperty('--color-background', customColors.background)
      root.style.setProperty('--color-surface', customColors.surface)
      root.style.setProperty('--color-text-primary', customColors.text)
      root.style.setProperty('--color-accent', customColors.accent)
    } else {
      // Remove custom properties for other themes
      root.style.removeProperty('--color-primary')
      root.style.removeProperty('--color-background')
      root.style.removeProperty('--color-surface')
      root.style.removeProperty('--color-text-primary')
      root.style.removeProperty('--color-accent')
    }
  }, [theme, customColors])

  // Save custom colors to localStorage
  useEffect(() => {
    localStorage.setItem('customColors', JSON.stringify(customColors))
  }, [customColors])

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      customColors,
      setCustomColors
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}