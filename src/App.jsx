import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/Login'
import SignUpPage from './pages/SignUp'
import MainPage from './pages/Main'
import ProductRegisterPage from './pages/ProductRegister'
import MyPage from './pages/MyPage'
import { useAuth } from './contexts/AuthContext'

const App = () => {
  const navigate = useNavigate()
  const { isAuthenticated, signIn, signOut, user } = useAuth()

  const handleLoginSuccess = (payload) => {
    signIn(payload)
    navigate('/', { replace: true })
  }

  const handleLogout = () => {
    signOut()
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
        <Route
          path="/mypage"
          element={isAuthenticated ? <MyPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/seller/products/new"
          element={
            isAuthenticated ? (
              user?.role === 'STORE' ? (
                <ProductRegisterPage />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>
    </div>
  )
}

export default App
