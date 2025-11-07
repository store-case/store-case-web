import ICONS from '../constants/icons'

const DEFAULT_PROVIDERS = [
  {
    id: 'kakao',
    label: '카카오로 계속하기',
    className: 'auth-social__button auth-social__button--kakao',
    iconClassName: 'auth-social__icon auth-social__icon--kakao',
    iconContent: 'K',
  },
  {
    id: 'google',
    label: 'Google로 계속하기',
    className: 'auth-social__button auth-social__button--google',
    iconClassName: 'auth-social__icon',
    iconImage: ICONS.google,
  },
  {
    id: 'naver',
    label: '네이버로 계속하기',
    className: 'auth-social__button auth-social__button--naver',
    iconClassName: 'auth-social__icon auth-social__icon--naver',
    iconContent: 'N',
  },
]

const SocialLoginButtons = ({ providers = DEFAULT_PROVIDERS, onSelect }) => {
  return (
    <section className="auth-social">
      <div className="auth-social__divider" aria-hidden="true">
        <span className="auth-social__line" />
        <span className="auth-social__label">또는</span>
        <span className="auth-social__line" />
      </div>
      <div className="auth-social__buttons">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            className={provider.className}
            onClick={() => onSelect?.(provider.id)}
          >
            <span className={provider.iconClassName} aria-hidden="true">
              {provider.iconImage ? <img src={provider.iconImage} alt="" aria-hidden="true" /> : provider.iconContent}
            </span>
            <span>{provider.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default SocialLoginButtons
