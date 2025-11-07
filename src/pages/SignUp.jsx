import { useEffect, useMemo, useState } from 'react'
import FormField from '../components/FormField'
import PageHeader from '../components/PageHeader'
import PasswordInput from '../components/PasswordInput'
import FormInput from '../components/FormInput'
import ActionButton from '../components/ActionButton'
import FeedbackMessage from '../components/FeedbackMessage'
import AgreementCheckbox from '../components/AgreementCheckbox'
import ICONS from '../constants/icons'
import { API_ENDPOINTS } from '../constants/api'
import useFormValidation from '../hooks/useFormValidation'
import { apiClient } from '../utils/apiClient'

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
  const [emailVerification, setEmailVerification] = useState(null)
  const [verifyingEmailCode, setVerifyingEmailCode] = useState(false)
  const validators = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return {
      name: (value) => (!value ? '이름을 입력해주세요.' : null),
      email: (value) => {
        if (!value) return '이메일을 입력해주세요.'
        return emailRegex.test(value) ? null : '유효한 이메일을 입력해주세요.'
      },
      phone: (value) => (!value ? '휴대폰번호를 입력해주세요.' : null),
      password: (value) => {
        if (!value) return '비밀번호를 입력해주세요.'
        if (value.length < 8) return '비밀번호는 8자 이상 입력해주세요.'
        return null
      },
      passwordConfirm: (value, values) => {
        if (!value) return '비밀번호 확인을 입력해주세요.'
        if (value !== values.password) return '비밀번호가 일치하지 않습니다.'
        return null
      },
    }
  }, [])
  const { clearError, validateAll, resetErrors } = useFormValidation(validators)

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
    clearError(field)
    if (feedback) {
      setFeedback(null)
    }
    if (field === 'email' && emailError) {
      setEmailError(null)
    }
    if (field === 'emailCode' && emailVerification) {
      setEmailVerification(null)
    }
  }

  const isValidEmail = useMemo(() => !validators.email(formValues.email), [formValues.email, validators])

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
      const data = await apiClient.post(API_ENDPOINTS.auth.join, {
        email: formValues.email,
        password: formValues.password,
        name: formValues.name,
        phone: formValues.phone,
      })

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
      resetErrors()
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
    setEmailVerification(null)

    try {
      const data = await apiClient.post(API_ENDPOINTS.auth.joinEmail, { email: formValues.email }, { skipAuth: true })

      setFeedback({ type: 'success', message: data?.message || '이메일이 전송되었습니다.' })
      setEmailTimer(5 * 60)
    } catch (error) {
      if (error?.status === 409) {
        setEmailVerification({ type: 'success', message: error?.message || '이미 인증된 이메일입니다.' })
        setFeedback(null)
      } else {
        setEmailError(error?.message || '인증번호 전송에 실패했습니다.')
      }
    } finally {
      setSendingEmail(false)
    }
  }

  const handleVerifyEmailCode = async () => {
    if (!formValues.email || !formValues.emailCode) {
      setEmailVerification({ type: 'error', message: '이메일과 인증번호를 입력해주세요.' })
      return
    }

    setVerifyingEmailCode(true)
    setEmailVerification(null)

    try {
      const data = await apiClient.post(
        API_ENDPOINTS.auth.joinEmailVerify,
        { email: formValues.email, code: formValues.emailCode },
        { skipAuth: true },
      )

      const status = data?.data?.status
      if (status === 'VERIFIED') {
        setEmailVerification({ type: 'success', message: data?.message || '이메일 인증이 완료되었습니다.' })
      } else {
        setEmailVerification({ type: 'error', message: data?.message || '인증번호가 일치하지 않습니다.' })
      }
    } catch (error) {
      const message = error?.message || '인증번호 확인에 실패했습니다.'
      if (error?.status === 410) {
        setEmailVerification({ type: 'error', message })
        setEmailTimer(0)
      } else {
        setEmailVerification({ type: 'error', message })
      }
    } finally {
      setVerifyingEmailCode(false)
    }
  }

  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(emailTimer / 60)
    const seconds = emailTimer % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [emailTimer])

  const emailButtonLabel = useMemo(() => {
    if (emailVerification?.type === 'success') {
      return '인증 완료'
    }
    if (sendingEmail) return '전송 중...'
    if (emailTimer > 0) return '재전송'
    return '인증번호 발송'
  }, [emailTimer, sendingEmail, emailVerification?.type])

  return (
    <div className="auth-card auth-card--signup">
      <PageHeader title="회원가입" onBack={onBack} />

      <main className="auth__content auth__content--signup">
        <form className="auth-form auth-form--signup" onSubmit={handleSubmit}>
          <FormField label="이름" labelFor="signUpName" labelSuffix={<RequiredMark />}>
            <FormInput
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
              <FormInput
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
                <ActionButton
                  className="mypage-action-button--signup mypage-action-button--block"
                  onClick={handleSendEmail}
                  disabled={sendingEmail || emailVerification?.type === 'success'}
                >
                  {emailButtonLabel}
                </ActionButton>
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
            <FormInput
              id="signUpEmailCode"
              name="signUpEmailCode"
              type="text"
              placeholder="인증번호 6자리"
              icon={ICONS.key}
              value={formValues.emailCode}
              onChange={handleChange('emailCode')}
              endSlot={
                <button
                  type="button"
                  className="auth-chip-button"
                  onClick={handleVerifyEmailCode}
                  disabled={verifyingEmailCode}
                >
                  {verifyingEmailCode ? '확인 중...' : '확인'}
                </button>
              }
            />
            {emailVerification && (
              <p
                className={
                  emailVerification.type === 'success'
                    ? 'auth-message auth-message--success auth-message--inline'
                    : 'auth-message auth-message--error auth-message--inline'
                }
                role={emailVerification.type === 'success' ? 'status' : 'alert'}
              >
                {emailVerification.message}
              </p>
            )}
          </FormField>

          <FormField label="휴대폰번호" labelFor="signUpPhone" labelSuffix={<RequiredMark />}>
            <FormInput
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

          <FeedbackMessage type={feedback?.type} message={feedback?.message} />

          <section className="auth-agreements" aria-label="약관 동의">
            <AgreementCheckbox id="agreement-all" label="전체 약관에 동의합니다" defaultChecked variant="card" />

            <div className="auth-agreements__list">
              {AGREEMENTS.map((agreement) => (
                <div className="auth-agreement" key={agreement.id}>
                  <AgreementCheckbox
                    id={agreement.id}
                    label={agreement.label}
                    defaultChecked={agreement.defaultChecked}
                    required={agreement.required}
                  />
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
