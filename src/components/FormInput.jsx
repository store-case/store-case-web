import { forwardRef } from 'react'

const FormInput = forwardRef(
  ({ icon, iconAlt = '', endSlot, className = '', inputClassName = '', ...inputProps }, ref) => {
    const iconElement = icon ? (
      <span className="auth-input__icon">
        <img src={icon} alt={iconAlt || ''} aria-hidden={iconAlt ? undefined : 'true'} />
      </span>
    ) : null

    if (!endSlot) {
      return (
        <div className={`auth-input${className ? ` ${className}` : ''}`}>
          {iconElement}
          <input ref={ref} className={`auth-input__control${inputClassName ? ` ${inputClassName}` : ''}`} {...inputProps} />
        </div>
      )
    }

    return (
      <div className={`auth-input auth-input--with-action${className ? ` ${className}` : ''}`}>
        <div className="auth-input__left">
          {iconElement}
          <input ref={ref} className={`auth-input__control${inputClassName ? ` ${inputClassName}` : ''}`} {...inputProps} />
        </div>
        {endSlot}
      </div>
    )
  },
)

FormInput.displayName = 'FormInput'

export default FormInput
