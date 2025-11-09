import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const parseUserProfile = (value) => {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [rawAccessToken, setRawAccessToken] = useState(() => localStorage.getItem('accessToken') || '')
  const [user, setUser] = useState(() => parseUserProfile(localStorage.getItem('userProfile')))

  useEffect(() => {
    if (rawAccessToken) {
      localStorage.setItem('accessToken', rawAccessToken)
    } else {
      localStorage.removeItem('accessToken')
    }
  }, [rawAccessToken])

  useEffect(() => {
    if (user) {
      localStorage.setItem('userProfile', JSON.stringify(user))
    } else {
      localStorage.removeItem('userProfile')
    }
  }, [user])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }
    const handleTokenRefresh = (event) => {
      const nextToken = typeof event.detail === 'string' ? event.detail : ''
      setRawAccessToken(nextToken)
    }
    window.addEventListener('auth:token-refresh', handleTokenRefresh)
    return () => {
      window.removeEventListener('auth:token-refresh', handleTokenRefresh)
    }
  }, [])

  const signIn = useCallback((payload) => {
    if (!payload) return

    const { accessToken: nextAccessToken, ...profile } = payload

    if (!nextAccessToken) return

    setRawAccessToken(nextAccessToken)
    setUser(profile)
  }, [])

  const signOut = useCallback(() => {
    setRawAccessToken('')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      accessToken: rawAccessToken,
      user,
      isAuthenticated: Boolean(rawAccessToken),
      signIn,
      signOut,
    }),
    [rawAccessToken, signIn, signOut, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
