import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './MyPage.css'
import ICONS from '../constants/icons'
import { useAuth } from '../contexts/AuthContext'
import AuthHeader from '../components/AuthHeader'
import MyPageActionButton from '../components/MyPageActionButton'

const STATS_KEYS = [
  { key: 'orders', label: '주문 내역' },
  { key: 'reviews', label: '작성한 리뷰' },
  { key: 'wishlists', label: '찜한 상품' },
]

const SHORTCUT_ITEMS = [
  {
    key: 'orders',
    title: '주문 내역',
    description: '배송 현황과 주문 상세를 확인하세요.',
    path: '#orders',
  },
  {
    key: 'reviews',
    title: '작성한 리뷰',
    description: '내가 남긴 리뷰와 평점을 관리해요.',
    path: '#reviews',
  },
  {
    key: 'wishlists',
    title: '찜한 상품',
    description: '관심 있는 상품을 한눈에 모아보세요.',
    path: '#wishlists',
  },
]

const SUPPORT_ITEMS = [
  {
    key: 'profile',
    title: '회원 정보 수정',
    description: '비밀번호, 연락처 등 기본 정보를 변경할 수 있어요.',
  },
  {
    key: 'address',
    title: '배송지 관리',
    description: '자주 사용하는 배송지를 등록하고 관리하세요.',
  },
  {
    key: 'support',
    title: '고객센터',
    description: '문의 및 환불이 필요하신가요? 언제든지 도와드릴게요.',
  },
]

const STORE_VISIT_ITEMS = [
  {
    key: 'recent-store',
    title: '최근 방문한 스토어',
    description: '최근 둘러본 스토어 소식과 상품을 다시 확인해보세요.',
    action: '스토어 보기',
  },
  {
    key: 'favorite-store',
    title: '즐겨찾는 스토어',
    description: '찜한 스토어 소식을 빠르게 받아보세요.',
    action: '즐겨찾기 관리',
  },
]

const MyPage = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const displayName = user?.name || '스토어 회원'
  const email = user?.email || '이메일 정보가 아직 등록되지 않았어요.'
  const initials = useMemo(() => displayName.slice(0, 2).toUpperCase(), [displayName])

  const stats = useMemo(
    () =>
      STATS_KEYS.map(({ key, label }) => ({
        key,
        label,
        value: user && typeof user[`${key}Count`] === 'number' ? user[`${key}Count`] : '--',
      })),
    [user],
  )

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString()
    }
    return value
  }

  const handleShortcut = (path) => {
    if (!path) return
    if (path.startsWith('#')) {
      window.location.hash = path
      return
    }
    navigate(path)
  }

  const handleLogout = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="auth-card auth-card--mypage">
      <AuthHeader title="마이페이지" onBack={() => navigate(-1)} />
      <main className="auth__content mypage">
        <section className="mypage__profile-card">
        <div className="mypage__profile">
          <div className="mypage__avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="mypage__profile-info">
            <p className="mypage__profile-name">{displayName}</p>
            <p className="mypage__profile-email">{email}</p>
          </div>
        </div>
        <div className="mypage__profile-actions">
          <button type="button" className="mypage__secondary">
            프로필 수정
          </button>
          <MyPageActionButton onClick={handleLogout}>로그아웃</MyPageActionButton>
        </div>
      </section>

      <section className="mypage__section">
        <h2 className="mypage__section-title">나의 활동</h2>
        <div className="mypage__stats">
          {stats.map(({ key, label, value }) => (
            <article className="mypage__stat" key={key}>
              <p className="mypage__stat-value" aria-label={`${label} ${formatValue(value)}`}>
                {formatValue(value)}
              </p>
              <p className="mypage__stat-label">{label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mypage__section">
        <h2 className="mypage__section-title">빠른 이동</h2>
        <div className="mypage__cards">
          {SHORTCUT_ITEMS.map(({ key, title, description, path }) => (
            <button
              type="button"
              key={key}
              className="mypage__card"
              onClick={() => handleShortcut(path)}
            >
              <div className="mypage__card-text">
                <p className="mypage__card-title">{title}</p>
                <p className="mypage__card-description">{description}</p>
              </div>
              <img src={ICONS.chevronRight} alt="" aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      <section className="mypage__section">
        <h2 className="mypage__section-title">스토어 방문</h2>
        <div className="mypage__store-cards">
          {STORE_VISIT_ITEMS.map(({ key, title, description, action }) => (
            <article className="mypage__store-card" key={key}>
              <div className="mypage__store-card-body">
                <p className="mypage__store-card-title">{title}</p>
                <p className="mypage__store-card-description">{description}</p>
              </div>
              <MyPageActionButton
                className="mypage-action-button--compact"
                icon={ICONS.chevronRight}
                onClick={() => navigate('#' + key)}
              >
                {action}
              </MyPageActionButton>
            </article>
          ))}
        </div>
      </section>

      <section className="mypage__section">
        <h2 className="mypage__section-title">계정 관리</h2>
        <div className="mypage__list">
          {SUPPORT_ITEMS.map(({ key, title, description }) => (
            <div key={key} className="mypage__list-item">
              <div>
                <p className="mypage__list-title">{title}</p>
                <p className="mypage__list-description">{description}</p>
              </div>
              <button type="button" className="mypage__link" onClick={() => navigate('#' + key)}>
                자세히 보기
                <img src={ICONS.chevronRight} alt="" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </section>
      </main>
    </div>
  )
}

export default MyPage
