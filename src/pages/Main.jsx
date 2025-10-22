import './Main.css'

const MainPage = ({ onLogout }) => {
  return (
    <div className="main-page">
      <header className="main-header">
        <div className="main-header__logo">
          <div className="main-header__logo-icon">K</div>
          <span className="main-header__logo-text">K-Shop</span>
        </div>
        <div className="main-header__actions">
          <button type="button" className="main-header__avatar">
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
            {Array.from({ length: 4 }).map((_, index) => (
              <article key={`popular-${index}`} className="main-card">
                <div className="main-card__media main-card__media--placeholder" />
                <div className="main-card__body">
                  <h3 className="main-card__name">프리미엄 런닝화</h3>
                  <div className="main-card__price">
                    <span className="main-card__price-current">129,000원</span>
                    <span className="main-card__price-original">
                      211,475원 <span className="main-card__badge">39%</span>
                    </span>
                  </div>
                  <div className="main-card__rating">
                    <span className="main-card__stars" aria-hidden="true">
                      ★★★★★
                    </span>
                    <span className="main-card__rating-text">4.8 (256)</span>
                  </div>
                </div>
              </article>
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
            {Array.from({ length: 6 }).map((_, index) => (
              <article key={`related-${index}`} className="main-scroll__item">
                <div className="main-scroll__media main-scroll__media--placeholder" />
                <div className="main-scroll__body">
                  <h3 className="main-scroll__name">스마트워치</h3>
                  <p className="main-scroll__price">349,000원</p>
                  <div className="main-scroll__rating">
                    <span className="main-scroll__rating-icon" aria-hidden="true">
                      ★
                    </span>
                    <span className="main-scroll__rating-text">4.7</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default MainPage
