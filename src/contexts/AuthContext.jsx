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
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken') || '')
  const [user, setUser] = useState(() => parseUserProfile(localStorage.getItem('userProfile')))

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken)
    } else {
      localStorage.removeItem('accessToken')
    }
  }, [accessToken])

  useEffect(() => {
    if (user) {
      localStorage.setItem('userProfile', JSON.stringify(user))
    } else {
      localStorage.removeItem('userProfile')
    }
  }, [user])

  const signIn = useCallback((payload) => {
    if (!payload) return

    const { accessToken: nextAccessToken, ...profile } = payload

    if (!nextAccessToken) return

    setAccessToken(nextAccessToken)
    setUser(profile)
  }, [])

  const signOut = useCallback(() => {
    setAccessToken('')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated: Boolean(accessToken),
      signIn,
      signOut,
    }),
    [accessToken, signIn, signOut, user],
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

