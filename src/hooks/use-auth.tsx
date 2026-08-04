import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface SignInResult {
  error: any
  requires2FA?: boolean
  email?: string
  otp?: string
}

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<SignInResult>
  signOut: () => void
  loading: boolean
  checkBackendHealth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.isValid ? pb.authStore.record : null)
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid ? record : null)
      setIsAuthenticated(pb.authStore.isValid)
    })

    const initAuth = async () => {
      try {
        if (pb.authStore.isValid) {
          await pb.collection('users').authRefresh()
        } else {
          if (pb.authStore.record) pb.authStore.clear()
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch {
        try {
          pb.authStore.clear()
        } catch {
          // ignore clear errors
        }
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    return () => {
      unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      await pb.collection('users').create({ email, password, passwordConfirm: password })
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    try {
      const result = await pb.collection('users').authWithPassword(email, password)

      if (result?.record?.['twofa_enabled']) {
        try {
          const otpRes = await pb.send('/backend/v1/auth/2fa/generate-otp', { method: 'POST' })
          pb.authStore.clear()
          setUser(null)
          setIsAuthenticated(false)
          return { error: null, requires2FA: true, email, otp: otpRes.otp }
        } catch {
          pb.authStore.clear()
          setUser(null)
          setIsAuthenticated(false)
          return { error: new Error('Falha ao gerar código 2FA. Tente novamente.') }
        }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  const checkBackendHealth = async (): Promise<boolean> => {
    try {
      await pb.health.check()
      return true
    } catch {
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, signUp, signIn, signOut, loading, checkBackendHealth }}
    >
      {children}
    </AuthContext.Provider>
  )
}
