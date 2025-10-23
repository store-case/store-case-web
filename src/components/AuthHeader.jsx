import ICONS from '../constants/icons'

const AuthHeader = ({ title, titleId, onBack, rightSlot }) => (
  <header className="auth__header">
    {onBack ? (
      <button type="button" className="auth__icon-button" aria-label="뒤로 가기" onClick={onBack}>
        <img src={ICONS.arrowLeft} alt="" aria-hidden="true" />
      </button>
    ) : (
      <span aria-hidden="true" className="auth__icon-placeholder" />
    )}
    <h1 id={titleId} className="auth__title">
      {title}
    </h1>
    {rightSlot || <span aria-hidden="true" className="auth__icon-placeholder" />}
  </header>
)

export default AuthHeader
