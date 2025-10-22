const FormField = ({ label, labelFor, labelSuffix, children }) => (
  <div className="auth-field">
    {label && (
      <div className="auth-field__label">
        <label className="auth-field__label-text" htmlFor={labelFor}>
          {label}
        </label>
        {labelSuffix}
      </div>
    )}
    <div className="auth-field__control">{children}</div>
  </div>
)

export default FormField
