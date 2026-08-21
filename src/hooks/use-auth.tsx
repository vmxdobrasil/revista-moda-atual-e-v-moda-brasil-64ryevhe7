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
  signUp: (
    email: string,
    password: string,
    options?: { name?: string; avatar?: File | null },
  ) => Promise<{ error: any; record?: any }>
  updateProfile: (
    data: FormData | Partial<{ name: string; avatar: File | null }>,
  ) => Promise<{ error: any; record?: any }>
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

  const signUp = async (
    email: string,
    password: string,
    options?: { name?: string; avatar?: File | null },
  ) => {
    try {
      let createData: any = {
        email,
        password,
        passwordConfirm: password,
      }

      if (options?.name) {
        createData.name = options.name
      }

      if (options?.avatar) {
        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)
        formData.append('passwordConfirm', password)
        if (options.name) formData.append('name', options.name)
        formData.append('avatar', options.avatar)
        createData = formData
      }

      const createdUser = await pb.collection('users').create(createData)
      const authData = await pb.collection('users').authWithPassword(email, password)
      setUser(authData.record)
      setIsAuthenticated(true)
      return { error: null, record: authData.record || createdUser }
    } catch (error) {
      return { error }
    }
  }

  const updateProfile = async (data: FormData | Partial<{ name: string; avatar: File | null }>) => {
    if (!pb.authStore.record?.id) return { error: new Error('Não autenticado') }
    try {
      const updated = await pb.collection('users').update(pb.authStore.record.id, data)
      setUser(updated)
      return { error: null, record: updated }
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
      value={{
        user,
        isAuthenticated,
        signUp,
        updateProfile,
        signIn,
        signOut,
        loading,
        checkBackendHealth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
