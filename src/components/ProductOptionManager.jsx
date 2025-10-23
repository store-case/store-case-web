import ICONS from '../constants/icons'

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

const ProductOptionManager = ({ option, onOptionChange, onFeedbackChange, onEnable, onDisable }) => {
  const optionEnabled = Boolean(option)

  const clearFeedback = () => {
    if (onFeedbackChange) {
      onFeedbackChange(null)
    }
  }

  const updateOption = (updater) => {
    if (!onOptionChange) return
    if (!option) return
    const nextOption = updater(option)
    onOptionChange(nextOption)
  }

  const handleEnableOption = () => {
    if (optionEnabled) return
    clearFeedback()
    const nextOption = createEmptyOption()
    onOptionChange?.(nextOption)
    onEnable?.()
  }

  const handleDisableOption = () => {
    if (!optionEnabled) return
    clearFeedback()
    onOptionChange?.(null)
    onDisable?.()
  }

  const handleOptionNameChange = (event) => {
    const { value } = event.target
    clearFeedback()
    updateOption((prev) => ({ ...prev, name: value }))
  }

  const handleOptionValueLabelChange = (event) => {
    const { value } = event.target
    clearFeedback()
    updateOption((prev) => ({ ...prev, valueInput: value }))
  }

  const handleOptionValuePriceChange = (event) => {
    const { value } = event.target
    clearFeedback()
    updateOption((prev) => ({ ...prev, valuePriceInput: value }))
  }

  const handleAddOptionValue = () => {
    if (!optionEnabled || !option) {
      return
    }

    const trimmedLabel = option.valueInput.trim()
    const trimmedPrice = option.valuePriceInput.trim()

    if (!trimmedLabel || !trimmedPrice) {
      onFeedbackChange?.({
        type: 'error',
        message: '옵션 값과 가격을 모두 입력해주세요.',
      })
      return
    }

    const numericPrice = Number(trimmedPrice)

    if (Number.isNaN(numericPrice)) {
      onFeedbackChange?.({
        type: 'error',
        message: '옵션 가격은 숫자로 입력해주세요.',
      })
      return
    }

    if (numericPrice < 0) {
      onFeedbackChange?.({
        type: 'error',
        message: '옵션 가격은 0 이상이어야 합니다.',
      })
      return
    }

    if (option.values.some((item) => item.label === trimmedLabel)) {
      clearFeedback()
      updateOption((prev) => ({
        ...prev,
        valueInput: '',
        valuePriceInput: '',
      }))
      return
    }

    clearFeedback()
    updateOption((prev) => ({
      ...prev,
      values: [...prev.values, createOptionValue(trimmedLabel, numericPrice)],
      valueInput: '',
      valuePriceInput: '',
    }))
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
    clearFeedback()
    updateOption((prev) => ({
      ...prev,
      values: prev.values.filter((item) => item.id !== valueId),
    }))
  }

  return (
    <section className="product-register__section product-register__section--divider">
      <span className="product-register__label">상품 옵션</span>
      <div className="product-register__option-info">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M10 1.667A8.333 8.333 0 1 0 10 18.333 8.333 8.333 0 0 0 10 1.667Zm.833 12.5H9.167v-5h1.666v5Zm0-6.667H9.167v-1.666h1.666V7.5Z" />
        </svg>
        <span>색상, 사이즈 등의 옵션을 추가할 수 있습니다 (선택사항)</span>
      </div>
      {optionEnabled && option && (
        <div className="product-register__option-panel">
          <div className="product-register__option-header">
            <span className="product-register__option-title">옵션</span>
            <button
              type="button"
              className="product-register__option-remove"
              aria-label="옵션 삭제"
              onClick={handleDisableOption}
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
      <button type="button" className="product-register__option-button" onClick={handleEnableOption} disabled={optionEnabled}>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M10 3.333a1 1 0 0 1 1 1v4.667h4.667a1 1 0 0 1 0 2H11v4.667a1 1 0 0 1-2 0V11H4.333a1 1 0 1 1 0-2H9V4.333a1 1 0 0 1 1-1Z" />
        </svg>
        옵션 추가
      </button>
      {optionEnabled && (
        <p className="product-register__helper product-register__helper--info">상품당 옵션은 한 개만 추가할 수 있습니다.</p>
      )}
    </section>
  )
}

export default ProductOptionManager
