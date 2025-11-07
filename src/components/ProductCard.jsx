const formatCurrency = (value, suffix = '원') => {
  if (value === undefined || value === null) {
    return null
  }

  const numeric = Number(value)
  if (Number.isNaN(numeric)) {
    return null
  }

  return `${numeric.toLocaleString()}${suffix}`
}

const buildStars = (rating) => {
  if (!rating) {
    return '★★★★★'
  }

  const rounded = Math.max(0, Math.min(5, Math.round(rating)))
  return '★'.repeat(rounded).padEnd(5, '☆')
}

const ProductCard = ({
  variant = 'grid',
  name,
  price,
  originalPrice,
  discountRate,
  rating,
  ratingCount,
  thumbnail,
  className = '',
  assistText,
  currencySuffix = '원',
  ...rest
}) => {
  const formattedPrice = formatCurrency(price, currencySuffix)
  const formattedOriginalPrice = formatCurrency(originalPrice, currencySuffix)

  const computedDiscount =
    discountRate !== undefined && discountRate !== null
      ? discountRate
      : price && originalPrice
        ? Math.round((1 - Number(price) / Number(originalPrice)) * 100)
        : null

  const hasThumbnail = Boolean(thumbnail)
  const ratingLabel = rating ? Number(rating).toFixed(1) : null

  if (variant === 'scroll') {
    const wrapperClass = `main-scroll__item${className ? ` ${className}` : ''}`
    const mediaClass = `main-scroll__media${hasThumbnail ? '' : ' main-scroll__media--placeholder'}`

    return (
      <article className={wrapperClass} {...rest}>
        <div className={mediaClass}>
          {hasThumbnail ? <img src={thumbnail} alt={name || '상품 이미지'} /> : null}
        </div>
        <div className="main-scroll__body">
          {name ? <h3 className="main-scroll__name">{name}</h3> : null}
          {formattedPrice ? <p className="main-scroll__price">{formattedPrice}</p> : null}
          {(rating || assistText) && (
            <div className="main-scroll__rating">
              {rating ? (
                <>
                  <span className="main-scroll__rating-icon" aria-hidden="true">
                    ★
                  </span>
                  <span className="main-scroll__rating-text">{ratingLabel}</span>
                </>
              ) : (
                <span className="main-scroll__rating-text">{assistText}</span>
              )}
            </div>
          )}
        </div>
      </article>
    )
  }

  const wrapperClass = `main-card${className ? ` ${className}` : ''}`
  const mediaClass = `main-card__media${hasThumbnail ? '' : ' main-card__media--placeholder'}`
  const stars = buildStars(rating)

  return (
    <article className={wrapperClass} {...rest}>
      <div className={mediaClass}>{hasThumbnail ? <img src={thumbnail} alt={name || '상품 이미지'} /> : null}</div>
      <div className="main-card__body">
        {name ? <h3 className="main-card__name">{name}</h3> : null}
        <div className="main-card__price">
          {formattedPrice ? <span className="main-card__price-current">{formattedPrice}</span> : null}
          {formattedOriginalPrice && (
            <span className="main-card__price-original">
              {formattedOriginalPrice}
              {computedDiscount ? <span className="main-card__badge">{`${computedDiscount}%`}</span> : null}
            </span>
          )}
        </div>
        {(rating || ratingCount) && (
          <div className="main-card__rating">
            <span className="main-card__stars" aria-hidden="true">
              {stars}
            </span>
            <span className="main-card__rating-text">
              {ratingLabel}
              {ratingCount ? ` (${Number(ratingCount).toLocaleString()})` : ''}
            </span>
          </div>
        )}
      </div>
    </article>
  )
}

export default ProductCard
