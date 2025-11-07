import { useCallback, useState } from 'react'

const useFormValidation = (validators = {}) => {
  const [errors, setErrors] = useState({})

  const runValidator = useCallback(
    (name, value, values) => {
      const validator = validators[name]
      if (!validator) {
        return null
      }
      return validator(value, values)
    },
    [validators],
  )

  const validateField = useCallback(
    (name, value, values = {}) => {
      const error = runValidator(name, value, values)
      setErrors((prev) => {
        if (error) {
          return { ...prev, [name]: error }
        }
        if (!prev[name]) {
          return prev
        }
        const next = { ...prev }
        delete next[name]
        return next
      })
      return !error
    },
    [runValidator],
  )

  const validateAll = useCallback(
    (values = {}) => {
      const nextErrors = {}
      let firstError = ''
      Object.keys(validators).forEach((name) => {
        const error = runValidator(name, values[name], values)
        if (error) {
          nextErrors[name] = error
          if (!firstError) {
            firstError = error
          }
        }
      })

      setErrors(nextErrors)

      return {
        isValid: Object.keys(nextErrors).length === 0,
        errors: nextErrors,
        firstError,
      }
    },
    [runValidator, validators],
  )

  const clearError = useCallback((name) => {
    setErrors((prev) => {
      if (!prev[name]) {
        return prev
      }
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const resetErrors = useCallback(() => setErrors({}), [])

  return {
    errors,
    validateField,
    validateAll,
    clearError,
    resetErrors,
  }
}

export default useFormValidation
