import { useEffect, useMemo, useState } from 'react'
import FormField from '../components/FormField'
import AuthHeader from '../components/AuthHeader'
import PasswordInput from '../components/PasswordInput'
import AuthInput from '../components/AuthInput'
import MyPageActionButton from '../components/MyPageActionButton'
import ICONS from '../constants/icons'

const AGREEMENTS = [
  {
    id: 'terms',
    label: '서비스 이용약관 동의',
    required: true,
    defaultChecked: false,
  },
  {
    id: 'privacy',
    label: '개인정보 처리방침 동의',
    required: true,
    defaultChecked: false,
  },
  {
    id: 'marketing',
    label: '마케팅 정보 수신 동의',
    required: false,
    defaultChecked: true,
  },
]

const SignUpPage = ({ onBack, onSuccess }) => {
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
    emailCode: '',
    password: '',
    passwordConfirm: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailTimer, setEmailTimer] = useState(0)
  const [emailError, setEmailError] = useState(null)

  useEffect(() => {
    if (emailTimer <= 0) return undefined
    const interval = setInterval(() => {
      setEmailTimer((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [emailTimer])

  const handleChange = (field) => (event) => {
    const { value } = event.target
    setFormValues((prev) => ({ ...prev, [field]: value }))
    if (feedback) {
      setFeedback(null)
    }
    if (field === 'email' && emailError) {
      setEmailError(null)
    }
  }

  const isValidEmail = useMemo(() => {
    if (!formValues.email) return false
    const emailRegex = /^[\w.+-]+@[\w-]+\.[\w.-]+$/
    return emailRegex.test(formValues.email)
  }, [formValues.email])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    if (!formValues.name || !formValues.email || !formValues.phone || !formValues.password) {
      setFeedback({ type: 'error', message: '모든 필드를 입력해주세요.' })
      return
    }

    if (formValues.password !== formValues.passwordConfirm) {
      setFeedback({ type: 'error', message: '비밀번호가 일치하지 않습니다.' })
      return
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      const response = await fetch('http://localhost:8081/api/auth/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formValues.email,
          password: formValues.password,
          name: formValues.name,
          phone: formValues.phone,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const errorMessage = data?.message || '회원가입에 실패했습니다.'
        throw new Error(errorMessage)
      }

      setFeedback({
        type: 'success',
        message: data?.message || '회원가입이 완료되었습니다.',
      })
      setFormValues({
        name: '',
        email: '',
        phone: '',
        emailCode: '',
        password: '',
        passwordConfirm: '',
      })
      setTimeout(() => {
        onSuccess?.()
      }, 800)
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error?.message || '회원가입에 실패했습니다.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendEmail = async () => {
    if (!isValidEmail || sendingEmail) return

    setSendingEmail(true)
    setEmailError(null)

    try {
      const response = await fetch('http://localhost:8081/api/auth/join/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formValues.email }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const errorMessage = data?.message || '인증번호 전송에 실패했습니다.'
        throw new Error(errorMessage)
      }

      setFeedback({ type: 'success', message: data?.message || '이메일이 전송되었습니다.' })
      setEmailTimer(5 * 60)
    } catch (error) {
      setEmailError(error?.message || '인증번호 전송에 실패했습니다.')
    } finally {
      setSendingEmail(false)
    }
  }

  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(emailTimer / 60)
    const seconds = emailTimer % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [emailTimer])

  const emailButtonLabel = useMemo(() => {
    if (sendingEmail) return '전송 중...'
    if (emailTimer > 0) return '재전송'
    return '인증번호 발송'
  }, [emailTimer, sendingEmail])

  return (
    <div className="auth-card auth-card--signup">
      <AuthHeader title="회원가입" onBack={onBack} />

      <main className="auth__content auth__content--signup">
        <form className="auth-form auth-form--signup" onSubmit={handleSubmit}>
          <FormField label="이름" labelFor="signUpName" labelSuffix={<RequiredMark />}>
            <AuthInput
              id="signUpName"
              name="signUpName"
              type="text"
              placeholder="이름을 입력하세요"
              autoComplete="name"
              icon={ICONS.user}
              value={formValues.name}
              onChange={handleChange('name')}
            />
          </FormField>

          <FormField label="이메일 (아이디)" labelFor="signUpEmail" labelSuffix={<RequiredMark />}>
            <div className="auth-field__group auth-field__group--stacked">
              <AuthInput
                id="signUpEmail"
                name="signUpEmail"
                type="email"
                placeholder="이메일을 입력하세요"
                autoComplete="email"
                icon={ICONS.mail}
                value={formValues.email}
                onChange={handleChange('email')}
              />
              {isValidEmail ? (
                <MyPageActionButton
                  className="mypage-action-button--signup mypage-action-button--block"
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                >
                  {emailButtonLabel}
                </MyPageActionButton>
              ) : (
                <button
                  type="button"
                  className="mypage__secondary mypage__secondary--signup mypage__secondary--block"
                  disabled
                >
                  인증번호 발송
                </button>
              )}
            </div>
            {emailError && <p className="auth-message auth-message--error auth-message--inline">{emailError}</p>}
          </FormField>

          <FormField
            label="이메일 인증번호"
            labelFor="signUpEmailCode"
            labelSuffix={<span className="auth-field__timer">{emailTimer > 0 ? formattedTimer : '05:00'}</span>}
          >
            <AuthInput
              id="signUpEmailCode"
              name="signUpEmailCode"
              type="text"
              placeholder="인증번호 6자리"
              icon={ICONS.key}
              value={formValues.emailCode}
              onChange={handleChange('emailCode')}
              endSlot={
                <button type="button" className="auth-chip-button">
                  확인
                </button>
              }
            />
          </FormField>

          <FormField label="휴대폰번호" labelFor="signUpPhone" labelSuffix={<RequiredMark />}>
            <AuthInput
              id="signUpPhone"
              name="signUpPhone"
              type="tel"
              placeholder="휴대폰번호를 입력하세요"
              autoComplete="tel"
              icon={ICONS.phone}
              value={formValues.phone}
              onChange={handleChange('phone')}
            />
          </FormField>

          <FormField label="비밀번호" labelFor="signUpPassword" labelSuffix={<RequiredMark />}>
            <PasswordInput
              id="signUpPassword"
              name="signUpPassword"
              placeholder="비밀번호를 입력하세요"
              autoComplete="new-password"
              icon={ICONS.lock}
              value={formValues.password}
              onChange={handleChange('password')}
            />
            <ul className="auth-password-rules">
              <PasswordRule icon={ICONS.ruleCheck} text="영문, 숫자 포함 8자 이상" success />
              <PasswordRule icon={ICONS.ruleError} text="특수문자 포함" />
            </ul>
          </FormField>

          <FormField
            label="비밀번호 확인"
            labelFor="signUpPasswordConfirm"
            labelSuffix={<RequiredMark />}
          >
            <PasswordInput
              id="signUpPasswordConfirm"
              name="signUpPasswordConfirm"
              placeholder="비밀번호를 다시 입력하세요"
              autoComplete="new-password"
              icon={ICONS.lock}
              value={formValues.passwordConfirm}
              onChange={handleChange('passwordConfirm')}
            />
          </FormField>

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

          <section className="auth-agreements" aria-label="약관 동의">
            <label className="auth-checkbox auth-checkbox--card">
              <input type="checkbox" defaultChecked className="auth-checkbox__input" />
              <span className="auth-checkbox__box" aria-hidden="true">
                <img src={ICONS.checklist} alt="" aria-hidden="true" />
              </span>
              <span className="auth-checkbox__content">전체 약관에 동의합니다</span>
            </label>

            <div className="auth-agreements__list">
              {AGREEMENTS.map((agreement) => (
                <div className="auth-agreement" key={agreement.id}>
                  <label className="auth-checkbox auth-checkbox--inline" htmlFor={agreement.id}>
                    <input
                      id={agreement.id}
                      type="checkbox"
                      className="auth-checkbox__input"
                      defaultChecked={agreement.defaultChecked}
                    />
                    <span className="auth-checkbox__box" aria-hidden="true">
                      <img src={ICONS.checklist} alt="" aria-hidden="true" />
                    </span>
                    <span className="auth-checkbox__content">
                      {agreement.label}
                      <span
                        className={
                          agreement.required
                            ? 'auth-agreement__badge auth-agreement__badge--required'
                            : 'auth-agreement__badge'
                        }
                      >
                        {agreement.required ? '(필수)' : '(선택)'}
                      </span>
                    </span>
                  </label>
                  <button
                    type="button"
                    className="auth__icon-button auth__icon-button--small"
                    aria-label="약관 자세히 보기"
                  >
                    <img src={ICONS.chevronRight} alt="" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="auth-actions">
            <button
              type="submit"
              className="auth-primary-button auth-primary-button--full"
              disabled={submitting}
            >
              회원가입
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

const PasswordRule = ({ icon, text, success = false }) => (
  <li className={success ? 'auth-password-rule auth-password-rule--success' : 'auth-password-rule'}>
    <span className="auth-password-rule__icon">
      <img src={icon} alt="" aria-hidden="true" />
    </span>
    <span>{text}</span>
  </li>
)

const RequiredMark = () => (
  <span className="auth-field__required" aria-hidden="true">
    *
  </span>
)

export default SignUpPage
