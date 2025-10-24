const MyPageActionButton = ({ children, icon, onClick, type = 'button', className = '', disabled = false }) => {
  const buttonClassName = ['mypage-action-button', className, disabled ? 'mypage-action-button--disabled' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={buttonClassName} onClick={onClick} disabled={disabled}>
      <span>{children}</span>
      {icon ? <img src={icon} alt="" aria-hidden="true" /> : null}
    </button>
  )
}

export default MyPageActionButton
