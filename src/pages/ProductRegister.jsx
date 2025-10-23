import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProductRegister.css'
import AuthHeader from '../components/AuthHeader'
import ICONS from '../constants/icons'
import { useAuth } from '../contexts/AuthContext'

const CATEGORY_PRESETS = ['신발', '전자기기', '가방', '패션', '스포츠', '가전', '뷰티']

const DEFAULT_FORM = {
  name: '',
  description: '',
  price: '',
  category: '',
}

const createEmptyOption = () => ({
  name: '',
  valueInput: '',
  valuePriceInput: '',
  values: [],
})

const createOptionValue = (label, price) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  label,
  price,
})

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10)

const createImageInput = () => ({
  id: generateId(),
  file: null,
  preview: '',
  data: '',
})

const revokePreview = (preview) => {
  if (preview?.startsWith('blob:') && typeof URL !== 'undefined' && URL.revokeObjectURL) {
    URL.revokeObjectURL(preview)
  }
}

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (typeof FileReader === 'undefined') {
      resolve('')
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

const ProductRegisterPage = () => {
  const navigate = useNavigate()
  const { accessToken, user } = useAuth()
  const [formValues, setFormValues] = useState(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [option, setOption] = useState(null)
  const [imageInputs, setImageInputs] = useState([createImageInput()])

  const storeName = useMemo(() => user?.name || '스토어', [user?.name])
  const optionEnabled = Boolean(option)
  const filledImageCount = imageInputs.filter((input) => Boolean(input.preview)).length
  const showAddImageInput = filledImageCount < 5 && imageInputs.every((input) => input.preview)

  const handleChange = (field) => (event) => {
    const { value } = event.target
    setFormValues((prev) => ({ ...prev, [field]: value }))
    if (feedback) {
      setFeedback(null)
    }
  }

  const handleCategoryToggle = (value) => {
    setFormValues((prev) => ({ ...prev, category: prev.category === value ? '' : value }))
    if (feedback) {
      setFeedback(null)
    }
  }

  const resetForm = () => {
    setFormValues(DEFAULT_FORM)
    setFeedback(null)
    setOption(null)
    imageInputs.forEach((input) => revokePreview(input.preview))
    setImageInputs([createImageInput()])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    const hasOption = Boolean(option)

    if (!formValues.name || !formValues.description || !formValues.category) {
      setFeedback({
        type: 'error',
        message: '필수 입력값을 모두 채워주세요.',
      })
      return
    }

    if (!hasOption && !formValues.price) {
      setFeedback({
        type: 'error',
        message: '판매가를 입력해주세요.',
      })
      return
    }

    let formattedOption = null
    let productPrice = 0

    if (hasOption) {
      const trimmedName = option.name.trim()
      if (!trimmedName) {
        setFeedback({
          type: 'error',
          message: '옵션명을 입력해주세요.',
        })
        return
      }

      if (option.values.length === 0) {
        setFeedback({
          type: 'error',
          message: '옵션 값을 최소 한 개 이상 추가해주세요.',
        })
        return
      }

      const normalizedValues = option.values
        .map(({ label, price }) => {
          const trimmedLabel = label.trim()
          const numericPrice = Number(price)
          if (!trimmedLabel || Number.isNaN(numericPrice)) {
            return null
          }
          return {
            label: trimmedLabel,
            price: numericPrice,
          }
        })
        .filter(Boolean)

      if (normalizedValues.length === 0) {
        setFeedback({
          type: 'error',
          message: '유효한 옵션 값과 가격을 입력해주세요.',
        })
        return
      }

      formattedOption = {
        name: trimmedName,
        values: normalizedValues,
      }
    } else {
      const parsedPrice = Number(formValues.price)
      if (Number.isNaN(parsedPrice)) {
        setFeedback({
          type: 'error',
          message: '판매가는 숫자로 입력해주세요.',
        })
        return
      }

      if (parsedPrice < 0) {
        setFeedback({
          type: 'error',
          message: '판매가는 0 이상이어야 합니다.',
        })
        return
      }

      productPrice = parsedPrice
    }

    const requestBody = {
      name: formValues.name,
      summary: '',
      category: formValues.category,
      price: hasOption ? 0 : productPrice,
      stock: 0,
      shippingFee: 0,
      status: 'ACTIVE',
      tags: [],
      thumbnailUrl: '',
      description: formValues.description,
      detailImages: imageInputs
        .filter((input) => input.data)
        .map((input) => input.data)
        .slice(0, 5),
      options: formattedOption ? [formattedOption] : [],
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      if (accessToken) {
        headers.Authorization = accessToken
      }

      const response = await fetch('http://localhost:8081/api/seller/products', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const errorMessage = data?.message || '상품 등록에 실패했습니다.'
        throw new Error(errorMessage)
      }

      setFeedback({
        type: 'success',
        message: data?.message || '상품이 등록되었습니다.',
      })
      resetForm()
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 1200)
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error?.message || '상품 등록에 실패했습니다.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddOption = () => {
    if (option) return
    if (feedback) {
      setFeedback(null)
    }
    setOption(createEmptyOption())
    setFormValues((prev) => ({ ...prev, price: '' }))
  }

  const handleRemoveOption = () => {
    setOption(null)
    setFormValues((prev) => ({ ...prev, price: '' }))
    if (feedback) {
      setFeedback(null)
    }
  }

  const handleOptionNameChange = (event) => {
    const { value } = event.target
    setOption((prev) => (prev ? { ...prev, name: value } : prev))
    if (feedback) {
      setFeedback(null)
    }
  }

  const handleOptionValueLabelChange = (event) => {
    const { value } = event.target
    setOption((prev) => (prev ? { ...prev, valueInput: value } : prev))
    if (feedback) {
      setFeedback(null)
    }
  }

  const handleOptionValuePriceChange = (event) => {
    const { value } = event.target
    setOption((prev) => (prev ? { ...prev, valuePriceInput: value } : prev))
    if (feedback) {
      setFeedback(null)
    }
  }

  const handleAddOptionValue = () => {
    if (!option) {
      return
    }

    const trimmedLabel = option.valueInput.trim()
    const trimmedPrice = option.valuePriceInput.trim()

    if (!trimmedLabel || !trimmedPrice) {
      setFeedback({
        type: 'error',
        message: '옵션 값과 가격을 모두 입력해주세요.',
      })
      return
    }

    const numericPrice = Number(trimmedPrice)

    if (Number.isNaN(numericPrice)) {
      setFeedback({
        type: 'error',
        message: '옵션 가격은 숫자로 입력해주세요.',
      })
      return
    }

    if (numericPrice < 0) {
      setFeedback({
        type: 'error',
        message: '옵션 가격은 0 이상이어야 합니다.',
      })
      return
    }

    if (option.values.some((item) => item.label === trimmedLabel)) {
      if (feedback) {
        setFeedback(null)
      }
      setOption({
        ...option,
        valueInput: '',
        valuePriceInput: '',
      })
      return
    }

    if (feedback) {
      setFeedback(null)
    }

    setOption({
      ...option,
      values: [...option.values, createOptionValue(trimmedLabel, numericPrice)],
      valueInput: '',
      valuePriceInput: '',
    })
  }

  const handleOptionValuePriceKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddOptionValue()
    }
  }

  const handleOptionValueLabelKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddOptionValue()
    }
  }

  const handleRemoveOptionValue = (valueId) => {
    setOption((prev) =>
      prev
        ? {
            ...prev,
            values: prev.values.filter((item) => item.id !== valueId),
          }
        : prev,
    )
    if (feedback) {
      setFeedback(null)
    }
  }

  const handleImageChange = async (inputId, event) => {
    const { target } = event
    const file = target.files?.[0]
    if (!file) {
      return
    }

    target.value = ''

    const objectUrl =
      typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : ''

    try {
      const dataUrl = await readFileAsDataUrl(file)

      setImageInputs((prev) => {
        let updated = prev.map((input) => {
          if (input.id !== inputId) return input

          if (input.preview) {
            revokePreview(input.preview)
          }

          return {
            ...input,
            file,
            preview: objectUrl || dataUrl,
            data: dataUrl,
          }
        })

        const filledCount = updated.filter((input) => Boolean(input.preview)).length
        const hasEmpty = updated.some((input) => !input.preview)

        if (!hasEmpty && filledCount < 5) {
          updated = [...updated, createImageInput()]
        }

        if (updated.length > 5 && filledCount >= 5) {
          updated = updated.filter((input) => input.preview).slice(0, 5)
        }

        return updated
      })
    } catch (error) {
      if (objectUrl) {
        revokePreview(objectUrl)
      }
      // eslint-disable-next-line no-console
      console.error('이미지 파일을 읽을 수 없습니다.', error)
    }
  }

  const handleAddImageInput = () => {
    setImageInputs((prev) => {
      if (prev.length >= 5 || prev.some((input) => !input.preview)) {
        return prev
      }
      return [...prev, createImageInput()]
    })
  }

  const handleRemoveImage = (inputId) => {
    setImageInputs((prev) => {
      const target = prev.find((input) => input.id === inputId)
      if (target?.preview) {
        revokePreview(target.preview)
      }

      const filtered = prev.filter((input) => input.id !== inputId)

      if (filtered.length === 0) {
        return [createImageInput()]
      }

      if (!filtered.some((input) => !input.preview) && filtered.length < 5) {
        filtered.push(createImageInput())
      }

      return filtered
    })
  }

  return (
    <div className="auth-card auth-card--product" aria-labelledby="product-register-title">
      <AuthHeader title="상품 등록" titleId="product-register-title" onBack={() => navigate(-1)} />

      <form id="product-register-form" className="product-register" onSubmit={handleSubmit}>
        <p className="product-register__intro">{storeName}님의 새로운 상품을 소개해주세요.</p>
        {feedback && (
          <p
            className={
              feedback.type === 'success'
                ? 'product-register__feedback product-register__feedback--success'
                : 'product-register__feedback product-register__feedback--error'
            }
            role={feedback.type === 'success' ? 'status' : 'alert'}
          >
            {feedback.message}
          </p>
        )}

        <section className="product-register__section">
          <span className="product-register__label">상품 이미지</span>
          <div className="product-register__dropzone" aria-describedby="product-image-helper">
            <div className="product-register__dropzone-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14l-4.5-3.6a1 1 0 0 0-1.3.1l-2.86 2.87-3.45-4.02a1 1 0 0 0-1.52-.03L4 17V5Zm8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
              </svg>
            </div>
            <p id="product-image-helper" className="product-register__helper">
              최대 5개까지 이미지를 첨부할 수 있습니다.
            </p>
          </div>
          <div className="product-register__image-inputs">
            {imageInputs.map((input, index) => (
              <div className="product-register__image-input" key={input.id}>
                <label className="product-register__file-label" htmlFor={`productImage-${input.id}`}>
                  <span>이미지 {index + 1} 선택</span>
                  <input
                    id={`productImage-${input.id}`}
                    type="file"
                    accept="image/*"
                    className="product-register__file-input"
                    onChange={(event) => handleImageChange(input.id, event)}
                  />
                </label>
                {input.preview && (
                  <div className="product-register__image-preview">
                    <img src={input.preview} alt={`미리보기 ${index + 1}`} />
                    <button
                      type="button"
                      className="product-register__image-remove"
                      aria-label={`이미지 ${index + 1} 삭제`}
                      onClick={() => handleRemoveImage(input.id)}
                    >
                      <img src={ICONS.delete} alt="" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {showAddImageInput && (
            <button type="button" className="product-register__option-button" onClick={handleAddImageInput}>
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 3.333a1 1 0 0 1 1 1v4.667h4.667a1 1 0 0 1 0 2H11v4.667a1 1 0 0 1-2 0V11H4.333a1 1 0 1 1 0-2H9V4.333a1 1 0 0 1 1-1Z" />
              </svg>
              이미지 추가
            </button>
          )}
        </section>

        <section className="product-register__section">
          <label className="product-register__label" htmlFor="productName">
            상품명<span className="product-register__badge">*</span>
          </label>
          <input
            id="productName"
            name="productName"
            type="text"
            className="product-register__control"
            placeholder="예: 프리미엄 런닝화"
            value={formValues.name}
            onChange={handleChange('name')}
          />
        </section>

        <section className="product-register__section">
          <label className="product-register__label" htmlFor="productDescription">
            상품 설명<span className="product-register__badge">*</span>
          </label>
          <textarea
            id="productDescription"
            name="productDescription"
            className="product-register__textarea"
            placeholder="상품에 대한 자세한 설명을 입력해주세요"
            value={formValues.description}
            onChange={handleChange('description')}
          />
        </section>

        <section className="product-register__section">
          <label className="product-register__label" htmlFor="productPrice">
            가격<span className="product-register__badge">*</span>
          </label>
          <div className="product-register__input-group">
            <input
              id="productPrice"
              name="productPrice"
              type="number"
              min="0"
              className="product-register__control"
              placeholder="0"
              value={formValues.price}
              onChange={handleChange('price')}
              disabled={optionEnabled}
            />
            <span className="product-register__input-suffix">원</span>
          </div>
          {optionEnabled && <p className="product-register__helper">옵션 가격으로 판매가를 설정할 수 있어요.</p>}
        </section>

        <section className="product-register__section">
          <span className="product-register__label">
            카테고리<span className="product-register__badge">*</span>
          </span>
          <div className="product-register__category-list">
            {CATEGORY_PRESETS.map((category) => (
              <button
                key={category}
                type="button"
                className="product-register__category"
                aria-pressed={formValues.category === category}
                onClick={() => handleCategoryToggle(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="product-register__section product-register__section--divider">
          <span className="product-register__label">상품 옵션</span>
          <div className="product-register__option-info">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 1.667A8.333 8.333 0 1 0 10 18.333 8.333 8.333 0 0 0 10 1.667Zm.833 12.5H9.167v-5h1.666v5Zm0-6.667H9.167v-1.666h1.666V7.5Z" />
            </svg>
            <span>색상, 사이즈 등의 옵션을 추가할 수 있습니다 (선택사항)</span>
          </div>
          {optionEnabled && (
            <div className="product-register__option-panel">
              <div className="product-register__option-header">
                <span className="product-register__option-title">옵션</span>
                <button
                  type="button"
                  className="product-register__option-remove"
                  aria-label="옵션 삭제"
                  onClick={handleRemoveOption}
                >
                  <img src={ICONS.delete} alt="" aria-hidden="true" />
                </button>
              </div>
              <div className="product-register__option-group">
                <label className="product-register__label" htmlFor="productOptionName">
                  옵션명<span className="product-register__badge">*</span>
                </label>
                <input
                  id="productOptionName"
                  name="productOptionName"
                  type="text"
                  className="product-register__control"
                  placeholder="예: 색상"
                  value={option.name}
                  onChange={handleOptionNameChange}
                />
              </div>
              <div className="product-register__option-group">
                <label className="product-register__label" htmlFor="productOptionValueLabel">
                  옵션 값<span className="product-register__badge">*</span>
                </label>
                <div className="product-register__chip-list">
                  {option.values.map(({ id, label, price }) => (
                    <span className="product-register__chip" key={id}>
                      {label} / {Number(price).toLocaleString()}원
                      <button
                        type="button"
                        className="product-register__chip-remove"
                        aria-label={`${label} 삭제`}
                        onClick={() => handleRemoveOptionValue(id)}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="product-register__option-inputs">
                  <input
                    id="productOptionValueLabel"
                    type="text"
                    className="product-register__control product-register__option-value-input"
                    placeholder="예: 블랙"
                    value={option.valueInput}
                    onChange={handleOptionValueLabelChange}
                    onKeyDown={handleOptionValueLabelKeyDown}
                  />
                  <div className="product-register__option-price-input">
                    <input
                      type="number"
                      min="0"
                      className="product-register__control"
                      placeholder="0"
                      value={option.valuePriceInput}
                      onChange={handleOptionValuePriceChange}
                      onKeyDown={handleOptionValuePriceKeyDown}
                    />
                    <span>원</span>
                  </div>
                  <button type="button" className="product-register__option-add" onClick={handleAddOptionValue}>
                    추가
                  </button>
                </div>
                <p className="product-register__helper">옵션 값과 가격을 입력한 후 추가 버튼을 눌러주세요.</p>
              </div>
            </div>
          )}
        <button
          type="button"
          className="product-register__option-button"
          onClick={handleAddOption}
          disabled={optionEnabled}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 3.333a1 1 0 0 1 1 1v4.667h4.667a1 1 0 0 1 0 2H11v4.667a1 1 0 0 1-2 0V11H4.333a1 1 0 1 1 0-2H9V4.333a1 1 0 0 1 1-1Z" />
          </svg>
          옵션 추가
        </button>
          {optionEnabled && (
            <p className="product-register__helper product-register__helper--info">상품당 옵션은 한 개만 추가할 수 있습니다.</p>
          )}
        </section>
      </form>

      <footer className="product-register__footer">
        <div className="product-register__empty" aria-hidden="true">
          * 필수 입력 항목
        </div>
        <button type="submit" className="product-register__submit" form="product-register-form" disabled={submitting}>
          <img src={ICONS.add} alt="" aria-hidden="true" />
          {submitting ? '등록 중...' : '상품 등록하기'}
        </button>
        <button type="button" className="product-register__reset" onClick={resetForm} disabled={submitting}>
          초기화
        </button>
      </footer>
    </div>
  )
}

export default ProductRegisterPage
