import { forwardRef, useState } from 'react'
import AuthInput from './AuthInput'
import ICONS from '../constants/icons'

const PasswordInput = forwardRef((props, ref) => {
  const {
    icon = ICONS.lock,
    toggleOnLabel = '비밀번호 숨기기',
    toggleOffLabel = '비밀번호 표시',
    toggleButtonProps = {},
    ...inputProps
  } = props
  const {
    onClick: toggleButtonOnClick,
    className: toggleButtonClassName,
    ...restToggleButtonProps
  } = toggleButtonProps

  const [visible, setVisible] = useState(false)

  const handleToggle = (event) => {
    setVisible((prev) => !prev)
    toggleButtonOnClick?.(event)
  }

  const isVisible = visible
  const buttonAriaLabel = isVisible ? toggleOnLabel : toggleOffLabel
  const toggleIcon = isVisible && ICONS.eye ? ICONS.eye : ICONS.eyeOff

  return (
    <AuthInput
      ref={ref}
      type={isVisible ? 'text' : 'password'}
      icon={icon}
      {...inputProps}
      endSlot={
        <button
          type="button"
          className={`auth__icon-button auth__icon-button--muted${
            toggleButtonClassName ? ` ${toggleButtonClassName}` : ''
          }`}
          aria-label={buttonAriaLabel}
          aria-pressed={isVisible}
          onClick={handleToggle}
          {...restToggleButtonProps}
        >
          <img src={toggleIcon} alt="" aria-hidden="true" />
        </button>
      }
    />
  )
})

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput
