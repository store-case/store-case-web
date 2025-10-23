import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/Login'
import SignUpPage from './pages/SignUp'
import MainPage from './pages/Main'

const App = () => {
  const navigate = useNavigate()
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken') || '')

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken)
    } else {
      localStorage.removeItem('accessToken')
    }
  }, [accessToken])

  const isAuthenticated = useMemo(() => Boolean(accessToken), [accessToken])

  const handleLoginSuccess = (token) => {
    if (!token) return
    setAccessToken(token)
    navigate('/', { replace: true })
  }

  const handleLogout = () => {
    setAccessToken('')
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-root">
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage
                onBack={() => navigate(-1)}
                onGoSignUp={() => navigate('/join')}
                onSuccess={handleLoginSuccess}
              />
            )
          }
        />
        <Route
          path="/join"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <SignUpPage onBack={() => navigate(-1)} onSuccess={() => navigate('/login', { replace: true })} />
            )
          }
        />
        <Route
          path="/"
          element={isAuthenticated ? <MainPage onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>
    </div>
  )
}

export default App
