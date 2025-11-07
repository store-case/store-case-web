import ICONS from '../constants/icons'

const AgreementCheckbox = ({
  id,
  label,
  defaultChecked = false,
  required = false,
  variant = 'inline',
  children,
  ...inputProps
}) => {
  const baseClass =
    variant === 'card' ? 'auth-checkbox auth-checkbox--card' : 'auth-checkbox auth-checkbox--inline'

  return (
    <label className={baseClass} htmlFor={id}>
      <input id={id} type="checkbox" className="auth-checkbox__input" defaultChecked={defaultChecked} {...inputProps} />
      <span className="auth-checkbox__box" aria-hidden="true">
        <img src={ICONS.checklist} alt="" aria-hidden="true" />
      </span>
      <span className="auth-checkbox__content">
        {label}
        {variant === 'inline' && (
          <span
            className={
              required ? 'auth-agreement__badge auth-agreement__badge--required' : 'auth-agreement__badge'
            }
          >
            {required ? '(필수)' : '(선택)'}
          </span>
        )}
      </span>
      {children}
    </label>
  )
}

export default AgreementCheckbox
