export const API_BASE_URL = 'http://localhost:8000'

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/identity/auth/login`,
    join: `${API_BASE_URL}/api/identity/auth/join`,
    joinEmail: `${API_BASE_URL}/api/identity/auth/join/email`,
    joinEmailVerify: `${API_BASE_URL}/api/identity/auth/join/email/verify`,
  },
  seller: {
    createProduct: `${API_BASE_URL}/api/seller/products`,
  },
  catalog: {
    categories: `${API_BASE_URL}/api/catalog/category`,
  },
}
