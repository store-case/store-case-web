import { useState } from 'react'
import FormField from '../components/FormField'
import AuthInput from '../components/AuthInput'
import AuthHeader from '../components/AuthHeader'
import PasswordInput from '../components/PasswordInput'
import ICONS from '../constants/icons'

const LoginPage = ({ onBack, onGoSignUp, onSuccess }) => {
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const handleChange = (field) => (event) => {
    const { value } = event.target
    setFormValues((prev) => ({ ...prev, [field]: value }))
    if (feedback) {
      setFeedback(null)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    if (!formValues.email || !formValues.password) {
      setFeedback({ type: 'error', message: '이메일과 비밀번호를 입력해주세요.' })
      return
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      const response = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formValues.email,
          password: formValues.password,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const errorMessage = data?.message || '로그인에 실패했습니다.'
        throw new Error(errorMessage)
      }

      const payload = data?.data

      if (payload?.accessToken) {
        onSuccess?.(payload)
        return
      }

      setFeedback({
        type: 'success',
        message: data?.message || '로그인에 성공했습니다.',
      })
      setFormValues({
        email: '',
        password: '',
      })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error?.message || '로그인에 실패했습니다.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-card auth-card--login">
      <AuthHeader title="로그인" onBack={onBack} />

      <main className="auth__content auth__content--login">
        <section className="auth-brand" aria-labelledby="brand-title">
          <div className="auth-brand__logo" aria-hidden="true">
            E
          </div>
          <div className="auth-brand__text">
            <p id="brand-title" className="auth-brand__title">
              ShopMate
            </p>
            <p className="auth-brand__subtitle">더 나은 쇼핑 경험을 시작하세요</p>
          </div>
        </section>

        <form className="auth-form" onSubmit={handleSubmit}>
          <FormField label="이메일" labelFor="loginEmail">
            <AuthInput
              id="loginEmail"
              name="loginEmail"
              type="email"
              placeholder="이메일을 입력하세요"
              autoComplete="username"
              value={formValues.email}
              onChange={handleChange('email')}
              icon={ICONS.mail}
            />
          </FormField>

          <FormField label="비밀번호" labelFor="loginPassword">
            <PasswordInput
              id="loginPassword"
              name="loginPassword"
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              value={formValues.password}
              onChange={handleChange('password')}
              icon={ICONS.lock}
            />
          </FormField>

          <div className="auth-login-options">
            <label className="auth-checkbox">
              <input type="checkbox" className="auth-checkbox__input" />
              <span className="auth-checkbox__box" aria-hidden="true">
                <img src={ICONS.checklist} alt="" aria-hidden="true" />
              </span>
              <span className="auth-checkbox__content">로그인 상태 유지</span>
            </label>
            <button type="button" className="auth-link-button auth-link-button--primary">
              비밀번호 찾기
            </button>
          </div>

          {feedback && (
            <p
              className={
                feedback.type === 'success'
                  ? 'auth-message auth-message--success'
                  : 'auth-message auth-message--error'
              }
              role={feedback.type === 'success' ? 'status' : 'alert'}
            >
              {feedback.message}
            </p>
          )}

          <button
            type="submit"
            className="auth-primary-button auth-primary-button--full"
            disabled={submitting}
          >
            로그인
          </button>
        </form>

        <section className="auth-social">
          <div className="auth-social__divider" aria-hidden="true">
            <span className="auth-social__line" />
            <span className="auth-social__label">또는</span>
            <span className="auth-social__line" />
          </div>
          <div className="auth-social__buttons">
            <button type="button" className="auth-social__button auth-social__button--kakao">
              <span className="auth-social__icon auth-social__icon--kakao" aria-hidden="true">
                K
              </span>
              <span>카카오로 계속하기</span>
            </button>
            <button type="button" className="auth-social__button auth-social__button--google">
              <span className="auth-social__icon" aria-hidden="true">
                <img src={ICONS.google} alt="" aria-hidden="true" />
              </span>
              <span>Google로 계속하기</span>
            </button>
            <button type="button" className="auth-social__button auth-social__button--naver">
              <span className="auth-social__icon auth-social__icon--naver" aria-hidden="true">
                N
              </span>
              <span>네이버로 계속하기</span>
            </button>
          </div>
        </section>

        <p className="auth-footer">
          <span>아직 계정이 없으신가요?</span>
          <button
            type="button"
            className="auth-link-button auth-link-button--primary"
            onClick={onGoSignUp}
          >
            회원가입
          </button>
        </p>
      </main>
    </div>
  )
}

export default LoginPage
