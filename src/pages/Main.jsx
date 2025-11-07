import { useNavigate } from 'react-router-dom'
import './Main.css'
import ProductCard from '../components/ProductCard'

const POPULAR_PRODUCTS = [
  {
    id: 'popular-1',
    name: '프리미엄 런닝화',
    price: 129000,
    originalPrice: 211475,
    discountRate: 39,
    rating: 4.8,
    ratingCount: 256,
  },
  {
    id: 'popular-2',
    name: '어반 라이프 재킷',
    price: 89000,
    originalPrice: 129000,
    discountRate: 31,
    rating: 4.6,
    ratingCount: 142,
  },
  {
    id: 'popular-3',
    name: '노이즈 캔슬링 헤드폰',
    price: 199000,
    originalPrice: 259000,
    discountRate: 23,
    rating: 4.9,
    ratingCount: 98,
  },
  {
    id: 'popular-4',
    name: '스마트 피트니스 워치',
    price: 159000,
    originalPrice: 189000,
    discountRate: 16,
    rating: 4.7,
    ratingCount: 312,
  },
]

const RELATED_PRODUCTS = [
  {
    id: 'related-1',
    name: '스마트워치',
    price: 349000,
    rating: 4.7,
  },
  {
    id: 'related-2',
    name: '무선 이어폰',
    price: 189000,
    rating: 4.5,
  },
  {
    id: 'related-3',
    name: '러닝 팬츠',
    price: 79000,
    rating: 4.6,
  },
  {
    id: 'related-4',
    name: '경량 바람막이',
    price: 99000,
    rating: 4.4,
  },
  {
    id: 'related-5',
    name: '프리미엄 양말 3팩',
    price: 19000,
    rating: 4.8,
  },
  {
    id: 'related-6',
    name: '워터프루프 백팩',
    price: 129000,
    rating: 4.6,
  },
]

const MainPage = () => {
  const navigate = useNavigate()

  return (
    <div className="main-page">
      <header className="main-header">
        <div className="main-header__logo">
          <div className="main-header__logo-icon">K</div>
          <span className="main-header__logo-text">K-Shop</span>
        </div>
        <div className="main-header__actions">
          <button type="button" className="main-header__avatar" onClick={() => navigate('/mypage')}>
            K
          </button>
          <button type="button" className="main-header__icon-button" aria-label="찜">
            <span className="main-header__icon main-header__icon--heart" aria-hidden="true" />
          </button>
          <button type="button" className="main-header__icon-button" aria-label="장바구니">
            <span className="main-header__icon main-header__icon--cart" aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="main-search">
          <div className="main-search__input">
            <span className="main-search__icon" aria-hidden="true" />
            <input type="search" placeholder="원하는 상품을 검색해보세요" />
          </div>
          <button type="button" className="main-search__filter" aria-label="필터" />
        </section>

        <section className="main-banner">
          <div className="main-banner__card main-banner__card--primary">
            <div className="main-banner__content">
              <p className="main-banner__eyebrow">특별 할인</p>
              <p className="main-banner__headline">봄 신상품 최대 50% 할인</p>
              <button type="button" className="main-banner__cta">
                지금 쇼핑하기
              </button>
            </div>
            <div className="main-banner__media main-banner__media--placeholder" />
          </div>
          <div className="main-banner__dots">
            <span className="main-banner__dot main-banner__dot--active" />
            <span className="main-banner__dot" />
            <span className="main-banner__dot" />
          </div>
        </section>

        <nav className="main-menu">
          <button type="button" className="main-menu__item">
            <span className="main-menu__icon main-menu__icon--deal" aria-hidden="true" />
            <span className="main-menu__label">할인상품</span>
          </button>
          <button type="button" className="main-menu__item">
            <span className="main-menu__icon main-menu__icon--trend" aria-hidden="true" />
            <span className="main-menu__label">인기상품</span>
          </button>
          <button type="button" className="main-menu__item">
            <span className="main-menu__icon main-menu__icon--gift" aria-hidden="true" />
            <span className="main-menu__label">신상품</span>
          </button>
          <button type="button" className="main-menu__item">
            <span className="main-menu__icon main-menu__icon--clock" aria-hidden="true" />
            <span className="main-menu__label">타임세일</span>
          </button>
        </nav>

        <section className="main-section">
          <div className="main-section__header">
            <div>
              <p className="main-section__title">🔥 인기상품</p>
              <p className="main-section__subtitle">지금 가장 많이 찾는 상품들</p>
            </div>
            <button type="button" className="main-section__view-all">
              전체보기
            </button>
          </div>
          <div className="main-grid">
            {POPULAR_PRODUCTS.map((product) => (
              <ProductCard key={product.id} variant="grid" {...product} />
            ))}
          </div>
        </section>

        <section className="main-section">
          <div className="main-section__header">
            <div>
              <p className="main-section__title">👀 이 상품과 함께 본 상품</p>
              <p className="main-section__subtitle">함께 보면 좋은 추천 상품</p>
            </div>
            <button type="button" className="main-section__view-all">
              전체보기
            </button>
          </div>
          <div className="main-scroll">
            {RELATED_PRODUCTS.map((product) => (
              <ProductCard key={product.id} variant="scroll" {...product} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default MainPage
