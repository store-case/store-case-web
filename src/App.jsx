import { useEffect, useMemo, useState } from 'react'
import './App.css'
import LoginPage from './pages/Login'
import SignUpPage from './pages/SignUp'
import MainPage from './pages/Main'

const VIEWS = {
  LOGIN: 'login',
  SIGNUP: 'signup',
}

const App = () => {
  const [view, setView] = useState(VIEWS.LOGIN)
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
    if (token) {
      setAccessToken(token)
      setView(VIEWS.MAIN)
    }
  }

  const handleLogout = () => {
    setAccessToken('')
    setView(VIEWS.LOGIN)
  }

  const renderView = () => {
    if (!isAuthenticated) {
      if (view === VIEWS.SIGNUP) {
        return <SignUpPage onBack={() => setView(VIEWS.LOGIN)} onSuccess={() => setView(VIEWS.LOGIN)} />
      }

      return (
        <LoginPage
          onBack={() => setView(VIEWS.LOGIN)}
          onGoSignUp={() => setView(VIEWS.SIGNUP)}
          onSuccess={handleLoginSuccess}
        />
      )
    }

    return <MainPage onLogout={handleLogout} />
  }

  return <div className="app-root">{renderView()}</div>
}

export default App
