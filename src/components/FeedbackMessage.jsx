const VARIANT_CLASS_MAP = {
  auth: {
    success: 'auth-message auth-message--success',
    error: 'auth-message auth-message--error',
    info: 'auth-message',
  },
  product: {
    success: 'product-register__feedback product-register__feedback--success',
    error: 'product-register__feedback product-register__feedback--error',
    info: 'product-register__feedback',
  },
}

const FeedbackMessage = ({ type = 'info', message, variant = 'auth', role, className = '' }) => {
  if (!message) {
    return null
  }

  const variantClasses = VARIANT_CLASS_MAP[variant] || VARIANT_CLASS_MAP.auth
  const typeClass = variantClasses[type] || variantClasses.info
  const combinedClassName = className ? `${typeClass} ${className}` : typeClass
  const resolvedRole = role || (type === 'success' ? 'status' : 'alert')

  return (
    <p className={combinedClassName} role={resolvedRole}>
      {message}
    </p>
  )
}

export default FeedbackMessage
