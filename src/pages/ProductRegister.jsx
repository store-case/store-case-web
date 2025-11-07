import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProductRegister.css'
import PageHeader from '../components/PageHeader'
import ImageUploader, { createImageItem, revokePreview } from '../components/ImageUploader'
import ProductOptionManager from '../components/ProductOptionManager'
import FeedbackMessage from '../components/FeedbackMessage'
import ICONS from '../constants/icons'
import { API_ENDPOINTS } from '../constants/api'
import { useAuth } from '../contexts/AuthContext'
import useFormValidation from '../hooks/useFormValidation'
import { apiClient } from '../utils/apiClient'

const CATEGORY_PRESETS = ['신발', '전자기기', '가방', '패션', '스포츠', '가전', '뷰티']

const DEFAULT_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
}

const ProductRegisterPage = () => {
  const navigate = useNavigate()
  const { accessToken, user } = useAuth()
  const [formValues, setFormValues] = useState(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [option, setOption] = useState(null)
  const [imageInputs, setImageInputs] = useState([createImageItem()])

  const storeName = useMemo(() => user?.name || '스토어', [user?.name])
  const optionEnabled = Boolean(option)
  const optionSectionRef = useRef(null)
  const productValidators = useMemo(
    () => ({
      name: (value) => (!value ? '상품명을 입력해주세요.' : null),
      description: (value) => (!value ? '상품 설명을 입력해주세요.' : null),
      category: (value) => (!value ? '카테고리를 선택해주세요.' : null),
      price: (value, values) => {
        if (values?.hasOption) {
          return null
        }
        if (value === '' || value === null || value === undefined) {
          return '판매가를 입력해주세요.'
        }
        const numeric = Number(value)
        if (Number.isNaN(numeric) || numeric < 0) {
          return '판매가는 0 이상 숫자로 입력해주세요.'
        }
        return null
      },
      stock: (value, values) => {
        if (values?.hasOption) {
          return null
        }
        if (value === '' || value === null || value === undefined) {
          return '재고수를 입력해주세요.'
        }
        const numeric = Number(value)
        if (Number.isNaN(numeric) || numeric < 0 || !Number.isInteger(numeric)) {
          return '재고수는 0 이상 정수로 입력해주세요.'
        }
        return null
      },
    }),
    [],
  )
  const { clearError, validateAll, resetErrors } = useFormValidation(productValidators)

  useEffect(() => {
    if (optionEnabled && optionSectionRef.current) {
      optionSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [optionEnabled])

  const handleChange = (field) => (event) => {
    const { value } = event.target
    setFormValues((prev) => ({ ...prev, [field]: value }))
    clearError(field)
    if (feedback) {
      setFeedback(null)
    }
  }

  const handleCategoryToggle = (value) => {
    setFormValues((prev) => ({ ...prev, category: prev.category === value ? '' : value }))
    clearError('category')
    if (feedback) {
      setFeedback(null)
    }
  }

  const resetForm = () => {
    setFormValues(DEFAULT_FORM)
    setFeedback(null)
    setOption(null)
    imageInputs.forEach((input) => revokePreview(input.preview))
    setImageInputs([createImageItem()])
    resetErrors()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    const hasOption = Boolean(option)
    const { isValid, firstError } = validateAll({ ...formValues, hasOption })
    if (!isValid) {
      setFeedback({
        type: 'error',
        message: firstError,
      })
      return
    }

    let formattedOption = null
    let productPrice = 0
    let productStock = 0

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
        .map(({ label, price, stock }) => {
          const trimmedLabel = label.trim()
          const numericPrice = Number(price)
          const numericStock = Number(stock)
          if (
            !trimmedLabel ||
            Number.isNaN(numericPrice) ||
            Number.isNaN(numericStock) ||
            numericPrice < 0 ||
            numericStock < 0 ||
            !Number.isInteger(numericStock)
          ) {
            return null
          }
          return {
            label: trimmedLabel,
            price: numericPrice,
            stock: numericStock,
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
      productPrice = Number(formValues.price)
      productStock = Number(formValues.stock)
    }

    const requestBody = {
      name: formValues.name,
      summary: '',
      category: formValues.category,
      price: hasOption ? 0 : productPrice,
      stock: hasOption ? 0 : productStock,
      shippingFee: 0,
      status: 'ACTIVE',
      tags: [],
      thumbnailUrl: '',
      description: formValues.description,
      detailImages: imageInputs.filter((input) => input.data).map((input) => input.data).slice(0, 5),
      options: formattedOption ? [formattedOption] : [],
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      const data = await apiClient.post(API_ENDPOINTS.seller.createProduct, requestBody, {
        token: accessToken,
      })

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

  return (
    <div className="auth-card auth-card--product" aria-labelledby="product-register-title">
      <PageHeader title="상품 등록" titleId="product-register-title" onBack={() => navigate(-1)} />

      <form id="product-register-form" className="product-register" onSubmit={handleSubmit}>
        <p className="product-register__intro">{storeName}님의 새로운 상품을 소개해주세요.</p>
        <FeedbackMessage type={feedback?.type} message={feedback?.message} variant="product" />

        <ImageUploader images={imageInputs} onChange={setImageInputs} maxImages={5} />

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
          <label className="product-register__label" htmlFor="productStock">
            재고수<span className="product-register__badge">*</span>
          </label>
          <div className="product-register__input-group">
            <input
              id="productStock"
              name="productStock"
              type="number"
              min="0"
              className="product-register__control"
              placeholder="0"
              value={formValues.stock}
              onChange={handleChange('stock')}
              disabled={optionEnabled}
            />
            <span className="product-register__input-suffix">개</span>
          </div>
          {optionEnabled && <p className="product-register__helper">옵션별 재고로 관리할 수 있어요.</p>}
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

        <div ref={optionSectionRef}>
          <ProductOptionManager
            option={option}
            onOptionChange={setOption}
            onFeedbackChange={setFeedback}
            onEnable={() => {
              setFormValues((prev) => ({ ...prev, price: '', stock: '' }))
              clearError('price')
              clearError('stock')
            }}
            onDisable={() => {
              setFormValues((prev) => ({ ...prev, price: '', stock: '' }))
              clearError('price')
              clearError('stock')
            }}
          />
        </div>
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
