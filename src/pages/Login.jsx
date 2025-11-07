import { useMemo, useState } from 'react'
import FormField from '../components/FormField'
import FormInput from '../components/FormInput'
import PageHeader from '../components/PageHeader'
import PasswordInput from '../components/PasswordInput'
import FeedbackMessage from '../components/FeedbackMessage'
import SocialLoginButtons from '../components/SocialLoginButtons'
import ICONS from '../constants/icons'
import { API_ENDPOINTS } from '../constants/api'
import useFormValidation from '../hooks/useFormValidation'
import { apiClient } from '../utils/apiClient'

const LoginPage = ({ onBack, onGoSignUp, onSuccess }) => {
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const validators = useMemo(
    () => ({
      email: (value) => {
        if (!value) return '이메일을 입력해주세요.'
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailPattern.test(value) ? null : '유효한 이메일을 입력해주세요.'
      },
      password: (value) => (!value ? '비밀번호를 입력해주세요.' : null),
    }),
    [],
  )
  const { clearError, validateAll, resetErrors } = useFormValidation(validators)

  const handleChange = (field) => (event) => {
    const { value } = event.target
    setFormValues((prev) => ({ ...prev, [field]: value }))
    clearError(field)
    if (feedback) {
      setFeedback(null)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    const { isValid, firstError } = validateAll(formValues)
    if (!isValid) {
      setFeedback({ type: 'error', message: firstError })
      return
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      const data = await apiClient.post(API_ENDPOINTS.auth.login, formValues, {
        credentials: 'include',
        skipAuth: true,
      })

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
      resetErrors()
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
      <PageHeader title="로그인" onBack={onBack} />

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
            <FormInput
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

          <FeedbackMessage type={feedback?.type} message={feedback?.message} />

          <button
            type="submit"
            className="auth-primary-button auth-primary-button--full"
            disabled={submitting}
          >
            로그인
          </button>
        </form>

        <SocialLoginButtons />

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
