import { useMemo } from 'react'
import PropTypes from 'prop-types'

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M12 5a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H6a1 1 0 110-2h5V6a1 1 0 011-1z"
      fill="#4f46e5"
    />
  </svg>
)

const IconLightning = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M13 2a1 1 0 01.92.61l4.5 10.5A1 1 0 0117.5 14H13.8l1.42 6.37a1 1 0 01-1.8.78l-9-11A1 1 0 015.2 8H10L11.11 2.56A1 1 0 0113 2z"
      fill="#f97316"
    />
  </svg>
)

const IconMonitor = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M6 4h12a3 3 0 013 3v7a3 3 0 01-3 3h-3v2h1a1 1 0 110 2H8a1 1 0 110-2h1v-2H6a3 3 0 01-3-3V7a3 3 0 013-3zm12 2H6a1 1 0 00-1 1v7a1 1 0 001 1h12a1 1 0 001-1V7a1 1 0 00-1-1z"
      fill="#0ea5e9"
    />
  </svg>
)

const IconBag = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M8 7V6a4 4 0 118 0v1h3a1 1 0 01.99 1.14l-1.5 11A3 3 0 0115.52 22H8.48a3 3 0 01-2.97-2.86l-1.5-11A1 1 0 015 7zm7-1a2 2 0 10-4 0v1h4z"
      fill="#db2777"
    />
  </svg>
)

const IconHat = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M12 4a2 2 0 011.32.49L21 10v2a1 1 0 01-.45.83l-.55.37v4.36a3 3 0 01-2.33 2.92l-5.27 1.17a3 3 0 01-1.3 0L5.81 20.5A3 3 0 013.5 17.6V13.2l-.05-.03A1 1 0 013 12V9.5l7.68-5.62A2 2 0 0112 4zm7 7l-7-5.13L5 11v.17l6.38 3.84a3 3 0 002.96 0L19 11.16z"
      fill="#ec4899"
    />
  </svg>
)

const ICON_PRESETS = Object.freeze([
  { gradientFrom: '#e0e7ff', gradientTo: '#c7d2fe', Icon: IconPlus },
  { gradientFrom: '#fef3c7', gradientTo: '#fde68a', Icon: IconLightning },
  { gradientFrom: '#cffafe', gradientTo: '#bae6fd', Icon: IconMonitor },
  { gradientFrom: '#fce7f3', gradientTo: '#f5d0fe', Icon: IconBag },
  { gradientFrom: '#fee2e2', gradientTo: '#fecdd3', Icon: IconHat },
])

const getIconPreset = (index) => ICON_PRESETS[index % ICON_PRESETS.length]

const noop = () => {}

const CategorySidebar = ({
  isOpen,
  onClose,
  categories = [],
  isLoading = false,
  error,
  onRetry,
  onSelect = noop,
}) => {
  const normalizedCategories = useMemo(() => {
    const safeCategories = Array.isArray(categories) ? categories : []
    return [{ id: 'all', name: '전체상품' }, ...safeCategories]
  }, [categories])

  const canShowList = !isLoading && !error && normalizedCategories.length > 0

  return (
    <div className={`category-sidebar${isOpen ? ' category-sidebar--open' : ''}`} aria-hidden={!isOpen}>
      <div className="category-sidebar__scrim" role="presentation" onClick={onClose} />
      <aside className="category-sidebar__panel" role="dialog" aria-modal="true" aria-label="카테고리">
        <header className="category-sidebar__header">
          <h2 className="category-sidebar__title">카테고리</h2>
          <button type="button" className="category-sidebar__close" aria-label="카테고리 닫기" onClick={onClose}>
            <span aria-hidden="true">&times;</span>
          </button>
        </header>
        <div className="category-sidebar__body">
          {isLoading ? (
            <div className="category-sidebar__state">
              <span className="category-sidebar__spinner" aria-hidden="true" />
              <p className="category-sidebar__state-text">카테고리를 불러오는 중입니다.</p>
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="category-sidebar__state">
              <p className="category-sidebar__state-text">{error}</p>
              {onRetry ? (
                <button type="button" className="category-sidebar__retry" onClick={onRetry}>
                  다시 시도
                </button>
              ) : null}
            </div>
          ) : null}

          {canShowList ? (
            <ul className="category-sidebar__list">
              {normalizedCategories.map((category, index) => {
                const { gradientFrom, gradientTo, Icon } = getIconPreset(index)
                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      className="category-sidebar__item"
                      onClick={() => onSelect(category)}
                    >
                      <span
                        className="category-sidebar__icon"
                        style={{ backgroundImage: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
                        aria-hidden="true"
                      >
                        <Icon />
                      </span>
                      <span className="category-sidebar__label">{category.name}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}

          {!isLoading && !error && !canShowList ? (
            <div className="category-sidebar__state">
              <p className="category-sidebar__state-text">표시할 카테고리가 없습니다.</p>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  )
}

CategorySidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func,
  onSelect: PropTypes.func,
}

export default CategorySidebar
